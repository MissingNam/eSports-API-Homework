<script setup>
import { ref, computed, onMounted } from 'vue'
import ModalBase from './ModalBase.vue'
import * as jugadoresApi from '../api/jugadores'
import { asignarJugador } from '../api/rosters'

const props = defineProps({
  idRoster: { type: Number, required: true },
  idsEnRoster: { type: Array, default: () => [] } // jugadores que ya están: no se ofrecen
})
const emit = defineEmits(['asignado', 'cerrar'])

const ROLES_EN_ROSTER = ['Titular', 'Suplente']

const todos = ref([])
const cargandoLista = ref(true)
const errorLista = ref('')

const busqueda = ref('')
const seleccion = ref(null)
const rolEnRoster = ref('Titular')

const guardando = ref(false)
const error = ref('')

const disponibles = computed(() => {
  const texto = busqueda.value.trim().toLowerCase()
  return todos.value.filter(
    (j) => !props.idsEnRoster.includes(j.id) && j.nickname.toLowerCase().includes(texto)
  )
})
const hayDisponibles = computed(() => todos.value.some((j) => !props.idsEnRoster.includes(j.id)))

async function cargarLista() {
  cargandoLista.value = true
  errorLista.value = ''
  try {
    todos.value = await jugadoresApi.listar()
  } catch (e) {
    errorLista.value = e.message
  } finally {
    cargandoLista.value = false
  }
}
onMounted(cargarLista)

async function asignar() {
  if (seleccion.value === null) return
  error.value = ''
  guardando.value = true
  try {
    await asignarJugador(props.idRoster, seleccion.value, rolEnRoster.value)
    emit('asignado')
  } catch (e) {
    // 409: ya hay un titular con ese rol, ya hay 5 titulares... el usuario puede probar como Suplente
    error.value = e.message
  } finally {
    guardando.value = false
  }
}

function cerrar() {
  if (!guardando.value) emit('cerrar')
}
</script>

<template>
  <ModalBase titulo="Añadir jugador al roster" ancho="520px" @cerrar="cerrar">
    <p v-if="cargandoLista" class="aviso">Cargando jugadores...</p>

    <p v-else-if="errorLista" class="mensaje-error">
      {{ errorLista }}
      <button class="btn-enlace" type="button" @click="cargarLista">Reintentar</button>
    </p>

    <p v-else-if="!todos.length" class="aviso">
      No hay jugadores registrados. Créalos primero en la pestaña Jugadores.
    </p>

    <p v-else-if="!hayDisponibles" class="aviso">Todos los jugadores ya están en este roster.</p>

    <template v-else>
      <input
        v-model="busqueda"
        class="entrada"
        type="search"
        placeholder="Buscar jugador..."
        aria-label="Buscar jugador"
      />

      <div class="lista" role="radiogroup" aria-label="Jugadores disponibles">
        <label v-for="j in disponibles" :key="j.id" class="opcion" :class="{ elegida: seleccion === j.id }">
          <input v-model="seleccion" type="radio" name="jugador" :value="j.id" />
          <span class="nick">{{ j.nickname }}</span>
          <span class="insignia">{{ j.rol }}</span>
          <span class="insignia" :class="j.estado">{{ j.estado }}</span>
        </label>
        <p v-if="!disponibles.length" class="aviso">Ningún jugador coincide con la búsqueda.</p>
      </div>

      <div class="campo">
        <label for="a-rol">Rol en el roster</label>
        <select id="a-rol" v-model="rolEnRoster">
          <option v-for="r in ROLES_EN_ROSTER" :key="r" :value="r">{{ r }}</option>
        </select>
      </div>

      <p v-if="error" class="mensaje-error">{{ error }}</p>
    </template>

    <template #pie>
      <button class="btn-enlace" type="button" :disabled="guardando" @click="cerrar">Cancelar</button>
      <button class="btn-oro" type="button" :disabled="guardando || seleccion === null" @click="asignar">
        {{ guardando ? 'Añadiendo...' : 'Añadir al roster' }}
      </button>
    </template>
  </ModalBase>
</template>

<style scoped>
.aviso {
  margin: 0;
  padding: 12px 0;
  text-align: center;
}

.lista {
  max-height: 280px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.opcion {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  background: var(--azul-noche);
  border: 1px solid var(--azul-borde);
  border-left: 3px solid var(--oro-oscuro);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}

.opcion:hover {
  border-color: var(--oro-oscuro);
}

.opcion.elegida {
  background: rgba(200, 170, 110, 0.14);
  border-color: var(--oro);
}

/* el radio queda oculto pero accesible por teclado */
.opcion input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.opcion:has(input:focus-visible) {
  outline: 2px solid var(--oro);
}

.nick {
  flex: 1;
  min-width: 0;
  color: var(--texto-fuerte);
  font-weight: 700;
  overflow-wrap: anywhere;
}
</style>