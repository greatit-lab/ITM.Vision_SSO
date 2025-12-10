 <!-- frontend/src/views/PreAlignAnalyticsView.vue -->
<template>
  <div
    class="flex flex-col h-full w-full font-sans transition-colors duration-500 bg-[#F8FAFC] dark:bg-[#09090B] overflow-hidden"
  >
    <div class="flex items-center gap-2 px-1 mb-2 shrink-0">
      <div
        class="flex items-center justify-center w-8 h-8 bg-white border rounded-lg shadow-sm dark:bg-zinc-900 border-slate-100 dark:border-zinc-800"
      >
        <i
          class="text-lg text-indigo-500 pi pi-compass dark:text-indigo-400"
        ></i>
      </div>
      <div class="flex items-baseline gap-2">
        <h1
          class="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white"
        >
          PreAlign Data
        </h1>
        <span
          class="text-slate-400 dark:text-slate-500 font-medium text-[11px]"
        >
          Precision alignment trend analysis.
        </span>
      </div>
    </div>

    <div
      class="mb-3 bg-white dark:bg-[#111111] p-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 flex flex-wrap gap-2 items-center justify-between shadow-sm shrink-0 transition-colors duration-300"
    >
      <div
        class="flex flex-wrap items-center flex-1 gap-2 px-1 py-1 overflow-x-auto scrollbar-hide"
      >
        <div class="min-w-[140px] shrink-0">
          <Select
            v-model="filter.site"
            :options="sites"
            placeholder="Site"
            class="w-full custom-dropdown small"
            overlayClass="custom-dropdown-panel small"
            showClear
            @change="onSiteChange"
          />
        </div>
        <div class="min-w-[160px] shrink-0">
          <Select
            v-model="filter.sdwt"
            :options="sdwts"
            placeholder="SDWT"
            :disabled="!filter.site"
            class="w-full custom-dropdown small"
            overlayClass="custom-dropdown-panel small"
            showClear
            @change="onSdwtChange"
          />
        </div>
        <div class="min-w-[160px] shrink-0">
          <Select
            v-model="filter.eqpId"
            :options="eqpIds"
            filter
            placeholder="EQP ID"
            :disabled="!filter.sdwt"
            showClear
            class="w-full custom-dropdown small"
            overlayClass="custom-dropdown-panel small"
            @change="onEqpIdChange"
          />
        </div>

        <div class="w-px h-6 bg-slate-200 dark:bg-zinc-700 mx-1 shrink-0"></div>

        <div class="min-w-[150px] shrink-0">
          <DatePicker
            v-model="filter.startDate"
            showIcon
            dateFormat="yy-mm-dd"
            placeholder="Start Date"
            class="w-full custom-dropdown small date-picker"
          />
        </div>
        <div class="min-w-[150px] shrink-0">
          <DatePicker
            v-model="filter.endDate"
            showIcon
            dateFormat="yy-mm-dd"
            placeholder="End Date"
            class="w-full custom-dropdown small date-picker"
          />
        </div>
      </div>

      <div
        class="flex items-center gap-1 pl-2 ml-auto border-l border-slate-100 dark:border-zinc-800"
      >
        <Button
          icon="pi pi-search"
          rounded
          class="!bg-indigo-500 !border-indigo-500 hover:!bg-indigo-600 !w-8 !h-8 !text-xs"
          @click="search"
          :loading="isLoading"
          :disabled="!filter.eqpId"
        />
        <Button
          icon="pi pi-refresh"
          text
          rounded
          severity="secondary"
          v-tooltip.left="'Reset'"
          @click="reset"
          class="!w-7 !h-7 !text-slate-400 hover:!text-slate-600 dark:!text-zinc-500 dark:hover:!text-zinc-300 transition-colors"
        />
      </div>
    </div>

    <div
      class="flex flex-col flex-1 min-h-0 overflow-hidden bg-white border shadow-sm dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 rounded-xl animate-fade-in relative"
    >
      <div
        class="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-zinc-800 shrink-0"
      >
        <div class="flex items-center gap-2">
          <div class="w-1 h-4 bg-indigo-500 rounded-full"></div>
          <h3 class="text-sm font-bold text-slate-700 dark:text-slate-200">
            {{ searchedEqpId ? `${searchedEqpId} - ` : "" }}Alignment Trend
          </h3>
          <span
            v-if="hasSearched"
            class="text-xs font-medium text-slate-400 dark:text-slate-500 ml-2"
          >
            ({{ chartData.length.toLocaleString() }} points)
          </span>
        </div>
      </div>

      <div class="relative flex-1 w-full min-h-0 group">
        <div
          v-if="isLoading"
          class="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm"
        >
          <ProgressSpinner style="width: 40px; height: 40px" strokeWidth="4" />
          <p class="mt-4 text-xs font-medium text-slate-400 animate-pulse">
            Loading Data...
          </p>
        </div>

        <EChart
          v-else-if="hasSearched && chartData.length > 0"
          :option="chartOption"
          class="w-full h-full"
          @chartCreated="onChartCreated"
        />

        <div
          v-else-if="!isLoading && hasSearched && chartData.length === 0"
          class="absolute inset-0 flex flex-col items-center justify-center text-slate-400 opacity-60"
        >
          <i class="mb-2 text-3xl pi pi-exclamation-circle opacity-30"></i>
          <span class="text-xs">No data found for the selected criteria.</span>
        </div>

        <div
          v-else
          class="absolute inset-0 flex flex-col items-center justify-center opacity-50 select-none"
        >
          <div
            class="flex items-center justify-center w-20 h-20 mb-4 rounded-full shadow-inner bg-slate-100 dark:bg-zinc-800"
          >
            <i
              class="text-4xl text-slate-300 dark:text-zinc-600 pi pi-chart-line"
            ></i>
          </div>
          <p class="text-sm font-bold text-slate-500">Ready to Analyze</p>
          <p class="mt-1 text-xs text-slate-400">
            Select an equipment and date range to view trends.
          </p>
        </div>

        <transition name="fade">
          <button
            v-if="isZoomed"
            @click="resetZoom"
            class="absolute top-2 right-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1 transition-colors z-20 cursor-pointer"
          >
            <i class="pi pi-refresh" style="font-size: 0.7rem"></i>
            Reset Zoom
          </button>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, onUnmounted } from "vue";
import { dashboardApi } from "@/api/dashboard";
import { equipmentApi } from "@/api/equipment";
import { preAlignApi, type PreAlignDataDto } from "@/api/prealign";
import EChart from "@/components/common/EChart.vue";
import type { ECharts } from "echarts";

// Components
import Select from "primevue/select";
// AutoComplete 제거
import DatePicker from "primevue/datepicker";
import Button from "primevue/button";
import ProgressSpinner from "primevue/progressspinner";

// --- State ---
const filter = reactive({
  site: "",
  sdwt: "",
  eqpId: "",
  startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Default: 7 days ago
  endDate: new Date(),
});

const sites = ref<string[]>([]);
const sdwts = ref<string[]>([]);
const eqpIds = ref<string[]>([]);
// filteredEqpIds 제거 (Select 내부 필터 사용)

const isLoading = ref(false);
const hasSearched = ref(false);
const chartData = ref<PreAlignDataDto[]>([]);
const searchedEqpId = ref(""); // [수정 6] 검색된 장비명 저장용

// Zoom State
const isZoomed = ref(false);
let chartInstance: ECharts | null = null;

// Theme detection
const isDarkMode = ref(document.documentElement.classList.contains("dark"));
const themeObserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.attributeName === "class") {
      isDarkMode.value = document.documentElement.classList.contains("dark");
    }
  });
});

// --- Lifecycle ---
onMounted(async () => {
  sites.value = await dashboardApi.getSites();

  // [수정 1] localStorage에서 필터 상태 복원
  const savedSite = localStorage.getItem("prealign_site");
  const savedSdwt = localStorage.getItem("prealign_sdwt");
  const savedEqpId = localStorage.getItem("prealign_eqpid");

  if (savedSite && sites.value.includes(savedSite)) {
    filter.site = savedSite;
    sdwts.value = await dashboardApi.getSdwts(savedSite);

    if (savedSdwt) {
      filter.sdwt = savedSdwt;
      // SDWT에 해당하는 EQP 목록 로드
      eqpIds.value = await equipmentApi.getEqpIds(
        undefined,
        savedSdwt,
        "prealign"
      );

      if (savedEqpId && eqpIds.value.includes(savedEqpId)) {
        filter.eqpId = savedEqpId;
      }
    }
  }

  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
});

onUnmounted(() => {
  themeObserver.disconnect();
});

// --- Handlers ---
const onSiteChange = async () => {
  // [수정 1] 변경 시 localStorage 저장
  if (filter.site) {
    localStorage.setItem("prealign_site", filter.site);
    sdwts.value = await dashboardApi.getSdwts(filter.site);
  } else {
    localStorage.removeItem("prealign_site");
    sdwts.value = [];
  }

  // 하위 필터 초기화
  filter.sdwt = "";
  localStorage.removeItem("prealign_sdwt");
  filter.eqpId = "";
  localStorage.removeItem("prealign_eqpid");
  eqpIds.value = [];
};

const onSdwtChange = async () => {
  if (filter.sdwt) {
    localStorage.setItem("prealign_sdwt", filter.sdwt);
    // [수정] type: 'prealign' 전달
    eqpIds.value = await equipmentApi.getEqpIds(
     undefined,
     filter.sdwt,
     "prealign"
    );
  } else {
    localStorage.removeItem("prealign_sdwt");
    eqpIds.value = [];
  }

  // 하위 필터 초기화
  filter.eqpId = "";
  localStorage.removeItem("prealign_eqpid");
};

// [수정 1] EQPID 변경 시 localStorage 저장
const onEqpIdChange = () => {
  if (filter.eqpId) {
    localStorage.setItem("prealign_eqpid", filter.eqpId);
  } else {
    localStorage.removeItem("prealign_eqpid");
  }
};

const search = async () => {
  if (!filter.eqpId || !filter.startDate || !filter.endDate) return;

  isLoading.value = true;
  hasSearched.value = true;
  isZoomed.value = false;
  searchedEqpId.value = filter.eqpId; // [수정 6] 검색된 ID 업데이트

  try {
    const data = await preAlignApi.getData(
      filter.eqpId,
      filter.startDate.toISOString(),
      filter.endDate.toISOString()
    );
    chartData.value = data || [];
  } catch (e) {
    console.error("Failed to load PreAlign data:", e);
    chartData.value = [];
  } finally {
    isLoading.value = false;
  }
};

const reset = () => {
  filter.site = "";
  filter.sdwt = "";
  filter.eqpId = "";
  filter.startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  filter.endDate = new Date();

  // localStorage 초기화
  localStorage.removeItem("prealign_site");
  localStorage.removeItem("prealign_sdwt");
  localStorage.removeItem("prealign_eqpid");

  sdwts.value = [];
  eqpIds.value = [];
  chartData.value = [];
  hasSearched.value = false;
  isZoomed.value = false;
  searchedEqpId.value = "";
};

// --- Chart Helper (Zoom Event) ---
const onChartCreated = (instance: any) => {
  chartInstance = instance;
  instance.on("dataZoom", () => {
    const opt = instance.getOption();
    if (opt.dataZoom && opt.dataZoom[0]) {
      const start = opt.dataZoom[0].start;
      const end = opt.dataZoom[0].end;
      isZoomed.value = start > 0.1 || end < 99.9;
    }
  });
};

const resetZoom = () => {
  if (chartInstance) {
    chartInstance.dispatchAction({
      type: "dataZoom",
      start: 0,
      end: 100,
    });
    isZoomed.value = false;
  }
};

// --- ECharts Config ---
const chartOption = computed(() => {
  const textColor = isDarkMode.value ? "#cbd5e1" : "#475569";
  const gridColor = isDarkMode.value
    ? "rgba(255, 255, 255, 0.1)"
    : "rgba(0, 0, 0, 0.1)";

  // [수정] Time Axis(시간축) 사용을 위해 데이터를 [timestamp, value] 형태의 튜플 배열로 변환
  // 기존: timestamps 배열 별도, values 배열 별도 -> 변경: 각 시리즈가 시간 정보를 포함
  const xmmData = chartData.value.map((d) => [d.timestamp, d.xmm]);
  const ymmData = chartData.value.map((d) => [d.timestamp, d.ymm]);
  const notchData = chartData.value.map((d) => [d.timestamp, d.notch]);

  return {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      backgroundColor: isDarkMode.value
        ? "rgba(24, 24, 27, 0.9)"
        : "rgba(255, 255, 255, 0.95)",
      borderColor: isDarkMode.value ? "#3f3f46" : "#e2e8f0",
      textStyle: { color: isDarkMode.value ? "#fff" : "#1e293b" },
      formatter: (params: any) => {
        if (!params || !params[0]) return "";
        
        // [수정] Time Axis 데이터 구조([time, value])에 맞춰 툴팁 헤더 시간 포맷팅
        const date = new Date(params[0].value[0]);
        const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${String(
          date.getHours()
        ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

        let html = `<div class="font-bold mb-1 border-b border-gray-500 pb-1 text-xs">${dateStr}</div>`;
        params.forEach((p: any) => {
          // p.value가 [time, value] 배열이므로 index 1을 참조
          const val = p.value[1] !== undefined ? p.value[1].toFixed(4) : "-";
          const colorDot = `<span style="display:inline-block;margin-right:4px;border-radius:10px;width:8px;height:8px;background-color:${p.color};"></span>`;
          html += `<div class="flex justify-between gap-4 text-xs mt-1"><span>${colorDot} ${p.seriesName}</span><span class="font-mono font-bold">${val}</span></div>`;
        });
        return html;
      },
    },
    legend: {
      show: true,
      top: 5,
      left: "auto",
      right: 80,
      textStyle: { color: textColor },
      itemGap: 15,
      selectedMode: true,
    },
    grid: {
      left: 60,
      right: 60,
      top: 50,
      bottom: 80,
      containLabel: false,
    },
    dataZoom: [
      { type: "inside", xAxisIndex: [0], filterMode: "filter" },
      {
        type: "slider",
        xAxisIndex: [0],
        filterMode: "filter",
        height: 20,
        bottom: 10,
        borderColor: "transparent",
        backgroundColor: isDarkMode.value ? "#18181b" : "#f1f5f9",
      },
    ],
    xAxis: {
      type: "time",
      boundaryGap: false,
      axisLabel: {
        color: textColor,
        fontSize: 10,
        hideOverlap: true, // [유지] 라벨 겹침 방지 (너무 조밀하지 않게 자동 조절)
        
        // [수정] 요청하신 "12-05 10:00" 형식 적용
        formatter: (value: number) => {
          const date = new Date(value);
          
          // 월, 일, 시, 분을 2자리(0채움)로 변환
          const mm = String(date.getMonth() + 1).padStart(2, "0");
          const dd = String(date.getDate()).padStart(2, "0");
          const hh = String(date.getHours()).padStart(2, "0");
          const min = String(date.getMinutes()).padStart(2, "0");
          
          return `${mm}-${dd} ${hh}:${min}`;
        },
      },
      axisLine: { lineStyle: { color: gridColor } },
      splitLine: { show: false } 
    },
    yAxis: [
      {
        type: "value",
        name: "Position (mm)",
        nameTextStyle: {
          color: textColor,
          align: "left",
          padding: [0, 0, 0, -30],
        },
        position: "left",
        min: -0.5,
        max: 0.5,
        axisLabel: { color: textColor, fontSize: 10 },
        splitLine: { lineStyle: { color: gridColor } },
        axisLine: { show: true, lineStyle: { color: gridColor } },
      },
      {
        type: "value",
        name: "Notch",
        nameTextStyle: {
          color: textColor,
          align: "right",
          padding: [0, -30, 0, 0],
        },
        position: "right",
        axisLabel: { color: textColor, fontSize: 10 },
        splitLine: { show: false },
        axisLine: { show: true, lineStyle: { color: gridColor } },
      },
    ],
    series: [
      {
        name: "X (mm)",
        type: "line",
        data: xmmData, // [수정] 변환된 [시간, 값] 데이터 사용
        yAxisIndex: 0,
        showSymbol: true,
        symbolSize: 2,
        itemStyle: { color: "#3b82f6" },
        lineStyle: { width: 1.5 },
      },
      {
        name: "Y (mm)",
        type: "line",
        data: ymmData, // [수정] 변환된 [시간, 값] 데이터 사용
        yAxisIndex: 0,
        showSymbol: true,
        symbolSize: 2,
        itemStyle: { color: "#10b981" },
        lineStyle: { width: 1.5 },
      },
      {
        name: "Notch",
        type: "line",
        data: notchData, // [수정] 변환된 [시간, 값] 데이터 사용
        yAxisIndex: 1,
        showSymbol: true,
        symbolSize: 2,
        itemStyle: { color: "#f59e0b" },
        lineStyle: { width: 1.5 },
      },
    ],
  };
});
</script>

<style scoped>
/* 드롭다운 스타일 공통화 */
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
:deep(.custom-dropdown.small) {
  @apply h-7;
}
:deep(.custom-dropdown:hover) {
  @apply !bg-slate-200 dark:!bg-zinc-800;
}
:deep(.p-select-dropdown) {
  @apply text-slate-400 dark:text-zinc-500 w-6 !bg-transparent !border-0 !shadow-none;
}
:deep(.p-select-dropdown svg) {
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
</style>




