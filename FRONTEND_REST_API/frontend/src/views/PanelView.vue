<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()

// Mismo punto de corte que tenías (760px): por debajo, las pestañas pasan arriba
const { width } = useDisplay()
const angosto = computed(() => width.value < 760)

async function salir() {
  await auth.cerrarSesion()
  router.push({ name: 'login' })
}

// Cada ícono es una lista de rutas SVG (viewBox 24x24)
const enlaces = computed(() =>
  [
    {
      nombre: 'Inicio',
      ruta: 'inicio',
      visible: auth.esAdmin,
      icono: ['M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10']
    },
    {
      nombre: 'Jugadores',
      ruta: 'jugadores',
      visible: true,
      icono: ['M8 8a4 4 0 1 0 8 0a4 4 0 1 0 -8 0', 'M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7']
    },
    {
      nombre: 'Roster',
      ruta: 'rosters',
      visible: true,
      icono: ['M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6l8-3z']
    },
    {
      nombre: 'Recursos',
      ruta: 'recursos',
      visible: auth.esAdmin,
      icono: ['M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4z', 'M5 17a3 3 0 0 1 3-3h11']
    }
  ].filter((e) => e.visible)
)
</script>

<template>
  <v-app-bar flat color="azul-noche" class="barra-superior">
    <div class="barra">
      <v-btn variant="outlined" color="primary" size="small" @click="salir">Cerrar sesión</v-btn>
      <RouterLink :to="{ name: auth.esAdmin ? 'inicio' : 'jugadores' }" class="marca">
        {{ auth.esAdmin ? 'Panel de Administración' : 'Panel de Visualización' }}
      </RouterLink>
      <span class="usuario">{{ auth.nombreVisible }}</span>
    </div>

    <!-- Pantallas angostas: pestañas arriba, bajo la barra -->
    <template v-if="angosto" #extension>
      <v-tabs grow color="primary" class="tabs-superiores">
        <v-tab v-for="e in enlaces" :key="e.ruta" :to="{ name: e.ruta }" exact>
          <svg class="icono" viewBox="0 0 24 24" aria-hidden="true">
            <path v-for="d in e.icono" :key="d" :d="d" />
          </svg>
          <span class="ml-2">{{ e.nombre }}</span>
        </v-tab>
      </v-tabs>
    </template>
  </v-app-bar>

  <!-- Pantallas anchas: menú lateral fijo -->
  <v-navigation-drawer v-if="!angosto" permanent :width="220" color="azul-noche" class="menu-lateral">
    <v-list nav class="py-5">
      <v-list-item
        v-for="e in enlaces"
        :key="e.ruta"
        :to="{ name: e.ruta }"
        exact
        color="primary"
        class="tab"
      >
        <template #prepend>
          <svg class="icono" viewBox="0 0 24 24" aria-hidden="true">
            <path v-for="d in e.icono" :key="d" :d="d" />
          </svg>
        </template>
        <v-list-item-title>{{ e.nombre }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>

  <v-main class="vista-contenedor">
    <div class="vista" :class="angosto ? 'pa-5' : 'pa-8 px-10'">
      <RouterView />
    </div>
  </v-main>
</template>

<style scoped>
.barra-superior,
.menu-lateral {
  border-color: rgb(var(--v-theme-oro-oscuro)) !important;
}

/* ---------- Barra superior ---------- */
.barra {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 0 20px;
}

.barra .v-btn {
  justify-self: start;
}

.marca {
  font-family: var(--fuente-titulo);
  font-weight: 700;
  font-size: 1.15rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-primary));
  text-decoration: none;
}

.marca:hover {
  color: rgb(var(--v-theme-secondary));
}

.usuario {
  justify-self: end;
  font-family: var(--fuente-titulo);
  color: rgb(var(--v-theme-secondary));
  letter-spacing: 0.08em;
}

/* ---------- Pestañas ---------- */
.icono {
  width: 22px;
  height: 22px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.tab {
  padding: 8px 20px;
  font-family: var(--fuente-titulo);
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  border-left: 3px solid transparent;
}

.tab.v-list-item--active {
  color: rgb(var(--v-theme-secondary));
  border-left-color: rgb(var(--v-theme-primary));
  background: linear-gradient(90deg, rgba(200, 170, 110, 0.18), transparent);
}

.tab :deep(.v-list-item__prepend > .icono) {
  margin-right: 12px;
}

.tabs-superiores {
  width: 100%;
  border-top: 1px solid rgb(var(--v-theme-oro-oscuro));
  font-size: 0.8rem;
}

/* ---------- Contenido ---------- */
.vista-contenedor {
  background: rgb(var(--v-theme-azul-profundo));
}
</style>