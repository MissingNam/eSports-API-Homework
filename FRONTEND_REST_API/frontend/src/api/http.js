const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

export class ApiError extends Error {
  constructor(status, message, detalles = []) {
    super(message)
    this.name = 'ApiError'
    this.status = status      // 0 = no hubo conexión con el servidor
    this.detalles = detalles  // mensajes de validación (errores 400)
  }
}

let csrfToken = null
let alExpirarSesion = null

export function setCsrfToken(token) {
  csrfToken = token
}

// main.js registra aquí qué hacer cuando el servidor responde 401
export function setUnauthorizedHandler(fn) {
  alExpirarSesion = fn
}

// Estas rutas manejan su propio 401, no deben disparar el aviso de "sesión expirada"
const RUTAS_SIN_AVISO = ['/auth/login', '/auth/me', '/auth/logout']

async function request(method, path, body) {
  const headers = {}
  const opciones = { method, headers, credentials: 'include' } // sin esto el navegador no manda la cookie

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    opciones.body = JSON.stringify(body)
  }
  if (method !== 'GET' && csrfToken) {
    headers['X-CSRF-Token'] = csrfToken
  }

  let res
  try {
    res = await fetch(API_URL + path, opciones)
  } catch {
    throw new ApiError(0, 'No se pudo conectar con el servidor')
  }

  if (res.status === 204) return null

  let data = null
  try {
    data = await res.json()
  } catch {
    // respuesta sin JSON
  }

  if (!res.ok) {
    if (res.status === 401 && !RUTAS_SIN_AVISO.includes(path) && alExpirarSesion) {
      alExpirarSesion()
    }
    throw new ApiError(res.status, data?.error || `Error ${res.status}`, data?.detalles || [])
  }

  return data
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body ?? {}),
  put: (path, body) => request('PUT', path, body ?? {}),
  del: (path) => request('DELETE', path)
}