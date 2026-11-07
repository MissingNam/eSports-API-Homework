import { api } from './http'

export const login = (username, password) => api.post('/auth/login', { username, password })
export const logout = () => api.post('/auth/logout')
export const me = () => api.get('/auth/me')
export const registro = (nombre, email, password) =>
  api.post('/auth/registro', { nombre, email, password })