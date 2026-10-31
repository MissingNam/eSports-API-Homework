import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import LoginView from '../views/LoginView.vue'
import PerfilView from '../views/PerfilView.vue'
import PanelView from '../views/PanelView.vue'
import InicioView from '../views/InicioView.vue'
import JugadoresView from '../views/JugadoresView.vue'
import RostersView from '../views/RostersView.vue'
import RecursosView from '../views/RecursosView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'login', component: LoginView, meta: { soloInvitado: true } },
    { path: '/perfil', name: 'perfil', component: PerfilView, meta: { requiereAuth: true, soloUsuario: true } },
    {
      path: '/',
      component: PanelView,
      meta: { requiereAuth: true, soloAdmin: true },
      children: [
        { path: '', name: 'inicio', component: InicioView },
        { path: 'jugadores', name: 'jugadores', component: JugadoresView },
        { path: 'rosters', name: 'rosters', component: RostersView },
        { path: 'recursos', name: 'recursos', component: RecursosView }
      ]
    },
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ]
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  if (!auth.verificada) await auth.restaurarSesion()

  const destino = auth.esAdmin ? 'inicio' : 'perfil'

  if (to.meta.requiereAuth && !auth.estaAutenticado) return { name: 'login' }
  if (to.meta.soloAdmin && !auth.esAdmin) return { name: 'perfil' }
  if (to.meta.soloUsuario && auth.esAdmin) return { name: 'inicio' }
  if (to.meta.soloInvitado && auth.estaAutenticado) return { name: destino }
})

export default router