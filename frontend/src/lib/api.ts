/**
 * API client — thin fetch wrapper that injects the JWT auth header.
 *
 * Usage:
 *   import { api } from '../lib/api'
 *   const data = await api.get('/player/profile')
 *   await api.post('/player/upload', formData)
 */

export const API_BASE = 'http://localhost:8000/api'

function getToken(): string | null {
  return localStorage.getItem('tt_token')
}

function authHeaders(extra?: Record<string, string>): Record<string, string> {
  const token = getToken()
  const headers: Record<string, string> = { ...extra }
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const isFormData = body instanceof FormData
  const headers = authHeaders(isFormData ? {} : { 'Content-Type': 'application/json' })

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: isFormData ? (body as FormData) : body != null ? JSON.stringify(body) : undefined,
  })

  if (res.status === 401) {
    localStorage.removeItem('tt_token')
    localStorage.removeItem('tt_user')
    window.location.hash = '/player/login'
    throw new Error('Session expired. Please log in again.')
  }

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(data.detail || data.message || `Request failed (${res.status})`)
  }

  return data as T
}

export const api = {
  get:    <T>(path: string) => request<T>('GET', path),
  post:   <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  put:    <T>(path: string, body?: unknown) => request<T>('PUT', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
  upload: <T>(path: string, file: File) => {
    const fd = new FormData()
    fd.append('file', file)
    return request<T>('POST', path, fd)
  },
}
