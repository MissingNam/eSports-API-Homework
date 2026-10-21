<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { salud } from '../api/auxiliares'

const auth = useAuthStore()

const estado = ref('cargando') // 'cargando' | 'ok' | 'error'
const detalle = ref('')

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

    <div class="tarjeta-panel estado">
      <span class="punto" :class="estado"></span>
      <div class="texto">
        <strong v-if="estado === 'cargando'">Comprobando el servidor...</strong>
        <strong v-else-if="estado === 'ok'">Servidor funcionando: OK</strong>
        <strong v-else>El servidor no responde</strong>
        <span v-if="detalle">{{ detalle }}</span>
      </div>
      <button class="btn-enlace" :disabled="estado === 'cargando'" @click="verificar">
        Verificar
      </button>
    </div>
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
}

.texto {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.texto strong {
  color: var(--texto-fuerte);
  font-family: var(--fuente-titulo);
  letter-spacing: 0.06em;
}

.texto span {
  font-size: 0.9rem;
}

.punto {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  flex-shrink: 0;
}

.punto.cargando {
  background: var(--oro-oscuro);
}

.punto.ok {
  background: var(--exito);
  box-shadow: 0 0 10px var(--exito);
}

.punto.error {
  background: var(--error);
  box-shadow: 0 0 10px var(--error);
}

.btn-enlace:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>