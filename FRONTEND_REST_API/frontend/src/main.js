import { createApp } from 'vue'
import { createPinia } from 'pinia'
import '@fontsource/cinzel/600.css'
import '@fontsource/cinzel/700.css'
import '@fontsource/lato/400.css'
import '@fontsource/lato/700.css'
import './assets/theme.css'

import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'
import { setUnauthorizedHandler } from './api/http'

const app = createApp(App)
app.use(createPinia()) // Pinia primero: el guardia del router usa el store
app.use(router)

// Si en cualquier petición el servidor responde 401 (sesión expirada), volvemos al login
setUnauthorizedHandler(() => {
  const auth = useAuthStore()
  if (!auth.estaAutenticado) return
  auth.limpiarSesion()
  router.push({ name: 'login', query: { expirada: '1' } })
})

app.mount('#app')