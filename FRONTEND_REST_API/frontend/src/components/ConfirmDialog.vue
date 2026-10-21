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
    <p v-if="error" class="mensaje-error">{{ error }}</p>

    <template #pie>
      <button class="btn-enlace" type="button" :disabled="cargando" @click="cerrar">Cancelar</button>
      <button class="btn-peligro" type="button" :disabled="cargando" @click="emit('confirmar')">
        {{ cargando ? textoCargando : textoConfirmar }}
      </button>
    </template>
  </ModalBase>
</template>

<style scoped>
.mensaje {
  color: var(--texto-fuerte);
}

.mensaje :deep(p) {
  margin: 0 0 8px;
}

.mensaje :deep(small) {
  color: var(--texto);
}
</style>