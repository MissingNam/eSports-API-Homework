<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()

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
  <!-- Barra superior: 3 columnas del grid (botón | título | usuario) -->
  <v-app-bar flat color="azul-noche" class="barra-superior">
    <v-container fluid class="py-0">
      <v-row align="center" no-gutters>
        <v-col cols="4" sm="3">
          <v-btn variant="outlined" color="primary" size="small" @click="salir">Cerrar sesión</v-btn>
        </v-col>
        <v-col cols="4" sm="6" class="text-center">
          <RouterLink :to="{ name: auth.esAdmin ? 'inicio' : 'jugadores' }" class="marca text-body-2">
            {{ auth.esAdmin ? 'Panel de Administración' : 'Panel de Visualización' }}
          </RouterLink>
        </v-col>
        <v-col cols="4" sm="3" class="text-end">
          <span class="usuario text-body-2">{{ auth.nombreVisible }}</span>
        </v-col>
      </v-row>
    </v-container>
  </v-app-bar>

  <v-main class="vista-contenedor d-flex">
    <v-container fluid class="pa-0 d-flex flex-column">
      <v-row no-gutters class="flex-grow-1 align-content-start align-content-md-stretch">
        <!-- Menú: arriba (12 columnas) en pantallas chicas; columna lateral desde "md" -->
        <v-col cols="12" md="3" class="menu">
          <nav aria-label="Secciones">
            <v-row no-gutters>
              <v-col v-for="e in enlaces" :key="e.ruta" cols="6" sm="3" md="12">
                <v-btn
                  :to="{ name: e.ruta }"
                  exact
                  variant="text"
                  block
                  height="52"
                  class="tab justify-start"
                >
                  <template #prepend>
                    <svg class="icono" viewBox="0 0 24 24" aria-hidden="true">
                      <path v-for="d in e.icono" :key="d" :d="d" />
                    </svg>
                  </template>
                  {{ e.nombre }}
                </v-btn>
              </v-col>
            </v-row>
          </nav>
        </v-col>

        <v-col cols="12" md="9" class="pa-4 pa-md-8">
          <RouterView />
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<style scoped>
.barra-superior {
  border-bottom: 1px solid rgb(var(--v-theme-oro-oscuro));
}

.marca {
  font-family: var(--fuente-titulo);
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-primary));
  text-decoration: none;
}

.marca:hover {
  color: rgb(var(--v-theme-secondary));
}

.usuario {
  font-family: var(--fuente-titulo);
  color: rgb(var(--v-theme-secondary));
  letter-spacing: 0.08em;
}

.vista-contenedor {
  background: rgb(var(--v-theme-azul-profundo));
}

/* ---------- Menú ---------- */
.menu {
  background: rgb(var(--v-theme-azul-noche));
  border-bottom: 1px solid rgb(var(--v-theme-oro-oscuro));
}

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
  font-family: var(--fuente-titulo);
  font-weight: 600;
  letter-spacing: 0.12em;
  color: rgb(var(--v-theme-on-background));
  border-bottom: 3px solid transparent;
}

.tab.v-btn--active {
  color: rgb(var(--v-theme-secondary));
  border-bottom-color: rgb(var(--v-theme-primary));
  background: rgba(200, 170, 110, 0.14);
}
</style>