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

async function enviar() {
  error.value = ''
  if (password.value !== confirmar.value) {
    error.value = 'Las contraseñas no coinciden.'
    return
  }

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
  <main class="login">
    <form class="tarjeta" @submit.prevent="enviar">
      <span class="esquina arriba-izq"></span>
      <span class="esquina arriba-der"></span>
      <span class="esquina abajo-izq"></span>
      <span class="esquina abajo-der"></span>

      <h1>Crear cuenta</h1>
      <p class="subtitulo">Regístrate con tu correo</p>

      <p v-if="error" class="mensaje-error">{{ error }}</p>

      <div class="campo">
        <label for="nombre">Nombre</label>
        <input id="nombre" v-model="nombre" type="text" maxlength="100" autocomplete="name" required autofocus />
      </div>

      <div class="campo">
        <label for="email">Correo</label>
        <input id="email" v-model="email" type="email" maxlength="255" autocomplete="email" required />
      </div>

      <div class="campo">
        <label for="password">Contraseña</label>
        <input id="password" v-model="password" type="password" minlength="8" maxlength="72" autocomplete="new-password" required />
      </div>

      <div class="campo">
        <label for="confirmar">Confirmar contraseña</label>
        <input id="confirmar" v-model="confirmar" type="password" minlength="8" maxlength="72" autocomplete="new-password" required />
      </div>

      <button class="btn-oro" type="submit" :disabled="cargando">
        {{ cargando ? 'Creando...' : 'Crear cuenta' }}
      </button>

      <p class="alterno">
        ¿Ya tienes cuenta? <RouterLink :to="{ name: 'login' }">Iniciar sesión</RouterLink>
      </p>
    </form>
  </main>
</template>