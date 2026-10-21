import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as authApi from '../api/auth'
import { setCsrfToken } from '../api/http'

export const useAuthStore = defineStore('auth', () => {
  const admin = ref(null)
  const verificada = ref(false) // ya preguntamos al servidor si hay sesión al abrir la app
  const estaAutenticado = computed(() => admin.value !== null)

  function guardarSesion(datos) {
    admin.value = datos.admin
    setCsrfToken(datos.csrfToken)
  }

  function limpiarSesion() {
    admin.value = null
    setCsrfToken(null)
  }

  // Se ejecuta una vez al abrir/recargar la app: la cookie sigue viva pero el csrfToken se perdió
  async function restaurarSesion() {
    try {
      guardarSesion(await authApi.me())
    } catch {
      limpiarSesion()
    } finally {
      verificada.value = true
    }
  }

  async function iniciarSesion(username, password) {
    guardarSesion(await authApi.login(username, password))
  }

  async function cerrarSesion() {
    try {
      await authApi.logout()
    } catch {
      // aunque falle la red, cerramos la sesión en pantalla
    }
    limpiarSesion()
  }

  return { admin, verificada, estaAutenticado, restaurarSesion, iniciarSesion, cerrarSesion, limpiarSesion }
})