// API base URL.
//
// - Development (no env set): talks to the local backend on :8080.
// - Production: set VITE_API_BASE_URL in your .env, e.g.
//     VITE_API_BASE_URL=https://api.your-production-domain.com/api/v1
//
// The production host is intentionally NOT hardcoded so the repo carries no
// private infrastructure details.
const DEFAULT_API_BASE_URL = 'http://localhost:8080/api/v1'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL
