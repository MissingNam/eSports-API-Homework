<script setup>
import { ref, computed } from 'vue'
import * as rostersApi from '../api/rosters'
import AsignarJugadorModal from './AsignarJugadorModal.vue'

const props = defineProps({
  roster: { type: Object, required: true }
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

async function cambiarRol(j, evento) {
  const nuevo = evento.target.value
  if (nuevo === j.rol_en_roster) return

  errorAccion.value = ''
  ocupado.value = j.id
  try {
    await rostersApi.cambiarRol(props.roster.id, j.id, nuevo)
    await cargarJugadores()
  } catch (e) {
    evento.target.value = j.rol_en_roster // el servidor lo rechazó: el combobox vuelve a su valor
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
  <article class="roster" :class="{ abierto }">
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
        <span class="insignia">{{ roster.tipo }}</span>
        <span class="insignia">Temporada {{ roster.temporada }}</span>
        <span class="cantidad">{{ cantidad }} {{ cantidad === 1 ? 'jugador' : 'jugadores' }}</span>
      </button>

      <div class="acciones">
        <button class="btn-icono peligro" type="button" title="Eliminar roster" :aria-label="`Eliminar el roster ${roster.nombre}`" @click="emit('eliminar', roster)">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6" />
          </svg>
        </button>
        <button class="btn-icono" type="button" title="Editar roster" :aria-label="`Editar el roster ${roster.nombre}`" @click="emit('editar', roster)">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 20h4L19 9l-4-4L4 16v4z" />
            <path d="M13.5 6.5l4 4" />
          </svg>
        </button>
      </div>
    </div>

    <div v-if="abierto" :id="`roster-${roster.id}`" class="cuerpo">
      <p v-if="cargando && jugadores === null" class="aviso">Cargando jugadores...</p>

      <p v-else-if="error" class="mensaje-error">
        {{ error }}
        <button class="btn-enlace reintentar" type="button" @click="cargarJugadores">Reintentar</button>
      </p>

      <template v-else>
        <p v-if="errorAccion" class="mensaje-error">{{ errorAccion }}</p>

        <p class="resumen">
          Titulares: {{ titulares }}/{{ MAX_TITULARES }} · Suplentes: {{ suplentes }}
        </p>

        <p v-if="!ordenados.length" class="aviso">Este roster aún no tiene jugadores.</p>

        <div v-else class="jugadores">
          <div v-for="j in ordenados" :key="j.id" class="miembro">
            <button
              class="btn-icono peligro quitar"
              type="button"
              title="Quitar del roster"
              :aria-label="`Quitar a ${j.nickname} del roster`"
              :disabled="ocupado === j.id"
              @click="quitar(j)"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>

            <strong class="nick">{{ j.nickname }}</strong>
            <span class="insignia">{{ j.rol }}</span>

            <select
              class="entrada rol-roster"
              :value="j.rol_en_roster"
              :disabled="ocupado === j.id"
              :aria-label="`Rol de ${j.nickname} en el roster`"
              @change="cambiarRol(j, $event)"
            >
              <option v-for="r in ROLES_EN_ROSTER" :key="r" :value="r">{{ r }}</option>
            </select>
          </div>
        </div>

        <button class="agregar-jugador" type="button" title="Añadir jugador al roster" aria-label="Añadir jugador al roster" @click="asignarAbierto = true">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
        </button>
      </template>
    </div>

    <AsignarJugadorModal
      v-if="asignarAbierto"
      :id-roster="roster.id"
      :ids-en-roster="idsEnRoster"
      @asignado="alAsignar"
      @cerrar="asignarAbierto = false"
    />
  </article>
</template>

<style scoped>
.roster {
  background: linear-gradient(180deg, var(--azul-panel), var(--azul-profundo));
  border: 1px solid var(--oro-oscuro);
  transition: border-color 0.15s, box-shadow 0.15s;
}

.roster:hover,
.roster.abierto {
  border-color: var(--oro);
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
  stroke: var(--oro);
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
  color: var(--oro-claro);
  overflow-wrap: anywhere;
}

.titulo small {
  color: var(--texto);
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

/* ---------- Cuerpo desplegado ---------- */
.cuerpo {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px 20px 20px;
  border-top: 1px solid var(--oro-oscuro);
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
  color: var(--oro);
}

.reintentar {
  margin-left: 12px;
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
  background: var(--azul-noche);
  border: 1px solid var(--azul-borde);
  border-left: 3px solid var(--oro-oscuro);
}

.quitar {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 26px;
  height: 26px;
}

.quitar svg {
  width: 15px;
  height: 15px;
}

.nick {
  padding-right: 24px;
  color: var(--texto-fuerte);
  font-size: 1.05rem;
  overflow-wrap: anywhere;
}

.rol-roster {
  width: 100%;
  padding: 6px 8px;
  font-size: 0.9rem;
}

/* Rectángulo verde con "+" al final del desplegable */
.agregar-jugador {
  display: grid;
  place-items: center;
  width: 100%;
  height: 44px;
  padding: 0;
  color: #d6ffe9;
  background: linear-gradient(180deg, #0f7a4d, #095c3a);
  border: 1px solid var(--exito);
  cursor: pointer;
  transition: box-shadow 0.15s, filter 0.15s;
}

.agregar-jugador svg {
  width: 22px;
  height: 22px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2.4;
  stroke-linecap: round;
}

.agregar-jugador:hover {
  filter: brightness(1.2);
  box-shadow: 0 0 14px rgba(10, 207, 131, 0.5);
}
</style>