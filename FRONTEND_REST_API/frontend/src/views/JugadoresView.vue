<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import * as jugadoresApi from '../api/jugadores'
import * as aux from '../api/auxiliares'
import JugadorForm from '../components/JugadorForm.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'

// ---------- Listado y filtros ----------
const jugadores = ref([])
const cargando = ref(true)
const error = ref('')

const busqueda = ref('')
const filtroRol = ref('')
const filtroEstado = ref('')

const roles = ref([])
const estados = ref([])

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
      <input
        v-model="busqueda"
        class="entrada buscador"
        type="search"
        placeholder="Buscar jugador por nickname..."
        aria-label="Buscar jugador por nickname"
      />
      <button class="btn-agregar" type="button" title="Añadir jugador" aria-label="Añadir jugador" @click="abrirFormulario()">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
      </button>
    </div>

    <div class="filtros">
      <select v-model="filtroRol" class="entrada" aria-label="Filtrar por rol">
        <option value="">Todos los roles</option>
        <option v-for="r in roles" :key="r" :value="r">{{ r }}</option>
      </select>
      <select v-model="filtroEstado" class="entrada" aria-label="Filtrar por estado">
        <option value="">Todos los estados</option>
        <option v-for="e in estados" :key="e" :value="e">{{ e }}</option>
      </select>
      <span v-if="!error && !(cargando && !jugadores.length)" class="contador">
        {{ jugadores.length }} {{ jugadores.length === 1 ? 'jugador' : 'jugadores' }}
      </span>
    </div>

    <p v-if="error" class="mensaje-error">
      {{ error }}
      <button class="btn-enlace reintentar" type="button" @click="cargar">Reintentar</button>
    </p>

    <p v-else-if="cargando && !jugadores.length" class="aviso">Cargando jugadores...</p>

    <p v-else-if="!jugadores.length" class="aviso">
      {{ hayFiltros
        ? 'Ningún jugador coincide con la búsqueda.'
        : 'Aún no hay jugadores registrados. Usa el botón + para añadir el primero.' }}
    </p>

    <div v-else class="rejilla">
      <article v-for="j in jugadores" :key="j.id" class="jugador">
        <div class="acciones">
          <button class="btn-icono peligro" type="button" title="Eliminar" :aria-label="`Eliminar a ${j.nickname}`" @click="pedirEliminar(j)">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6" />
            </svg>
          </button>
          <button class="btn-icono" type="button" title="Editar" :aria-label="`Editar a ${j.nickname}`" @click="abrirFormulario(j)">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 20h4L19 9l-4-4L4 16v4z" />
              <path d="M13.5 6.5l4 4" />
            </svg>
          </button>
        </div>

        <h3>{{ j.nickname }}</h3>
        <p class="nombre">{{ j.nombre_real || 'Sin nombre registrado' }}</p>
        <p class="pais">{{ j.pais || 'País no indicado' }}</p>
        <div class="insignias">
          <span class="insignia">{{ j.rol }}</span>
          <span class="insignia" :class="j.estado">{{ j.estado }}</span>
        </div>
      </article>
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

.rejilla {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

.jugador {
  position: relative;
  padding: 18px 20px;
  background: linear-gradient(180deg, var(--azul-panel), var(--azul-profundo));
  border: 1px solid var(--oro-oscuro);
  transition: border-color 0.15s, box-shadow 0.15s;
}

.jugador:hover {
  border-color: var(--oro);
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

h3 {
  font-size: 1.25rem;
  color: var(--oro-claro);
  padding-right: 40px;
  overflow-wrap: anywhere;
}

.nombre {
  margin: 4px 0 0;
  color: var(--texto-fuerte);
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