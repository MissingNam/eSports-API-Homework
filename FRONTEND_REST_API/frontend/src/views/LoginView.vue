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

async function enviar() {
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
  <main class="login">
    <form class="tarjeta" @submit.prevent="enviar">
      <span class="esquina arriba-izq"></span>
      <span class="esquina arriba-der"></span>
      <span class="esquina abajo-izq"></span>
      <span class="esquina abajo-der"></span>

      <h1>Panel de Administración</h1>
      <p class="subtitulo">Inicia sesión para continuar</p>

      <p v-if="route.query.expirada" class="mensaje-aviso">
        Tu sesión expiró. Inicia sesión de nuevo.
      </p>
      <p v-if="route.query.error === 'google'" class="mensaje-error">
        No se pudo iniciar sesión con Google. Inténtalo de nuevo.
      </p>
      <p v-if="error" class="mensaje-error">{{ error }}</p>

      <div class="campo">
        <label for="username">Usuario</label>
        <input id="username" v-model="username" type="text" autocomplete="username" required autofocus />
      </div>

      <div class="campo">
        <label for="password">Contraseña</label>
        <input id="password" v-model="password" type="password" autocomplete="current-password" required />
      </div>

      <button class="btn-oro" type="submit" :disabled="cargando">
        {{ cargando ? 'Entrando...' : 'Iniciar sesión' }}
      </button>
      <div class="separador"><span>o</span></div>
      <a :href="googleUrl" class="btn-google">
        <img src="/google.svg" alt="" width="20" height="20" />
        Iniciar sesión con Google
      </a>
    </form>
  </main>
</template>

<style scoped>
.login {
  min-height: 100%;
  display: grid;
  place-items: center;
  padding: 24px;
  background:
    radial-gradient(ellipse at 50% 30%, rgba(10, 200, 185, 0.08), transparent 60%),
    radial-gradient(ellipse at 50% 100%, rgba(200, 170, 110, 0.1), transparent 55%),
    var(--azul-noche);
}

.tarjeta {
  position: relative;
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 40px 36px;
  text-align: center;
  background: linear-gradient(180deg, var(--azul-panel), var(--azul-profundo));
  border: 1px solid var(--oro-oscuro);
  box-shadow: 0 0 0 4px var(--azul-noche), 0 0 0 5px var(--oro-oscuro), 0 20px 60px rgba(0, 0, 0, 0.7);
}

h1 {
  font-size: 1.5rem;
  color: var(--oro);
}

.subtitulo {
  margin: -8px 0 4px;
  font-size: 0.9rem;
}

.esquina {
  position: absolute;
  width: 14px;
  height: 14px;
  border: 2px solid var(--oro);
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
  background: var(--oro-oscuro);
}

.btn-google {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 10px 16px;
  color: #e3e3e3;
  background: #131314;
  border: 1px solid #8e918f;
  font-family: var(--fuente-texto);
  font-weight: 700;
  text-decoration: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.btn-google:hover {
  border-color: var(--oro-claro);
  box-shadow: 0 0 14px rgba(200, 170, 110, 0.3);
}
</style>