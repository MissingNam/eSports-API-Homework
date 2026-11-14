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
const seleccion = ref([]) // v-list entrega un arreglo; con "single-independent" tiene 0 o 1 id
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
  if (!seleccion.value.length) return
  error.value = ''
  guardando.value = true
  try {
    await asignarJugador(props.idRoster, seleccion.value[0], rolEnRoster.value)
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

    <v-alert v-else-if="errorLista" type="error">
      {{ errorLista }}
      <template #append>
        <v-btn size="small" variant="outlined" @click="cargarLista">Reintentar</v-btn>
      </template>
    </v-alert>

    <p v-else-if="!todos.length" class="aviso">
      No hay jugadores registrados. Créalos primero en la pestaña Jugadores.
    </p>

    <p v-else-if="!hayDisponibles" class="aviso">Todos los jugadores ya están en este roster.</p>

    <template v-else>
      <v-text-field
        v-model="busqueda"
        type="search"
        placeholder="Buscar jugador..."
        aria-label="Buscar jugador"
        density="compact"
        hide-details
      />

      <v-list
        v-model:selected="seleccion"
        class="lista"
        select-strategy="single-independent"
        color="primary"
        density="compact"
        aria-label="Jugadores disponibles"
      >
        <v-list-item
          v-for="j in disponibles"
          :key="j.id"
          :value="j.id"
          :title="j.nickname"
          class="opcion"
        >
          <template #append>
            <v-chip label size="small" variant="outlined" color="primary" class="mr-2">{{ j.rol }}</v-chip>
            <v-chip
              label
              size="small"
              variant="outlined"
              :color="j.estado === 'activo' ? 'success' : undefined"
            >
              {{ j.estado }}
            </v-chip>
          </template>
        </v-list-item>
        <p v-if="!disponibles.length" class="aviso">Ningún jugador coincide con la búsqueda.</p>
      </v-list>

      <v-select v-model="rolEnRoster" :items="ROLES_EN_ROSTER" label="Rol en el roster" hide-details />

      <v-alert v-if="error" type="error">{{ error }}</v-alert>
    </template>

    <template #pie>
      <v-btn variant="outlined" color="primary" :disabled="guardando" @click="cerrar">Cancelar</v-btn>
      <v-btn
        color="primary"
        variant="flat"
        :loading="guardando"
        :disabled="!seleccion.length"
        @click="asignar"
      >
        {{ guardando ? 'Añadiendo...' : 'Añadir al roster' }}
      </v-btn>
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
  background: transparent;
}

.opcion {
  margin-bottom: 6px;
  background: rgb(var(--v-theme-azul-noche));
  border: 1px solid rgb(var(--v-theme-azul-borde));
  border-left: 3px solid rgb(var(--v-theme-oro-oscuro));
}
</style>