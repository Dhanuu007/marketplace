const DEFAULT_API_BASE_URL =
  'http://192.168.1.8:4000/api'

export const env = {
  apiBaseUrl:
    import.meta.env.VITE_API_BASE_URL ??
    DEFAULT_API_BASE_URL,
}