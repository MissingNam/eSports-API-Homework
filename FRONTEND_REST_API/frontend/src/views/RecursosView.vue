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
    <v-alert v-else-if="error" type="error">{{ error }}</v-alert>

    <v-row v-else>
      <v-col v-for="g in grupos" :key="g.ruta" cols="12" sm="6" lg="4">
      <v-card class="grupo pa-5 h-100">
        <h3>{{ g.titulo }}</h3>
        <code>GET {{ g.ruta }}</code>
        <v-list class="valores pa-0" bg-color="transparent">
          <v-list-item v-for="v in g.valores" :key="v" :title="v" class="valor" />
        </v-list>
      </v-card>
      </v-col>
    </v-row>
  </section>
</template>

<style scoped>
.grupo {
  background: linear-gradient(180deg, rgb(var(--v-theme-surface)), rgb(var(--v-theme-azul-profundo)));
  border: 1px solid rgb(var(--v-theme-oro-oscuro));
}

h3 {
  font-size: 1.05rem;
  color: rgb(var(--v-theme-primary));
}

code {
  display: block;
  margin: 4px 0 14px;
  font-size: 0.8rem;
  color: rgb(var(--v-theme-info));
}

.valor {
  margin-bottom: 8px;
  background: rgb(var(--v-theme-azul-noche));
  border: 1px solid rgb(var(--v-theme-azul-borde));
  border-left: 3px solid rgb(var(--v-theme-oro-oscuro));
}
</style>