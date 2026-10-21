import { api } from './http'

export const listar = () => api.get('/rosters')
export const crear = (datos) => api.post('/rosters', datos)
export const actualizar = (id, datos) => api.put(`/rosters/${id}`, datos)
export const eliminar = (id) => api.del(`/rosters/${id}`)

// Jugadores dentro de un roster
export const listarJugadores = (id) => api.get(`/rosters/${id}/jugadores`)
export const asignarJugador = (id, idJugador, rolEnRoster) =>
  api.post(`/rosters/${id}/jugadores`, { id_jugador: idJugador, rol_en_roster: rolEnRoster })
export const cambiarRol = (id, idJugador, rolEnRoster) =>
  api.put(`/rosters/${id}/jugadores/${idJugador}`, { rol_en_roster: rolEnRoster })
export const quitarJugador = (id, idJugador) => api.del(`/rosters/${id}/jugadores/${idJugador}`)