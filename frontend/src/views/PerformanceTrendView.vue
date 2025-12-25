<!-- frontend/src/views/PerformanceTrendView.vue -->
<template>
  <div
    class="min-h-full transition-colors duration-500 bg-[#F8FAFC] dark:bg-[#09090B] font-sans flex flex-col"
  >
    <div class="flex items-center justify-between gap-3 px-1 mb-2 shrink-0">
      <div class="flex items-center gap-2">
        <div
          class="flex items-center justify-center w-8 h-8 bg-white border rounded-lg shadow-sm dark:bg-zinc-900 border-slate-100 dark:border-zinc-800"
        >
          <i class="text-lg text-teal-600 pi pi-bolt dark:text-teal-400"></i>
        </div>
        <div class="flex items-baseline gap-2">
          <h1
            class="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white"
          >
            Performance Trend
          </h1>
          <span
            class="text-slate-400 dark:text-slate-500 font-medium text-[11px]"
          >
            System Resource Monitoring
          </span>
        </div>
      </div>

      <div
        v-if="isRealtime"
        class="flex items-center gap-2 px-3 py-1 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/50 rounded-full animate-pulse transition-all"
      >
        <span class="relative flex w-1.5 h-1.5">
          <span
            class="absolute inline-flex w-full h-full rounded-full opacity-75 bg-rose-400 animate-ping"
          ></span>
          <span
            class="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500"
          ></span>
        </span>
        <span
          class="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider"
          >LIVE</span
        >
      </div>
    </div>

    <div
      class="mb-5 bg-white dark:bg-[#111111] p-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-2 shadow-sm transition-colors duration-300 shrink-0"
    >
      <div
        class="flex items-center flex-1 gap-2 px-1 py-1 overflow-x-auto scrollbar-hide"
      >
        <div class="min-w-[140px] shrink-0">
          <Select
            v-model="filterStore.selectedSite"
            :options="sites"
            placeholder="Site"
            showClear
            class="w-full custom-dropdown small"
            overlayClass="custom-dropdown-panel small"
            :class="{ '!text-slate-400': !filterStore.selectedSite }"
            :disabled="isRealtime"
            @change="onSiteChange"
          />
        </div>

        <div class="min-w-[160px] shrink-0">
          <Select
            v-model="filterStore.selectedSdwt"
            :options="sdwts"
            placeholder="SDWT"
            showClear
            class="w-full custom-dropdown small"
            overlayClass="custom-dropdown-panel small"
            :class="{ '!text-slate-400': !filterStore.selectedSdwt }"
            :disabled="!filterStore.selectedSite || isRealtime"
            @change="onSdwtChange"
          />
        </div>

        <div class="min-w-[160px] shrink-0">
          <Select
            v-model="selectedEqpId"
            :options="eqpIds"
            filter
            placeholder="Select EQP"
            showClear
            class="w-full custom-dropdown small"
            overlayClass="custom-dropdown-panel small"
            :class="{ '!text-slate-400': !selectedEqpId }"
            :disabled="!filterStore.selectedSdwt || isRealtime"
            :loading="isEqpLoading"
            @change="onEqpIdChange"
          />
        </div>

        <div class="w-px h-6 bg-slate-200 dark:bg-zinc-700 mx-1 shrink-0"></div>

        <div class="min-w-[150px] shrink-0">
          <DatePicker
            v-model="startDate"
            showTime
            hourFormat="24"
            showIcon
            dateFormat="yy-mm-dd"
            placeholder="Start Time"
            class="w-full custom-dropdown small date-picker"
            :disabled="isRealtime"
            :stepMinute="60"
          />
        </div>

        <div class="min-w-[150px] shrink-0">
          <DatePicker
            v-model="endDate"
            showTime
            hourFormat="24"
            showIcon
            dateFormat="yy-mm-dd"
            placeholder="End Time"
            class="w-full custom-dropdown small date-picker"
            :disabled="isRealtime"
            :stepMinute="60"
          />
        </div>
      </div>

      <div
        class="flex items-center gap-2 pl-2 border-l shrink-0 border-slate-100 dark:border-zinc-800"
      >
        <div class="flex items-center gap-1">
          <Button
            icon="pi pi-search"
            rounded
            class="!bg-teal-600 !border-teal-600 hover:!bg-teal-700 !w-8 !h-8 !text-xs"
            @click="() => searchData()"
            :loading="isLoading"
            :disabled="!selectedEqpId || isRealtime"
          />
          <Button
            icon="pi pi-refresh"
            text
            rounded
            severity="secondary"
            v-tooltip.bottom="'Reset'"
            class="!w-7 !h-7 !text-slate-400 hover:!text-slate-600 dark:!text-zinc-500 dark:hover:!text-zinc-300 transition-colors"
            @click="resetFilters"
            :disabled="isRealtime"
          />
        </div>

        <div class="w-px h-4 bg-slate-200 dark:bg-zinc-700 mx-1"></div>

        <div
          class="flex items-center gap-2 bg-slate-50 dark:bg-zinc-800/50 rounded-lg px-2 py-0.5 border border-slate-100 dark:border-zinc-800"
          :class="{ 'opacity-50 pointer-events-none': !selectedEqpId }"
        >
          <div
            class="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap"
          >
            <span>AUTO</span>
            <i class="pi pi-clock text-[9px]"></i>
          </div>
          <Select
            v-model="intervalSeconds"
            :options="intervalOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Off"
            class="w-[110px] h-6 !border-0 !bg-transparent !text-[11px] !shadow-none small-text-dropdown"
            :class="{ '!text-rose-500 font-bold': isRealtime }"
            overlayClass="custom-dropdown-panel small"
            @change="toggleRealtime"
            :disabled="!selectedEqpId"
          />
        </div>
      </div>
    </div>

    <div
      v-if="hasSearched"
      class="flex-1 flex flex-col gap-3 animate-fade-in pb-2 min-h-0"
    >
      <div
        class="grid grid-cols-1 lg:grid-cols-2 lg:grid-rows-2 gap-3 flex-1 min-h-0"
      >
        <div
          class="bg-white dark:bg-[#111111] p-3 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm h-full relative flex flex-col group min-h-[200px]"
        >
          <div class="flex items-center justify-between mb-1 shrink-0">
            <h3
              class="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2"
            >
              <i class="pi pi-desktop text-blue-500"></i> {{ selectedEqpId }} -
              CPU Usage
            </h3>
          </div>
          <div class="flex-1 min-h-0 w-full relative">
            <EChart
              v-if="chartData.length > 0"
              :option="cpuOption"
              @chartCreated="(inst) => onChartInit('cpu', inst)"
            />
            <div
              v-else
              class="absolute inset-0 flex items-center justify-center text-slate-400 text-xs"
            >
              No Data
            </div>
            <transition name="fade">
              <button
                v-if="zoomStates.cpu"
                @click="resetChartZoom('cpu')"
                class="absolute top-2 right-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded shadow-md flex items-center gap-1 transition-colors z-10"
              >
                <i class="pi pi-refresh" style="font-size: 0.6rem"></i> Reset
                Zoom
              </button>
            </transition>
          </div>
        </div>

        <div
          class="bg-white dark:bg-[#111111] p-3 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm h-full relative flex flex-col group min-h-[200px]"
        >
          <div class="flex items-center justify-between mb-1 shrink-0">
            <h3
              class="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2"
            >
              <i class="pi pi-microchip text-emerald-500"></i>
              {{ selectedEqpId }} - Memory Usage
            </h3>
          </div>
          <div class="flex-1 min-h-0 w-full relative">
            <EChart
              v-if="chartData.length > 0"
              :option="memOption"
              @chartCreated="(inst) => onChartInit('mem', inst)"
            />
            <div
              v-else
              class="absolute inset-0 flex items-center justify-center text-slate-400 text-xs"
            >
              No Data
            </div>
            <transition name="fade">
              <button
                v-if="zoomStates.mem"
                @click="resetChartZoom('mem')"
                class="absolute top-2 right-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded shadow-md flex items-center gap-1 transition-colors z-10"
              >
                <i class="pi pi-refresh" style="font-size: 0.6rem"></i> Reset
                Zoom
              </button>
            </transition>
          </div>
        </div>

        <div
          class="bg-white dark:bg-[#111111] p-3 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm h-full relative flex flex-col group min-h-[200px]"
        >
          <div class="flex items-center justify-between mb-1 shrink-0">
            <h3
              class="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2"
            >
              <i class="pi pi-cog text-amber-500"></i> {{ selectedEqpId }} - CPU
              Temp & Fan Speed
            </h3>
          </div>
          <div class="flex-1 min-h-0 w-full relative">
            <EChart
              v-if="chartData.length > 0"
              :option="cpuTempFanOption"
              @chartCreated="(inst) => onChartInit('dual', inst)"
            />
            <div
              v-else
              class="absolute inset-0 flex items-center justify-center text-slate-400 text-xs"
            >
              No Data
            </div>
            <transition name="fade">
              <button
                v-if="zoomStates.dual"
                @click="resetChartZoom('dual')"
                class="absolute top-2 right-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-2 py-1 rounded shadow-md flex items-center gap-1 transition-colors z-10"
              >
                <i class="pi pi-refresh" style="font-size: 0.6rem"></i> Reset
                Zoom
              </button>
            </transition>
          </div>
        </div>

        <div
          class="bg-white dark:bg-[#111111] p-3 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm h-full relative flex flex-col group min-h-[200px]"
        >
          <div class="flex items-center justify-between mb-1 shrink-0">
            <h3
              class="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2"
            >
              <i class="pi pi-palette text-orange-500"></i>
              {{ selectedEqpId }} - GPU Temp
            </h3>
          </div>
          <div class="flex-1 min-h-0 w-full relative">
            <EChart
              v-if="chartData.length > 0"
              :option="gpuOption"
              @chartCreated="(inst) => onChartInit('gpu', inst)"
            />
            <div
              v-else
              class="absolute inset-0 flex items-center justify-center text-slate-400 text-xs"
            >
              No Data
            </div>
            <transition name="fade">
              <button
                v-if="zoomStates.gpu"
                @click="resetChartZoom('gpu')"
                class="absolute top-2 right-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-2 py-1 rounded shadow-md flex items-center gap-1 transition-colors z-10"
              >
                <i class="pi pi-refresh" style="font-size: 0.6rem"></i> Reset
                Zoom
              </button>
            </transition>
          </div>
        </div>
      </div>

      <div
        class="bg-white dark:bg-[#111111] rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden h-auto shrink-0 flex flex-col"
      >
        <div
          class="px-4 py-2 border-b border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50 flex items-center gap-2 shrink-0"
        >
          <i class="pi pi-list text-teal-500 text-xs"></i>
          <h3 class="text-xs font-bold text-slate-700 dark:text-slate-200">
            Performance Summary (Peak Values)
          </h3>
        </div>
        <div class="overflow-x-auto">
          <table
            class="w-full text-xs text-left text-slate-600 dark:text-slate-400 table-fixed"
          >
            <thead
              class="text-[10px] text-slate-500 uppercase bg-slate-50 dark:bg-zinc-800 dark:text-slate-400"
            >
              <tr>
                <th
                  scope="col"
                  class="px-4 py-2 w-[120px] text-left font-bold text-slate-600 dark:text-slate-300"
                >
                  EQP ID
                </th>
                <th scope="col" class="px-4 py-2 text-left">CPU Peak Time</th>
                <th scope="col" class="px-4 py-2 text-left">CPU Max (%)</th>
                <th scope="col" class="px-4 py-2 text-left">CPU Temp (°C)</th>
                <th scope="col" class="px-4 py-2 text-left">Fan (RPM)</th>
                <th scope="col" class="px-4 py-2 text-left">Mem Peak Time</th>
                <th scope="col" class="px-4 py-2 text-left">Mem Max (%)</th>
                <th scope="col" class="px-4 py-2 text-left">GPU Peak Time</th>
                <th scope="col" class="px-4 py-2 text-left">GPU Max (°C)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-zinc-800">
              <tr
                v-for="item in summaryData"
                :key="item.eqpId"
                class="hover:bg-slate-50 dark:hover:bg-zinc-900/50 transition-colors"
              >
                <td
                  class="px-4 py-1.5 text-left font-bold text-slate-700 dark:text-slate-200"
                >
                  {{ item.eqpId }}
                </td>
                <td class="px-4 py-1.5 text-left font-mono">
                  {{ formatDate(item.cpuPeakTime) }}
                </td>
                <td
                  class="px-4 py-1.5 text-left font-mono text-red-600 dark:text-red-400 font-bold"
                >
                  {{ fmt(item.cpuMax, 2) }}
                </td>
                <td class="px-4 py-1.5 text-left font-mono">
                  {{ fmt(item.cpuTempAtPeak, 1) }}
                </td>
                <td class="px-4 py-1.5 text-left font-mono">
                  {{ fmt(item.fanSpeedAtPeak, 0) }}
                </td>
                <td class="px-4 py-1.5 text-left font-mono">
                  {{ formatDate(item.memPeakTime) }}
                </td>
                <td
                  class="px-4 py-1.5 text-left font-mono text-red-600 dark:text-red-400 font-bold"
                >
                  {{ fmt(item.memMax, 2) }}
                </td>
                <td class="px-4 py-1.5 text-left font-mono">
                  {{ formatDate(item.gpuPeakTime) }}
                </td>
                <td
                  class="px-4 py-1.5 text-left font-mono text-red-600 dark:text-red-400 font-bold"
                >
                  {{ fmt(item.gpuMax, 1) }}
                </td>
              </tr>
              <tr v-if="summaryData.length === 0">
                <td colspan="9" class="px-4 py-8 text-center text-slate-400">
                  No Summary Data Available
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div
      v-else
      class="flex flex-col items-center justify-center flex-1 min-h-[400px] opacity-50"
    >
      <div
        class="flex items-center justify-center w-16 h-16 mb-4 rounded-full shadow-inner bg-slate-100 dark:bg-zinc-800"
      >
        <i
          class="text-3xl pi pi-chart-line text-slate-300 dark:text-zinc-600"
        ></i>
      </div>
      <p class="text-sm font-bold text-slate-500">Ready to analyze.</p>
      <p class="text-xs text-slate-400">
        Select EQP ID and Date Range to view performance trends.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, reactive } from "vue";
import { useFilterStore } from "@/stores/filter";
import { useAuthStore } from "@/stores/auth";
import { dashboardApi } from "@/api/dashboard";
import { equipmentApi } from "@/api/equipment";
import {
  performanceApi,
  type PerformanceDataPointDto,
} from "@/api/performance";
import EChart from "@/components/common/EChart.vue";
import type { ECharts } from "echarts";

// PrimeVue
import Select from "primevue/select";
import DatePicker from "primevue/datepicker";
import Button from "primevue/button";

interface PerformanceSummary {
  eqpId: string;
  cpuPeakTime?: string;
  cpuMax?: number;
  cpuTempAtPeak?: number;
  fanSpeedAtPeak?: number;
  memPeakTime?: string;
  memMax?: number;
  gpuPeakTime?: string;
  gpuMax?: number;
}

const filterStore = useFilterStore();
const authStore = useAuthStore();
const selectedEqpId = ref("");
const startDate = ref(new Date(Date.now() - 24 * 60 * 60 * 1000));
const endDate = ref(new Date());
const intervalSeconds = ref(0);

const sites = ref<string[]>([]);
const sdwts = ref<string[]>([]);
const eqpIds = ref<string[]>([]);
const isEqpLoading = ref(false); // [유지] 로딩 상태 변수

const chartData = ref<PerformanceDataPointDto[]>([]);
const summaryData = ref<PerformanceSummary[]>([]);
const isLoading = ref(false);
const hasSearched = ref(false);
const isRealtime = ref(false);
let refreshTimer: number | null = null;

const zoomStates = reactive<Record<string, boolean>>({
  cpu: false,
  mem: false,
  dual: false,
  gpu: false,
});
const chartInstances = reactive<Record<string, ECharts | null>>({
  cpu: null,
  mem: null,
  dual: null,
  gpu: null,
});

const isDarkMode = ref(document.documentElement.classList.contains("dark"));
let themeObserver: MutationObserver | null = null;

const intervalOptions = [
  { label: "Manual", value: 0 },
  { label: "10 Sec", value: 10 },
  { label: "1 Min", value: 60 },
  { label: "5 Min", value: 300 },
];

// --- Lifecycle ---
onMounted(async () => {
  // 1. Site 목록 로드
  sites.value = await dashboardApi.getSites();

  // 2. 초기 필터 값 결정 (우선순위: 1.Store -> 2.LocalStorage -> 3.Auth/Demo)
  let targetSite = filterStore.selectedSite;
  let targetSdwt = filterStore.selectedSdwt;

  // Store 비어있으면 LocalStorage 확인
  if (!targetSite) {
    targetSite = localStorage.getItem("performance_site") || "";
    if (targetSite) {
      targetSdwt = localStorage.getItem("performance_sdwt") || "";
    }
  }

  // LocalStorage도 없으면 Auth/Demo 기본값
  if (!targetSite) {
    targetSite = authStore.user?.site || "";
    targetSdwt = authStore.user?.sdwt || "";
  }

  // 3. 결정된 Site 적용 및 하위 데이터(SDWT) 로드
  if (targetSite && sites.value.includes(targetSite)) {
    filterStore.selectedSite = targetSite;
    
    // [중요] Site 변경에 따른 SDWT 목록 즉시 로드
    sdwts.value = await dashboardApi.getSdwts(targetSite);

    // 4. SDWT 적용 및 하위 데이터(EQP) 로드
    if (targetSdwt && sdwts.value.includes(targetSdwt)) {
      filterStore.selectedSdwt = targetSdwt;
      
      // Agent 설치 장비 목록 로드
      await loadEqpIds();

      // 5. EQP ID 복원
      const savedEqpId = localStorage.getItem("performance_eqpid");
      if (savedEqpId && eqpIds.value.includes(savedEqpId)) {
        selectedEqpId.value = savedEqpId;
      }
    } else {
      filterStore.selectedSdwt = "";
      selectedEqpId.value = "";
    }
  } else {
    filterStore.selectedSite = "";
    filterStore.selectedSdwt = "";
  }

  themeObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === "class") {
        isDarkMode.value = document.documentElement.classList.contains("dark");
      }
    });
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
});

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer);
  if (themeObserver) themeObserver.disconnect();
});

// --- Handlers ---
// Site 변경 시 로컬 스토리지 업데이트 (performance_site)
const onSiteChange = async () => {
  if (filterStore.selectedSite) {
    localStorage.setItem("performance_site", filterStore.selectedSite);
    sdwts.value = await dashboardApi.getSdwts(filterStore.selectedSite);
  } else {
    localStorage.removeItem("performance_site");
    sdwts.value = [];
  }

  // 하위 필터 초기화 & 로컬스토리지 삭제
  filterStore.selectedSdwt = "";
  localStorage.removeItem("performance_sdwt");
  selectedEqpId.value = "";
  localStorage.removeItem("performance_eqpid");
  eqpIds.value = [];
  hasSearched.value = false;
};

// SDWT 변경 시 로컬 스토리지 업데이트 (performance_sdwt)
const onSdwtChange = async () => {
  if (filterStore.selectedSdwt) {
    localStorage.setItem("performance_sdwt", filterStore.selectedSdwt);
    await loadEqpIds();
  } else {
    localStorage.removeItem("performance_sdwt");
    eqpIds.value = [];
  }

  // 하위 필터 초기화 & 로컬스토리지 삭제
  selectedEqpId.value = "";
  localStorage.removeItem("performance_eqpid");
};

// EqpID 변경 시 로컬 스토리지 업데이트 (performance_eqpid)
const onEqpIdChange = () => {
  if (selectedEqpId.value) {
    localStorage.setItem("performance_eqpid", selectedEqpId.value);
  } else {
    localStorage.removeItem("performance_eqpid");
  }
};

// 초기화 시 로컬 스토리지 키 삭제
const resetFilters = () => {
  if (isRealtime.value) return;

  filterStore.reset();
  selectedEqpId.value = "";

  localStorage.removeItem("performance_site");
  localStorage.removeItem("performance_sdwt");
  localStorage.removeItem("performance_eqpid");

  sdwts.value = [];
  eqpIds.value = [];
  chartData.value = [];
  summaryData.value = [];
  hasSearched.value = false;
  intervalSeconds.value = 0;
};

// [유지] EqpID 로딩 상태 처리
const loadEqpIds = async () => {
  isEqpLoading.value = true;
  try {
    eqpIds.value = await equipmentApi.getEqpIds(
      undefined,
      filterStore.selectedSdwt,
      "performance"
    );
  } finally {
    isEqpLoading.value = false;
  }
};

// --- Chart Options & Helpers (기존 유지) ---
const getTooltipFormatter = (unitMap: Record<string, string>) => {
  return (params: any) => {
    if (!params || !params[0]) return "";
    const xDate = new Date(params[0].axisValueLabel);
    const timeStr = isNaN(xDate.getTime())
      ? params[0].axisValueLabel
      : xDate.toLocaleTimeString("en-GB", { hour12: false });

    let html = `<div class="font-bold mb-1">${timeStr}</div>`;

    params.forEach((p: any) => {
      let key = "";
      if (p.seriesName === "CPU Usage") key = "cpuUsage";
      else if (p.seriesName === "Memory Usage") key = "memoryUsage";
      else if (p.seriesName === "CPU Temp") key = "cpuTemp";
      else if (p.seriesName === "Fan Speed") key = "fanSpeed";
      else if (p.seriesName === "GPU Temp") key = "gpuTemp";

      if (key && p.data[key] !== undefined) {
        const u = unitMap[p.seriesName] || "";
        const valNum = Number(p.data[key]);
        const colorDot = `<span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:${p.color};"></span>`;
        html += `<div>${colorDot} ${p.seriesName}: ${valNum.toFixed(
          2
        )} ${u}</div>`;
      }
    });
    return html;
  };
};

const axisFormatter = (value: number | string) => {
  const val = Number(value);
  if (isNaN(val)) return value;
  return Number.isInteger(val) ? val : val.toFixed(1);
};

const getAxisRange = (
  field: keyof PerformanceDataPointDto,
  isPercent: boolean = false
) => {
  if (!chartData.value.length) return {};
  const values = chartData.value.map((d) => Number(d[field]));
  const min = Math.min(...values);
  const max = Math.max(...values);

  const range = max - min || (min === 0 ? 1 : Math.abs(min * 0.1));
  const padding = range * 0.2;

  let newMin = min - padding;
  let newMax = max + padding;

  if (isPercent) {
    newMin = Math.max(0, newMin);
    newMax = Math.min(100, newMax);
  } else {
    if (field === "fanSpeed") newMin = Math.max(0, newMin);
  }

  return { min: newMin, max: newMax };
};

const commonChartOption = () => {
  const textColor = isDarkMode.value ? "#cbd5e1" : "#475569";
  const gridColor = isDarkMode.value
    ? "rgba(255, 255, 255, 0.1)"
    : "rgba(0, 0, 0, 0.1)";
  return {
    tooltip: {
      trigger: "axis",
      backgroundColor: isDarkMode.value
        ? "rgba(24, 24, 27, 0.9)"
        : "rgba(255, 255, 255, 0.95)",
      borderColor: isDarkMode.value ? "#3f3f46" : "#e2e8f0",
      textStyle: { color: isDarkMode.value ? "#fff" : "#1e293b" },
    },
    grid: { left: 50, right: 35, top: 30, bottom: 25 },
    dataZoom: [
      {
        type: "inside",
        xAxisIndex: [0],
        filterMode: "filter",
      },
    ],
    dataset: {
      source: chartData.value,
    },
    xAxis: {
      type: "category",
      axisLabel: {
        color: textColor,
        fontSize: 10,
        formatter: (value: string) => {
          const d = new Date(value);
          if (isNaN(d.getTime())) return value;
          return `${String(d.getMonth() + 1).padStart(2, "0")}-${String(
            d.getDate()
          ).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(
            d.getMinutes()
          ).padStart(2, "0")}`;
        },
      },
      axisLine: { lineStyle: { color: gridColor } },
    },
    legend: {
      show: false,
    },
    yAxis: {
      type: "value",
      scale: true,
      axisLabel: { color: textColor, fontSize: 10, formatter: axisFormatter },
      splitLine: { lineStyle: { color: gridColor } },
    },
  };
};

const cpuOption = computed(() => {
  const base = commonChartOption();
  const range = getAxisRange("cpuUsage", true);

  return {
    ...base,
    tooltip: {
      ...base.tooltip,
      formatter: getTooltipFormatter({ "CPU Usage": "%" }),
    },
    yAxis: {
      ...base.yAxis,
      min: range.min,
      max: range.max,
    },
    series: [
      {
        name: "CPU Usage",
        type: "line",
        encode: { x: "timestamp", y: "cpuUsage" },
        smooth: true,
        showSymbol: true,
        symbolSize: 3,
        itemStyle: { color: "#3b82f6" },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(59, 130, 246, 0.3)" },
              { offset: 1, color: "rgba(59, 130, 246, 0)" },
            ],
          },
        },
      },
    ],
  };
});

const memOption = computed(() => {
  const base = commonChartOption();
  const range = getAxisRange("memoryUsage", true);

  return {
    ...base,
    tooltip: {
      ...base.tooltip,
      formatter: getTooltipFormatter({ "Memory Usage": "%" }),
    },
    yAxis: {
      ...base.yAxis,
      min: range.min,
      max: range.max,
    },
    series: [
      {
        name: "Memory Usage",
        type: "line",
        encode: { x: "timestamp", y: "memoryUsage" },
        smooth: true,
        showSymbol: true,
        symbolSize: 3,
        itemStyle: { color: "#10b981" },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(16, 185, 129, 0.3)" },
              { offset: 1, color: "rgba(16, 185, 129, 0)" },
            ],
          },
        },
      },
    ],
  };
});

const cpuTempFanOption = computed(() => {
  const base = commonChartOption();
  const textColor = isDarkMode.value ? "#cbd5e1" : "#475569";
  const gridColor = isDarkMode.value
    ? "rgba(255, 255, 255, 0.1)"
    : "rgba(0, 0, 0, 0.1)";

  const tempRange = getAxisRange("cpuTemp", false);
  const fanRange = getAxisRange("fanSpeed", false);

  return {
    ...base,
    tooltip: {
      ...base.tooltip,
      formatter: getTooltipFormatter({ "CPU Temp": "°C", "Fan Speed": "RPM" }),
    },
    legend: {
      show: true,
      data: ["CPU Temp", "Fan Speed"],
      selectedMode: true,
      top: 5,
      right: 70,
      textStyle: { color: textColor, fontSize: 10 },
      itemGap: 10,
      itemWidth: 15,
      itemHeight: 10,
    },
    yAxis: [
      {
        type: "value",
        name: "Temp (°C)",
        position: "left",
        min: tempRange.min,
        max: tempRange.max,
        axisLabel: { color: textColor, fontSize: 10, formatter: axisFormatter },
        splitLine: { lineStyle: { color: gridColor } },
      },
      {
        type: "value",
        name: "Fan (RPM)",
        position: "right",
        min: fanRange.min,
        max: fanRange.max,
        axisLabel: { color: textColor, fontSize: 10, formatter: axisFormatter },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: "CPU Temp",
        type: "line",
        yAxisIndex: 0,
        encode: { x: "timestamp", y: "cpuTemp" },
        smooth: true,
        showSymbol: true,
        symbolSize: 3,
        itemStyle: { color: "#f59e0b" },
      },
      {
        name: "Fan Speed",
        type: "line",
        yAxisIndex: 1,
        encode: { x: "timestamp", y: "fanSpeed" },
        smooth: true,
        showSymbol: true,
        symbolSize: 3,
        itemStyle: { color: "#8b5cf6" },
      },
    ],
  };
});

const gpuOption = computed(() => {
  const base = commonChartOption();
  const range = getAxisRange("gpuTemp", false);

  return {
    ...base,
    tooltip: {
      ...base.tooltip,
      formatter: getTooltipFormatter({ "GPU Temp": "°C" }),
    },
    yAxis: {
      ...base.yAxis,
      min: range.min,
      max: range.max,
    },
    series: [
      {
        name: "GPU Temp",
        type: "line",
        encode: { x: "timestamp", y: "gpuTemp" },
        smooth: true,
        showSymbol: true,
        symbolSize: 3,
        itemStyle: { color: "#ef4444" },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(239, 68, 68, 0.3)" },
              { offset: 1, color: "rgba(239, 68, 68, 0)" },
            ],
          },
        },
      },
    ],
  };
});

const onChartInit = (chartKey: string, instance: any) => {
  chartInstances[chartKey] = instance;
  instance.on("dataZoom", () => {
    const option = instance.getOption();
    if (option.dataZoom && option.dataZoom[0]) {
      const start = option.dataZoom[0].start;
      const end = option.dataZoom[0].end;
      if (start > 0 || end < 100) zoomStates[chartKey] = true;
      else zoomStates[chartKey] = false;
    }
  });
};

const resetChartZoom = (chartKey: string) => {
  const instance = chartInstances[chartKey];
  if (instance) {
    instance.dispatchAction({ type: "dataZoom", start: 0, end: 100 });
    zoomStates[chartKey] = false;
  }
};

const toggleRealtime = () => {
  if (intervalSeconds.value > 0) {
    isRealtime.value = true;
    updateRealtimeDates();
    searchData();
    if (refreshTimer) clearInterval(refreshTimer);
    refreshTimer = setInterval(() => {
      updateRealtimeDates();
      searchData(true);
    }, intervalSeconds.value * 1000);
  } else {
    isRealtime.value = false;
    if (refreshTimer) clearInterval(refreshTimer);
  }
};

const updateRealtimeDates = () => {
  const now = new Date();
  endDate.value = now;
  startDate.value = new Date(now.getTime() - 1 * 60 * 60 * 1000);
};

const searchData = async (silent = false) => {
  if (!selectedEqpId.value) return;
  if (!silent) isLoading.value = true;
  hasSearched.value = true;

  try {
    const fixedStart = new Date(startDate.value);
    fixedStart.setMinutes(0, 0, 0);

    const fixedEnd = new Date(endDate.value);
    fixedEnd.setMinutes(59, 59, 999);

    let fetchInterval = 60;

    const diffMs = fixedEnd.getTime() - fixedStart.getTime();
    const diffDays = diffMs / (1000 * 3600 * 24);

    if (isRealtime.value) {
      fetchInterval = intervalSeconds.value;
    } else {
      if (diffDays <= 1) fetchInterval = 5;
      else if (diffDays <= 3) fetchInterval = 10;
      else if (diffDays <= 7) fetchInterval = 60;
      else if (diffDays <= 30) fetchInterval = 600;
      else fetchInterval = 1800;
    }

    // [수정] 배열로 전달하여 API 에러 방지 ([selectedEqpId.value])
    const rawData = await performanceApi.getHistory(
      isRealtime.value
        ? startDate.value.toISOString()
        : fixedStart.toISOString(),
      isRealtime.value ? endDate.value.toISOString() : fixedEnd.toISOString(),
      [selectedEqpId.value],
      fetchInterval
    );

    chartData.value = rawData
      .filter((d) => d.timestamp)
      .map((d) => {
        let ts = String(d.timestamp || "");
        if (ts.includes(".")) {
          ts = ts.split(".")[0] ?? ts;
        }
        if (ts.includes("Z")) ts = ts.replace("Z", "");

        return {
          eqpId: d.eqpId || "",
          timestamp: ts,
          cpuUsage: Number(d.cpuUsage ?? 0),
          memoryUsage: Number(d.memoryUsage ?? 0),
          cpuTemp: Number(d.cpuTemp ?? 0),
          gpuTemp: Number(d.gpuTemp ?? 0),
          fanSpeed: Number(d.fanSpeed ?? 0),
        };
      });

    calculateSummary(chartData.value);
  } catch (e) {
    console.error(e);
    chartData.value = [];
    summaryData.value = [];
  } finally {
    if (!silent) isLoading.value = false;
  }
};

const calculateSummary = (data: PerformanceDataPointDto[]) => {
  if (!data || data.length === 0) {
    summaryData.value = [];
    return;
  }
  let cpuPeakItem = data[0] as PerformanceDataPointDto;
  let memPeakItem = data[0] as PerformanceDataPointDto;
  let gpuPeakItem = data[0] as PerformanceDataPointDto;

  for (const d of data) {
    if ((d.cpuUsage ?? 0) > (cpuPeakItem.cpuUsage ?? 0)) cpuPeakItem = d;
    if ((d.memoryUsage ?? 0) > (memPeakItem.memoryUsage ?? 0)) memPeakItem = d;
    if ((d.gpuTemp ?? 0) > (gpuPeakItem.gpuTemp ?? 0)) gpuPeakItem = d;
  }

  summaryData.value = [
    {
      eqpId: selectedEqpId.value || "",
      cpuPeakTime: cpuPeakItem.timestamp ?? "",
      cpuMax: cpuPeakItem.cpuUsage,
      cpuTempAtPeak: cpuPeakItem.cpuTemp,
      fanSpeedAtPeak: cpuPeakItem.fanSpeed,
      memPeakTime: memPeakItem.timestamp ?? "",
      memMax: memPeakItem.memoryUsage,
      gpuPeakTime: gpuPeakItem.timestamp ?? "",
      gpuMax: gpuPeakItem.gpuTemp,
    },
  ];
};

const formatDate = (dateStr: string | undefined) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return `${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes()
  ).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
};

const fmt = (val: number | string | undefined, digits: number) => {
  const num = Number(val);
  return !isNaN(num) && val !== undefined && val !== null
    ? num.toFixed(digits)
    : "-";
};
</script>

<style scoped>
:deep(.p-select),
:deep(.custom-dropdown) {
  @apply !bg-slate-100 dark:!bg-zinc-800/50 !border-0 text-slate-700 dark:text-slate-200 rounded-lg font-bold shadow-none transition-colors;
}
:deep(.custom-dropdown .p-select-label) {
  @apply text-[13px] py-[5px] px-3;
}
:deep(.custom-input-text.small) {
  @apply !text-[13px] !p-1 !h-7 !bg-transparent !border-0;
}
:deep(.date-picker .p-inputtext) {
  @apply !text-[13px] !py-1 !px-2 !h-7;
}
:deep(.p-select-clear-icon),
:deep(.p-datepicker-clear-icon) {
  @apply text-[9px] text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300;
}
:deep(.custom-dropdown.small) {
  @apply h-7;
}
:deep(.custom-dropdown:hover) {
  @apply !bg-slate-200 dark:!bg-zinc-800;
}
:deep(.p-select-dropdown),
:deep(.p-autocomplete-dropdown) {
  @apply text-slate-400 dark:text-zinc-500 w-6 !bg-transparent !border-0 !shadow-none;
}
:deep(.p-select-dropdown svg),
:deep(.p-autocomplete-dropdown svg) {
  @apply w-3 h-3;
}
.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
:deep(.p-select-filter-container) {
  @apply !p-2;
}
:deep(.p-select-filter-input) {
  @apply !text-xs !py-1.5 !px-2;
}

:deep(.small-text-dropdown .p-select-label) {
  font-size: 11px !important;
  padding: 4px 8px !important;
}
</style>

