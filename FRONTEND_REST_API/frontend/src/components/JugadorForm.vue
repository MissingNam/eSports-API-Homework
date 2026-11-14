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
  rol: props.jugador?.rol ?? null,
  estado: props.jugador?.estado ?? 'activo'
})

const cargando = ref(false)
const error = ref('')
const detalles = ref([])

const requerido = (v) => !!v?.toString().trim() || 'Campo obligatorio'

function traducirError(e) {
  // El servidor responde un 409 genérico cuando el nickname ya existe
  if (e.status === 409 && e.message.includes('valor unico')) {
    return 'Ya existe un jugador con ese nickname.'
  }
  return e.message
}

// v-form emite un "submit" que se puede await para conocer el resultado de las reglas
async function guardar(evento) {
  const { valid } = await evento
  if (!valid) return

  error.value = ''
  detalles.value = []

  const datos = {
    nickname: form.nickname.trim(),
    nombre_real: form.nombre_real.trim() || null, // vacío = sin dato
    pais: form.pais.trim() || null,
    rol: form.rol,
    estado: form.estado
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
    <v-form id="form-jugador" class="d-flex flex-column ga-4" @submit.prevent="guardar">
      <v-alert v-if="error" type="error">
        {{ error }}
        <ul v-if="detalles.length" class="detalles">
          <li v-for="d in detalles" :key="d">{{ d }}</li>
        </ul>
      </v-alert>

      <v-text-field
        v-model="form.nickname"
        label="Nickname *"
        maxlength="50"
        autofocus
        :rules="[requerido]"
      />

      <v-text-field v-model="form.nombre_real" label="Nombre real" maxlength="100" />

      <v-text-field v-model="form.pais" label="País" maxlength="60" />

      <v-row dense>
        <v-col cols="12" sm="6">
          <v-select
            v-model="form.rol"
            :items="roles"
            label="Rol *"
            placeholder="Selecciona un rol"
            :rules="[(v) => !!v || 'Selecciona un rol']"
          />
        </v-col>
        <v-col cols="12" sm="6">
          <v-select
            v-model="form.estado"
            :items="estados"
            label="Estado *"
            :rules="[(v) => !!v || 'Selecciona un estado']"
          />
        </v-col>
      </v-row>
    </v-form>

    <template #pie>
      <v-btn variant="outlined" color="primary" :disabled="cargando" @click="cerrar">Cancelar</v-btn>
      <v-btn type="submit" form="form-jugador" color="primary" variant="flat" :loading="cargando">
        {{ cargando ? 'Guardando...' : 'Guardar' }}
      </v-btn>
    </template>
  </ModalBase>
</template>

<style scoped>
.detalles {
  margin: 6px 0 0;
  padding-left: 18px;
}
</style>