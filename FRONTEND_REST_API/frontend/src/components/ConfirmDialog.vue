<script setup>
import ModalBase from './ModalBase.vue'

const props = defineProps({
  titulo: { type: String, default: 'Confirmar' },
  textoConfirmar: { type: String, default: 'Eliminar' },
  textoCargando: { type: String, default: 'Eliminando...' },
  cargando: { type: Boolean, default: false },
  error: { type: String, default: '' }
})
const emit = defineEmits(['confirmar', 'cancelar'])

function cerrar() {
  if (!props.cargando) emit('cancelar')
}
</script>

<template>
  <ModalBase :titulo="titulo" ancho="440px" @cerrar="cerrar">
    <div class="mensaje"><slot /></div>
    <v-alert v-if="error" type="error">{{ error }}</v-alert>

    <template #pie>
      <v-btn variant="text" :disabled="cargando" @click="cerrar">Cancelar</v-btn>
      <v-btn color="error" variant="flat" :disabled="cargando" @click="emit('confirmar')">
        {{ cargando ? textoCargando : textoConfirmar }}
      </v-btn>
    </template>
  </ModalBase>
</template>

<style scoped>
.mensaje :deep(p) {
  margin: 0 0 8px;
}

.mensaje :deep(small) {
  opacity: 0.75;
}
</style>