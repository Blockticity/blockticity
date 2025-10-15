import { createRouter, createWebHashHistory } from 'vue-router';
import PlayerCOA from './views/PlayerCOA.vue';

const routes = [
  {
    path: '/coa/:id',
    name: 'COA',
    component: PlayerCOA
  },
  // Legacy route for backwards compatibility
  {
    path: '/playerscoa/:id',
    redirect: to => `/coa/${to.params.id}`
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
