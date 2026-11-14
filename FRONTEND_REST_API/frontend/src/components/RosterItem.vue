<script setup>
import { ref, computed } from 'vue'
import * as rostersApi from '../api/rosters'
import AsignarJugadorModal from './AsignarJugadorModal.vue'

const props = defineProps({
  roster: { type: Object, required: true },
  editable: { type: Boolean, default: false }
})
const emit = defineEmits(['editar', 'eliminar'])

const ROLES_EN_ROSTER = ['Titular', 'Suplente']
const ORDEN_ROL = ['Top', 'Jungle', 'Mid', 'ADC', 'Support']
const MAX_TITULARES = 5

const abierto = ref(false)
const jugadores = ref(null) // null = todavía no se han pedido
const cargando = ref(false)
const error = ref('')
const errorAccion = ref('')
const ocupado = ref(null) // id del jugador cuya acción está en curso
const asignarAbierto = ref(false)

// El contador usa la lista real cuando ya está cargada; si no, el que trae el listado
const cantidad = computed(() =>
  jugadores.value ? jugadores.value.length : Number(props.roster.cantidad_jugadores) || 0
)

// Titulares primero; dentro de cada grupo, por rol de juego y luego por nickname
const ordenados = computed(() =>
  [...(jugadores.value ?? [])].sort((a, b) => {
    const t = (b.rol_en_roster === 'Titular') - (a.rol_en_roster === 'Titular')
    return t || ORDEN_ROL.indexOf(a.rol) - ORDEN_ROL.indexOf(b.rol) || a.nickname.localeCompare(b.nickname)
  })
)
const titulares = computed(() => (jugadores.value ?? []).filter((j) => j.rol_en_roster === 'Titular').length)
const suplentes = computed(() => (jugadores.value ?? []).length - titulares.value)
const idsEnRoster = computed(() => (jugadores.value ?? []).map((j) => j.id))

async function cargarJugadores() {
  cargando.value = true
  error.value = ''
  try {
    jugadores.value = await rostersApi.listarJugadores(props.roster.id)
  } catch (e) {
    error.value = e.message
  } finally {
    cargando.value = false
  }
}

function alternar() {
  abierto.value = !abierto.value
  if (abierto.value && jugadores.value === null) cargarJugadores()
}

// v-select recibe el valor directamente. Como su model-value viene del jugador (no de un v-model local),
// si el servidor rechaza el cambio el selector vuelve solo a su valor anterior.
async function cambiarRol(j, nuevo) {
  if (nuevo === j.rol_en_roster) return

  errorAccion.value = ''
  ocupado.value = j.id
  try {
    await rostersApi.cambiarRol(props.roster.id, j.id, nuevo)
    await cargarJugadores()
  } catch (e) {
    errorAccion.value = e.message
  } finally {
    ocupado.value = null
  }
}

async function quitar(j) {
  errorAccion.value = ''
  ocupado.value = j.id
  try {
    await rostersApi.quitarJugador(props.roster.id, j.id)
    await cargarJugadores()
  } catch (e) {
    if (e.status === 404) await cargarJugadores() // ya no estaba: basta con refrescar
    else errorAccion.value = e.message
  } finally {
    ocupado.value = null
  }
}

function alAsignar() {
  asignarAbierto.value = false
  errorAccion.value = ''
  cargarJugadores()
}
</script>

<template>
  <v-card class="roster" :class="{ abierto }">
    <div class="cabecera">
      <button
        class="alternar"
        type="button"
        :aria-expanded="abierto"
        :aria-controls="`roster-${roster.id}`"
        @click="alternar"
      >
        <svg class="flecha" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
        <span class="titulo">
          <strong>{{ roster.nombre }}</strong>
          <small>{{ roster.juego }}</small>
        </span>
        <v-chip label size="small" variant="outlined" color="primary">{{ roster.tipo }}</v-chip>
        <v-chip label size="small" variant="outlined" color="primary">Temporada {{ roster.temporada }}</v-chip>
        <span class="cantidad">{{ cantidad }} {{ cantidad === 1 ? 'jugador' : 'jugadores' }}</span>
      </button>

      <div v-if="editable" class="acciones">
        <v-btn
          icon
          variant="text"
          size="small"
          class="peligro"
          title="Eliminar roster"
          :aria-label="`Eliminar el roster ${roster.nombre}`"
          @click="emit('eliminar', roster)"
        >
          <svg class="icono" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6" />
          </svg>
        </v-btn>
        <v-btn
          icon
          variant="text"
          size="small"
          title="Editar roster"
          :aria-label="`Editar el roster ${roster.nombre}`"
          @click="emit('editar', roster)"
        >
          <svg class="icono" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 20h4L19 9l-4-4L4 16v4z" />
            <path d="M13.5 6.5l4 4" />
          </svg>
        </v-btn>
      </div>
    </div>

    <div v-if="abierto" :id="`roster-${roster.id}`" class="cuerpo">
      <p v-if="cargando && jugadores === null" class="aviso">Cargando jugadores...</p>

      <v-alert v-else-if="error" type="error">
        {{ error }}
        <template #append>
          <v-btn size="small" variant="outlined" @click="cargarJugadores">Reintentar</v-btn>
        </template>
      </v-alert>

      <template v-else>
        <v-alert v-if="errorAccion" type="error">{{ errorAccion }}</v-alert>

        <p class="resumen">
          Titulares: {{ titulares }}/{{ MAX_TITULARES }} · Suplentes: {{ suplentes }}
        </p>

        <p v-if="!ordenados.length" class="aviso">Este roster aún no tiene jugadores.</p>

        <div v-else class="jugadores">
          <v-sheet v-for="j in ordenados" :key="j.id" class="miembro" color="azul-noche" border>
            <v-btn
              v-if="editable"
              icon
              variant="text"
              size="x-small"
              class="quitar peligro"
              title="Quitar del roster"
              :aria-label="`Quitar a ${j.nickname} del roster`"
              :disabled="ocupado === j.id"
              @click="quitar(j)"
            >
              <svg class="icono icono-chico" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </v-btn>

            <strong class="nick">{{ j.nickname }}</strong>
            <v-chip label size="small" variant="outlined" color="primary">{{ j.rol }}</v-chip>

            <v-select
              v-if="editable"
              :model-value="j.rol_en_roster"
              :items="ROLES_EN_ROSTER"
              :disabled="ocupado === j.id"
              :aria-label="`Rol de ${j.nickname} en el roster`"
              density="compact"
              hide-details
              class="rol-roster"
              @update:model-value="(nuevo) => cambiarRol(j, nuevo)"
            />
            <v-chip v-else label size="small" variant="outlined" color="primary">
              {{ j.rol_en_roster }}
            </v-chip>
          </v-sheet>
        </div>

        <v-btn
          v-if="editable"
          color="success"
          variant="flat"
          block
          height="44"
          title="Añadir jugador al roster"
          aria-label="Añadir jugador al roster"
          @click="asignarAbierto = true"
        >
          <svg class="icono icono-grande" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
        </v-btn>
      </template>
    </div>

    <AsignarJugadorModal
      v-if="asignarAbierto"
      :id-roster="roster.id"
      :ids-en-roster="idsEnRoster"
      @asignado="alAsignar"
      @cerrar="asignarAbierto = false"
    />
  </v-card>
</template>

<style scoped>
.roster {
  background: linear-gradient(180deg, rgb(var(--v-theme-surface)), rgb(var(--v-theme-azul-profundo)));
  border: 1px solid rgb(var(--v-theme-oro-oscuro));
  transition: border-color 0.15s, box-shadow 0.15s;
}

.roster:hover,
.roster.abierto {
  border-color: rgb(var(--v-theme-primary));
}

.roster.abierto {
  box-shadow: 0 0 16px rgba(200, 170, 110, 0.15);
}

/* ---------- Cabecera ---------- */
.cabecera {
  display: flex;
  align-items: flex-start;
}

.alternar {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 14px;
  padding: 18px 12px 18px 16px;
  background: none;
  border: 0;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.flecha {
  width: 20px;
  height: 20px;
  fill: none;
  stroke: rgb(var(--v-theme-primary));
  stroke-width: 2.2;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: transform 0.15s;
}

.abierto .flecha {
  transform: rotate(90deg);
}

.titulo {
  display: flex;
  flex-direction: column;
  min-width: 140px;
}

.titulo strong {
  font-family: var(--fuente-titulo);
  font-size: 1.2rem;
  letter-spacing: 0.06em;
  color: rgb(var(--v-theme-secondary));
  overflow-wrap: anywhere;
}

.cantidad {
  margin-left: auto;
  font-size: 0.9rem;
  letter-spacing: 0.04em;
}

.acciones {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 8px 0 0;
}

/* ---------- Iconos SVG dentro de v-btn ---------- */
.icono {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.icono-chico {
  width: 15px;
  height: 15px;
}

.icono-grande {
  width: 22px;
  height: 22px;
  stroke-width: 2.4;
}

.peligro:hover {
  color: rgb(var(--v-theme-error));
}

/* ---------- Cuerpo desplegado ---------- */
.cuerpo {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px 20px 20px;
  border-top: 1px solid rgb(var(--v-theme-oro-oscuro));
}

.aviso {
  margin: 0;
  padding: 8px 0;
  text-align: center;
}

.resumen {
  margin: 0;
  font-size: 0.85rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-primary));
}

.jugadores {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 12px;
}

.miembro {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  padding: 14px 14px 14px 16px;
  border-color: rgb(var(--v-theme-azul-borde));
  border-left: 3px solid rgb(var(--v-theme-oro-oscuro));
}

.quitar {
  position: absolute;
  top: 4px;
  right: 4px;
}

.nick {
  padding-right: 24px;
  font-size: 1.05rem;
  overflow-wrap: anywhere;
}

.rol-roster {
  width: 100%;
}
</style>