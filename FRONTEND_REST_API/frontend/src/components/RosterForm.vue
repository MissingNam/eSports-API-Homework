<script setup>
import { computed, reactive, ref } from 'vue'
import ModalBase from './ModalBase.vue'
import { crear, actualizar } from '../api/rosters'

const props = defineProps({
  roster: { type: Object, default: null }, // null = crear, objeto = editar
  tipos: { type: Array, required: true }
})
const emit = defineEmits(['guardado', 'cerrar'])

const esEdicion = computed(() => props.roster !== null)

const form = reactive({
  nombre: props.roster?.nombre ?? '',
  juego: props.roster?.juego ?? '',
  tipo: props.roster?.tipo ?? '',
  temporada: props.roster?.temporada ?? String(new Date().getFullYear())
})

const cargando = ref(false)
const error = ref('')
const detalles = ref([])

async function guardar() {
  error.value = ''
  detalles.value = []

  const datos = {
    nombre: form.nombre.trim(),
    tipo: form.tipo,
    temporada: form.temporada.trim()
  }
  // Si se deja vacío no se envía y el servidor conserva / usa League of Legends
  if (form.juego.trim()) datos.juego = form.juego.trim()

  if (!datos.nombre) {
    error.value = 'El nombre es obligatorio.'
    return
  }
  if (!datos.temporada) {
    error.value = 'La temporada es obligatoria.'
    return
  }

  cargando.value = true
  try {
    const guardado = esEdicion.value
      ? await actualizar(props.roster.id, datos)
      : await crear(datos)
    emit('guardado', guardado)
  } catch (e) {
    error.value = e.message
    detalles.value = e.detalles ?? []
  } finally {
    cargando.value = false
  }
}

function cerrar() {
  if (!cargando.value) emit('cerrar')
}
</script>

<template>
  <ModalBase :titulo="esEdicion ? 'Editar roster' : 'Nuevo roster'" @cerrar="cerrar">
    <form id="form-roster" class="formulario" @submit.prevent="guardar">
      <div v-if="error" class="mensaje-error">
        {{ error }}
        <ul v-if="detalles.length">
          <li v-for="d in detalles" :key="d">{{ d }}</li>
        </ul>
      </div>

      <div class="campo">
        <label for="r-nombre">Nombre *</label>
        <input id="r-nombre" v-model="form.nombre" type="text" maxlength="100" required autofocus />
      </div>

      <div class="campo">
        <label for="r-juego">Juego</label>
        <input id="r-juego" v-model="form.juego" type="text" maxlength="100" placeholder="League of Legends (por defecto)" />
      </div>

      <div class="fila">
        <div class="campo">
          <label for="r-tipo">Tipo *</label>
          <select id="r-tipo" v-model="form.tipo" required>
            <option value="" disabled>Selecciona un tipo</option>
            <option v-for="t in tipos" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>

        <div class="campo">
          <label for="r-temporada">Temporada *</label>
          <input id="r-temporada" v-model="form.temporada" type="text" maxlength="10" required />
        </div>
      </div>
    </form>

    <template #pie>
      <button class="btn-enlace" type="button" :disabled="cargando" @click="cerrar">Cancelar</button>
      <button class="btn-oro" type="submit" form="form-roster" :disabled="cargando">
        {{ cargando ? 'Guardando...' : 'Guardar' }}
      </button>
    </template>
  </ModalBase>
</template>

<style scoped>
.formulario {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.fila {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.mensaje-error ul {
  margin: 6px 0 0;
  padding-left: 18px;
}
</style>