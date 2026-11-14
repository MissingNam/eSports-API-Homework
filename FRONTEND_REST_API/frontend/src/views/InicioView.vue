<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { salud } from '../api/auxiliares'

const auth = useAuthStore()

const estado = ref('cargando') // 'cargando' | 'ok' | 'error'
const detalle = ref('')

// color del indicador según el estado (nombres del tema de Vuetify)
const colorPunto = computed(
  () => ({ cargando: 'oro-oscuro', ok: 'success', error: 'error' })[estado.value]
)

async function verificar() {
  estado.value = 'cargando'
  detalle.value = ''
  try {
    const r = await salud()
    estado.value = r.status === 'ok' ? 'ok' : 'error'
    detalle.value = r.database === 'connected' ? 'Base de datos conectada' : ''
  } catch (e) {
    estado.value = 'error'
    detalle.value = e.message
  }
}

onMounted(verificar)
</script>

<template>
  <section>
    <h2 class="vista-titulo">Bienvenido, {{ auth.admin?.username }}</h2>
    <p class="intro">
      Desde este panel puedes administrar los jugadores y armar los rosters.
      Usa las pestañas de la izquierda para empezar.
    </p>

    <v-card class="estado pa-5">
      <span class="punto" :class="`bg-${colorPunto}`" :style="{ '--brillo': `var(--v-theme-${colorPunto})` }"></span>
      <div class="texto">
        <strong v-if="estado === 'cargando'">Comprobando el servidor...</strong>
        <strong v-else-if="estado === 'ok'">Servidor funcionando: OK</strong>
        <strong v-else>El servidor no responde</strong>
        <span v-if="detalle" class="text-body-2">{{ detalle }}</span>
      </div>
      <v-btn variant="outlined" color="primary" size="small" :disabled="estado === 'cargando'" @click="verificar">
        Verificar
      </v-btn>
    </v-card>
  </section>
</template>

<style scoped>
.intro {
  max-width: 560px;
  margin: 0 0 28px;
}

.estado {
  display: flex;
  align-items: center;
  gap: 16px;
  max-width: 560px;
  background: linear-gradient(180deg, rgb(var(--v-theme-surface)), rgb(var(--v-theme-azul-profundo)));
  border: 1px solid rgb(var(--v-theme-oro-oscuro));
}

.texto {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.texto strong {
  font-family: var(--fuente-titulo);
  letter-spacing: 0.06em;
}

.punto {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* brillo solo para ok / error */
.punto.bg-success,
.punto.bg-error {
  box-shadow: 0 0 10px rgb(var(--brillo));
}
</style>