import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import PrimeVue from "primevue/config";
import Aura from "@primevue/themes/aura"; // [추가] v4 테마 프리셋 임포트
import Tooltip from "primevue/tooltip";
import "primeicons/primeicons.css";
import "./style.css";

// [삭제] 아래 라인은 v4에서 존재하지 않는 파일이므로 지워야 합니다.
// import "primevue/resources/themes/aura-light-green/theme.css";

const app = createApp(App);

app.use(router);

// [수정] 테마 설정 적용
app.use(PrimeVue, {
  ripple: true,
  theme: {
    preset: Aura,
    options: {
      // Tailwind의 다크 모드 클래스(.dark)와 연동되도록 설정
      darkModeSelector: ".dark",
    },
  },
});

app.directive("tooltip", Tooltip);

app.mount("#app");
