#!/usr/bin/env python3
"""Static import checker for the cardtalogue src tree (no node needed)."""
import re, os, sys, pathlib
ROOT = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else 'src')
files = sorted(p for p in ROOT.rglob('*') if p.suffix in ('.ts', '.tsx') and p.is_file())

def exports(text):
    names = set()
    for m in re.finditer(r'^export (?:const|let|var|function|class|async function)\s+([A-Za-z_$][\w$]*)', text, re.M):
        names.add(m.group(1))
    for m in re.finditer(r'^export default (?:async )?function\s+([A-Za-z_$][\w$]*)', text, re.M):
        names.add(m.group(1))
    for m in re.finditer(r'^export default\s+([A-Za-z_$][\w$]*)\s*;?\s*$', text, re.M):
        names.add(m.group(1))
    for m in re.finditer(r'^export\s*\{([^}]*)\}', text, re.M):
        for part in m.group(1).split(','):
            part = part.strip()
            if part:
                names.add(part.split()[-1])
    # interface / type / enum declarations that are exported
    for m in re.finditer(r'^export (?:interface|type)\s+([A-Za-z_$][\w$]*)', text, re.M):
        names.add(m.group(1))
    return names

exp = {}
for f in files:
    exp[str(f)] = exports(f.read_text())

problems = []
for f in files:
    text = f.read_text()
    # strip line comments and block comments so commented-out imports are ignored
    code = re.sub(r'/\*.*?\*/', '', text, flags=re.S)
    code = re.sub(r'(?m)^\s*//.*$', '', code)
    for m in re.finditer(r"import\s+(?:type\s+)?([A-Za-z_$][\w$]*)\s*,?\s*(?:\{[^}]*\})?\s*from\s*'([^']+)'", code):
        pass
    for m in re.finditer(r"import\s+(?:type\s+)?\{([^}]*)\}\s*from\s*'([^']+)'", code, re.S):
        names = [n.strip().split(' as ')[-1].strip() for n in m.group(1).split(',') if n.strip()]
        mod = m.group(2)
        if mod.startswith('.'):
            base = (f.parent / mod)
            cands = [base, base.with_suffix('')]
            target = None
            for b in cands:
                for cand in (b, pathlib.Path(str(b) + '.ts'), pathlib.Path(str(b) + '.tsx'), pathlib.Path(str(b) + '/index.ts'), pathlib.Path(str(b) + '/index.tsx')):
                    if cand.is_file():
                        target = cand
                        break
                if target:
                    break
            if target is None:
                problems.append(f"{f}: import {mod} -> FILE NOT FOUND")
                continue
            ttext = target.read_text()
            texp = exports(ttext)
            for n in names:
                if n not in texp:
                    problems.append(f"{f}: import {n} from {mod} -> NOT EXPORTED")
            for n in names:
                # unused import check (crude: name appears elsewhere in file?)
                rest = re.sub(r"import\s+(?:type\s+)?\{[^}]*\}\s*from\s*'[^']+'", '', code)
                if not re.search(r'\b' + re.escape(n) + r'\b', rest):
                    problems.append(f"{f}: import {n} from {mod} -> UNUSED")
        else:
            if mod == 'react':
                for n in names:
                    rest = re.sub(r"import\s+(?:type\s+)?\{[^}]*\}\s*from\s*'[^']+'", '', code)
                    if not re.search(r'\b' + re.escape(n) + r'\b', rest):
                        problems.append(f"{f}: import {n} from react -> UNUSED")
    # default imports of local modules
    for m in re.finditer(r"import\s+([A-Z][\w$]*)\s+from\s*'((?:\.[^']+))'", code):
        name, mod = m.group(1), m.group(2)
        base = f.parent / mod
        target = None
        for cand in (base, pathlib.Path(str(base) + '.ts'), pathlib.Path(str(base) + '.tsx')):
            if cand.is_file():
                target = cand
                break
        if target is None:
            problems.append(f"{f}: import {name} from {mod} -> FILE NOT FOUND")
            continue
        texp = exports(target.read_text())
        if name not in texp:
            problems.append(f"{f}: default import {name} from {mod} -> NOT EXPORTED AS DEFAULT/NAME")
print('\n'.join(problems) if problems else 'OK: all imports resolve, all names exported, none unused')
print(f'--- files checked: {len(files)}')
