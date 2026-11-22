// App-wide feature flags.
//
// CAPTCHA_ENABLED mirrors the backend's CAPTCHA_MODE env var and is set from the
// Vite build-time variable VITE_CAPTCHA_ENABLED ('true' enables the gate).
//   - Backend CAPTCHA_MODE=on  -> set VITE_CAPTCHA_ENABLED=true (widget must solve before scanning)
//   - Backend CAPTCHA_MODE=off -> leave it unset           (backend accepts any token; skip the gate)
//
// It defaults to false so local dev is unchanged: the scanner's Cap widget talks
// to a self-hosted captcha instance that may be unreachable in some dev
// environments, so the gate must be skippable there.
export const CAPTCHA_ENABLED = import.meta.env.VITE_CAPTCHA_ENABLED === 'true';

// The frontend gate is required only when the backend enforces captcha.
export const CAPTCHA_REQUIRED = CAPTCHA_ENABLED;
