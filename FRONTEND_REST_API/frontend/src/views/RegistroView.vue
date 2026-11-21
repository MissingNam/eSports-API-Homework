<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()

const nombre = ref('')
const email = ref('')
const password = ref('')
const confirmar = ref('')
const error = ref('')
const cargando = ref(false)

const requerido = (v) => !!v?.toString().trim() || 'Campo obligatorio'
const correoValido = (v) => /^\S+@\S+\.\S+$/.test(v?.trim() ?? '') || 'Correo no válido'
const minimo8 = (v) => (v?.length ?? 0) >= 8 || 'Mínimo 8 caracteres'
const coincide = (v) => v === password.value || 'Las contraseñas no coinciden.'

// v-form emite un "submit" que se puede await para conocer el resultado de las reglas
async function enviar(evento) {
  const { valid } = await evento
  if (!valid) return

  error.value = ''
  cargando.value = true
  try {
    await auth.registrar(nombre.value.trim(), email.value.trim(), password.value)
    router.push({ name: 'jugadores' })
  } catch (e) {
    error.value = e.message
  } finally {
    cargando.value = false
  }
}
</script>

<template>
  <v-main class="login d-flex align-center">
    <v-container>
      <v-row justify="center">
        <v-col cols="12" sm="8" md="8" lg="8">
    <v-card class="tarjeta pa-9 text-center mx-auto" max-width="440">
      <span class="esquina arriba-izq"></span>
      <span class="esquina arriba-der"></span>
      <span class="esquina abajo-izq"></span>
      <span class="esquina abajo-der"></span>

      <h1 class="text-h5 text-primary">Crear cuenta</h1>
      <p class="text-body-2 mt-1 mb-4">Regístrate con tu correo</p>

      <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>

      <v-form @submit.prevent="enviar">
        <v-text-field
          v-model="nombre"
          label="Nombre"
          maxlength="100"
          autocomplete="name"
          autofocus
          :rules="[requerido]"
        />
        <v-text-field
          v-model="email"
          label="Correo"
          type="email"
          maxlength="255"
          autocomplete="email"
          :rules="[requerido, correoValido]"
        />
        <v-text-field
          v-model="password"
          label="Contraseña"
          type="password"
          maxlength="72"
          autocomplete="new-password"
          :rules="[requerido, minimo8]"
        />
        <v-text-field
          v-model="confirmar"
          label="Confirmar contraseña"
          type="password"
          maxlength="72"
          autocomplete="new-password"
          :rules="[requerido, minimo8, coincide]"
        />

        <v-btn type="submit" color="primary" variant="flat" size="large" block :loading="cargando">
          {{ cargando ? 'Creando...' : 'Crear cuenta' }}
        </v-btn>
      </v-form>

      <p class="text-body-2 mt-4">
        ¿Ya tienes cuenta? <RouterLink :to="{ name: 'login' }">Iniciar sesión</RouterLink>
      </p>
    </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<style scoped>
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

.login {
  background:
    radial-gradient(ellipse at 50% 30%, rgba(10, 200, 185, 0.08), transparent 60%),
    radial-gradient(ellipse at 50% 100%, rgba(200, 170, 110, 0.1), transparent 55%),
    rgb(var(--v-theme-azul-noche));
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
</style>