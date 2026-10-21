import { api } from './http'

export const login = (username, password) => api.post('/auth/login', { username, password })
export const logout = () => api.post('/auth/logout')
export const me = () => api.get('/auth/me')