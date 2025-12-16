// frontend/src/router/index.ts
import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import LoginView from "../views/LoginView.vue";
import WaferFlatDataView from "../views/WaferFlatDataView.vue";
import PerformanceTrendView from "../views/PerformanceTrendView.vue";
import EquipmentExplorerView from "../views/EquipmentExplorerView.vue";
import ErrorAnalyticsView from "../views/ErrorAnalyticsView.vue";
import LampLifeView from "../views/LampLifeView.vue";
import PreAlignAnalyticsView from "../views/PreAlignAnalyticsView.vue";
import ProcessMemoryView from "../views/ProcessMemoryView.vue";
import SpectrumAnalysisView from "../views/SpectrumAnalysisView.vue";
import LotUniformityTrendView from "../views/LotUniformityTrendView.vue";
import EquipmentHealthView from "../views/EquipmentHealthView.vue";
import ProcessMatchingAnalyticsView from "../views/ProcessMatchingAnalyticsView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
      meta: { requiresAuth: true },
    },
    {
      path: "/login",
      name: "login",
      component: LoginView,
      meta: { requiresAuth: false },
    },
    {
      path: "/waferflatdata",
      name: "wafer",
      component: WaferFlatDataView,
      meta: { requiresAuth: true },
    },
    {
      path: "/performance-trend",
      name: "performance",
      component: PerformanceTrendView,
      meta: { requiresAuth: true },
    },
    {
      path: "/equipment-explorer",
      name: "equipment",
      component: EquipmentExplorerView,
      meta: { requiresAuth: true },
    },
    {
      path: "/error-analytics",
      name: "error",
      component: ErrorAnalyticsView,
      meta: { requiresAuth: true },
    },
    {
      path: "/lamp-life",
      name: "lamp",
      component: LampLifeView,
      meta: { requiresAuth: true },
    },
    {
      path: "/prealign-analytics",
      name: "prealign",
      component: PreAlignAnalyticsView,
      meta: { requiresAuth: true },
    },
    {
      path: "/process-memory",
      name: "process",
      component: ProcessMemoryView,
      meta: { requiresAuth: true },
    },
    {
      path: "/spectrum-analytics",
      name: "spectrum",
      component: SpectrumAnalysisView,
      meta: { requiresAuth: true },
    },
    {
      path: "/lot-uniformity-trend",
      name: "lot-uniformity",
      component: LotUniformityTrendView,
      meta: { requiresAuth: true },
    },
    {
      path: "/health",
      name: "health",
      component: EquipmentHealthView,
      meta: { requiresAuth: true },
    },
    {
      path: "/process-matching",
      name: "process-matching",
      component: ProcessMatchingAnalyticsView,
      meta: { requiresAuth: true },
    },
  ],
});

// [네비게이션 가드] 페이지 이동 전 인증 상태 확인
// [수정] from -> _from 으로 변경하여 미사용 변수 경고 해결
router.beforeEach((to, _from, next) => {
  // 로컬 스토리지에서 토큰 확인
  const isAuthenticated = !!localStorage.getItem("jwt_token");

  // 1. 인증이 필요한 페이지에 접속하려는데 로그인이 안 되어 있다면 -> 로그인 페이지로 이동
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: "login" });
  }
  // 2. 이미 로그인 상태인데 로그인 페이지로 진입하려 하면 -> 홈으로 이동
  else if (to.path === "/login" && isAuthenticated) {
    next({ name: "home" });
  }
  // 3. 그 외에는 정상 허용
  else {
    next();
  }
});

export default router;
