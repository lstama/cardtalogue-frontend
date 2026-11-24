#!/usr/bin/env node
// Owner-side "no orphan calls" check for the frontend.
//
// The contract repo no longer enforces this (it cannot see the consumers); each
// consumer checks its own calls against the contract version it pins. This script
// is dependency-free (Node stdlib only) and run by
// .github/workflows/contract-check.yml.
//
// What it does
//   1. Discovers every openapi-fetch call in src/ — `client.GET('...')`,
//      `client.POST('...')`, `client.PUT|DELETE|PATCH|HEAD|OPTIONS('...')` — plus
//      raw `fetch(`${API_BASE_URL}/path`)` calls.
//   2. Matches each (method, path) against the *pinned* contract, reading the
//      generated TypeScript types (`<contract>/gen/ts/backend.ts`) so the check
//      fails for exactly the reasons `tsc` would.
//   3. Fails if any call is not covered. Fails if zero calls are discovered
//      (the previous contract-repo script silently passed with 0 frontend calls
//      because it did not know about openapi-fetch `client.METHOD`).
//
// Usage
//   node scripts/check-contract-calls.mjs [--contract <contract-repo-dir>] [--src <dir>]
//
// Defaults: --contract ../cardtalogue-api-contract, --src src
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve, sep } from 'node:path'

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------
function parseArgs(argv) {
  const args = { contract: '../cardtalogue-api-contract', src: 'src' }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--contract') args.contract = argv[++i]
    else if (a === '--src') args.src = argv[++i]
    else if (a === '--help' || a === '-h') {
      console.log('usage: node scripts/check-contract-calls.mjs [--contract <dir>] [--src <dir>]')
      process.exit(0)
    } else {
      console.error(`unknown argument: ${a}`)
      process.exit(2)
    }
  }
  return args
}

const args = parseArgs(process.argv.slice(2))
const contractDir = resolve(args.contract)
const srcDir = resolve(args.src)

// ---------------------------------------------------------------------------
// Path normalisation
// ---------------------------------------------------------------------------
// `/cards/${id}` -> `/cards/{id}`; `/cards/` -> `/cards`; `?x=1` dropped.
function normalizePath(p) {
  let out = String(p).trim()
  const q = out.indexOf('?')
  if (q !== -1) out = out.slice(0, q)
  out = out.replace(/\$\{[^}]*\}/g, '{param}')
  // Numbers/ids interpolated as `${x}` above; also collapse `/{{foo}}` typos.
  if (!out.startsWith('/')) out = '/' + out
  out = out.replace(/\/+$/, '')
  return out === '' ? '/' : out
}

// Two paths match when they only differ in parameter names (`{id}` vs `{param}`).
function pathShape(p) {
  return normalizePath(p).replace(/\{[^}]*\}/g, '{}')
}

// ---------------------------------------------------------------------------
// Contract source: generated TS types first, spec fallback
// ---------------------------------------------------------------------------
function loadFromGeneratedTs(file) {
  const src = readFileSync(file, 'utf8')
  const start = src.indexOf('export interface paths {')
  if (start === -1) throw new Error(`${file}: no "export interface paths" block`)
  const lines = src.slice(start).split('\n')
  const paths = new Map() // path -> Set(method)
  let current = null
  for (const line of lines) {
    const pathKey = line.match(/^ {4}"([^"]+)": \{$/)
    if (pathKey) {
      current = pathKey[1]
      paths.set(current, new Set())
      continue
    }
    if (!current) continue
    const method = line.match(/^ {8}(get|put|post|delete|options|head|patch|trace)(\?)?: (.*)$/)
    if (method && !/never/.test(method[3])) {
      paths.get(current).add(method[1].toUpperCase())
      continue
    }
    // Leaving the paths interface (top-level close).
    if (/^\}/.test(line)) break
  }
  return { paths, source: file }
}

// Indentation-based parse of a hand-maintained OpenAPI YAML spec. Covers the
// shape this repo uses (`paths:` -> `  /path:` -> `    get:`), no YAML dep.
function loadFromSpec(file) {
  const lines = readFileSync(file, 'utf8').split('\n')
  const paths = new Map()
  let inPaths = false
  let current = null
  for (const raw of lines) {
    const line = raw.replace(/\t/g, '  ')
    if (/^paths:\s*$/.test(line)) {
      inPaths = true
      continue
    }
    if (!inPaths) continue
    if (/^\S/.test(line) && !/^paths:/.test(line)) break // next top-level key
    const pathKey = line.match(/^ {2}(\/[^:]*):\s*$/)
    if (pathKey) {
      current = pathKey[1]
      paths.set(current, new Set())
      continue
    }
    const method = line.match(/^ {4}(get|put|post|delete|options|head|patch|trace):\s*$/)
    if (method && current) paths.get(current).add(method[1].toUpperCase())
  }
  return { paths, source: file }
}

function loadContract() {
  const genTs = join(contractDir, 'gen', 'ts', 'backend.ts')
  const spec = join(contractDir, 'contracts', 'backend.yaml')
  try {
    const loaded = loadFromGeneratedTs(genTs)
    if (loaded.paths.size > 0) return { ...loaded, kind: 'generated TypeScript types' }
    throw new Error(`${genTs}: parsed 0 paths`)
  } catch (err) {
    console.warn(`! generated types unavailable (${err.message}); falling back to the spec`)
  }
  const loaded = loadFromSpec(spec)
  if (loaded.paths.size === 0) throw new Error(`${spec}: parsed 0 paths`)
  return { ...loaded, kind: 'OpenAPI spec (generated types missing)' }
}

// ---------------------------------------------------------------------------
// Discover calls in src/
// ---------------------------------------------------------------------------
function walk(dir) {
  const out = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) out.push(...walk(full))
    else if (/\.(ts|tsx|mts|js|jsx|mjs)$/.test(entry) && !/\.d\.ts$/.test(entry)) out.push(full)
  }
  return out
}

// Remove block comments and whole-line `//` comments so commented-out calls are
// not counted. Inline `//` is left alone: URLs contain `//`.
function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .filter((line) => !/^\s*(\/\/|\*)/.test(line))
    .join('\n')
}

const CLIENT_CALL =
  /\bclient\s*\.\s*(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)\s*\(\s*(['"`])([^'"`]*)\2/g
const CLIENT_CALL_ANY = /\bclient\s*\.\s*(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)\s*\(\s*/g
const FETCH_CALL = /\bfetch\s*\(\s*`([^`]+)`/g

const calls = [] // {method, path, file, line}
const skipped = [] // calls whose path is not a literal

function lineOf(src, index) {
  return src.slice(0, index).split('\n').length
}

const files = walk(srcDir).sort()
for (const file of files) {
  const raw = readFileSync(file, 'utf8')
  const src = stripComments(raw)
  const rel = relative(process.cwd(), file).split(sep).join('/')

  let m
  CLIENT_CALL.lastIndex = 0
  let literalCalls = 0
  while ((m = CLIENT_CALL.exec(src)) !== null) {
    literalCalls++
    calls.push({ method: m[1].toUpperCase(), path: normalizePath(m[3]), file: rel, line: lineOf(src, m.index) })
  }
  // Any `client.METHOD(...)` we could not read a literal path from must be
  // reported, never silently dropped.
  CLIENT_CALL_ANY.lastIndex = 0
  let totalClientCalls = 0
  while ((m = CLIENT_CALL_ANY.exec(src)) !== null) {
    totalClientCalls++
    const next = m.index + m[0].length
    const ch = src[next]
    if (ch === "'" || ch === '"' || ch === '`') continue // covered above
    skipped.push({
      file: rel,
      line: lineOf(src, m.index),
      what: `client.${m[1]}(<non-literal path>)`,
    })
  }
  if (totalClientCalls !== literalCalls + skipped.filter((s) => s.file === rel).length) {
    // Defensive: counts must reconcile (a parse drift would hide calls).
    console.error(`! ${rel}: ${totalClientCalls} client calls, ${literalCalls} with literal paths — count mismatch`)
  }

  FETCH_CALL.lastIndex = 0
  while ((m = FETCH_CALL.exec(src)) !== null) {
    const template = m[1]
    let path = null
    const base = template.match(/\$\{[^}]*\}(.*)$/)
    if (base) path = base[1] // `${API_BASE_URL}/auth/refresh` -> `/auth/refresh`
    else if (/^https?:\/\//.test(template)) {
      try {
        path = new URL(template).pathname
      } catch {
        path = null
      }
    } else if (template.startsWith('/')) path = template
    if (path === null) {
      skipped.push({ file: rel, line: lineOf(src, m.index), what: 'fetch(' + template + ')' })
      continue
    }
    // `fetch(url, { method: 'POST', ... })` — default GET when unspecified.
    const opts = src.slice(m.index, m.index + 400).match(/\bmethod:\s*['"`]([A-Za-z]+)['"`]/)
    const method = opts ? opts[1].toUpperCase() : 'GET'
    calls.push({ method, path: normalizePath(path), file: rel, line: lineOf(src, m.index), via: 'fetch' })
  }
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
const contract = loadContract()
const shapes = new Map()
for (const [path, methods] of contract.paths) {
  const key = pathShape(path)
  if (!shapes.has(key)) shapes.set(key, new Map())
  for (const method of methods) shapes.get(key).set(method, path)
}

console.log(`Contract source: ${contract.kind}`)
console.log(`  ${contract.source}`)
console.log(`  ${contract.paths.size} paths\n`)
console.log(`Discovered ${calls.length} call(s) in ${relative(process.cwd(), srcDir) || '.'}/`)

const failures = []
for (const call of calls) {
  const entry = shapes.get(pathShape(call.path))
  const where = `${call.file}:${call.line}`
  if (!entry) {
    failures.push(`${call.method} ${call.path}  (${where}) — path not in the contract`)
    console.log(`  x ${call.method} ${call.path}  (${where}) — path not in the contract`)
    continue
  }
  if (!entry.has(call.method)) {
    const allowed = [...entry.keys()].sort().join('|') || 'none'
    failures.push(`${call.method} ${call.path}  (${where}) — method not in the contract (allowed: ${allowed})`)
    console.log(`  x ${call.method} ${call.path}  (${where}) — method not in the contract (allowed: ${allowed})`)
    continue
  }
  console.log(`  ok ${call.method} ${call.path}  (${where})`)
}

if (skipped.length > 0) {
  console.log('\nNot statically checkable (non-literal path, skipped):')
  for (const s of skipped) console.log(`  ? ${s.what}  (${s.file}:${s.line})`)
}

console.log('\n' + '='.repeat(60))
if (calls.length === 0) {
  console.error('FAIL: discovered 0 calls — the scanner is blind again (vacuity guard).')
  console.error('      Expected openapi-fetch `client.GET/POST/...` calls under src/.')
  process.exit(1)
}
if (failures.length > 0) {
  console.error(`FAIL: ${failures.length} call(s) not covered by the pinned contract.`)
  for (const f of failures) console.error('  - ' + f)
  console.error('Update the contract (contracts/backend.yaml) and re-sync before merging.')
  process.exit(1)
}
console.log(`PASS: all ${calls.length} call(s) are covered by the pinned contract.`)
process.exit(0)
