import { env } from '../frontend/config/env.js'


export async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers)

  const isFormData = options.body instanceof FormData

  if (options.body && !isFormData) {
    headers.set('Content-Type', 'application/json')
  }

  if (options.token) {
    headers.set(
      'Authorization',
      `Bearer ${options.token}`,
    )
  }

  const response = await fetch(
    `${env.apiBaseUrl}${path}`,
    {
      method: options.method ?? 'GET',
      headers,
      body: isFormData
        ? options.body
        : options.body
          ? JSON.stringify(options.body)
          : undefined,
    },
  )

  const data = await response
    .json()
    .catch(() => null)

  if (!response.ok) {
    const error =
      new Error(
        data?.error?.message ??
          data?.message ??
          `Request failed with status ${response.status}`,
      )

    error.code =
      data?.error?.code ??
      data?.code

    throw error
  }

  return data
}


export async function getHealthStatus() {
  return apiRequest('/health')
}