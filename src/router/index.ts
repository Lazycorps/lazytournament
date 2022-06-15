import { createRouter, createWebHistory } from "vue-router";
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("../views/HomeView.vue"),
    },
    {
      path: "/teams",
      name: "teams",
      component: () => import("../views/TeamsView.vue"),
    },
    {
      path: "/ranking",
      name: "ranking",
      component: () => import("../views/RankingView.vue"),
    },
    {
      path: "/round",
      name: "round",
      component: () => import("../views/RoundView.vue"),
    },
    {
      path: "/configuration",
      name: "Configuration",
      component: () => import("../views/TournamentView.vue"),
    },
  ],
});

export default router;
