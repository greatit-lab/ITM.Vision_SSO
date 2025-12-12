// frontend/src/router/index.ts
import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
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
    { path: "/", name: "home", component: HomeView },
    { path: "/waferflatdata", name: "wafer", component: WaferFlatDataView },
    {
      path: "/performance-trend",
      name: "performance",
      component: PerformanceTrendView,
    },
    {
      path: "/equipment-explorer",
      name: "equipment",
      component: EquipmentExplorerView,
    },
    { path: "/error-analytics", name: "error", component: ErrorAnalyticsView },
    { path: "/lamp-life", name: "lamp", component: LampLifeView },
    {
      path: "/prealign-analytics",
      name: "prealign",
      component: PreAlignAnalyticsView,
    },
    { path: "/process-memory", name: "process", component: ProcessMemoryView },
    {
      path: "/spectrum-analytics",
      name: "spectrum",
      component: SpectrumAnalysisView,
    },
    {
      path: "/lot-uniformity-trend",
      name: "lot-uniformity",
      component: LotUniformityTrendView,
    },
    {
      path: "/health",
      name: "health",
      component: EquipmentHealthView,
    },
    {
      path: "/process-matching",
      name: "process-matching",
      component: ProcessMatchingAnalyticsView,
    },
  ],
});

export default router;
