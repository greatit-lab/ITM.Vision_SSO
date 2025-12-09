<!-- frontend/src/views/SpectrumAnalysisView.vue -->
<template>
  <div
    class="flex flex-col h-full w-full font-sans transition-colors duration-500 bg-[#F8FAFC] dark:bg-[#09090B] overflow-hidden"
  >
    <div class="flex items-center gap-2 px-1 mb-2 shrink-0">
      <div
        class="flex items-center justify-center w-8 h-8 bg-white border rounded-lg shadow-sm dark:bg-zinc-900 border-slate-100 dark:border-zinc-800"
      >
        <i
          class="text-lg text-indigo-500 pi pi-wave-pulse dark:text-indigo-400"
        ></i>
      </div>
      <div class="flex items-baseline gap-2">
        <h1
          class="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white"
        >
          Spectrum Analysis
        </h1>
        <span
          class="text-slate-400 dark:text-slate-500 font-medium text-[11px]"
        >
          Wavelength vs Intensity multi-wafer comparison.
        </span>
      </div>
    </div>

    <div
      class="mb-3 bg-white dark:bg-[#111111] p-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 flex flex-col gap-2 shadow-sm shrink-0 transition-colors duration-300"
    >
      <div class="flex items-center justify-between gap-2">
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
              @change="onSiteChange"
            />
          </div>
          <div class="min-w-[160px] shrink-0">
            <Select
              v-model="filterStore.selectedSdwt"
              :options="sdwts"
              placeholder="SDWT"
              :disabled="!filterStore.selectedSite"
              showClear
              class="w-full custom-dropdown small"
              overlayClass="custom-dropdown-panel small"
              @change="onSdwtChange"
            />
          </div>
          <div class="min-w-[160px] shrink-0">
            <Select
              v-model="filters.eqpId"
              :options="eqpIds"
              filter
              placeholder="EQP ID"
              :disabled="!filterStore.selectedSdwt"
              showClear
              class="w-full custom-dropdown small"
              overlayClass="custom-dropdown-panel small"
              @change="onEqpChange"
            />
          </div>
          <div class="min-w-[160px] shrink-0">
            <Select
              v-model="filters.lotId"
              :options="lotIds"
              filter
              placeholder="Lot ID"
              :disabled="!filters.eqpId"
              showClear
              class="w-full custom-dropdown small"
              overlayClass="custom-dropdown-panel small"
              @change="onLotChange"
            />
          </div>

          <div
            class="w-px h-6 bg-slate-200 dark:bg-zinc-700 mx-1 shrink-0"
          ></div>

          <div class="min-w-[130px] shrink-0">
            <DatePicker
              v-model="filters.startDate"
              showIcon
              dateFormat="yy-mm-dd"
              placeholder="Start"
              class="w-full custom-dropdown small date-picker"
              :disabled="!filters.eqpId"
              @update:model-value="onDateChange"
            />
          </div>
          <div class="min-w-[130px] shrink-0">
            <DatePicker
              v-model="filters.endDate"
              showIcon
              dateFormat="yy-mm-dd"
              placeholder="End"
              class="w-full custom-dropdown small date-picker"
              :disabled="!filters.eqpId"
              @update:model-value="onDateChange"
            />
          </div>
        </div>
        <div
          class="flex items-center gap-1 pl-2 border-l shrink-0 border-slate-100 dark:border-zinc-800"
        >
          <Button
            icon="pi pi-refresh"
            text
            rounded
            severity="secondary"
            v-tooltip.bottom="'Reset'"
            class="!w-7 !h-7 !text-slate-400 hover:!text-slate-600 dark:!text-zinc-500 dark:hover:!text-zinc-300"
            @click="resetFilters"
          />
        </div>
      </div>
    </div>

    <div
      v-if="filters.lotId"
      class="flex flex-1 min-h-0 gap-4 pb-2 overflow-hidden lg:flex-row flex-col animate-fade-in"
    >
      <div
        class="flex flex-col w-full lg:w-64 shrink-0 bg-white dark:bg-[#111111] border border-slate-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden"
      >
        <div
          class="p-3 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30"
        >
          <h3
            class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2"
          >
            Target Selection
          </h3>

          <div class="mb-3">
            <label class="text-[10px] font-bold text-slate-400 block mb-1"
              >MEASUREMENT POINT</label
            >
            <Select
              v-model="filters.pointId"
              :options="pointIds"
              placeholder="Select Point"
              class="w-full custom-dropdown small"
              overlayClass="custom-dropdown-panel small"
            />
          </div>

          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="text-[10px] font-bold text-slate-400"
                >WAFERS ({{ selectedWafers.length }})</label
              >
              <button
                @click="toggleAllWafers"
                class="text-[10px] text-indigo-500 hover:text-indigo-600 font-bold"
              >
                {{
                  selectedWafers.length === waferList.length
                    ? "Deselect All"
                    : "Select All"
                }}
              </button>
            </div>
            <div class="h-px bg-slate-200 dark:bg-zinc-700 mb-2"></div>
            <div
              class="max-h-[300px] lg:max-h-none overflow-y-auto custom-scrollbar pr-1 space-y-1"
            >
              <div
                v-for="w in waferList"
                :key="w"
                @click="toggleWafer(w)"
                class="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors border"
                :class="
                  selectedWafers.includes(w)
                    ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800'
                    : 'border-transparent hover:bg-slate-50 dark:hover:bg-zinc-900'
                "
              >
                <div
                  class="w-4 h-4 rounded border flex items-center justify-center transition-colors"
                  :class="
                    selectedWafers.includes(w)
                      ? 'bg-indigo-500 border-indigo-500'
                      : 'border-slate-300 dark:border-zinc-600'
                  "
                >
                  <i
                    v-if="selectedWafers.includes(w)"
                    class="pi pi-check text-white text-[10px]"
                  ></i>
                </div>
                <span
                  class="text-xs font-mono font-medium"
                  :class="
                    selectedWafers.includes(w)
                      ? 'text-indigo-700 dark:text-indigo-300'
                      : 'text-slate-600 dark:text-slate-400'
                  "
                >
                  Wafer #{{ w }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-auto p-3 border-t border-slate-100 dark:border-zinc-800">
          <Button
            label="Analyze Spectrum"
            icon="pi pi-search"
            class="w-full !text-xs !font-bold !py-2 !rounded-lg"
            :loading="isLoading"
            :disabled="!isReadyToSearch"
            @click="searchData"
          />
        </div>
      </div>

      <div
        class="flex flex-col flex-1 overflow-hidden bg-white border shadow-sm rounded-xl dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 relative"
      >
        <div
          class="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-zinc-800 shrink-0"
        >
          <div class="flex items-center gap-2">
            <div class="w-1 h-3 bg-indigo-500 rounded-full"></div>
            <h3 class="text-xs font-bold text-slate-700 dark:text-slate-200">
              Spectrum Trend (Intensity vs Wavelength)
            </h3>
          </div>
          <div class="flex items-center gap-2">
            <span
              v-if="chartSeries.length > 0"
              class="text-[10px] text-slate-400 font-mono"
            >
              Range: 200nm ~ 800nm
            </span>
          </div>
        </div>

        <div
          class="relative flex-1 w-full min-h-0 bg-slate-50/30 dark:bg-black/20"
        >
          <div
            v-if="!hasSearched"
            class="absolute inset-0 flex flex-col items-center justify-center text-slate-400 opacity-60 select-none"
          >
            <i
              class="pi pi-chart-line text-4xl mb-3 text-slate-300 dark:text-zinc-700"
            ></i>
            <p class="text-sm font-medium">Select wafers and click Analyze</p>
          </div>

          <EChart v-else :option="chartOption" class="w-full h-full" />
        </div>
      </div>
    </div>

    <div
      v-else
      class="flex flex-col items-center justify-center flex-1 text-slate-400 opacity-50 select-none min-h-[400px]"
    >
      <div
        class="flex items-center justify-center w-16 h-16 mb-4 rounded-full shadow-inner bg-slate-100 dark:bg-zinc-800"
      >
        <i
          class="text-3xl pi pi-wave-pulse text-slate-300 dark:text-zinc-600"
        ></i>
      </div>
      <p class="text-sm font-medium">Please select a Lot to begin analysis</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, onUnmounted } from "vue";
import { useFilterStore } from "@/stores/filter";
import { dashboardApi } from "@/api/dashboard";
import { equipmentApi } from "@/api/equipment";
import { waferApi } from "@/api/wafer";
import EChart from "@/components/common/EChart.vue";
import Select from "primevue/select";
import DatePicker from "primevue/datepicker";
import Button from "primevue/button";

// --- State & Filters ---
const filterStore = useFilterStore();
const isLoading = ref(false);
const hasSearched = ref(false);

const sites = ref<string[]>([]);
const sdwts = ref<string[]>([]);
const eqpIds = ref<string[]>([]);
const lotIds = ref<string[]>([]);
const waferList = ref<string[]>([]); // Available Wafers in Lot
const pointIds = ref<string[]>(["1", "2", "3", "4", "5"]); // Mock Points

// Filter Local State
const filters = reactive({
  eqpId: "",
  lotId: "",
  pointId: "1",
  startDate: new Date(Date.now() - 7 * 864e5),
  endDate: new Date(),
});

const selectedWafers = ref<string[]>([]);
const chartSeries = ref<any[]>([]);

// Dark Mode Detection (Safe)
const isDarkMode = ref(document.documentElement.classList.contains("dark"));
let themeObserver: MutationObserver;

// --- Computed ---
const isReadyToSearch = computed(
  () => filters.lotId && filters.pointId && selectedWafers.value.length > 0
);

// --- Lifecycle ---
onMounted(async () => {
  sites.value = await dashboardApi.getSites();
  // Load saved state logic...
  const savedSite = localStorage.getItem("spec_site");
  if (savedSite && sites.value.includes(savedSite)) {
    filterStore.selectedSite = savedSite;
    sdwts.value = await dashboardApi.getSdwts(savedSite);
  }

  // Theme Observer (Safe Implementation)
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

// --- Handlers ---
const onSiteChange = async () => {
  if (filterStore.selectedSite) {
    localStorage.setItem("spec_site", filterStore.selectedSite);
    sdwts.value = await dashboardApi.getSdwts(filterStore.selectedSite);
  } else {
    sdwts.value = [];
  }
  resetFrom(0);
};
const onSdwtChange = async () => {
  if (filterStore.selectedSdwt) {
    eqpIds.value = await equipmentApi.getEqpIds(
      undefined,
      filterStore.selectedSdwt
    );
  } else {
    eqpIds.value = [];
  }
  resetFrom(1);
};
const onEqpChange = () => {
  if (filters.eqpId) loadLotIds();
  else resetFrom(2);
};
const onLotChange = async () => {
  if (filters.lotId) {
    // Mock: Get Wafer List for Lot
    // In real app: waferApi.getWafersInLot(filters.lotId)
    waferList.value = Array.from({ length: 25 }, (_, i) => String(i + 1));
    selectedWafers.value = ["1", "2", "3"]; // Default select
  } else {
    resetFrom(3);
  }
};
const onDateChange = () => {
  if (filters.eqpId) loadLotIds();
};

const resetFrom = (level: number) => {
  if (level <= 0) {
    filterStore.selectedSdwt = "";
    eqpIds.value = [];
  }
  if (level <= 1) {
    filters.eqpId = "";
  }
  if (level <= 2) {
    filters.lotId = "";
    lotIds.value = [];
  }
  if (level <= 3) {
    waferList.value = [];
    selectedWafers.value = [];
    chartSeries.value = [];
    hasSearched.value = false;
  }
};

const loadLotIds = async () => {
  lotIds.value = await waferApi.getDistinctValues("lotids", {
    eqpId: filters.eqpId,
    startDate: filters.startDate?.toISOString(),
    endDate: filters.endDate?.toISOString(),
  });
};

const toggleWafer = (w: string) => {
  if (selectedWafers.value.includes(w))
    selectedWafers.value = selectedWafers.value.filter((item) => item !== w);
  else selectedWafers.value.push(w);
};

const toggleAllWafers = () => {
  if (selectedWafers.value.length === waferList.value.length)
    selectedWafers.value = [];
  else selectedWafers.value = [...waferList.value];
};

const searchData = async () => {
  if (!isReadyToSearch.value) return;
  isLoading.value = true;
  hasSearched.value = true;

  try {
    // Call API (Simulated in Service)
    // Make sure waferApi has getSpectrumTrend method
    chartSeries.value = await waferApi.getSpectrumTrend({
      lotId: filters.lotId,
      pointId: filters.pointId,
      waferIds: selectedWafers.value.join(","),
    });
  } catch (e) {
    console.error(e);
  } finally {
    isLoading.value = false;
  }
};

const resetFilters = () => {
  filterStore.reset();
  resetFrom(0);
};

// --- Chart Option ---
const chartOption = computed(() => {
  const textColor = isDarkMode.value ? "#cbd5e1" : "#475569";
  const gridColor = isDarkMode.value
    ? "rgba(255, 255, 255, 0.1)"
    : "rgba(0, 0, 0, 0.1)";

  return {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      backgroundColor: isDarkMode.value
        ? "rgba(24, 24, 27, 0.9)"
        : "rgba(255, 255, 255, 0.95)",
      textStyle: { color: isDarkMode.value ? "#fff" : "#1e293b", fontSize: 11 },
      axisPointer: { type: "cross" },
    },
    legend: {
      data: chartSeries.value.map((s) => s.name),
      textStyle: { color: textColor },
      type: "scroll",
      top: 0,
    },
    grid: { left: 40, right: 40, top: 40, bottom: 40, containLabel: true },
    dataZoom: [
      { type: "inside", xAxisIndex: 0 },
      { type: "slider", xAxisIndex: 0, bottom: 0, height: 16 },
    ],
    xAxis: {
      type: "value",
      name: "Wavelength (nm)",
      nameLocation: "middle",
      nameGap: 25,
      min: 200,
      max: 800,
      axisLabel: { color: textColor },
      splitLine: { show: false },
    },
    yAxis: {
      type: "value",
      name: "Intensity",
      scale: true,
      axisLabel: { color: textColor },
      splitLine: { lineStyle: { color: gridColor, type: "dashed" } },
    },
    series: chartSeries.value.map((s) => ({
      name: s.name,
      type: "line",
      data: s.data,
      smooth: true,
      showSymbol: false,
      lineStyle: { width: 1.5 },
      emphasis: { focus: "series" },
    })),
  };
});
</script>

<style scoped>
:deep(.p-select),
:deep(.custom-dropdown) {
  @apply !bg-slate-100 dark:!bg-zinc-800/50 !border-0 text-slate-700 dark:text-slate-200 rounded-lg font-bold shadow-none transition-colors;
}
:deep(.custom-dropdown .p-select-label) {
  @apply text-[11px] py-[3px] px-2;
}
:deep(.custom-dropdown.small) {
  @apply h-6;
}
:deep(.custom-dropdown:hover) {
  @apply !bg-slate-200 dark:!bg-zinc-800;
}
:deep(.date-picker .p-inputtext) {
  @apply !text-[11px] !py-0 !px-2 !h-6;
}
:deep(.p-select-dropdown) {
  @apply text-slate-400 dark:text-zinc-500 w-5;
}
:deep(.p-select-dropdown svg) {
  @apply w-2.5 h-2.5;
}
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #3f3f46;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
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
