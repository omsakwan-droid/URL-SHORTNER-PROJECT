const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  let res
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError(
      `can't reach server at ${BASE_URL} — is the backend running?`,
      0
    )
  }

  const isJson = res.headers.get('content-type')?.includes('application/json')
  const data = isJson ? await res.json().catch(() => null) : null

  if (!res.ok) {
    const message = extractErrorMessage(data) || `request failed (${res.status})`
    throw new ApiError(message, res.status)
  }

  return data
}

// The backend's zod errors come back in a couple of different shapes
// depending on the route (.format() in some places, raw error in others).
function extractErrorMessage(data) {
  if (!data) return null
  const err = data.error
  if (!err) return null
  if (typeof err === 'string') return err
  if (err._errors?.length) return err._errors.join(', ')
  const fieldErrors = Object.entries(err)
    .filter(([key]) => key !== '_errors')
    .map(([key, value]) => value?._errors?.length ? `${key}: ${value._errors.join(', ')}` : null)
    .filter(Boolean)
  if (fieldErrors.length) return fieldErrors.join(' · ')
  if (err.message) return err.message
  return null
}

export const api = {
  signup: ({ firstname, lastname, email, password }) =>
    request('/user/signup', { method: 'POST', body: { firstname, lastname, email, password } }),

  login: ({ email, password }) =>
    request('/user/login', { method: 'POST', body: { email, password } }),

  shorten: ({ url, code, token }) =>
    request('/shorten', { method: 'POST', body: { url, code: code || undefined }, token }),

  listCodes: ({ token }) =>
    request('/codes', { method: 'GET', token }),

  deleteCode: ({ id, token }) =>
    request(`/codes/${id}`, { method: 'DELETE', token }),
}

export { BASE_URL, ApiError }
