import { api } from './http'

export const salud = () => api.get('/health')
export const roles = () => api.get('/roles')
export const estados = () => api.get('/estados')
export const tiposRoster = () => api.get('/tipos-roster')