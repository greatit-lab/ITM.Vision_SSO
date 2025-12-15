// frontend/vite.config.ts
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import basicSsl from "@vitejs/plugin-basic-ssl"; // [신규 추가] HTTPS 플러그인

export default defineConfig({
  plugins: [
    vue(),
    basicSsl() // [신규 추가] 이 플러그인이 자동으로 인증서를 생성하고 https를 활성화합니다.
  ],
  server: {
    host: "0.0.0.0",
    port: 8082, // 개발 포트
    strictPort: true,
    // https: true, // basicSsl 플러그인이 자동으로 true로 설정하므로 주석 처리해도 됨
    proxy: {
      "/api": {
        target: "http://localhost:3000", // 백엔드는 여전히 HTTP (3000) 유지 (Vite가 SSL 종료 후 전달)
        changeOrigin: true,
        secure: false, // 백엔드가 HTTP이므로 보안 검증 무시
      },
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
