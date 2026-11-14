// src/plugins/vuetify.js  (en main.js: app.use(vuetify); importa theme.css DESPUÉS de este plugin)
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
// Registro explícito de TODOS los componentes: funciona sin plugins de Vite.
// (Si luego configuras vite-plugin-vuetify con autoImport, borra estas 2 líneas y la opción `components`.)
import * as components from 'vuetify/components'

const tema = {
  dark: true,
  colors: {
    background: '#010a13',        // --azul-noche
    surface: '#0a1e32',           // --azul-panel
    'surface-bright': '#091428',  // --azul-profundo
    primary: '#c8aa6e',           // --oro
    'on-primary': '#010a13',
    secondary: '#f0e6d2',         // --oro-claro
    error: '#e84057',             // --error
    success: '#0acf83',           // --exito
    warning: '#c8aa6e',           // aviso = dorado
    info: '#0ac8b9',              // --azul-hex
    'on-background': '#a09b8c',   // --texto
    'on-surface': '#f0e6d2',      // --texto-fuerte
    // colores propios (accesibles como rgb(var(--v-theme-NOMBRE)))
    'oro-oscuro': '#785a28',
    'azul-profundo': '#091428',
    'azul-noche': '#010a13',
    'azul-borde': '#1e2d3d'
  }
}

export default createVuetify({
  components,
  theme: { defaultTheme: 'tema', themes: { tema } },
  defaults: {
    VBtn: { rounded: 0 },
    VCard: { rounded: 0 },
    VTextField: { variant: 'outlined', density: 'comfortable', color: 'primary' },
    VAlert: { variant: 'tonal', density: 'compact', rounded: 0 }
  }
})