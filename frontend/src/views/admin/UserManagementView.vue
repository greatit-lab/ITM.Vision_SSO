<!-- frontend/src/views/admin/UserManagementView.vue -->
<template>
  <div
    class="absolute inset-0 flex flex-col w-full p-2 overflow-hidden font-sans transition-colors duration-500 bg-[#F8FAFC] dark:bg-[#09090B]"
  >
    <div class="flex items-center justify-between px-1 mb-2 shrink-0">
      <div>
        <h2
          class="flex items-center gap-2 text-xl font-bold text-slate-800 dark:text-white"
        >
          <i class="text-blue-500 pi pi-users"></i> 사용자 및 게스트 관리
        </h2>
        <p class="mt-1 text-xs text-slate-500">
          시스템 사용자 현황 및 게스트 접근 권한 승인/관리
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

    <div class="flex flex-1 min-h-0 gap-3 overflow-hidden">
      <div
        class="flex flex-col w-1/2 h-full overflow-hidden bg-white border rounded-lg shadow-sm dark:bg-[#111111] border-slate-200 dark:border-zinc-800"
      >
        <div
          class="flex items-center justify-between px-3 py-2 border-b shrink-0 border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30"
        >
          <div class="flex items-center gap-2">
            <i class="text-xs text-slate-500 pi pi-user"></i>
            <span class="text-xs font-bold text-slate-700 dark:text-slate-200"
              >시스템 사용자 (Employees)</span
            >
            <Tag
              :value="users.length"
              severity="secondary"
              class="!h-4 !text-[9px] !px-1"
            />
          </div>
        </div>
        <div class="relative flex-1 w-full min-h-0 overflow-hidden">
          <DataTable
            :value="users"
            scrollable
            scrollHeight="flex"
            class="absolute inset-0 w-full h-full text-xs border-none p-datatable-sm"
            stripedRows
          >
            <template #empty>
              <div class="p-4 text-center text-slate-400">
                데이터가 없습니다.
              </div>
            </template>
            <Column
              field="loginId"
              header="User ID"
              sortable
              style="width: 20%; font-weight: bold"
            ></Column>
            <Column header="즐겨찾기(소속)" style="width: 20%">
              <template #body="slotProps">
                <div
                  v-if="slotProps.data.context?.sdwtInfo"
                  class="flex items-center gap-2"
                >
                  <Tag
                    :value="slotProps.data.context.sdwtInfo.site"
                    severity="info"
                    class="!text-[9px] !h-4 !px-1"
                  />
                  <span
                    class="font-medium truncate text-slate-600 dark:text-slate-300"
                  >
                    {{ slotProps.data.context.sdwtInfo.sdwt }}
                  </span>
                </div>
                <span v-else class="text-slate-400 text-[10px] italic"
                  >- 설정 없음 -</span
                >
              </template>
            </Column>
            <Column
              field="loginCount"
              header="접속 횟수"
              sortable
              align="center"
              style="width: 20%"
            >
              <template #body="slotProps">
                <Badge
                  :value="slotProps.data.loginCount"
                  severity="secondary"
                  class="!min-w-[1.5rem]"
                />
              </template>
            </Column>
            <Column
              field="createdAt"
              header="최초 접속"
              sortable
              style="width: 20%"
            >
              <template #body="slotProps">
                <span class="text-slate-500 dark:text-slate-400">
                  {{ formatDateFull(slotProps.data.createdAt) }}
                </span>
              </template>
            </Column>
            <Column
              field="lastLoginAt"
              header="최근 접속"
              sortable
              style="width: 20%"
            >
              <template #body="slotProps">
                <span class="font-semibold text-blue-600 dark:text-blue-400">
                  {{ formatDateFull(slotProps.data.lastLoginAt) }}
                </span>
              </template>
            </Column>
          </DataTable>
        </div>
      </div>

      <div
        class="flex flex-col w-1/2 h-full overflow-hidden bg-white border rounded-lg shadow-sm dark:bg-[#111111] border-slate-200 dark:border-zinc-800"
      >
        <div class="flex border-b border-slate-200 dark:border-zinc-800">
          <button
            v-for="tab in ['Active Guests', 'Requests']"
            :key="tab"
            @click="activeTab = tab"
            class="px-4 py-2.5 text-xs font-bold transition-all border-b-2"
            :class="
              activeTab === tab
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-500/10'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-zinc-800'
            "
          >
            <div class="flex items-center gap-2">
              <i
                :class="tab === 'Requests' ? 'pi pi-inbox' : 'pi pi-shield'"
              ></i>
              {{
                tab === "Requests" ? "접근 신청 관리" : "등록된 게스트 (Active)"
              }}
              <Badge
                v-if="tab === 'Requests' && pendingCount > 0"
                :value="pendingCount"
                severity="danger"
                class="!min-w-[1rem] !h-4 !text-[9px] !px-1"
              />
            </div>
          </button>
        </div>

        <div
          v-if="activeTab === 'Active Guests'"
          class="relative flex-1 w-full min-h-0 overflow-hidden bg-slate-50/30 dark:bg-zinc-900/10"
        >
          <div
            class="flex justify-end px-2 py-1 border-b border-slate-100 dark:border-zinc-800"
          >
            <Button
              label="수동 등록"
              icon="pi pi-plus"
              text
              size="small"
              class="!text-[10px] !h-6 !px-2 text-indigo-600"
              @click="openManualGuestDialog"
            />
          </div>
          <DataTable
            :value="guests"
            scrollable
            scrollHeight="flex"
            class="absolute inset-0 w-full h-full text-xs border-none p-datatable-sm"
            stripedRows
          >
            <template #empty>
              <div class="p-4 text-center text-slate-400">
                등록된 게스트가 없습니다.
              </div>
            </template>
            <Column
              field="loginId"
              header="Guest ID"
              style="width: 25%; font-weight: bold"
            ></Column>
            <Column
              field="deptName"
              header="부서명"
              style="width: 20%"
            ></Column>
            <Column field="reason" header="사유" style="width: 30%"></Column>
            <Column
              field="validUntil"
              header="유효 기간"
              sortable
              style="width: 15%"
            >
              <template #body="slotProps">
                <span
                  :class="
                    isExpired(slotProps.data.validUntil)
                      ? 'text-red-500 line-through'
                      : 'text-green-600 font-medium'
                  "
                >
                  {{ formatDateFull(slotProps.data.validUntil) }}
                </span>
              </template>
            </Column>
            <Column header="Action" style="width: 10%" align="center">
              <template #body="slotProps">
                <i
                  class="pi pi-trash text-slate-300 hover:text-red-500 cursor-pointer text-[10px]"
                  @click="removeGuest(slotProps.data.loginId)"
                ></i>
              </template>
            </Column>
          </DataTable>
        </div>

        <div
          v-if="activeTab === 'Requests'"
          class="relative flex-1 w-full min-h-0 overflow-hidden"
        >
          <DataTable
            :value="requests"
            scrollable
            scrollHeight="flex"
            class="absolute inset-0 w-full h-full text-xs border-none p-datatable-sm"
            stripedRows
          >
            <template #empty>
              <div
                class="flex flex-col items-center justify-center h-full gap-2 text-slate-400"
              >
                <i class="text-2xl pi pi-check-circle opacity-20"></i>
                <span>대기 중인 요청이 없습니다.</span>
              </div>
            </template>

            <Column
              field="loginId"
              header="신청 ID"
              style="width: 20%; font-weight: bold"
            ></Column>
            <Column
              field="deptCode"
              header="부서코드"
              style="width: 15%"
            ></Column>
            <Column
              field="deptName"
              header="부서명"
              style="width: 15%"
            ></Column>
            <Column
              field="reason"
              header="신청사유"
              style="width: 30%"
            ></Column>
            <Column
              field="status"
              header="상태"
              align="center"
              style="width: 10%"
            >
              <template #body="slotProps">
                <Tag
                  :value="slotProps.data.status"
                  :severity="getStatusSeverity(slotProps.data.status)"
                  class="!text-[9px] !px-1"
                />
              </template>
            </Column>
            <Column header="Action" style="width: 10%" align="center">
              <template #body="slotProps">
                <div
                  v-if="slotProps.data.status === 'PENDING'"
                  class="flex justify-center gap-2"
                >
                  <Button
                    icon="pi pi-check"
                    severity="success"
                    text
                    rounded
                    size="small"
                    class="!w-6 !h-6"
                    v-tooltip.top="'승인'"
                    @click="openApproveDialog(slotProps.data)"
                  />
                  <Button
                    icon="pi pi-times"
                    severity="danger"
                    text
                    rounded
                    size="small"
                    class="!w-6 !h-6"
                    v-tooltip.top="'반려'"
                    @click="rejectRequest(slotProps.data.reqId)"
                  />
                </div>
                <span v-else class="text-[9px] text-slate-400">
                  {{ formatDateFull(slotProps.data.processedAt) }}
                </span>
              </template>
            </Column>
          </DataTable>
        </div>
      </div>
    </div>

    <Dialog
      v-model:visible="approveDialogVisible"
      modal
      header="게스트 승인"
      :style="{ width: '20rem' }"
    >
      <div class="flex flex-col gap-4 pt-2">
        <div
          class="p-2 text-xs border rounded bg-slate-50 dark:bg-zinc-900 text-slate-600 dark:text-slate-400"
        >
          <p><b>ID:</b> {{ selectedRequest?.loginId }}</p>
          <p><b>Reason:</b> {{ selectedRequest?.reason }}</p>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold text-slate-500">유효 기간 설정</label>
          <DatePicker
            v-model="approveValidUntil"
            dateFormat="yy-mm-dd"
            class="!text-sm"
            showIcon
            fluid
          />
        </div>
      </div>
      <template #footer>
        <Button
          label="취소"
          text
          severity="secondary"
          @click="approveDialogVisible = false"
        />
        <Button label="승인 완료" @click="confirmApprove" autofocus />
      </template>
    </Dialog>

    <Dialog
      v-model:visible="manualDialogVisible"
      modal
      header="게스트 수동 등록"
      :style="{ width: '25rem' }"
    >
      <div class="flex flex-col gap-4 pt-2">
        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold text-slate-500">Guest ID</label>
          <InputText v-model="newManualGuest.loginId" class="!text-sm" />
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div class="flex flex-col gap-1">
            <label class="text-xs font-bold text-slate-500">부서코드</label>
            <InputText
              v-model="newManualGuest.deptCode"
              class="!text-sm"
              placeholder="Code"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs font-bold text-slate-500">부서명</label>
            <InputText
              v-model="newManualGuest.deptName"
              class="!text-sm"
              placeholder="Name"
            />
          </div>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold text-slate-500">유효 기간</label>
          <DatePicker
            v-model="newManualGuest.validUntil"
            dateFormat="yy-mm-dd"
            class="!text-sm"
            showIcon
            fluid
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold text-slate-500">사유</label>
          <InputText v-model="newManualGuest.reason" class="!text-sm" />
        </div>
      </div>
      <template #footer>
        <Button
          label="취소"
          text
          severity="secondary"
          @click="manualDialogVisible = false"
        />
        <Button label="등록" @click="saveManualGuest" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import Button from "primevue/button";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Tag from "primevue/tag";
import Badge from "primevue/badge";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import DatePicker from "primevue/datepicker";
import { useAuthStore } from "@/stores/auth";
import * as AdminApi from "@/api/admin";

const authStore = useAuthStore();
// [변경] 기본 탭: Active Guests
const activeTab = ref("Active Guests");

const users = ref<any[]>([]);
const guests = ref<any[]>([]);
const requests = ref<any[]>([]);

const pendingCount = computed(
  () => requests.value.filter((r) => r.status === "PENDING").length
);

const fetchAllData = async () => {
  try {
    const [u, g, r] = await Promise.all([
      AdminApi.getUsers(),
      AdminApi.getGuests(),
      AdminApi.getGuestRequests(),
    ]);
    users.value = u.data;
    guests.value = g.data;
    requests.value = r.data;
  } catch (e) {
    console.error("Failed to fetch admin data", e);
  }
};

onMounted(() => {
  fetchAllData();
});

// Actions
const approveDialogVisible = ref(false);
const selectedRequest = ref<any>(null);
const approveValidUntil = ref<Date | null>(null);

const openApproveDialog = (req: any) => {
  selectedRequest.value = req;
  const d = new Date();
  d.setDate(d.getDate() + 30);
  approveValidUntil.value = d;
  approveDialogVisible.value = true;
};

const confirmApprove = async () => {
  if (!selectedRequest.value || !approveValidUntil.value) return;
  try {
    await AdminApi.approveGuestRequest({
      reqId: selectedRequest.value.reqId,
      validUntil: approveValidUntil.value,
      approverId: authStore.user?.userId || "Admin",
    });
    approveDialogVisible.value = false;
    fetchAllData();
  } catch (e) {
    alert("승인 처리 중 오류 발생");
  }
};

const rejectRequest = async (reqId: number) => {
  if (!confirm("해당 요청을 반려하시겠습니까?")) return;
  try {
    await AdminApi.rejectGuestRequest({
      reqId,
      approverId: authStore.user?.userId || "Admin",
    });
    fetchAllData();
  } catch (e) {
    alert("반려 처리 중 오류 발생");
  }
};

// Manual Add
const manualDialogVisible = ref(false);
const newManualGuest = ref({
  loginId: "",
  deptName: "",
  deptCode: "",
  validUntil: null,
  reason: "",
});

const openManualGuestDialog = () => {
  newManualGuest.value = {
    loginId: "",
    deptName: "",
    deptCode: "",
    validUntil: null,
    reason: "",
  };
  manualDialogVisible.value = true;
};
const saveManualGuest = async () => {
  if (!newManualGuest.value.loginId || !newManualGuest.value.validUntil)
    return alert("필수 입력 누락");
  try {
    await AdminApi.addGuest(newManualGuest.value);
    manualDialogVisible.value = false;
    fetchAllData();
  } catch (e) {
    alert("등록 실패");
  }
};
const removeGuest = async (id: string) => {
  if (confirm("정말 삭제(권한 해제) 하시겠습니까?")) {
    await AdminApi.deleteGuest(id);
    fetchAllData();
  }
};

const formatDateFull = (dateStr: string) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const isExpired = (dateStr: string) => {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
};
const getStatusSeverity = (status: string) => {
  if (status === "APPROVED") return "success";
  if (status === "REJECTED") return "danger";
  return "warn";
};
</script>

<style scoped>
:deep(.p-datatable-sm .p-datatable-thead > tr > th) {
  @apply bg-white dark:bg-[#111111] text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase border-b border-slate-100 dark:border-zinc-800;
}
:deep(.p-datatable-sm .p-datatable-tbody > tr > td) {
  @apply py-1 text-[11px] border-b border-slate-50 dark:border-zinc-800/30;
}
</style>
