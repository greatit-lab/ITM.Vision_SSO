// frontend/src/stores/auth.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import http from '@/api/http';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<any>(null);
  const token = ref<string | null>(localStorage.getItem('itm_token'));

  // 세션 설정 (SAML 콜백 처리용)
  const setSession = (accessToken: string, userInfo: any) => {
    token.value = accessToken;
    user.value = userInfo;

    localStorage.setItem('itm_token', accessToken);
    if (userInfo) {
      localStorage.setItem('itm_user', JSON.stringify(userInfo));
    }

    // Axios 기본 헤더 설정
    http.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
  };

  // 로그아웃
  const logout = () => {
    token.value = null;
    user.value = null;
    localStorage.removeItem('itm_token');
    localStorage.removeItem('itm_user');
    delete http.defaults.headers.common['Authorization'];
    
    // 로그인 페이지로 이동
    location.href = '/login';
  };

  // 초기 로드 시 토큰 복원
  if (token.value) {
    http.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
    const storedUser = localStorage.getItem('itm_user');
    if (storedUser) {
      try {
        user.value = JSON.parse(storedUser);
      } catch (e) {
        console.error('Failed to parse user info', e);
      }
    }
  }

  return { user, token, setSession, logout };
});
