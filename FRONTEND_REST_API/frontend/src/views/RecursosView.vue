<script setup>
import { ref, onMounted } from 'vue'
import * as aux from '../api/auxiliares'

const grupos = ref([])
const cargando = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const [roles, estados, tipos] = await Promise.all([
      aux.roles(),
      aux.estados(),
      aux.tiposRoster()
    ])
    grupos.value = [
      { titulo: 'Roles de jugador', ruta: '/roles', valores: roles },
      { titulo: 'Estados de jugador', ruta: '/estados', valores: estados },
      { titulo: 'Tipos de roster', ruta: '/tipos-roster', valores: tipos }
    ]
  } catch (e) {
    error.value = e.message
  } finally {
    cargando.value = false
  }
})
</script>

<template>
  <section>
    <h2 class="vista-titulo">Recursos</h2>

    <p v-if="cargando">Cargando...</p>
    <p v-else-if="error" class="mensaje-error">{{ error }}</p>

    <div v-else class="rejilla">
      <article v-for="g in grupos" :key="g.ruta" class="tarjeta-panel">
        <h3>{{ g.titulo }}</h3>
        <code>GET {{ g.ruta }}</code>
        <ul>
          <li v-for="v in g.valores" :key="v">{{ v }}</li>
        </ul>
      </article>
    </div>
  </section>
</template>

<style scoped>
.rejilla {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}

h3 {
  font-size: 1.05rem;
  color: var(--oro);
}

code {
  display: block;
  margin: 4px 0 14px;
  font-size: 0.8rem;
  color: var(--azul-hex);
}

ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

li {
  padding: 8px 12px;
  color: var(--texto-fuerte);
  background: var(--azul-noche);
  border: 1px solid var(--azul-borde);
  border-left: 3px solid var(--oro-oscuro);
}
</style>