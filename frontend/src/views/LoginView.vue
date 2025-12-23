<!-- frontend/src/views/LoginView.vue -->
<template>
  <div
    class="flex items-center justify-center min-h-screen overflow-hidden bg-slate-50 dark:bg-[#09090b] relative"
  >
    <div
      class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-400/20 blur-[100px] animate-pulse"
    ></div>
    <div
      class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-rose-400/20 blur-[100px] animate-pulse"
      style="animation-delay: 1s"
    ></div>

    <div
      class="relative z-10 w-full max-w-sm p-8 transition-all duration-300 border shadow-2xl bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl border-white/20 dark:border-white/5 rounded-2xl"
    >
      <div class="flex flex-col items-center mb-10">
        <div
          class="flex items-center justify-center w-20 h-20 mb-6 bg-white shadow-lg rounded-3xl dark:bg-zinc-800"
        >
          <i class="text-4xl text-indigo-500 pi pi-objects-column"></i>
        </div>
        <h1
          class="text-2xl font-black tracking-tight text-slate-800 dark:text-white"
        >
          ITM Vision SSO
        </h1>
        <p class="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
          Smart Factory Integrated Dashboard
        </p>
      </div>

      <div v-if="!errorType" class="space-y-4">
        <Button
          label="Login with ITM AD"
          icon="pi pi-microsoft"
          class="w-full !py-3.5 !rounded-xl !font-bold !text-base !bg-[#0078D4] hover:!bg-[#006cbd] !border-none !shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98]"
          @click="startSsoLogin"
          :loading="isLoading"
        />
        <p class="text-xs text-center text-slate-400">
          Click the button above to sign in with your corporate account.
        </p>
      </div>

      <div
        v-else
        class="flex flex-col gap-4 p-4 border rounded-xl animate-fadein"
        :class="getErrorClass(errorType)"
      >
        <div class="text-center">
          <div
            class="inline-flex items-center justify-center w-12 h-12 mb-2 rounded-full"
            :class="getErrorIconClass(errorType)"
          >
            <i class="text-xl pi" :class="getIconByError(errorType)"></i>
          </div>

          <h3 class="text-lg font-bold" :class="getErrorTextClass(errorType)">
            {{ getTitleByError(errorType) }}
          </h3>

          <p
            class="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400"
          >
            <span v-if="guestForm.loginId"
              >계정: <span class="font-bold">{{ guestForm.loginId }}</span
              ><br
            /></span>
            {{ getMessageByError(errorType) }}
          </p>
        </div>

        <Button
          v-if="errorType === 'AccessDenied'"
          label="게스트 권한 신청하기"
          icon="pi pi-key"
          severity="help"
          class="w-full !py-2.5 !text-sm !font-bold"
          @click="showGuestDialog = true"
        />

        <div
          v-else-if="errorType === 'PendingApproval'"
          class="p-2 text-[11px] font-bold text-center text-amber-700 bg-amber-100/50 rounded"
        >
          관리자 승인을 기다려주세요.
        </div>

        <Button
          v-else-if="errorType === 'Rejected'"
          label="게스트 권한 재신청"
          icon="pi pi-refresh"
          severity="danger"
          outlined
          class="w-full !py-2.5 !text-sm !font-bold"
          @click="showGuestDialog = true"
        />

        <div
          v-else-if="errorType === 'ServerErrors'"
          class="p-2 text-[11px] text-center text-slate-500"
        >
          시스템 관리자에게 문의하세요.
        </div>

        <div class="text-center">
          <a
            href="#"
            @click.prevent="resetState"
            class="text-[10px] text-slate-400 hover:underline"
            >처음으로 (다시 로그인)</a
          >
        </div>
      </div>

      <div class="mt-8 text-center">
        <p class="text-[10px] text-slate-400">
          Unauthorized access is strictly prohibited.<br />
          Copyright © 2025 ITM Semiconductor. All rights reserved.
        </p>
      </div>
    </div>

    <Dialog
      v-model:visible="showGuestDialog"
      modal
      header="게스트 권한 신청"
      :style="{ width: '90vw', maxWidth: '350px' }"
      :draggable="false"
      class="backdrop-blur-sm"
    >
      <div class="flex flex-col gap-4 py-2">
        <p
          class="p-3 text-xs leading-relaxed border rounded-lg text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-zinc-900 border-slate-100 dark:border-zinc-800"
        >
          <span
            v-if="errorType === 'Rejected'"
            class="block mb-1 font-bold text-red-500"
            >이전 요청이 반려되었습니다.</span
          >
          승인되지 않은 사용자입니다.<br />
          자동 확인된 부서 정보로 접근 권한을 신청합니다.
        </p>

        <div class="space-y-3">
          <div class="flex flex-col gap-1">
            <label class="text-xs font-bold text-slate-500"
              >ID (Login ID)</label
            >
            <InputText
              v-model="guestForm.loginId"
              disabled
              class="!bg-slate-100 !text-slate-500 !text-sm"
            />
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div class="flex flex-col gap-1">
              <label class="text-xs font-bold text-slate-500">부서코드</label>
              <InputText
                v-model="guestForm.deptCode"
                placeholder="Code"
                disabled
                class="!bg-slate-100 !text-slate-500 !text-sm"
              />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs font-bold text-slate-500">부서명</label>
              <InputText
                v-model="guestForm.deptName"
                placeholder="Name"
                disabled
                class="!bg-slate-100 !text-slate-500 !text-sm"
              />
            </div>
          </div>


          <div class="flex flex-col gap-1">
            <label class="text-xs font-bold text-slate-500"
              >사유 (Reason) <span class="text-red-500">*</span></label
            >
            <InputText
              v-model="guestForm.reason"
              placeholder="접속 요청 사유를 입력하세요"
              class="!text-sm"
            />
          </div>
        </div>
      </div>

      <template #footer>
        <Button
          label="취소"
          text
          severity="secondary"
          @click="showGuestDialog = false"
          class="!text-xs"
        />
        <Button
          label="신청하기"
          @click="submitGuestRequest"
          :loading="isRequesting"
          class="!text-xs !bg-indigo-600 !border-indigo-600"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import http from "@/api/http";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const isLoading = ref(false);
const errorType = ref<string | null>(null);
const showGuestDialog = ref(false);
const isRequesting = ref(false);

const guestForm = reactive({
  loginId: "",
  deptName: "",
  deptCode: "",
  reason: "",
});

// URL Query 감지
watch(
  () => route.query,
  (newQuery) => {
    try {
      const errorParam = newQuery.error as string;

      if (errorParam) {
        errorType.value = errorParam;
        guestForm.loginId = (newQuery.loginId as string) || "";
        // [수정] URL에서 부서정보 자동 입력
        guestForm.deptCode = (newQuery.deptCode as string) || "";
        guestForm.deptName = (newQuery.deptName as string) || "";
      } else if (newQuery.token) {
        const token = newQuery.token as string;
        const userStr = newQuery.user as string;
        if (token && userStr) {
          const userObj = JSON.parse(decodeURIComponent(userStr));
          authStore.setAuth(token, userObj);
          router.push("/");
        }
      }
    } catch (e) {
      console.error("Query param processing error:", e);
    }
  },
  { immediate: true }
);

// UI Helpers
const getErrorClass = (type: string | null) => {
  if (type === "PendingApproval")
    return "bg-amber-50 border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/30";
  return "bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-900/30";
};
const getErrorIconClass = (type: string | null) => {
  if (type === "PendingApproval") return "bg-amber-100 text-amber-500";
  return "bg-red-100 text-red-500";
};
const getErrorTextClass = (type: string | null) => {
  if (type === "PendingApproval") return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
};

const getIconByError = (type: string | null) => {
  if (type === "PendingApproval") return "pi-clock";
  if (type === "Rejected") return "pi-times-circle";
  if (type === "ServerErrors") return "pi-exclamation-triangle";
  return "pi-lock";
};
const getTitleByError = (type: string | null) => {
  if (type === "PendingApproval") return "승인 대기 중";
  if (type === "Rejected") return "요청 반려됨";
  if (type === "ServerErrors") return "서버 오류 (Server Error)";
  if (type === "NoUser") return "사용자 정보 없음";
  return "Access Denied";
};
const getMessageByError = (type: string | null) => {
  if (type === "PendingApproval")
    return "현재 관리자의 승인을 기다리고 있습니다.";
  if (type === "Rejected") return "귀하의 접근 요청이 반려되었습니다.";
  if (type === "ServerErrors") return "인증 처리 중 서버 오류가 발생했습니다.";
  if (type === "NoUser") return "SSO로부터 사용자 정보를 받지 못했습니다.";
  return "현재 시스템 접근 권한이 없습니다.";
};

const startSsoLogin = () => {
  isLoading.value = true;
  window.location.href = "https://localhost:8082/api/auth/login";
};

const submitGuestRequest = async () => {
  // [수정] 자동 입력되는 부서 정보 검증 (없을 경우 알림)
  if (!guestForm.deptCode && !guestForm.deptName) {
    alert("부서 정보가 확인되지 않았습니다. 관리자에게 문의하세요.");
    // return; // 강제 차단 여부는 정책에 따라 결정 (여기서는 일단 진행)
  }
  if (!guestForm.reason) {
    alert("사유는 필수 입력 항목입니다.");
    return;
  }

  isRequesting.value = true;
  try {
    await http.post("/auth/guest-request", {
      ...guestForm,
    });

    alert("신청이 완료되었습니다.");
    showGuestDialog.value = false;
    errorType.value = "PendingApproval";
    router.replace({ query: { ...route.query, error: "PendingApproval" } });
  } catch (e) {
    console.error(e);
    alert("신청 중 오류가 발생했습니다.");
  } finally {
    isRequesting.value = false;
  }
};

const resetState = () => {
  errorType.value = null;
  router.replace({ query: {} });
};
</script>

<style scoped>
@keyframes fadein {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fadein {
  animation: fadein 0.5s ease-out forwards;
}
</style>
