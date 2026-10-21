<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import * as rostersApi from '../api/rosters'
import * as aux from '../api/auxiliares'
import RosterItem from '../components/RosterItem.vue'
import RosterForm from '../components/RosterForm.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'

// ---------- Listado ----------
const rosters = ref([])
const cargando = ref(true)
const error = ref('')
const tipos = ref([])

async function cargar() {
  cargando.value = true
  error.value = ''
  try {
    rosters.value = await rostersApi.listar()
  } catch (e) {
    error.value = e.message
  } finally {
    cargando.value = false
  }
}

onMounted(async () => {
  cargar()
  try {
    tipos.value = await aux.tiposRoster()
  } catch {
    // sin tipos no se puede abrir el formulario; abrirFormulario lo avisa
  }
})

// ---------- Búsqueda y filtros (en el navegador: la lista es corta) ----------
const busqueda = ref('')
const filtroTipo = ref('')
const filtroTemporada = ref('')

const temporadas = computed(() =>
  [...new Set(rosters.value.map((r) => r.temporada))].sort().reverse()
)

// Si ya no quedan rosters de la temporada filtrada (p. ej. se borró el último), se quita el filtro
watch(temporadas, (lista) => {
  if (filtroTemporada.value && !lista.includes(filtroTemporada.value)) filtroTemporada.value = ''
})

const hayFiltros = computed(() => !!(busqueda.value.trim() || filtroTipo.value || filtroTemporada.value))

const visibles = computed(() => {
  const texto = busqueda.value.trim().toLowerCase()
  return rosters.value
    .filter(
      (r) =>
        r.nombre.toLowerCase().includes(texto) &&
        (!filtroTipo.value || r.tipo === filtroTipo.value) &&
        (!filtroTemporada.value || r.temporada === filtroTemporada.value)
    )
    .sort((a, b) => b.temporada.localeCompare(a.temporada) || a.nombre.localeCompare(b.nombre))
})

// ---------- Crear / editar ----------
const formularioAbierto = ref(false)
const rosterEditando = ref(null)

function abrirFormulario(roster = null) {
  if (!tipos.value.length) {
    error.value = 'No se pudieron cargar los tipos de roster. Recarga la página.'
    return
  }
  rosterEditando.value = roster
  formularioAbierto.value = true
}

function alGuardar() {
  formularioAbierto.value = false
  cargar()
}

// ---------- Eliminar ----------
const rosterAEliminar = ref(null)
const eliminando = ref(false)
const errorEliminar = ref('')

function pedirEliminar(roster) {
  errorEliminar.value = ''
  rosterAEliminar.value = roster
}

async function confirmarEliminar() {
  eliminando.value = true
  errorEliminar.value = ''
  try {
    await rostersApi.eliminar(rosterAEliminar.value.id)
    rosterAEliminar.value = null
    cargar()
  } catch (e) {
    if (e.status === 404) {
      rosterAEliminar.value = null
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
    <h2 class="vista-titulo">Roster</h2>

    <div class="barra-busqueda">
      <input
        v-model="busqueda"
        class="entrada buscador"
        type="search"
        placeholder="Buscar roster por nombre..."
        aria-label="Buscar roster por nombre"
      />
      <button class="btn-agregar" type="button" title="Añadir roster" aria-label="Añadir roster" @click="abrirFormulario()">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
      </button>
    </div>

    <div class="filtros">
      <select v-model="filtroTipo" class="entrada" aria-label="Filtrar por tipo">
        <option value="">Todos los tipos</option>
        <option v-for="t in tipos" :key="t" :value="t">{{ t }}</option>
      </select>
      <select v-model="filtroTemporada" class="entrada" aria-label="Filtrar por temporada">
        <option value="">Todas las temporadas</option>
        <option v-for="t in temporadas" :key="t" :value="t">{{ t }}</option>
      </select>
      <span v-if="!error && !(cargando && !rosters.length)" class="contador">
        {{ visibles.length }} {{ visibles.length === 1 ? 'roster' : 'rosters' }}
      </span>
    </div>

    <p v-if="error" class="mensaje-error">
      {{ error }}
      <button class="btn-enlace reintentar" type="button" @click="cargar">Reintentar</button>
    </p>

    <p v-else-if="cargando && !rosters.length" class="aviso">Cargando rosters...</p>

    <p v-else-if="!visibles.length" class="aviso">
      {{ hayFiltros
        ? 'Ningún roster coincide con la búsqueda.'
        : 'Aún no hay rosters. Usa el botón + para crear el primero.' }}
    </p>

    <div v-else class="lista">
      <RosterItem
        v-for="r in visibles"
        :key="r.id"
        :roster="r"
        @editar="abrirFormulario"
        @eliminar="pedirEliminar"
      />
    </div>

    <RosterForm
      v-if="formularioAbierto"
      :roster="rosterEditando"
      :tipos="tipos"
      @guardado="alGuardar"
      @cerrar="formularioAbierto = false"
    />

    <ConfirmDialog
      v-if="rosterAEliminar"
      titulo="Eliminar roster"
      :cargando="eliminando"
      :error="errorEliminar"
      @confirmar="confirmarEliminar"
      @cancelar="rosterAEliminar = null"
    >
      <p>¿Estás seguro de que deseas borrar este roster?</p>
      <p><strong>{{ rosterAEliminar.nombre }}</strong></p>
      <p><small>Se eliminarán sus asignaciones, pero los jugadores seguirán registrados. Esta acción no se puede deshacer.</small></p>
    </ConfirmDialog>
  </section>
</template>

<style scoped>
.barra-busqueda {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.buscador {
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

.contador {
  margin-left: auto;
  font-size: 0.85rem;
  letter-spacing: 0.06em;
}

.aviso {
  padding: 32px 0;
  text-align: center;
}

.reintentar {
  margin-left: 12px;
}

.lista {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>