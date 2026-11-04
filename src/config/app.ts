// App-wide feature flags.
//
// CAPTCHA_ENABLED mirrors the backend's CAPTCHA_MODE env var.
//   - Backend CAPTCHA_MODE=on  -> set this true  (widget must solve before scanning)
//   - Backend CAPTCHA_MODE=off -> set this false (backend accepts any token; skip the gate)
//
// Set to false for local dev testing when the backend runs with CAPTCHA_MODE=off.
// The scanner's Cap widget talks to a self-hosted captcha instance that may be
// unreachable in some dev environments, so the gate must be skippable.
export const CAPTCHA_ENABLED = false;

// The frontend gate is required only when the backend enforces captcha.
export const CAPTCHA_REQUIRED = CAPTCHA_ENABLED;
