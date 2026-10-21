<script setup>
import { computed, reactive, ref } from 'vue'
import ModalBase from './ModalBase.vue'
import { crear, actualizar } from '../api/jugadores'

const props = defineProps({
  jugador: { type: Object, default: null }, // null = crear, objeto = editar
  roles: { type: Array, required: true },
  estados: { type: Array, required: true }
})
const emit = defineEmits(['guardado', 'cerrar'])

const esEdicion = computed(() => props.jugador !== null)

const form = reactive({
  nickname: props.jugador?.nickname ?? '',
  nombre_real: props.jugador?.nombre_real ?? '',
  pais: props.jugador?.pais ?? '',
  rol: props.jugador?.rol ?? '',
  estado: props.jugador?.estado ?? 'activo'
})

const cargando = ref(false)
const error = ref('')
const detalles = ref([])

function traducirError(e) {
  // El servidor responde un 409 genérico cuando el nickname ya existe
  if (e.status === 409 && e.message.includes('valor unico')) {
    return 'Ya existe un jugador con ese nickname.'
  }
  return e.message
}

async function guardar() {
  error.value = ''
  detalles.value = []

  const datos = {
    nickname: form.nickname.trim(),
    nombre_real: form.nombre_real.trim() || null, // vacío = sin dato
    pais: form.pais.trim() || null,
    rol: form.rol,
    estado: form.estado
  }
  if (!datos.nickname) {
    error.value = 'El nickname es obligatorio.'
    return
  }

  cargando.value = true
  try {
    const guardado = esEdicion.value
      ? await actualizar(props.jugador.id, datos)
      : await crear(datos)
    emit('guardado', guardado)
  } catch (e) {
    error.value = traducirError(e)
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
  <ModalBase :titulo="esEdicion ? 'Editar jugador' : 'Nuevo jugador'" @cerrar="cerrar">
    <form id="form-jugador" class="formulario" @submit.prevent="guardar">
      <div v-if="error" class="mensaje-error">
        {{ error }}
        <ul v-if="detalles.length">
          <li v-for="d in detalles" :key="d">{{ d }}</li>
        </ul>
      </div>

      <div class="campo">
        <label for="f-nickname">Nickname *</label>
        <input id="f-nickname" v-model="form.nickname" type="text" maxlength="50" required autofocus />
      </div>

      <div class="campo">
        <label for="f-nombre">Nombre real</label>
        <input id="f-nombre" v-model="form.nombre_real" type="text" maxlength="100" />
      </div>

      <div class="campo">
        <label for="f-pais">País</label>
        <input id="f-pais" v-model="form.pais" type="text" maxlength="60" />
      </div>

      <div class="fila">
        <div class="campo">
          <label for="f-rol">Rol *</label>
          <select id="f-rol" v-model="form.rol" required>
            <option value="" disabled>Selecciona un rol</option>
            <option v-for="r in roles" :key="r" :value="r">{{ r }}</option>
          </select>
        </div>

        <div class="campo">
          <label for="f-estado">Estado *</label>
          <select id="f-estado" v-model="form.estado" required>
            <option v-for="e in estados" :key="e" :value="e">{{ e }}</option>
          </select>
        </div>
      </div>
    </form>

    <template #pie>
      <button class="btn-enlace" type="button" :disabled="cargando" @click="cerrar">Cancelar</button>
      <button class="btn-oro" type="submit" form="form-jugador" :disabled="cargando">
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