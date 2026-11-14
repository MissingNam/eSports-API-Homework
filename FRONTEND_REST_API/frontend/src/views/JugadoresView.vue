<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import * as jugadoresApi from '../api/jugadores'
import * as aux from '../api/auxiliares'
import JugadorForm from '../components/JugadorForm.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'

import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const puedeEditar = computed(() => auth.esAdmin)

// ---------- Listado y filtros ----------
const jugadores = ref([])
const cargando = ref(true)
const error = ref('')

const busqueda = ref('')
const filtroRol = ref('')
const filtroEstado = ref('')

const roles = ref([])
const estados = ref([])

// "Todos" usa '' para no cambiar la lógica de filtrado
const itemsRol = computed(() => [{ title: 'Todos los roles', value: '' }, ...roles.value])
const itemsEstado = computed(() => [{ title: 'Todos los estados', value: '' }, ...estados.value])

const hayFiltros = computed(() => !!(busqueda.value.trim() || filtroRol.value || filtroEstado.value))

let ultimaPeticion = 0 // evita que una respuesta lenta pise a una más reciente

async function cargar() {
  const id = ++ultimaPeticion
  cargando.value = true
  error.value = ''
  try {
    const datos = await jugadoresApi.listar({
      search: busqueda.value.trim(),
      rol: filtroRol.value,
      estado: filtroEstado.value
    })
    if (id !== ultimaPeticion) return
    jugadores.value = datos
  } catch (e) {
    if (id !== ultimaPeticion) return
    error.value = e.message
  } finally {
    if (id === ultimaPeticion) cargando.value = false
  }
}

let temporizador = null
watch(busqueda, () => {
  clearTimeout(temporizador)
  temporizador = setTimeout(cargar, 300) // espera a que termines de escribir
})
watch([filtroRol, filtroEstado], cargar)

onMounted(async () => {
  cargar()
  try {
    const [r, e] = await Promise.all([aux.roles(), aux.estados()])
    roles.value = r
    estados.value = e
  } catch {
    // sin roles no se puede abrir el formulario; abrirFormulario lo avisa
  }
})
onBeforeUnmount(() => clearTimeout(temporizador))

// ---------- Crear / editar ----------
const formularioAbierto = ref(false)
const jugadorEditando = ref(null)

function abrirFormulario(jugador = null) {
  if (!roles.value.length || !estados.value.length) {
    error.value = 'No se pudieron cargar los roles y estados. Recarga la página.'
    return
  }
  jugadorEditando.value = jugador
  formularioAbierto.value = true
}

function alGuardar() {
  formularioAbierto.value = false
  cargar()
}

// ---------- Eliminar ----------
const jugadorAEliminar = ref(null)
const eliminando = ref(false)
const errorEliminar = ref('')

function pedirEliminar(jugador) {
  errorEliminar.value = ''
  jugadorAEliminar.value = jugador
}

async function confirmarEliminar() {
  eliminando.value = true
  errorEliminar.value = ''
  try {
    await jugadoresApi.eliminar(jugadorAEliminar.value.id)
    jugadorAEliminar.value = null
    cargar()
  } catch (e) {
    if (e.status === 404) {
      // alguien ya lo había borrado: basta con refrescar la lista
      jugadorAEliminar.value = null
      cargar()
    } else {
      errorEliminar.value = e.message
    }
  } finally {
    eliminando.value = false
  }
}
</script>

<template>
  <section>
    <h2 class="vista-titulo">Jugadores</h2>

    <div class="barra-busqueda">
      <v-text-field
        v-model="busqueda"
        type="search"
        placeholder="Buscar jugador por nickname..."
        aria-label="Buscar jugador por nickname"
        hide-details
      />
      <v-btn
        v-if="puedeEditar"
        icon
        color="success"
        variant="flat"
        width="48"
        height="48"
        title="Añadir jugador"
        aria-label="Añadir jugador"
        @click="abrirFormulario()"
      >
        <svg class="icono icono-grande" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
      </v-btn>
    </div>

    <div class="filtros">
      <v-select
        v-model="filtroRol"
        :items="itemsRol"
        aria-label="Filtrar por rol"
        density="compact"
        hide-details
        class="filtro"
      />
      <v-select
        v-model="filtroEstado"
        :items="itemsEstado"
        aria-label="Filtrar por estado"
        density="compact"
        hide-details
        class="filtro"
      />
      <span v-if="!error && !(cargando && !jugadores.length)" class="contador">
        {{ jugadores.length }} {{ jugadores.length === 1 ? 'jugador' : 'jugadores' }}
      </span>
    </div>

    <v-alert v-if="error" type="error">
      {{ error }}
      <template #append>
        <v-btn size="small" variant="outlined" @click="cargar">Reintentar</v-btn>
      </template>
    </v-alert>

    <p v-else-if="cargando && !jugadores.length" class="aviso">Cargando jugadores...</p>

    <p v-else-if="!jugadores.length" class="aviso">
      {{ hayFiltros
        ? 'Ningún jugador coincide con la búsqueda.'
        : 'Aún no hay jugadores registrados. Usa el botón + para añadir el primero.' }}
    </p>

    <div v-else class="rejilla">
      <v-card v-for="j in jugadores" :key="j.id" class="jugador">
        <div v-if="puedeEditar" class="acciones">
          <v-btn
            icon
            variant="text"
            size="small"
            class="peligro"
            title="Eliminar"
            :aria-label="`Eliminar a ${j.nickname}`"
            @click="pedirEliminar(j)"
          >
            <svg class="icono" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6" />
            </svg>
          </v-btn>
          <v-btn icon variant="text" size="small" title="Editar" :aria-label="`Editar a ${j.nickname}`" @click="abrirFormulario(j)">
            <svg class="icono" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 20h4L19 9l-4-4L4 16v4z" />
              <path d="M13.5 6.5l4 4" />
            </svg>
          </v-btn>
        </div>

        <h3>{{ j.nickname }}</h3>
        <p class="nombre">{{ j.nombre_real || 'Sin nombre registrado' }}</p>
        <p class="pais">{{ j.pais || 'País no indicado' }}</p>
        <div class="insignias">
          <v-chip label size="small" variant="outlined" color="primary">{{ j.rol }}</v-chip>
          <v-chip label size="small" variant="outlined" :color="j.estado === 'activo' ? 'success' : undefined">
            {{ j.estado }}
          </v-chip>
        </div>
      </v-card>
    </div>

    <JugadorForm
      v-if="formularioAbierto"
      :jugador="jugadorEditando"
      :roles="roles"
      :estados="estados"
      @guardado="alGuardar"
      @cerrar="formularioAbierto = false"
    />

    <ConfirmDialog
      v-if="jugadorAEliminar"
      titulo="Eliminar jugador"
      :cargando="eliminando"
      :error="errorEliminar"
      @confirmar="confirmarEliminar"
      @cancelar="jugadorAEliminar = null"
    >
      <p>¿Estás seguro de que deseas borrar este jugador?</p>
      <p><strong>{{ jugadorAEliminar.nickname }}</strong></p>
      <p><small>También se quitará de todos los rosters en los que esté. Esta acción no se puede deshacer.</small></p>
    </ConfirmDialog>
  </section>
</template>

<style scoped>
.barra-busqueda {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.barra-busqueda .v-input {
  flex: 1;
  min-width: 0;
}

.filtros {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.filtro {
  flex: 0 1 220px;
}

.contador {
  margin-left: auto;
  font-size: 0.85rem;
  letter-spacing: 0.06em;
}

.aviso {
  padding: 32px 0;
  text-align: center;
}

.rejilla {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

.jugador {
  position: relative;
  padding: 18px 20px;
  background: linear-gradient(180deg, rgb(var(--v-theme-surface)), rgb(var(--v-theme-azul-profundo)));
  border: 1px solid rgb(var(--v-theme-oro-oscuro));
  transition: border-color 0.15s, box-shadow 0.15s;
}

.jugador:hover {
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 0 16px rgba(200, 170, 110, 0.15);
}

.acciones {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.icono {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.icono-grande {
  width: 22px;
  height: 22px;
  stroke-width: 2.4;
}

.peligro:hover {
  color: rgb(var(--v-theme-error));
}

h3 {
  font-size: 1.25rem;
  padding-right: 40px;
  overflow-wrap: anywhere;
}

.nombre {
  margin: 4px 0 0;
  color: rgb(var(--v-theme-on-surface));
  padding-right: 40px;
}

.pais {
  margin: 0 0 14px;
  font-size: 0.9rem;
}

.insignias {
  display: flex;
  gap: 8px;
}
</style>