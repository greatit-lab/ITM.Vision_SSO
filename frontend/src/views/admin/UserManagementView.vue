<!-- frontend/src/views/admin/UserManagementView.vue -->
<template>
  <div class="flex flex-col h-full gap-4">
    <div class="flex items-end justify-between shrink-0">
      <div>
        <h2
          class="flex items-center gap-2 text-xl font-bold text-slate-800 dark:text-white"
        >
          <i class="text-blue-500 pi pi-users"></i> 사용자 및 보안 관리
        </h2>
        <p class="mt-1 text-xs text-slate-500">
          사용자 계정 현황 및 보안 정책(화이트리스트, 권한 관리, 게스트)을 통합
          관리합니다.
        </p>
      </div>
      <Button
        icon="pi pi-refresh"
        label="새로고침"
        size="small"
        outlined
        @click="fetchAllData"
      />
    </div>

    <div
      class="flex-1 bg-white dark:bg-[#111111] rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col"
    >
      <Tabs value="0" class="flex flex-col flex-1">
        <TabList
          class="border-b bg-slate-50 dark:bg-zinc-900 dark:border-zinc-800"
        >
          <Tab value="0"><i class="mr-2 pi pi-user"></i>시스템 사용자 현황</Tab>
          <Tab value="1"><i class="mr-2 pi pi-shield"></i>운영권한 관리</Tab>
          <Tab value="2"
            ><i class="mr-2 pi pi-lock"></i>접근 허용 (Whitelist)</Tab
          >
          <Tab value="3"><i class="mr-2 pi pi-id-card"></i>게스트 정책</Tab>
        </TabList>
        <TabPanels class="!p-0 flex-1 overflow-hidden">
          <TabPanel value="0" class="h-full overflow-auto">
            <DataTable
              :value="users"
              scrollable
              scrollHeight="flex"
              class="text-xs p-datatable-sm"
              stripedRows
              tableStyle="min-width: 60rem"
            >
              <Column
                field="loginId"
                header="UserID"
                sortable
                style="width: 20%; font-weight: bold"
              ></Column>
              <Column header="소속 즐겨찾기" style="width: 20%">
                <template #body="slotProps">
                  <div
                    v-if="slotProps.data.context?.sdwtInfo"
                    class="flex items-center gap-2"
                  >
                    <Tag
                      :value="slotProps.data.context.sdwtInfo.site"
                      severity="info"
                      class="text-[10px]"
                    />
                    <span
                      class="font-medium text-slate-600 dark:text-slate-300"
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
                  <span class="text-slate-500">{{
                    formatDateFull(slotProps.data.createdAt)
                  }}</span>
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
          </TabPanel>

          <TabPanel value="1" class="h-full overflow-auto">
            <div class="flex flex-col h-full gap-4 p-4">
              <div
                class="flex items-center justify-between p-4 border border-blue-100 rounded-lg bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800"
              >
                <div class="flex items-center gap-4">
                  <Avatar
                    :label="currentUserId.charAt(0).toUpperCase()"
                    size="large"
                    shape="circle"
                    class="!text-white !font-bold shadow-lg border-2 border-white dark:border-zinc-800"
                    :class="getRoleColorClass(currentUserRole)"
                  />
                  <div>
                    <div
                      class="mb-1 text-xs font-semibold text-blue-600 dark:text-blue-400"
                    >
                      CURRENT SESSION
                    </div>
                    <div
                      class="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-white"
                    >
                      {{ currentUserId }}
                      <span
                        class="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 font-bold"
                      >
                        {{ currentUserRole }}
                      </span>
                    </div>
                  </div>
                </div>
                <div class="text-right">
                  <Button
                    label="운영 권한 부여"
                    icon="pi pi-user-plus"
                    @click="openAdminDialog"
                  />
                </div>
              </div>

              <DataTable
                :value="filteredAdmins"
                scrollable
                scrollHeight="flex"
                class="flex-1 text-xs border rounded p-datatable-sm"
                stripedRows
                tableStyle="min-width: 50rem"
              >
                <Column
                  field="loginId"
                  header="UserID"
                  sortable
                  style="width: 25%; font-weight: bold"
                ></Column>

                <Column field="role" header="Role" sortable style="width: 25%">
                  <template #body="slotProps">
                    <div class="flex items-center gap-3">
                      <Avatar
                        :label="slotProps.data.role.charAt(0).toUpperCase()"
                        shape="circle"
                        class="!text-white !font-bold !w-8 !h-8 !text-xs border-2 border-white dark:border-zinc-800 shadow-sm"
                        :class="getRoleColorClass(slotProps.data.role)"
                      />
                      <span
                        class="font-bold text-slate-700 dark:text-slate-200"
                      >
                        {{ slotProps.data.role }}
                      </span>
                    </div>
                  </template>
                </Column>

                <Column
                  field="assignedBy"
                  header="Assigned By"
                  style="width: 25%; color: #64748b"
                ></Column>

                <Column
                  field="assignedAt"
                  header="Date"
                  sortable
                  style="width: 25%"
                >
                  <template #body="slotProps">{{
                    formatDateFull(slotProps.data.assignedAt)
                  }}</template>
                </Column>

                <Column header="Action" style="width: 80px" align="center">
                  <template #body="slotProps">
                    <Button
                      icon="pi pi-trash"
                      text
                      severity="danger"
                      size="small"
                      @click="removeAdmin(slotProps.data.loginId)"
                    />
                  </template>
                </Column>
              </DataTable>
            </div>
          </TabPanel>

          <TabPanel value="2" class="h-full overflow-auto">
            <div class="flex flex-col h-full gap-2 p-4">
              <div class="flex justify-end">
                <Button
                  label="화이트리스트 추가"
                  icon="pi pi-plus"
                  size="small"
                  @click="openAccessDialog"
                />
              </div>
              <DataTable
                :value="accessCodes"
                scrollable
                scrollHeight="flex"
                class="text-xs border rounded p-datatable-sm"
                stripedRows
                tableStyle="min-width: 60rem"
              >
                <Column
                  field="compid"
                  header="회사 코드"
                  sortable
                  style="width: 12%; font-weight: bold; color: #475569"
                ></Column>

                <Column header="회사명" style="width: 18%">
                  <template #body="slotProps">
                    <span
                      class="font-semibold text-slate-700 dark:text-slate-200"
                    >
                      {{ getCompanyName(slotProps.data.compid) }}
                    </span>
                  </template>
                </Column>

                <Column
                  field="deptid"
                  header="부서 코드"
                  sortable
                  style="width: 12%"
                >
                  <template #body="slotProps">
                    <span class="font-mono font-bold text-blue-600">{{
                      slotProps.data.deptid
                    }}</span>
                  </template>
                </Column>

                <Column header="부서명" style="width: 18%">
                  <template #body="slotProps">
                    <span class="text-slate-600 dark:text-slate-300">
                      {{ getDeptName(slotProps.data.deptid) }}
                    </span>
                  </template>
                </Column>

                <Column
                  field="description"
                  header="설명"
                  style="width: 24%"
                ></Column>

                <Column
                  field="isActive"
                  header="사용 여부"
                  align="center"
                  style="width: 80px; min-width: 80px"
                >
                  <template #body="slotProps">
                    <Tag
                      :value="slotProps.data.isActive"
                      :severity="
                        slotProps.data.isActive === 'Y'
                          ? 'success'
                          : 'secondary'
                      "
                      class="!px-2"
                    />
                  </template>
                </Column>

                <Column
                  header="Action"
                  style="width: 80px; min-width: 80px"
                  align="center"
                >
                  <template #body="slotProps">
                    <div class="flex justify-center gap-1">
                      <Button
                        icon="pi pi-pencil"
                        text
                        severity="info"
                        size="small"
                        class="!w-6 !h-6 !p-0"
                        @click="editAccessCode(slotProps.data)"
                        v-tooltip="'수정'"
                      />
                      <Button
                        icon="pi pi-trash"
                        text
                        severity="danger"
                        size="small"
                        class="!w-6 !h-6 !p-0"
                        @click="removeAccessCode(slotProps.data.compid)"
                        v-tooltip="'삭제'"
                      />
                    </div>
                  </template>
                </Column>
              </DataTable>
            </div>
          </TabPanel>

          <TabPanel value="3" class="h-full overflow-auto">
            <div class="flex flex-col h-full gap-2 p-4">
              <div class="flex justify-end">
                <Button
                  label="게스트 등록"
                  icon="pi pi-plus"
                  size="small"
                  @click="openGuestDialog"
                />
              </div>
              <DataTable
                :value="guests"
                scrollable
                scrollHeight="flex"
                class="text-xs border rounded p-datatable-sm"
                stripedRows
              >
                <Column field="loginId" header="Guest ID" sortable></Column>
                <Column field="requester" header="요청자"></Column>
                <Column field="validUntil" header="유효 기간" sortable>
                  <template #body="slotProps">
                    <span
                      :class="
                        isExpired(slotProps.data.validUntil)
                          ? 'text-red-500 line-through'
                          : 'text-green-600'
                      "
                    >
                      {{ formatDateFull(slotProps.data.validUntil) }}
                    </span>
                  </template>
                </Column>
                <Column field="reason" header="사유"></Column>
                <Column header="Action" style="width: 80px" align="center">
                  <template #body="slotProps">
                    <Button
                      icon="pi pi-trash"
                      text
                      severity="danger"
                      size="small"
                      @click="removeGuest(slotProps.data.loginId)"
                    />
                  </template>
                </Column>
              </DataTable>
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>

    <Dialog
      v-model:visible="adminDialogVisible"
      modal
      header="운영 권한 부여 (Manager)"
      :style="{ width: '25rem' }"
    >
      <div class="flex flex-col gap-4 mb-4">
        <div class="flex flex-col gap-1">
          <label class="font-semibold">User ID</label>
          <InputText
            v-model="newAdmin.loginId"
            placeholder="권한을 부여할 ID 입력"
            autocomplete="off"
          />
        </div>

        <div class="flex flex-col gap-1">
          <label class="font-semibold">Role</label>
          <SelectButton
            v-model="newAdmin.role"
            :options="['MANAGER']"
            aria-labelledby="basic"
            class="w-full"
            :allowEmpty="false"
          />
          <small class="text-slate-400">
            * ADMIN 권한은 시스템 유일 관리자만 가능하며, 추가할 수 없습니다.
          </small>
        </div>

        <div class="flex flex-col gap-1">
          <label class="font-semibold">Assigned By</label>
          <InputText
            v-model="currentUserId"
            disabled
            class="bg-slate-100 text-slate-500"
          />
          <small class="text-slate-400"
            >현재 로그인한 관리자 ID가 자동 기록됩니다.</small
          >
        </div>
      </div>
      <div class="flex justify-end gap-2">
        <Button
          type="button"
          label="취소"
          severity="secondary"
          @click="adminDialogVisible = false"
        ></Button>
        <Button type="button" label="저장" @click="saveAdmin"></Button>
      </div>
    </Dialog>

    <Dialog
      v-model:visible="accessDialogVisible"
      modal
      :header="isEditMode ? '화이트리스트 수정' : '화이트리스트 추가'"
      :style="{ width: '25rem' }"
    >
      <div class="flex flex-col gap-3 mb-4">
        <div class="flex flex-col gap-1">
          <label class="font-semibold">회사 코드 (PK)</label>
          <InputText
            v-model="newAccess.compid"
            placeholder="예: SEC, 001"
            :disabled="isEditMode"
            :class="{ 'bg-slate-100': isEditMode }"
          />
          <small v-if="!isEditMode" class="text-slate-400"
            >고유한 회사 식별 코드를 입력하세요 (최대 3자)</small
          >
        </div>
        <div class="flex flex-col gap-1">
          <label class="font-semibold">부서 코드</label>
          <InputText
            v-model="newAccess.deptid"
            placeholder="예: DEVELOP, 100"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="font-semibold">설명</label>
          <InputText v-model="newAccess.description" />
        </div>
        <div class="flex items-center gap-2">
          <Checkbox v-model="newAccess.isActive" binary inputId="activeCheck" />
          <label for="activeCheck">사용 여부 (Active)</label>
        </div>
      </div>
      <div class="flex justify-end gap-2">
        <Button
          type="button"
          label="취소"
          severity="secondary"
          @click="accessDialogVisible = false"
        ></Button>
        <Button type="button" label="저장" @click="saveAccessCode"></Button>
      </div>
    </Dialog>

    <Dialog
      v-model:visible="guestDialogVisible"
      modal
      header="게스트 등록"
      :style="{ width: '25rem' }"
    >
      <div class="flex flex-col gap-3 mb-4">
        <label class="font-semibold">Guest ID</label>
        <InputText v-model="newGuest.loginId" />
        <label class="font-semibold">요청자</label>
        <InputText v-model="newGuest.requester" />
        <label class="font-semibold">유효 기간</label>
        <DatePicker
          v-model="newGuest.validUntil"
          showIcon
          fluid
          iconDisplay="input"
          dateFormat="yy-mm-dd"
        />
        <label class="font-semibold">사유</label>
        <InputText v-model="newGuest.reason" />
      </div>
      <div class="flex justify-end gap-2">
        <Button
          type="button"
          label="취소"
          severity="secondary"
          @click="guestDialogVisible = false"
        ></Button>
        <Button type="button" label="저장" @click="saveGuest"></Button>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useAuthStore } from "@/stores/auth";

import Tabs from "primevue/tabs";
import TabList from "primevue/tablist";
import Tab from "primevue/tab";
import TabPanels from "primevue/tabpanels";
import TabPanel from "primevue/tabpanel";
import Button from "primevue/button";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Tag from "primevue/tag";
import Badge from "primevue/badge";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import SelectButton from "primevue/selectbutton";
import DatePicker from "primevue/datepicker";
import Checkbox from "primevue/checkbox";
import Avatar from "primevue/avatar";

// API
import * as AdminApi from "@/api/admin";

// Auth Store
const authStore = useAuthStore();
const currentUserId = computed(() => authStore.user?.userId || "Unknown");
const currentUserRole = computed(() => authStore.user?.role || "User");

// Data Refs
const users = ref([]);
const admins = ref([]);
const accessCodes = ref([]);
const guests = ref([]);

// Filtered Admins
const filteredAdmins = computed(() => {
  return admins.value.filter((admin: any) => admin.role === "MANAGER");
});

// Role Style
const getRoleColorClass = (role: string) => {
  const r = role ? role.toUpperCase() : "";
  if (r === "ADMIN") return "!bg-gradient-to-br !from-red-500 !to-rose-600";
  if (r === "MANAGER")
    return "!bg-gradient-to-br !from-emerald-500 !to-teal-500";
  if (r === "USER") return "!bg-gradient-to-br !from-indigo-500 !to-purple-600";
  if (r === "GUEST") return "!bg-gradient-to-br !from-slate-500 !to-gray-500";
  return "!bg-gray-400";
};

// [수정] AD Claim Code Mapping (Case-Insensitive)
// 실제 환경에서는 AD 동기화 DB나 공통 코드 API를 통해 이름을 가져와야 합니다.
const getCompanyName = (code: string) => {
  if (!code) return "-";
  const c = code.toUpperCase().trim();
  const map: Record<string, string> = {
    SEC: "Samsung Electronics",
    LGD: "LG Display",
    SKH: "SK Hynix",
    ITM: "ITM Semiconductor",
    "001": "Headquarters",
    SSO: "Single Sign On Team",
    DEV: "Development Center",
  };
  return map[c] || code; // 매핑 없으면 코드 그대로 표시
};

const getDeptName = (code: string) => {
  if (!code) return "-";
  const c = code.toUpperCase().trim();
  const map: Record<string, string> = {
    DEV: "Development Team",
    QA: "Quality Assurance",
    EQP: "Equipment Eng.",
    MFG: "Manufacturing",
    HR: "Human Resources",
    IT: "Information Tech",
  };
  return map[c] || code;
};

// Fetch Data
const fetchAllData = async () => {
  try {
    const [u, a, ac, g] = await Promise.all([
      AdminApi.getUsers(),
      AdminApi.getAdmins(),
      AdminApi.getAccessCodes(),
      AdminApi.getGuests(),
    ]);
    users.value = u.data;
    admins.value = a.data;
    accessCodes.value = ac.data;
    guests.value = g.data;
  } catch (e) {
    console.error("Failed to fetch admin data", e);
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
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hour = pad(d.getHours());
  const min = pad(d.getMinutes());
  const sec = pad(d.getSeconds());

  return `${year}-${month}-${day} ${hour}:${min}:${sec}`;
};

const isExpired = (dateStr: string) => {
  return new Date(dateStr) < new Date();
};

// --- Admin Dialog ---
const adminDialogVisible = ref(false);
const newAdmin = ref({ loginId: "", role: "MANAGER", assignedBy: "" });

const openAdminDialog = () => {
  newAdmin.value = {
    loginId: "",
    role: "MANAGER",
    assignedBy: currentUserId.value,
  };
  adminDialogVisible.value = true;
};

const saveAdmin = async () => {
  if (!newAdmin.value.loginId) return alert("User ID를 입력해주세요.");

  const payload = {
    ...newAdmin.value,
    role: "MANAGER",
    assignedBy: currentUserId.value || "System",
  };

  try {
    await AdminApi.addAdmin(payload);
    adminDialogVisible.value = false;
    fetchAllData();
  } catch (e: any) {
    console.error(e);
    const msg =
      e.response?.data?.message ||
      "저장 중 오류가 발생했습니다. (중복된 ID일 수 있습니다)";
    alert(msg);
  }
};

const removeAdmin = async (id: string) => {
  if (confirm(`정말 ${id} 관리자를 삭제하시겠습니까?`)) {
    await AdminApi.deleteAdmin(id);
    fetchAllData();
  }
};

// --- Access Code Dialog ---
const accessDialogVisible = ref(false);
const isEditMode = ref(false);
const newAccess = ref({
  compid: "",
  deptid: "",
  description: "",
  isActive: true,
});

const openAccessDialog = () => {
  isEditMode.value = false;
  newAccess.value = { compid: "", deptid: "", description: "", isActive: true };
  accessDialogVisible.value = true;
};

const editAccessCode = (data: any) => {
  isEditMode.value = true;
  newAccess.value = {
    compid: data.compid,
    deptid: data.deptid,
    description: data.description,
    isActive: data.isActive === "Y",
  };
  accessDialogVisible.value = true;
};

const saveAccessCode = async () => {
  if (!newAccess.value.compid || !newAccess.value.deptid)
    return alert("필수 정보를 입력해주세요.");

  const payload = {
    ...newAccess.value,
    isActive: newAccess.value.isActive ? "Y" : "N",
  };

  try {
    if (isEditMode.value) {
      await AdminApi.updateAccessCode(newAccess.value.compid, payload);
    } else {
      await AdminApi.createAccessCode(payload);
    }
    accessDialogVisible.value = false;
    fetchAllData();
  } catch (e) {
    alert("저장 중 오류가 발생했습니다. (중복된 ID일 수 있습니다)");
  }
};

const removeAccessCode = async (id: string) => {
  if (confirm(`정말 회사코드 ${id}를 삭제하시겠습니까?`)) {
    await AdminApi.deleteAccessCode(id);
    fetchAllData();
  }
};

// --- Guest Dialog ---
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
  if (!newGuest.value.validUntil) return alert("유효 기간을 선택해주세요.");
  await AdminApi.addGuest(newGuest.value);
  guestDialogVisible.value = false;
  fetchAllData();
};

const removeGuest = async (id: string) => {
  if (confirm(`정말 게스트 ${id}를 삭제하시겠습니까?`)) {
    await AdminApi.deleteGuest(id);
    fetchAllData();
  }
};
</script>
