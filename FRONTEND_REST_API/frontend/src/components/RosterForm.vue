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
  tipo: props.roster?.tipo ?? null,
  temporada: props.roster?.temporada ?? String(new Date().getFullYear())
})

const cargando = ref(false)
const error = ref('')
const detalles = ref([])

const requerido = (v) => !!v?.toString().trim() || 'Campo obligatorio'

// v-form emite un "submit" que se puede await para conocer el resultado de las reglas
async function guardar(evento) {
  const { valid } = await evento
  if (!valid) return

  error.value = ''
  detalles.value = []

  const datos = {
    nombre: form.nombre.trim(),
    tipo: form.tipo,
    temporada: form.temporada.trim()
  }
  // Si se deja vacío no se envía y el servidor conserva / usa League of Legends
  if (form.juego.trim()) datos.juego = form.juego.trim()

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
    <v-form id="form-roster" class="d-flex flex-column ga-4" @submit.prevent="guardar">
      <v-alert v-if="error" type="error">
        {{ error }}
        <ul v-if="detalles.length" class="detalles">
          <li v-for="d in detalles" :key="d">{{ d }}</li>
        </ul>
      </v-alert>

      <v-text-field
        v-model="form.nombre"
        label="Nombre *"
        maxlength="100"
        autofocus
        :rules="[requerido]"
      />

      <v-text-field
        v-model="form.juego"
        label="Juego"
        maxlength="100"
        placeholder="League of Legends (por defecto)"
        persistent-placeholder
      />

      <v-row dense>
        <v-col cols="12" sm="6">
          <v-select
            v-model="form.tipo"
            :items="tipos"
            label="Tipo *"
            placeholder="Selecciona un tipo"
            :rules="[(v) => !!v || 'Selecciona un tipo']"
          />
        </v-col>
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="form.temporada"
            label="Temporada *"
            maxlength="10"
            :rules="[requerido]"
          />
        </v-col>
      </v-row>
    </v-form>

    <template #pie>
      <v-btn variant="outlined" color="primary" :disabled="cargando" @click="cerrar">Cancelar</v-btn>
      <v-btn type="submit" form="form-roster" color="primary" variant="flat" :loading="cargando">
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