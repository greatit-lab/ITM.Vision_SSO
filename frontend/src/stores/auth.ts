// frontend/src/stores/auth.ts
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import http from "@/api/http";

export interface UserInfo {
  userId: string;
  name: string;
  email: string;
  department: string;
  departmentName: string;
  companyCode: string;
  GrdName?: string;
  groups: string | string[];
  role?: string;
  sessionIndex?: string;
  // 사용자 컨텍스트
  site?: string;
  sdwt?: string;
  [key: string]: any;
}

export const useAuthStore = defineStore("auth", () => {
  // --- State ---
  const token = ref<string | null>(localStorage.getItem("jwt_token"));
  const user = ref<UserInfo | null>(
    localStorage.getItem("user_info")
      ? JSON.parse(localStorage.getItem("user_info") as string)
      : null
  );

  // --- Getters ---
  const isAuthenticated = computed(() => !!token.value);
  const userName = computed(() => user.value?.name || "Guest");

  const userInitial = computed(() => {
    return user.value?.name ? user.value.name.charAt(0).toUpperCase() : "U";
  });

  // Admin 또는 Manager
  const isAdmin = computed(() => {
    if (user.value?.role === "ADMIN" || user.value?.role === "MANAGER")
      return true;
    if (!user.value?.groups) return false;
    const adminGroups = ["Administrators", "ITM_Admins", "System Managers"];
    const userGroups = user.value.groups;
    if (Array.isArray(userGroups)) {
      return userGroups.some((g) => adminGroups.includes(g));
    } else {
      return adminGroups.includes(userGroups);
    }
  });

  // Super Admin
  const isSuperAdmin = computed(() => {
    if (user.value?.role === "ADMIN") return true;
    if (Array.isArray(user.value?.groups)) {
      return user.value.groups.includes("Administrators");
    }
    return user.value?.groups === "Administrators";
  });

  const userDetailTooltip = computed(() => {
    const dept =
      user.value?.departmentName || user.value?.department || "Unknown Dept";
    const grd = user.value?.GrdName || user.value?.title || "";
    return grd ? `${dept} / ${grd}` : dept;
  });

  // --- Actions ---
  const setAuth = (newToken: string, newUser: UserInfo) => {
    token.value = newToken;
    user.value = newUser;
    localStorage.setItem("jwt_token", newToken);
    localStorage.setItem("user_info", JSON.stringify(newUser));
  };

  const setToken = (newToken: string) => {
    token.value = newToken;
    localStorage.setItem("jwt_token", newToken);
  };

  // 사용자 정보 갱신
  const setUser = (newUser: UserInfo) => {
    user.value = newUser;
    localStorage.setItem("user_info", JSON.stringify(newUser));
  };

  const logout = () => {
    token.value = null;
    user.value = null;
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("user_info");
    window.location.href = "/login";
  };

  // 로그인 처리
  const loginAction = async (id: string, pw: string) => {
    try {
      const res = await http.post("/auth/login", {
        userId: id,
        password: pw,
      });

      if (res.data.access_token) {
        setAuth(res.data.access_token, res.data.user);
        return true;
      }
      return false;
    } catch (e) {
      throw e;
    }
  };

  // [수정] 데모 모드용 가상 로그인 (데이터 자동 조회를 위한 값 설정)
  const loginAsDemoUser = () => {
    const demoUser: UserInfo = {
      userId: "demo_user",
      name: "Demo User",
      email: "demo@itm.com",
      department: "Development",
      departmentName: "Dev Team",
      companyCode: "ITM",
      groups: ["Users"], 
      role: "USER",      
      
      // [중요] 초기 데이터 자동 조회를 위한 기본값 설정
      site: "Hanam",     
      sdwt: "WHT"        // <-- [수정필요] 실제 DB에 존재하는 장비 타입(SDWT) 입력 (예: 'WHT', 'EQP')
    };
    
    setAuth("demo-mode-dummy-token", demoUser);
  };

  return {
    token,
    user,
    isAuthenticated,
    userName,
    userInitial,
    isAdmin,
    isSuperAdmin,
    userDetailTooltip,
    setAuth,
    setToken,
    setUser,
    logout,
    loginAction,
    loginAsDemoUser,
  };
});
