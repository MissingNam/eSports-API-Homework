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
  <div class="panel">
    <header class="barra">
      <button class="btn-enlace" @click="salir">Cerrar sesión</button>
      <RouterLink :to="{ name: 'inicio' }" class="marca">Panel de Administración</RouterLink>
      <span class="usuario">{{ auth.admin?.username }}</span>
    </header>

    <div class="cuerpo">
      <nav class="tabs">
          <RouterLink :to="{ name: 'inicio' }" class="tab">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10" />
            </svg>
            Inicio
        </RouterLink>
        <RouterLink :to="{ name: 'jugadores' }" class="tab">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
          </svg>
          Jugadores
        </RouterLink>
        <RouterLink :to="{ name: 'rosters' }" class="tab">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6l8-3z" />
          </svg>
          Roster
        </RouterLink>
        <RouterLink :to="{ name: 'recursos' }" class="tab">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4z" />
            <path d="M5 17a3 3 0 0 1 3-3h11" />
          </svg>
          Recursos
        </RouterLink>
      </nav>

      <main class="vista">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
.panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--azul-profundo);
}

/* ---------- Barra superior ---------- */
.barra {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 12px 20px;
  border-bottom: 1px solid var(--oro-oscuro);
  background: var(--azul-noche);
}

.barra .btn-enlace {
  justify-self: start;
}

.marca {
  font-family: var(--fuente-titulo);
  font-weight: 700;
  font-size: 1.15rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--oro);
  text-decoration: none;
}

.marca:hover {
  color: var(--oro-claro);
}

.usuario {
  justify-self: end;
  font-family: var(--fuente-titulo);
  color: var(--oro-claro);
  letter-spacing: 0.08em;
}

/* ---------- Cuerpo: tabs a la izquierda ---------- */
.cuerpo {
  flex: 1;
  min-height: 0;
  display: flex;
}

.tabs {
  width: 220px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 20px 0;
  background: var(--azul-noche);
  border-right: 1px solid var(--oro-oscuro);
}

.tab {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 24px;
  font-family: var(--fuente-titulo);
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  text-decoration: none;
  color: var(--texto);
  border-left: 3px solid transparent;
  transition: color 0.15s, background 0.15s, border-color 0.15s;
}

.tab svg {
  width: 22px;
  height: 22px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.tab:hover {
  color: var(--oro-claro);
  background: rgba(200, 170, 110, 0.06);
}

.tab.router-link-exact-active {
  color: var(--oro-claro);
  border-left-color: var(--oro);
  background: linear-gradient(90deg, rgba(200, 170, 110, 0.18), transparent);
}

.vista {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  padding: 32px 40px;
}

/* ---------- Pantallas angostas: tabs arriba ---------- */
@media (max-width: 760px) {
  .cuerpo {
    flex-direction: column;
  }
  .tabs {
    width: auto;
    flex-direction: row;
    padding: 0;
    border-right: 0;
    border-bottom: 1px solid var(--oro-oscuro);
  }
  .tab {
    flex: 1;
    justify-content: center;
    padding: 12px 8px;
    border-left: 0;
    border-bottom: 3px solid transparent;
    font-size: 0.8rem;
  }
  .tab.router-link-exact-active {
    border-bottom-color: var(--oro);
  }
  .vista {
    padding: 20px 16px;
  }
}
</style>