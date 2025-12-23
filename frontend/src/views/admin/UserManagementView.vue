<!-- frontend/src/views/admin/UserManagementView.vue -->
<template>
  <div class="absolute inset-0 flex flex-col w-full font-sans transition-colors duration-500 bg-[#F8FAFC] dark:bg-[#09090B] overflow-hidden p-2">
    
    <div class="flex items-center justify-between px-1 mb-2 shrink-0">
      <div>
        <h2 class="flex items-center gap-2 text-xl font-bold text-slate-800 dark:text-white">
          <i class="text-blue-500 pi pi-users"></i> 사용자 및 게스트 관리
        </h2>
        <p class="mt-1 text-xs text-slate-500">
          시스템 사용자 접속 현황 모니터링 및 외부 게스트 계정 관리
        </p>
      </div>
      <Button
        icon="pi pi-refresh"
        label="새로고침"
        size="small"
        outlined
        class="!text-xs"
        @click="fetchAllData"
      />
    </div>

    <div class="flex flex-1 gap-3 min-h-0 overflow-hidden">
      
      <div class="flex flex-col w-1/2 bg-white dark:bg-[#111111] rounded-lg border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden h-full">
        <div class="px-3 py-2 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-900/30 shrink-0">
          <div class="flex items-center gap-2">
            <i class="pi pi-user text-slate-500 text-xs"></i>
            <span class="font-bold text-xs text-slate-700 dark:text-slate-200">시스템 사용자 현황</span>
            <Tag :value="users.length" severity="secondary" class="!h-4 !text-[9px] !px-1" />
          </div>
        </div>

        <div class="flex-1 min-h-0 relative w-full overflow-hidden">
          <DataTable
            :value="users"
            scrollable
            scrollHeight="flex"
            class="h-full w-full text-xs p-datatable-sm border-none absolute inset-0"
            stripedRows
          >
            <template #empty>
              <div class="p-4 text-center text-slate-400">사용자 데이터가 없습니다.</div>
            </template>

            <Column field="loginId" header="User ID" sortable style="width: 20%; font-weight: bold"></Column>
            
            <Column header="소속 / 즐겨찾기" style="width: 30%">
              <template #body="slotProps">
                <div v-if="slotProps.data.context?.sdwtInfo" class="flex items-center gap-2">
                  <Tag :value="slotProps.data.context.sdwtInfo.site" severity="info" class="!text-[9px] !h-4 !px-1" />
                  <span class="font-medium text-slate-600 dark:text-slate-300 truncate">
                    {{ slotProps.data.context.sdwtInfo.sdwt }}
                  </span>
                </div>
                <span v-else class="text-slate-400 text-[10px] italic">- 설정 없음 -</span>
              </template>
            </Column>

            <Column field="loginCount" header="접속 횟수" sortable align="center" style="width: 15%">
              <template #body="slotProps">
                <Badge :value="slotProps.data.loginCount" severity="secondary" class="!min-w-[1.5rem]" />
              </template>
            </Column>

            <Column field="lastLoginAt" header="최근 접속" sortable style="width: 35%">
              <template #body="slotProps">
                <span class="font-semibold text-blue-600 dark:text-blue-400">
                  {{ formatDateFull(slotProps.data.lastLoginAt) }}
                </span>
              </template>
            </Column>
          </DataTable>
        </div>
      </div>

      <div class="flex flex-col w-1/2 bg-white dark:bg-[#111111] rounded-lg border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden h-full">
        <div class="px-3 py-2 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-900/30 shrink-0">
          <div class="flex items-center gap-2">
            <i class="pi pi-id-card text-slate-500 text-xs"></i>
            <span class="font-bold text-xs text-slate-700 dark:text-slate-200">게스트 정책 (Guest Policy)</span>
          </div>
          <Button 
            label="Add Guest" 
            icon="pi pi-plus" 
            size="small" 
            class="!text-[10px] !h-6 !px-2 !bg-indigo-600 !border-indigo-600" 
            @click="openGuestDialog" 
          />
        </div>

        <div class="flex-1 min-h-0 relative w-full overflow-hidden">
          <DataTable
            :value="guests"
            scrollable
            scrollHeight="flex"
            class="h-full w-full text-xs p-datatable-sm border-none absolute inset-0"
            stripedRows
          >
            <template #empty>
              <div class="p-4 text-center text-slate-400">등록된 게스트가 없습니다.</div>
            </template>

            <Column field="loginId" header="Guest ID" sortable style="width: 20%; font-weight: bold"></Column>
            <Column field="requester" header="요청자" style="width: 20%"></Column>
            <Column field="validUntil" header="유효 기간" sortable style="width: 25%">
              <template #body="slotProps">
                <span :class="isExpired(slotProps.data.validUntil) ? 'text-red-500 line-through' : 'text-green-600 font-medium'">
                  {{ formatDateFull(slotProps.data.validUntil) }}
                </span>
              </template>
            </Column>
            <Column field="reason" header="사유" style="width: 25%"></Column>
            
            <Column header="Action" style="width: 10%" align="center">
              <template #body="slotProps">
                <div class="flex justify-center">
                  <i class="pi pi-trash text-slate-300 hover:text-red-500 cursor-pointer text-[10px]" @click="removeGuest(slotProps.data.loginId)"></i>
                </div>
              </template>
            </Column>
          </DataTable>
        </div>
      </div>

    </div>

    <Dialog
      v-model:visible="guestDialogVisible"
      modal
      header="게스트 등록"
      :style="{ width: '25rem' }"
      class="p-fluid"
    >
      <div class="flex flex-col gap-4 pt-2">
        <div class="flex flex-col gap-1">
           <label class="text-xs font-bold text-slate-500">Guest ID</label>
           <InputText v-model="newGuest.loginId" class="!text-sm" placeholder="e.g. guest01" />
        </div>
        <div class="flex flex-col gap-1">
           <label class="text-xs font-bold text-slate-500">요청자 (Requester)</label>
           <InputText v-model="newGuest.requester" class="!text-sm" />
        </div>
        <div class="flex flex-col gap-1">
           <label class="text-xs font-bold text-slate-500">유효 기간 (Valid Until)</label>
           <DatePicker
            v-model="newGuest.validUntil"
            showIcon
            fluid
            iconDisplay="input"
            dateFormat="yy-mm-dd"
            class="!text-sm"
          />
        </div>
        <div class="flex flex-col gap-1">
           <label class="text-xs font-bold text-slate-500">사유 (Reason)</label>
           <InputText v-model="newGuest.reason" class="!text-sm" />
        </div>
      </div>
      <template #footer>
        <Button label="취소" text severity="secondary" @click="guestDialogVisible = false" />
        <Button label="저장" @click="saveGuest" />
      </template>
    </Dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import Button from "primevue/button";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Tag from "primevue/tag";
import Badge from "primevue/badge";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import DatePicker from "primevue/datepicker";

// API
import * as AdminApi from "@/api/admin";

// Data Refs
const users = ref<any[]>([]);
const guests = ref<any[]>([]);

// Fetch Data (Managers, Whitelist 관련 호출 제거)
const fetchAllData = async () => {
  try {
    const [u, g] = await Promise.all([
      AdminApi.getUsers(),
      AdminApi.getGuests(),
    ]);
    users.value = u.data;
    guests.value = g.data;
  } catch (e) {
    console.error("Failed to fetch user data", e);
  }
};

onMounted(() => {
  fetchAllData();
});

// Formatters
const formatDateFull = (dateStr: string) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; // 공간 절약을 위해 날짜만 표시 (필요시 시간 추가 가능)
};

const isExpired = (dateStr: string) => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  // 오늘 날짜의 자정과 비교하거나, 현재 시간과 비교
  return d < new Date();
};

// --- Guest Dialog Logic ---
const guestDialogVisible = ref(false);
const newGuest = ref({
  loginId: "",
  requester: "",
  validUntil: null,
  reason: "",
});

const openGuestDialog = () => {
  newGuest.value = { loginId: "", requester: "", validUntil: null, reason: "" };
  guestDialogVisible.value = true;
};

const saveGuest = async () => {
  if (!newGuest.value.loginId) return alert("Guest ID를 입력해주세요.");
  if (!newGuest.value.validUntil) return alert("유효 기간을 선택해주세요.");
  
  try {
    await AdminApi.addGuest(newGuest.value);
    guestDialogVisible.value = false;
    fetchAllData();
  } catch (e) {
    console.error(e);
    alert("게스트 등록 중 오류가 발생했습니다.");
  }
};

const removeGuest = async (id: string) => {
  if (confirm(`정말 게스트 '${id}'를 삭제하시겠습니까?`)) {
    try {
      await AdminApi.deleteGuest(id);
      fetchAllData();
    } catch (e) {
      console.error(e);
      alert("삭제 중 오류가 발생했습니다.");
    }
  }
};
</script>

<style scoped>
/* Custom Table Styling for consistency */
:deep(.p-datatable-sm .p-datatable-thead > tr > th) {
  @apply bg-white dark:bg-[#111111] text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase border-b border-slate-100 dark:border-zinc-800;
}
:deep(.p-datatable-sm .p-datatable-tbody > tr > td) {
  @apply py-1 text-[11px] border-b border-slate-50 dark:border-zinc-800/30;
}
</style>
