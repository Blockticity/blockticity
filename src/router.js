import { createRouter, createWebHashHistory } from 'vue-router';
import PlayerCOA from './views/PlayerCOA.vue';

const routes = [
  {
    path: '/playerscoa/:id',
    name: 'PlayerCOA',
    component: PlayerCOA
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
