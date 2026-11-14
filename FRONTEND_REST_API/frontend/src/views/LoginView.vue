<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'
const googleUrl = `${API_URL}/auth/google/login`

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const username = ref('')
const password = ref('')
const error = ref('')
const cargando = ref(false)

const requerido = (v) => !!v?.toString().trim() || 'Campo requerido'

// v-form emite un "submit" que se puede await para conocer el resultado de las reglas
async function enviar(evento) {
  const { valid } = await evento
  if (!valid) return

  error.value = ''
  cargando.value = true
  try {
    await auth.iniciarSesion(username.value.trim(), password.value)
    router.push({ name: 'inicio' })
  } catch (e) {
    error.value = e.message
  } finally {
    cargando.value = false
  }
}
</script>

<template>
  <v-main class="login d-flex align-center justify-center">
    <v-card class="tarjeta pa-9 text-center" max-width="400" width="100%">
      <span class="esquina arriba-izq"></span>
      <span class="esquina arriba-der"></span>
      <span class="esquina abajo-izq"></span>
      <span class="esquina abajo-der"></span>

      <h1 class="text-h5 text-primary">Panel de Administración</h1>
      <p class="text-body-2 mt-1 mb-4">Inicia sesión para continuar</p>

      <v-alert v-if="route.query.expirada" type="warning" class="mb-4">
        Tu sesión expiró. Inicia sesión de nuevo.
      </v-alert>
      <v-alert v-if="route.query.error === 'google'" type="error" class="mb-4">
        No se pudo iniciar sesión con Google. Inténtalo de nuevo.
      </v-alert>
      <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>

      <v-form @submit.prevent="enviar">
        <v-text-field
          v-model="username"
          label="Usuario o correo"
          type="text"
          autocomplete="username"
          autofocus
          :rules="[requerido]"
        />
        <v-text-field
          v-model="password"
          label="Contraseña"
          type="password"
          autocomplete="current-password"
          :rules="[requerido]"
        />

        <v-btn type="submit" color="primary" variant="flat" size="large" block :loading="cargando">
          {{ cargando ? 'Entrando...' : 'Iniciar sesión' }}
        </v-btn>
      </v-form>

      <div class="separador my-4"><span>o</span></div>

      <v-btn :href="googleUrl" variant="outlined" size="large" block class="btn-google">
        <template #prepend>
          <img src="/google.svg" alt="" width="20" height="20" />
        </template>
        Iniciar sesión con Google
      </v-btn>

      <p class="text-body-2 mt-4">
        ¿No tienes cuenta? <RouterLink :to="{ name: 'registro' }">Crear cuenta</RouterLink>
      </p>
    </v-card>
  </v-main>
</template>

<style scoped>
.login {
  background:
    radial-gradient(ellipse at 50% 30%, rgba(10, 200, 185, 0.08), transparent 60%),
    radial-gradient(ellipse at 50% 100%, rgba(200, 170, 110, 0.1), transparent 55%),
    rgb(var(--v-theme-azul-noche));
}

.tarjeta {
  position: relative;
  overflow: visible;
  background: linear-gradient(180deg, rgb(var(--v-theme-surface)), rgb(var(--v-theme-azul-profundo)));
  border: 1px solid rgb(var(--v-theme-oro-oscuro));
  box-shadow:
    0 0 0 4px rgb(var(--v-theme-azul-noche)),
    0 0 0 5px rgb(var(--v-theme-oro-oscuro)),
    0 20px 60px rgba(0, 0, 0, 0.7);
}

.esquina {
  position: absolute;
  width: 14px;
  height: 14px;
  border: 2px solid rgb(var(--v-theme-primary));
}
.arriba-izq { top: -2px; left: -2px; border-right: 0; border-bottom: 0; }
.arriba-der { top: -2px; right: -2px; border-left: 0; border-bottom: 0; }
.abajo-izq { bottom: -2px; left: -2px; border-right: 0; border-top: 0; }
.abajo-der { bottom: -2px; right: -2px; border-left: 0; border-top: 0; }

.separador {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.8rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.separador::before,
.separador::after {
  content: '';
  flex: 1;
  height: 1px;
  background: rgb(var(--v-theme-oro-oscuro));
}

.btn-google {
  color: #e3e3e3;
  background: #131314;
  border-color: #8e918f;
  text-transform: none;
  letter-spacing: normal;
  font-weight: 700;
}
</style>