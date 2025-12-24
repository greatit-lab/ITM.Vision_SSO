<!-- frontend/src/views/OpticalTrendView.vue -->
<template>
  <div
    class="flex flex-col h-full w-full font-sans transition-colors duration-500 bg-[#F8FAFC] dark:bg-[#09090B] overflow-hidden"
  >
    <div class="flex items-center gap-3 px-1 mb-2 shrink-0">
      <div
        class="flex items-center justify-center w-8 h-8 bg-white border rounded-lg shadow-sm dark:bg-zinc-900 border-slate-100 dark:border-zinc-800"
      >
        <i class="text-lg text-amber-500 pi pi-eye dark:text-amber-400"></i>
      </div>
      <div class="flex items-baseline gap-2">
        <h1
          class="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white"
        >
          Optical Health Analytics
        </h1>
        <span
          class="text-slate-400 dark:text-slate-500 font-medium text-[11px]"
        >
          Spectrum quantification & intensity trend monitoring.
        </span>
      </div>
    </div>

    <div
      class="mb-5 bg-white dark:bg-[#111111] p-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 flex flex-wrap gap-2 items-center justify-between shadow-sm shrink-0 transition-colors duration-300"
    >
      <div class="flex flex-wrap items-center flex-1 gap-2 px-1 py-1">
        <div class="min-w-[120px] shrink-0">
          <Select
            v-model="filter.site"
            :options="sites"
            placeholder="Site"
            showClear
            class="w-full custom-dropdown small"
            overlayClass="custom-dropdown-panel small"
            @change="onSiteChange"
          />
        </div>
        <div class="min-w-[140px] shrink-0">
          <Select
            v-model="filter.sdwt"
            :options="sdwts"
            placeholder="SDWT"
            :disabled="!filter.site"
            showClear
            class="w-full custom-dropdown small"
            overlayClass="custom-dropdown-panel small"
            @change="onSdwtChange"
          />
        </div>
        <div class="min-w-[160px] shrink-0">
          <Select
            v-model="filter.eqpId"
            :options="eqpIds"
            placeholder="EQP ID"
            :disabled="!filter.sdwt"
            showClear
            class="w-full custom-dropdown small"
            overlayClass="custom-dropdown-panel small"
          />
        </div>
        <div
          class="flex items-center gap-2 px-2 py-1 ml-2 border-l border-slate-100 dark:border-zinc-800"
        >
          <DatePicker
            v-model="filter.startDate"
            showIcon
            dateFormat="yy-mm-dd"
            class="!w-32 !h-7 !text-[12px]"
          />
          <span class="text-slate-400">~</span>
          <DatePicker
            v-model="filter.endDate"
            showIcon
            dateFormat="yy-mm-dd"
            class="!w-32 !h-7 !text-[12px]"
          />
        </div>
      </div>

      <div
        class="flex items-center gap-1 pl-2 ml-auto border-l border-slate-100 dark:border-zinc-800"
      >
        <Button
          icon="pi pi-search"
          label="Analyze"
          class="!px-4 !py-1.5 !text-xs !font-bold !rounded-lg !bg-amber-600 !border-amber-600 hover:!bg-amber-700 !text-white transition-opacity"
          :loading="isLoading"
          :disabled="!filter.eqpId"
          @click="fetchData"
        />
      </div>
    </div>

    <div
      v-if="hasSearched && trendData.length > 0"
      class="flex flex-col flex-1 gap-4 overflow-hidden animate-fade-in"
    >
      <div class="grid grid-cols-1 gap-3 md:grid-cols-4 shrink-0">
        <div
          class="relative p-4 overflow-hidden bg-white border shadow-sm rounded-xl dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 group"
        >
          <div class="flex items-start justify-between">
            <div>
              <p
                class="text-[10px] font-bold text-slate-400 uppercase tracking-wider"
              >
                Avg Total Intensity
              </p>
              <div class="flex items-baseline gap-2 mt-1">
                <span
                  class="text-2xl font-black text-slate-800 dark:text-white"
                  >{{
                    currentStats.avgTotal.toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })
                  }}</span
                >
                <span
                  class="text-[10px] font-bold"
                  :class="getDiffClass(currentStats.totalDiff)"
                >
                  {{ currentStats.totalDiff > 0 ? "+" : ""
                  }}{{ currentStats.totalDiff }}%
                </span>
              </div>
            </div>
            <div
              class="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-500"
            >
              <i class="pi pi-sun"></i>
            </div>
          </div>
          <div
            class="w-full h-1 mt-3 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800"
          >
            <div
              class="h-full transition-all duration-1000 bg-amber-500"
              style="width: 75%"
            ></div>
          </div>
        </div>

        <div
          class="relative p-4 overflow-hidden bg-white border shadow-sm rounded-xl dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 group"
        >
          <div class="flex items-start justify-between">
            <div>
              <p
                class="text-[10px] font-bold text-slate-400 uppercase tracking-wider"
              >
                Avg Peak Signal
              </p>
              <div class="flex items-baseline gap-2 mt-1">
                <span
                  class="text-2xl font-black text-slate-800 dark:text-white"
                  >{{ currentStats.avgPeak.toFixed(1) }}</span
                >
                <span class="text-[10px] text-slate-400">counts</span>
              </div>
            </div>
            <div
              class="flex items-center justify-center w-8 h-8 text-indigo-500 rounded-lg bg-indigo-50 dark:bg-indigo-900/30"
            >
              <i class="pi pi-chart-line"></i>
            </div>
          </div>
          <div
            class="w-full h-1 mt-3 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800"
          >
            <div
              class="h-full transition-all duration-1000 bg-indigo-500"
              style="width: 60%"
            ></div>
          </div>
        </div>

        <div
          class="relative p-4 overflow-hidden bg-white border shadow-sm rounded-xl dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 group"
        >
          <div class="flex items-start justify-between">
            <div>
              <p
                class="text-[10px] font-bold text-slate-400 uppercase tracking-wider"
              >
                Signal Stability
              </p>
              <div class="flex items-baseline gap-2 mt-1">
                <span class="text-2xl font-black text-emerald-500">{{
                  currentStats.stabilityScore
                }}</span>
                <span class="text-[10px] font-bold text-slate-400">/ 100</span>
              </div>
            </div>
            <div
              class="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500"
            >
              <i class="pi pi-shield"></i>
            </div>
          </div>
          <div
            class="w-full h-1 mt-3 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800"
          >
            <div
              class="h-full transition-all duration-1000 bg-emerald-500"
              :style="{ width: currentStats.stabilityScore + '%' }"
            ></div>
          </div>
        </div>

        <div
          class="relative p-4 overflow-hidden bg-white border shadow-sm rounded-xl dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 group"
        >
          <div class="flex items-start justify-between">
            <div>
              <p
                class="text-[10px] font-bold text-slate-400 uppercase tracking-wider"
              >
                Optical Health
              </p>
              <div class="flex items-baseline gap-2 mt-1">
                <span
                  class="text-xl font-black"
                  :class="currentStats.healthColor"
                  >{{ currentStats.healthStatus }}</span
                >
              </div>
            </div>
            <div
              class="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 animate-pulse"
            >
              <i class="pi pi-check-circle"></i>
            </div>
          </div>
          <p class="mt-3 text-[10px] text-slate-400">
            Calculated based on intensity trends
          </p>
        </div>
      </div>

      <div
        class="flex flex-1 min-h-0 bg-white dark:bg-[#111111] rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm p-4 relative flex-col"
      >
        <div class="flex items-center justify-between mb-2">
          <h3
            class="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200"
          >
            <i class="pi pi-chart-bar text-amber-500"></i> Intensity Trend
            Monitoring
          </h3>
          <div class="flex gap-2">
            <span class="flex items-center gap-1 text-[10px] text-slate-500"
              ><div class="w-2 h-2 rounded-full bg-amber-500"></div>
              Total Intensity</span
            >
            <span class="flex items-center gap-1 text-[10px] text-slate-500"
              ><div class="w-2 h-2 bg-indigo-500 rounded-full"></div>
              Peak Intensity</span
            >
          </div>
        </div>
        <div class="relative flex-1 w-full min-h-0">
          <EChart :option="chartOption" class="w-full h-full" />
        </div>
      </div>
    </div>

    <div
      v-else-if="!isLoading"
      class="flex flex-col items-center justify-center flex-1 text-slate-400 opacity-50 select-none min-h-[400px]"
    >
      <div
        class="flex items-center justify-center w-20 h-20 mb-4 rounded-full shadow-inner bg-slate-100 dark:bg-zinc-800"
      >
        <i
          class="text-4xl pi pi-chart-scatter text-slate-300 dark:text-zinc-600"
        ></i>
      </div>
      <p class="text-sm font-bold text-slate-500">No Data Analyzed</p>
      <p class="text-xs">
        Select Equipment and Date Range to analyze optical health.
      </p>
    </div>

    <div
      v-else
      class="flex flex-col items-center justify-center flex-1 space-y-4"
    >
      <div class="relative">
        <div
          class="w-12 h-12 border-4 rounded-full border-slate-100 dark:border-zinc-800"
        ></div>
        <div
          class="absolute top-0 left-0 w-12 h-12 border-4 rounded-full border-amber-500 border-t-transparent animate-spin"
        ></div>
      </div>
      <p class="text-xs font-bold text-slate-400 animate-pulse">
        Quantifying Spectrum Data...
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, onUnmounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { dashboardApi } from "@/api/dashboard";
import { equipmentApi } from "@/api/equipment";
import { waferApi, type OpticalTrendDto } from "@/api/wafer";
import EChart from "@/components/common/EChart.vue";
import Select from "primevue/select";
import Button from "primevue/button";
import DatePicker from "primevue/datepicker";

// State
const authStore = useAuthStore();
const isLoading = ref(false);
const hasSearched = ref(false);
const isDarkMode = ref(document.documentElement.classList.contains("dark"));

const sites = ref<string[]>([]);
const sdwts = ref<string[]>([]);
const eqpIds = ref<string[]>([]);

const filter = reactive({
  site: "",
  sdwt: "",
  eqpId: "",
  startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
  endDate: new Date(),
});

const trendData = ref<OpticalTrendDto[]>([]);

// Lifecycle
let themeObserver: MutationObserver;

onMounted(async () => {
  sites.value = await dashboardApi.getSites();

  // Initialize with saved filters or defaults if available
  if (authStore.user?.site && sites.value.includes(authStore.user.site)) {
    filter.site = authStore.user.site;
    await onSiteChange();
    if (authStore.user?.sdwt && sdwts.value.includes(authStore.user.sdwt)) {
      filter.sdwt = authStore.user.sdwt;
      await onSdwtChange();
    }
  }

  // Theme Observer
  themeObserver = new MutationObserver((m) => {
    m.forEach((mu) => {
      if (mu.attributeName === "class")
        isDarkMode.value = document.documentElement.classList.contains("dark");
    });
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
});

onUnmounted(() => {
  if (themeObserver) themeObserver.disconnect();
});

// Handlers
const onSiteChange = async () => {
  if (filter.site) {
    sdwts.value = await dashboardApi.getSdwts(filter.site);
  } else {
    sdwts.value = [];
  }
  filter.sdwt = "";
  filter.eqpId = "";
};

const onSdwtChange = async () => {
  if (filter.sdwt) {
    eqpIds.value = await equipmentApi.getEqpIds(
      undefined,
      filter.sdwt,
      "wafer"
    );
  } else {
    eqpIds.value = [];
  }
  filter.eqpId = "";
};

const fetchData = async () => {
  if (!filter.eqpId) return;
  isLoading.value = true;
  hasSearched.value = true;
  trendData.value = []; // Reset previous data

  try {
    trendData.value = await waferApi.getOpticalTrend({
      eqpId: filter.eqpId,
      startDate: filter.startDate.toISOString(),
      endDate: filter.endDate.toISOString(),
    });
  } catch (e) {
    console.error("Failed to fetch optical trend:", e);
  } finally {
    isLoading.value = false;
  }
};

// Computed Logic for KPI
const currentStats = computed(() => {
  if (trendData.value.length === 0) {
    return {
      avgTotal: 0,
      avgPeak: 0,
      totalDiff: 0,
      stabilityScore: 0,
      healthStatus: "UNKNOWN",
      healthColor: "text-slate-400",
    };
  }

  // 1. Averages
  const sumTotal = trendData.value.reduce(
    (acc, v) => acc + v.totalIntensity,
    0
  );
  const sumPeak = trendData.value.reduce((acc, v) => acc + v.peakIntensity, 0);
  const avgTotal = sumTotal / trendData.value.length;
  const avgPeak = sumPeak / trendData.value.length;

  // 2. Diff from simulated baseline (using the first 10% of data as baseline if no other source)
  const baselineCount = Math.max(1, Math.floor(trendData.value.length * 0.1));
  const baselineData = trendData.value.slice(0, baselineCount);
  const baselineAvg =
    baselineData.reduce((acc, v) => acc + v.totalIntensity, 0) / baselineCount;

  // Calculate Diff %
  const totalDiff =
    baselineAvg !== 0
      ? Math.round(((avgTotal - baselineAvg) / baselineAvg) * 100)
      : 0;

  // 3. Stability (CV: Coefficient of Variation)
  // Standard Deviation calculation
  const variance =
    trendData.value.reduce(
      (acc, v) => acc + Math.pow(v.totalIntensity - avgTotal, 2),
      0
    ) / trendData.value.length;
  const stdDev = Math.sqrt(variance);
  const cv = avgTotal !== 0 ? stdDev / avgTotal : 0;

  // Score: 100 - (CV * 100 * Scaling Factor). If CV is 1% -> 95 score. If CV is 5% -> 75 score.
  let stabilityScore = Math.round(100 - cv * 500);
  if (stabilityScore > 100) stabilityScore = 100;
  if (stabilityScore < 0) stabilityScore = 0;

  // 4. Health Status Logic
  let healthStatus = "HEALTHY";
  let healthColor = "text-emerald-500";

  if (totalDiff < -20 || stabilityScore < 70) {
    healthStatus = "CRITICAL";
    healthColor = "text-rose-500";
  } else if (totalDiff < -10 || stabilityScore < 85) {
    healthStatus = "WARNING";
    healthColor = "text-amber-500";
  }

  return {
    avgTotal,
    avgPeak,
    totalDiff,
    stabilityScore,
    healthStatus,
    healthColor,
  };
});

const getDiffClass = (diff: number) => {
  if (diff < -10) return "text-rose-500";
  if (diff < 0) return "text-amber-500";
  return "text-emerald-500";
};

// EChart Options
const chartOption = computed(() => {
  if (trendData.value.length === 0) return {};

  const textColor = isDarkMode.value ? "#94a3b8" : "#64748b";
  const gridColor = isDarkMode.value ? "#334155" : "#e2e8f0";

  const dates = trendData.value.map((d) => {
    const date = new Date(d.ts);
    return `${
      date.getMonth() + 1
    }/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(
      2,
      "0"
    )}`;
  });
  const totalVals = trendData.value.map((d) => d.totalIntensity);
  const peakVals = trendData.value.map((d) => d.peakIntensity);

  return {
    tooltip: {
      trigger: "axis",
      backgroundColor: isDarkMode.value
        ? "rgba(24, 24, 27, 0.9)"
        : "rgba(255, 255, 255, 0.9)",
      borderColor: isDarkMode.value ? "#3f3f46" : "#e2e8f0",
      textStyle: { color: isDarkMode.value ? "#f1f5f9" : "#1e293b" },
    },
    grid: { left: 60, right: 60, top: 40, bottom: 40, containLabel: true },
    legend: { textStyle: { color: textColor } },
    dataZoom: [
      { type: "inside", start: 0, end: 100 },
      { type: "slider", bottom: 0, height: 20 },
    ],
    xAxis: {
      type: "category",
      data: dates,
      axisLine: { lineStyle: { color: gridColor } },
      axisLabel: { color: textColor, fontSize: 10 },
    },
    yAxis: [
      {
        type: "value",
        name: "Total Intensity",
        position: "left",
        splitLine: { lineStyle: { color: gridColor, type: "dashed" } },
        axisLabel: { color: textColor },
        nameTextStyle: { color: textColor, fontWeight: "bold" },
      },
      {
        type: "value",
        name: "Peak Count",
        position: "right",
        splitLine: { show: false },
        axisLabel: { color: textColor },
        nameTextStyle: { color: textColor, fontWeight: "bold" },
      },
    ],
    series: [
      {
        name: "Total Intensity",
        type: "line",
        data: totalVals,
        smooth: true,
        showSymbol: false,
        yAxisIndex: 0,
        itemStyle: { color: "#f59e0b" }, // Amber
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(245, 158, 11, 0.3)" },
              { offset: 1, color: "rgba(245, 158, 11, 0)" },
            ],
          },
        },
      },
      {
        name: "Peak Intensity",
        type: "line",
        data: peakVals,
        smooth: true,
        showSymbol: false,
        yAxisIndex: 1,
        itemStyle: { color: "#6366f1" }, // Indigo
        lineStyle: { type: "dashed" },
      },
    ],
  };
});
</script>

<style scoped>
:deep(.p-select),
:deep(.custom-dropdown) {
  @apply !bg-slate-100 dark:!bg-zinc-800/50 !border-0 text-slate-700 dark:text-slate-200 rounded-lg font-bold shadow-none transition-colors;
}
:deep(.custom-dropdown .p-select-label) {
  @apply text-[12px] py-[5px] px-3;
}
:deep(.custom-dropdown.small) {
  @apply h-7;
}
:deep(.custom-dropdown:hover) {
  @apply !bg-slate-200 dark:!bg-zinc-800;
}
/* Datepicker Customization */
:deep(.p-datepicker-input) {
  @apply !text-[12px] !py-1 !px-2;
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
