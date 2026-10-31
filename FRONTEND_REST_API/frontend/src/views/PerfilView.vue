<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()

async function salir() {
  await auth.cerrarSesion()
  router.push({ name: 'login' })
}
</script>

<template>
  <main class="perfil">
    <section class="tarjeta">
      <img
        v-if="auth.usuario?.foto"
        :src="auth.usuario.foto"
        class="foto"
        alt=""
        referrerpolicy="no-referrer"
      />
      <span v-else class="foto inicial">{{ auth.usuario?.nombre?.[0] }}</span>

      <h1>{{ auth.usuario?.nombre }}</h1>
      <p class="email">{{ auth.usuario?.email }}</p>
      <span class="insignia">Usuario</span>

      <p class="nota">
        Tu cuenta tiene acceso de solo lectura. La administración de jugadores y rosters
        está reservada a los administradores.
      </p>

      <button class="btn-oro" type="button" @click="salir">Cerrar sesión</button>
    </section>
  </main>
</template>

<style scoped>
.perfil {
  min-height: 100%;
  display: grid;
  place-items: center;
  padding: 24px;
  background:
    radial-gradient(ellipse at 50% 30%, rgba(10, 200, 185, 0.08), transparent 60%),
    var(--azul-noche);
}

.tarjeta {
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px 36px;
  text-align: center;
  background: linear-gradient(180deg, var(--azul-panel), var(--azul-profundo));
  border: 1px solid var(--oro-oscuro);
  box-shadow: 0 0 0 4px var(--azul-noche), 0 0 0 5px var(--oro-oscuro), 0 20px 60px rgba(0, 0, 0, 0.7);
}

.foto {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  border: 2px solid var(--oro);
  object-fit: cover;
}

.inicial {
  display: grid;
  place-items: center;
  font-family: var(--fuente-titulo);
  font-size: 2.5rem;
  color: var(--oro);
  background: var(--azul-noche);
  text-transform: uppercase;
}

h1 {
  font-size: 1.4rem;
  color: var(--oro);
}

.email {
  margin: -6px 0 0;
}

.nota {
  margin: 8px 0 12px;
  font-size: 0.9rem;
}
</style>