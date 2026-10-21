<script setup>
import { onMounted, onBeforeUnmount } from 'vue'

defineProps({
  titulo: { type: String, required: true },
  ancho: { type: String, default: '460px' }
})
const emit = defineEmits(['cerrar'])

function alTeclear(e) {
  if (e.key === 'Escape') emit('cerrar')
}
onMounted(() => window.addEventListener('keydown', alTeclear))
onBeforeUnmount(() => window.removeEventListener('keydown', alTeclear))
</script>

<template>
  <Teleport to="body">
    <div class="fondo">
      <div class="modal" role="dialog" aria-modal="true" :style="{ maxWidth: ancho }">
        <header class="encabezado">
          <h3>{{ titulo }}</h3>
          <button class="btn-icono" type="button" aria-label="Cerrar" @click="emit('cerrar')">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </header>

        <div class="cuerpo">
          <slot />
        </div>

        <footer v-if="$slots.pie" class="pie">
          <slot name="pie" />
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.fondo {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(1, 10, 19, 0.82);
}

.modal {
  width: 100%;
  max-height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, var(--azul-panel), var(--azul-profundo));
  border: 1px solid var(--oro);
  box-shadow: 0 0 0 4px var(--azul-noche), 0 0 0 5px var(--oro-oscuro), 0 24px 70px rgba(0, 0, 0, 0.8);
}

.encabezado {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--oro-oscuro);
}

h3 {
  font-size: 1.1rem;
  color: var(--oro);
}

.cuerpo {
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pie {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 14px 20px;
  border-top: 1px solid var(--oro-oscuro);
}
</style>