// const LOCAL_API_BASE_URL = 'http://localhost:8080/api/v1'
const REMOTE_API_BASE_URL = 'https://card-api.tama.id/api/v1'
const LOCAL_API_BASE_URL = 'http://localhost:8080/api/v1'

// Served from localhost -> talk to the local backend; anywhere else -> the deployed one.
export const API_BASE_URL =
  window.location.hostname === 'localhost' ? LOCAL_API_BASE_URL : REMOTE_API_BASE_URL
