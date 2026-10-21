import { api } from './http'

// filtros opcionales: { search, rol, estado }
export function listar({ search, rol, estado } = {}) {
  const params = new URLSearchParams()
  if (search) params.set('search', search)
  if (rol) params.set('rol', rol)
  if (estado) params.set('estado', estado)
  const consulta = params.toString()
  return api.get('/jugadores' + (consulta ? `?${consulta}` : ''))
}

export const crear = (datos) => api.post('/jugadores', datos)
export const actualizar = (id, datos) => api.put(`/jugadores/${id}`, datos)
export const eliminar = (id) => api.del(`/jugadores/${id}`)