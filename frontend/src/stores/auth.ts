// frontend/src/stores/auth.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

// Backend의 User 인터페이스와 구조 일치
export interface UserInfo {
  userId: string;
  name: string;
  email: string;
  department: string; // 부서명 (DeptName)
  GrdName?: string;   // 담당업무/직급 (GrdName) - 선택적 필드
  groups: string | string[];
  sessionIndex?: string;
  [key: string]: any;
}

export const useAuthStore = defineStore('auth', () => {
  // --- State ---
  const token = ref<string | null>(localStorage.getItem('jwt_token'));
  const user = ref<UserInfo | null>(
    localStorage.getItem('user_info') 
      ? JSON.parse(localStorage.getItem('user_info') as string) 
      : null
  );

  // --- Getters (Design Logic) ---
  
  // 1. 로그인 여부 확인
  const isAuthenticated = computed(() => !!token.value);

  // 2. 사용자 이름 (없으면 Guest)
  const userName = computed(() => user.value?.name || 'Guest');

  // 3. 사용자 이니셜 (이름 첫 글자 대문자, 아바타용)
  const userInitial = computed(() => {
    return user.value?.name ? user.value.name.charAt(0).toUpperCase() : 'U';
  });

  // 4. 관리자 여부 판단 (AD 그룹 기반)
  const isAdmin = computed(() => {
    if (!user.value?.groups) return false;
    
    const adminGroups = ['Administrators', 'ITM_Admins', 'System Managers', 'Domain Admins']; 
    const userGroups = user.value.groups;

    if (Array.isArray(userGroups)) {
      return userGroups.some(g => adminGroups.includes(g));
    } else {
      return adminGroups.includes(userGroups);
    }
  });

  // 5. 툴팁 표시용 상세 정보 (부서명/담당업무)
  const userDetailTooltip = computed(() => {
    const dept = user.value?.department || 'Unknown Dept';
    // GrdName이 없으면 title이나 공백 처리
    const grd = user.value?.GrdName || user.value?.title || ''; 
    
    return grd ? `${dept} / ${grd}` : dept;
  });

  // --- Actions ---
  
  // 로그인 성공 시 인증 정보 저장
  const setAuth = (newToken: string, newUser: UserInfo) => {
    token.value = newToken;
    user.value = newUser;
    localStorage.setItem('jwt_token', newToken);
    localStorage.setItem('user_info', JSON.stringify(newUser));
  };

  // 토큰만 갱신
  const setToken = (newToken: string) => {
    token.value = newToken;
    localStorage.setItem('jwt_token', newToken);
  };

  // 사용자 정보만 갱신
  const setUser = (newUser: UserInfo) => {
    user.value = newUser;
    localStorage.setItem('user_info', JSON.stringify(newUser));
  };

  // 로그아웃 처리
  const logout = () => {
    token.value = null;
    user.value = null;
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_info');
    
    window.location.href = '/login';
  };

  return {
    token,
    user,
    isAuthenticated,
    userName,
    userInitial,
    isAdmin,
    userDetailTooltip, // 툴팁용 Getter
    setAuth,
    setToken,
    setUser,
    logout
  };
});
