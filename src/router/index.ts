import {
  createRouter,
  createWebHistory,
  type NavigationGuardNext,
  type RouteLocationNormalized,
} from "vue-router";
import { store } from "@/global/store";

const requireAuth = (
  _to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext,
) => {
  if (!store.config.token) {
    return next("/auth");
  }

  next();
};

const requireNoAuth = (
  _to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext,
) => {
  if (store.config.token) {
    return next("/app");
  }

  next();
};

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      name: "home",
      path: "/",
      component: () => import("@/views/HomeView.vue"),
    },
    {
      name: "app",
      path: "/app",
      component: () => import("@/views/AppView.vue"),
      beforeEnter: requireAuth,
    },
    {
      name: "auth",
      path: "/auth",
      component: () => import("@/views/AuthView.vue"),
      beforeEnter: requireNoAuth,
    },
    {
      name: "channel",
      path: "/channels/:channelId",
      component: () => import("@/views/ChannelView.vue"),
      beforeEnter: requireAuth,
    },
    {
      name: "add",
      path: "/add/:username",
      component: () => import("@/views/AppView.vue"),
      beforeEnter: (
        to: RouteLocationNormalized,
        _from: RouteLocationNormalized,
        next: NavigationGuardNext,
      ) => {
        store.invite = String(to.params.username);
        next("/app");
      },
    },
    {
      name: "verify",
      path: "/verify/:key",
      component: () => import("@/views/VerifyView.vue"),
    },
    {
      name: "not-found",
      path: "/:pathMatch(.*)*",
      component: () => import("@/views/NotFoundView.vue"),
    },
  ],
});
