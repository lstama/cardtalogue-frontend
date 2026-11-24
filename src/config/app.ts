// App-wide feature flags.
//
// CAPTCHA_ENABLED mirrors the backend's CAPTCHA_MODE env var and is set from the
// Vite build-time variable VITE_CAPTCHA_ENABLED ('true' enables the gate).
//   - Backend CAPTCHA_MODE=on  -> set VITE_CAPTCHA_ENABLED=true (widget must solve before logging in and before scanning)
//   - Backend CAPTCHA_MODE=off -> leave it unset           (backend accepts any token; skip the gate)
//
// It defaults to false so local dev is unchanged: the Cap widget on both the
// login page and the scanner page talks to a self-hosted captcha instance whose
// endpoint (and the captcha endpoint of the backend) may be unreachable in some
// dev environments, so the gate must be skippable there.
export const CAPTCHA_ENABLED = import.meta.env.VITE_CAPTCHA_ENABLED === 'true';

// The frontend gate is required only when the backend enforces captcha.
export const CAPTCHA_REQUIRED = CAPTCHA_ENABLED;

// Self-hosted captcha widget endpoint, shared by every place that mounts the
// widget (the scanner page and the login page). Override in production with
// VITE_CAP_API_ENDPOINT in a .env file. Defaults to a placeholder so the repo
// carries no private infrastructure details.
const DEFAULT_CAP_API_ENDPOINT = 'https://example.com/captcha/';
export const CAP_API_ENDPOINT = import.meta.env.VITE_CAP_API_ENDPOINT || DEFAULT_CAP_API_ENDPOINT;
