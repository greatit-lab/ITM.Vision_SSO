// frontend/src/router/index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useMenuStore } from "@/stores/menu";
import type { MenuNode } from "@/api/menu";

// View Components
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
import ItmAgentMemoryView from "../views/ItmAgentMemoryView.vue";

// Admin Components
import AdminLayout from "../views/admin/AdminLayout.vue";
import MenuManagementView from "../views/admin/MenuManagementView.vue";
import UserManagementView from "../views/admin/UserManagementView.vue";
import InfraManagementView from "../views/admin/InfraManagementView.vue";
import SystemConfigView from "../views/admin/SystemConfigView.vue";

// Routes Definition
const routes: Array<RouteRecordRaw> = [
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
  {
    path: "/agent-memory",
    name: "agent-memory",
    component: ItmAgentMemoryView,
    meta: { requiresAuth: true },
  },
  
  // [관리자 섹션] AdminLayout을 적용하여 하위 탭 구조로 변경
  {
    path: "/admin",
    component: AdminLayout,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: "",
        redirect: { name: "admin-menus" }, // 기본 진입 시 메뉴 관리 탭으로 이동
      },
      // 1. 메뉴 및 권한 (Menu & Roles)
      {
        path: "menus",
        name: "admin-menus",
        component: MenuManagementView,
        meta: { title: "Menu Management" },
      },
      // 2. 사용자 및 보안 (User & Security)
      {
        path: "users",
        name: "admin-users",
        component: UserManagementView, 
        meta: { title: "User & Security" },
      },
      // 3. 인프라 관리 (Infrastructure)
      {
        path: "infra",
        name: "admin-infra",
        component: InfraManagementView,
        meta: { title: "Infrastructure" },
      },
      // 4. 시스템 설정 (System Config)
      {
        path: "system",
        name: "admin-system",
        component: SystemConfigView,
        meta: { title: "System Config" },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

/**
 * [Helper] 재귀적으로 메뉴 트리에서 경로 권한을 확인하는 함수
 * @param targetPath 이동하려는 경로
 * @param menus 현재 사용자의 메뉴 리스트
 * @returns 권한 존재 여부 (boolean)
 */
function checkRoutePermission(targetPath: string, menus: MenuNode[]): boolean {
  for (const menu of menus) {
    // 1. 현재 메뉴의 경로와 일치하는지 확인
    if (menu.routerPath === targetPath) {
      return true;
    }
    // 2. 자식 메뉴가 있다면 재귀적으로 확인
    if (menu.children && menu.children.length > 0) {
      if (checkRoutePermission(targetPath, menu.children)) {
        return true;
      }
    }
  }
  return false;
}

// [Navigation Guard] 페이지 이동 전 인증 및 권한 확인
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore();
  const menuStore = useMenuStore();

  const isAuthenticated = authStore.isAuthenticated;
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const requiresAdmin = to.matched.some((record) => record.meta.requiresAdmin);

  // 1. 인증이 필요한 페이지에 접속 시도 시 (로그인 여부 체크)
  if (requiresAuth && !isAuthenticated) {
    return next({ name: "login" });
  }

  // 2. 이미 로그인 상태에서 로그인 페이지 접속 시도 시 (홈으로 리다이렉트)
  if (to.path === "/login" && isAuthenticated) {
    return next({ name: "home" });
  }

  // 3. 로그인 된 상태에서의 권한 정밀 검사
  if (isAuthenticated) {
    // 3-1. 관리자 권한 체크 (Admin Routes)
    if (requiresAdmin && !authStore.isAdmin) {
      alert("Access Denied: Administrator privileges are required.");
      return next({ name: "home" });
    }

    // 3-2. 동적 메뉴 권한 체크 (Dynamic Menu Permission)
    // 메뉴 데이터가 아직 로드되지 않았다면 서버에서 가져옴
    if (menuStore.menus.length === 0) {
      await menuStore.loadMenus();
    }

    // 예외: 홈('/')은 기본 대시보드로서 항상 허용.
    // 관리자 페이지(/admin/*)는 별도 requiresAdmin 가드로 처리되므로 여기서는 체크 생략 가능.
    // agent-memory도 메뉴에 등록되어 있다면 체크 대상이 되지만, 개발 편의상 일단 예외 처리하거나 메뉴 DB에 추가해야 함.
    if (
      to.path !== "/" && 
      !to.path.startsWith("/admin") &&
      to.name !== "agent-memory" // 개발 중인 페이지 임시 허용
    ) {
      const hasPermission = checkRoutePermission(to.path, menuStore.menus);

      if (!hasPermission) {
        console.warn(`[Router Guard] Unauthorized access attempt to: ${to.path}`);
        alert("접근 권한이 없는 메뉴입니다.");
        return next({ name: "home" });
      }
    }
  }

  // 4. 모든 검사 통과
  next();
});

export default router;
