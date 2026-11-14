<script setup>
defineProps({
  titulo: { type: String, required: true },
  ancho: { type: String, default: '460px' }
})
const emit = defineEmits(['cerrar'])
</script>

<template>
  <!-- v-dialog ya se encarga de Teleport, scrim, foco, scroll lock y tecla Escape -->
  <v-dialog
    :model-value="true"
    :max-width="ancho"
    scrollable
    scrim="azul-noche"
    @update:model-value="emit('cerrar')"
  >
    <v-card class="modal-base">
      <v-card-title class="d-flex align-center justify-space-between py-3">
        <h3 class="text-subtitle-1 text-primary">{{ titulo }}</h3>
        <v-btn icon variant="text" size="small" aria-label="Cerrar" @click="emit('cerrar')">
          <svg class="icono-x" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </v-btn>
      </v-card-title>

      <v-divider class="borde-oro" />

      <v-card-text class="d-flex flex-column ga-4 pa-5">
        <slot />
      </v-card-text>

      <template v-if="$slots.pie">
        <v-divider class="borde-oro" />
        <v-card-actions class="px-5 py-3 ga-3">
          <v-spacer />
          <slot name="pie" />
        </v-card-actions>
      </template>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.modal-base {
  background: linear-gradient(180deg, rgb(var(--v-theme-surface)), rgb(var(--v-theme-azul-profundo)));
  border: 1px solid rgb(var(--v-theme-primary));
  box-shadow:
    0 0 0 4px rgb(var(--v-theme-azul-noche)),
    0 0 0 5px rgb(var(--v-theme-oro-oscuro)),
    0 24px 70px rgba(0, 0, 0, 0.8);
}

.icono-x {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
}

.borde-oro {
  border-color: rgb(var(--v-theme-oro-oscuro));
  opacity: 1;
}
</style>