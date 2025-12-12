<!-- frontend/src/views/ProcessMatchingAnalyticsView.vue -->
<template>
  <div class="flex flex-col h-full w-full font-sans transition-colors duration-500 bg-[#F8FAFC] dark:bg-[#09090B] overflow-hidden">
    
    <div class="flex items-center gap-3 px-1 mb-2 shrink-0">
      <div class="flex items-center justify-center w-8 h-8 bg-white border rounded-lg shadow-sm dark:bg-zinc-900 border-slate-100 dark:border-zinc-800">
        <i class="text-lg text-sky-500 pi pi-clone dark:text-sky-400"></i>
      </div>
      <div class="flex items-baseline gap-2">
        <h1 class="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Process Matching Analytics
        </h1>
        <span class="text-slate-400 dark:text-slate-500 font-medium text-[11px]">
          Multi-chamber comparison & cluster analysis.
        </span>
      </div>
    </div>

    <div class="mb-3 bg-white dark:bg-[#111111] p-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 flex flex-wrap gap-2 items-center justify-between shadow-sm shrink-0 transition-colors duration-300">
      <div class="flex flex-wrap items-center flex-1 gap-2 px-1 py-1 overflow-x-auto scrollbar-hide">
        <div class="min-w-[140px] shrink-0">
          <Select v-model="filterStore.selectedSite" :options="sites" placeholder="Site" showClear class="w-full custom-dropdown small" overlayClass="custom-dropdown-panel small" @change="onSiteChange" />
        </div>
        <div class="min-w-[160px] shrink-0">
          <Select v-model="filterStore.selectedSdwt" :options="sdwts" placeholder="SDWT" :disabled="!filterStore.selectedSite" showClear class="w-full custom-dropdown small" overlayClass="custom-dropdown-panel small" @change="onSdwtChange" />
        </div>
        <div class="w-px h-6 bg-slate-200 dark:bg-zinc-700 mx-1 shrink-0"></div>
        <div class="min-w-[140px] shrink-0">
          <DatePicker v-model="filters.startDate" showIcon dateFormat="yy-mm-dd" placeholder="Start" class="w-full custom-dropdown small date-picker" />
        </div>
        <div class="min-w-[140px] shrink-0">
          <DatePicker v-model="filters.endDate" showIcon dateFormat="yy-mm-dd" placeholder="End" class="w-full custom-dropdown small date-picker" />
        </div>
      </div>
      <div class="flex items-center gap-1 pl-2 ml-auto border-l border-slate-100 dark:border-zinc-800">
        <Button icon="pi pi-refresh" text rounded severity="secondary" v-tooltip.bottom="'Reset'" class="!w-7 !h-7 !text-slate-400 hover:!text-slate-600 dark:!text-zinc-500 dark:hover:!text-zinc-300 transition-colors" @click="resetFilters" />
      </div>
    </div>

    <div class="flex flex-1 min-h-0 gap-3 pb-2 overflow-hidden lg:flex-row flex-col animate-fade-in">
      
      <div class="flex flex-col w-full lg:w-72 shrink-0 bg-white dark:bg-[#111111] border border-slate-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden h-full">
        <div class="p-3 bg-slate-50 dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-800">
          <h3 class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <i class="pi pi-filter"></i> Analysis Setup
          </h3>
        </div>
        
        <div class="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-5">
          <div class="space-y-3">
            <div class="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              <span class="w-4 h-4 rounded-full bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400 flex items-center justify-center text-[9px]">1</span>
              Target Condition
            </div>
            <div class="pl-2 space-y-2">
              <div>
                <label class="text-[10px] text-slate-400 block mb-1">CASSETTE RCP</label>
                <Select v-model="filters.cassetteRcp" :options="cassetteRcps" placeholder="Select Recipe" filter class="w-full custom-dropdown small" overlayClass="custom-dropdown-panel small" @change="onCassetteChange" />
              </div>
              <div>
                <label class="text-[10px] text-slate-400 block mb-1">STAGE GROUP</label>
                <Select v-model="filters.stageGroup" :options="stageGroups" placeholder="Select Stage" :disabled="!filters.cassetteRcp" class="w-full custom-dropdown small" overlayClass="custom-dropdown-panel small" @change="onConditionChange" />
              </div>
              <div>
                <label class="text-[10px] text-slate-400 block mb-1">FILM</label>
                <Select v-model="filters.film" :options="films" placeholder="Select Film" :disabled="!filters.stageGroup" class="w-full custom-dropdown small" overlayClass="custom-dropdown-panel small" @change="onConditionChange" />
              </div>
            </div>
          </div>

          <div class="h-px bg-slate-100 dark:bg-zinc-800 shrink-0"></div>

          <div class="flex flex-col flex-1 min-h-0 space-y-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                <span class="w-4 h-4 rounded-full bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400 flex items-center justify-center text-[9px]">2</span>
                Equipments
              </div>
              <span v-if="targetEqps.length > 0" class="text-[10px] font-bold text-sky-500">{{ selectedEqps.length }} / {{ targetEqps.length }}</span>
            </div>
            
            <div v-if="isEqpLoading" class="flex justify-center py-4">
              <i class="pi pi-spin pi-spinner text-sky-500"></i>
            </div>
            <div v-else-if="targetEqps.length === 0" class="text-[10px] text-slate-400 italic pl-2">
              Select conditions to load equipments.
            </div>
            <div v-else class="flex-1 overflow-y-auto custom-scrollbar border rounded-lg border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30 p-1">
              <div v-for="eqp in targetEqps" :key="eqp" 
                   @click="toggleEqp(eqp)"
                   class="flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-all mb-1 select-none"
                   :class="selectedEqps.includes(eqp) ? 'bg-sky-500 text-white shadow-sm font-bold' : 'hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-600 dark:text-slate-400'">
                <i :class="selectedEqps.includes(eqp) ? 'pi pi-check-circle' : 'pi pi-circle'" class="text-[10px]"></i>
                <span class="text-xs">{{ eqp }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-auto p-3 border-t border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900">
          <Button label="Analyze Matching" icon="pi pi-chart-bar" 
                  class="w-full !text-xs !font-bold !py-2.5 !rounded-lg !bg-sky-600 hover:!bg-sky-700 !border-sky-600" 
                  :loading="isDataLoading" :disabled="selectedEqps.length < 1"
                  @click="loadComparisonData" />
        </div>
      </div>

      <div class="flex flex-col flex-1 gap-3 overflow-hidden h-full">
        
        <div class="flex-[3] min-h-0 bg-white border shadow-sm rounded-xl dark:bg-[#111111] border-slate-200 dark:border-zinc-800 flex flex-col relative">
          <div class="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-zinc-800 shrink-0 bg-slate-50/50 dark:bg-zinc-900/30">
            <div class="flex items-center gap-2">
              <div class="w-1 h-3 bg-sky-500 rounded-full"></div>
              <h3 class="text-xs font-bold text-slate-700 dark:text-slate-200">Parameter Distribution (Box Plot)</h3>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-[10px] text-slate-400">Metric:</span>
              <Select v-model="selectedMetric" :options="metricOptions" class="w-24 h-6 !text-[10px]" />
            </div>
          </div>
          <div class="relative flex-1 w-full min-h-0">
             <div v-if="!hasSearched" class="absolute inset-0 flex flex-col items-center justify-center text-slate-400 opacity-60">
                <i class="pi pi-chart-bar text-3xl mb-2 opacity-30"></i>
                <span class="text-xs">Select equipments and click Analyze.</span>
             </div>
             <EChart v-else :option="boxPlotOption" class="w-full h-full" />
          </div>
        </div>

        <div class="flex-[4] min-h-0 bg-white border shadow-sm rounded-xl dark:bg-[#111111] border-slate-200 dark:border-zinc-800 flex flex-col relative">
          <div class="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-zinc-800 shrink-0 bg-slate-50/50 dark:bg-zinc-900/30">
            <div class="flex items-center gap-2">
              <div class="w-1 h-3 bg-indigo-500 rounded-full"></div>
              <h3 class="text-xs font-bold text-slate-700 dark:text-slate-200">Correlation Cluster (Scatter)</h3>
            </div>
            <div class="flex items-center gap-3">
               <div class="flex items-center gap-1">
                 <span class="text-[10px] text-slate-400 font-bold">X:</span>
                 <Select v-model="scatterX" :options="metricOptions" class="w-20 h-6 !text-[10px]" />
               </div>
               <div class="flex items-center gap-1">
                 <span class="text-[10px] text-slate-400 font-bold">Y:</span>
                 <Select v-model="scatterY" :options="metricOptions" class="w-20 h-6 !text-[10px]" />
               </div>
            </div>
          </div>
          <div class="relative flex-1 w-full min-h-0">
             <div v-if="!hasSearched" class="absolute inset-0 flex flex-col items-center justify-center text-slate-400 opacity-60">
                <i class="pi pi-chart-scatter text-3xl mb-2 opacity-30"></i>
                <span class="text-xs">Scatter plot will appear here.</span>
             </div>
             <EChart v-else :option="scatterOption" class="w-full h-full" />
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, onUnmounted } from "vue";
import { useFilterStore } from "@/stores/filter";
import { dashboardApi } from "@/api/dashboard";
import { waferApi } from "@/api/wafer";
import EChart from "@/components/common/EChart.vue";

// Components
import Select from "primevue/select";
import DatePicker from "primevue/datepicker";
import Button from "primevue/button";

// [핵심] 1. rawData 인터페이스 정의 (TypeScript에게 데이터 구조 알림)
interface ComparisonRow {
  eqpid: string;
  lotid: string;
  waferid: string;
  point: number;
  [key: string]: number | string | null | undefined;
}

interface FilterState {
  startDate: Date;
  endDate: Date;
  cassetteRcp?: string;
  stageGroup?: string;
  film?: string;
}

const filterStore = useFilterStore();
const isEqpLoading = ref(false);
const isDataLoading = ref(false);
const hasSearched = ref(false);

const sites = ref<string[]>([]);
const sdwts = ref<string[]>([]);

const filters = reactive<FilterState>({
  startDate: new Date(Date.now() - 7 * 864e5),
  endDate: new Date(),
  cassetteRcp: undefined,
  stageGroup: undefined,
  film: undefined
});

const cassetteRcps = ref<string[]>([]);
const stageGroups = ref<string[]>([]);
const films = ref<string[]>([]);

const targetEqps = ref<string[]>([]);
const selectedEqps = ref<string[]>([]);

// [핵심] 2. rawData에 인터페이스 적용
const rawData = ref<ComparisonRow[]>([]);
const metricOptions = ref<string[]>(['t1', 'gof', 'mse', 'thickness']);
const selectedMetric = ref('t1');
const scatterX = ref('t1');
const scatterY = ref('gof');

const isDarkMode = ref(document.documentElement.classList.contains("dark"));
let themeObserver: MutationObserver;

onMounted(async () => {
  sites.value = await dashboardApi.getSites();
  themeObserver = new MutationObserver((m) => {
    m.forEach((mu) => { if (mu.attributeName === "class") isDarkMode.value = document.documentElement.classList.contains("dark"); });
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
});
onUnmounted(() => themeObserver?.disconnect());

const onSiteChange = async () => {
  if (filterStore.selectedSite) {
    sdwts.value = await dashboardApi.getSdwts(filterStore.selectedSite);
  } else { sdwts.value = []; }
  filterStore.selectedSdwt = "";
  resetConditions();
};

const onSdwtChange = () => { resetConditions(); loadOptions(); };

const resetConditions = () => {
  filters.cassetteRcp = undefined;
  filters.stageGroup = undefined;
  filters.film = undefined;
  cassetteRcps.value = [];
  stageGroups.value = [];
  films.value = [];
  targetEqps.value = [];
  selectedEqps.value = [];
};

const loadOptions = async () => {
  if(filterStore.selectedSdwt) {
     cassetteRcps.value = await waferApi.getDistinctValues("cassettercps", getBaseParams());
  }
};

const onCassetteChange = async () => {
  filters.stageGroup = undefined;
  filters.film = undefined;
  selectedEqps.value = [];
  if(filters.cassetteRcp) {
    const params = { ...getBaseParams(), cassetteRcp: filters.cassetteRcp };
    stageGroups.value = await waferApi.getDistinctValues("stagegroups", params);
    loadEquipments(); 
  }
};

const onConditionChange = async () => {
  if(filters.stageGroup) {
     const params = { 
       ...getBaseParams(), 
       cassetteRcp: filters.cassetteRcp ?? '', 
       stageGroup: filters.stageGroup ?? ''
     };
     films.value = await waferApi.getDistinctValues("films", params);
  }
  loadEquipments();
};

const getBaseParams = () => ({
  site: filterStore.selectedSite || '',
  sdwt: filterStore.selectedSdwt || '',
  startDate: filters.startDate ? new Date(filters.startDate).toISOString() : '',
  endDate: filters.endDate ? new Date(filters.endDate).toISOString() : ''
});

const loadEquipments = async () => {
  if (!filters.cassetteRcp) return;
  isEqpLoading.value = true;
  try {
    const params = {
      ...getBaseParams(),
      cassetteRcp: filters.cassetteRcp ?? '', 
      stageGroup: filters.stageGroup ?? '',
      film: filters.film ?? ''
    };
    targetEqps.value = await waferApi.getMatchingEquipments(params);
    selectedEqps.value = [];
  } catch (e) {
    console.error(e);
  } finally {
    isEqpLoading.value = false;
  }
};

const toggleEqp = (eqp: string) => {
  if(selectedEqps.value.includes(eqp)) selectedEqps.value = selectedEqps.value.filter(e => e !== eqp);
  else selectedEqps.value.push(eqp);
};

const loadComparisonData = async () => {
  if(selectedEqps.value.length === 0) return;
  isDataLoading.value = true;
  hasSearched.value = true;
  
  try {
    const params = {
      ...getBaseParams(),
      cassetteRcp: filters.cassetteRcp ?? '', 
      stageGroup: filters.stageGroup ?? '',
      film: filters.film ?? '',
      targetEqps: selectedEqps.value.join(',')
    };
    const data = await waferApi.getComparisonData(params);
    rawData.value = data as ComparisonRow[]; // 명시적 타입 단언
    
    if(data.length > 0 && data[0]) {
       const keys = Object.keys(data[0]).filter(k => 
         !['eqpid', 'lotid', 'waferid', 'point'].includes(k) &&
         typeof data[0][k] === 'number'
       );
       
       if (keys.length > 0) {
         metricOptions.value = keys;
         if(!keys.includes(selectedMetric.value)) selectedMetric.value = keys[0];
         if(!keys.includes(scatterX.value)) scatterX.value = keys[0];
         if(!keys.includes(scatterY.value)) scatterY.value = keys.length > 1 ? keys[1] : keys[0];
       }
    }
  } catch(e) {
    console.error(e);
    rawData.value = [];
  } finally {
    isDataLoading.value = false;
  }
};

const resetFilters = () => {
  filterStore.reset();
  resetConditions();
  hasSearched.value = false;
};

// Box Plot Calculation
const calculateBoxPlotData = (data: number[]) => {
  if (data.length === 0) return [0, 0, 0, 0, 0];
  
  const sorted = [...data].sort((a, b) => a - b);
  const q1 = quantile(sorted, 0.25);
  const median = quantile(sorted, 0.5);
  const q3 = quantile(sorted, 0.75);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];

  return [min, q1, median, q3, max];
};

const quantile = (sorted: number[], q: number): number => {
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  
  const baseVal = sorted[base];
  const nextVal = sorted[base + 1];

  if (baseVal === undefined) return 0;

  if (nextVal !== undefined) {
    return baseVal + rest * (nextVal - baseVal);
  } else {
    return baseVal;
  }
};

// [핵심] 3. Box Plot Type Narrowing
const boxPlotOption = computed(() => {
  if (rawData.value.length === 0) return {};
  
  const categories = selectedEqps.value;
  const boxData: number[][] = []; 
  const outliers: number[][] = []; 

  categories.forEach((eqp, index) => {
    // Type Guard를 사용하여 number 타입만 필터링
    const values = rawData.value
      .filter(r => r.eqpid === eqp)
      .map(r => r[selectedMetric.value])
      .filter((v): v is number => typeof v === 'number' && !isNaN(v));

    const stats = calculateBoxPlotData(values);
    boxData.push(stats);

    const q1 = stats[1] ?? 0;
    const q3 = stats[3] ?? 0;
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    values.forEach(v => {
      if (v < lowerBound || v > upperBound) {
        outliers.push([index, v]);
      }
    });
  });

  const textColor = isDarkMode.value ? '#cbd5e1' : '#475569';
  const gridColor = isDarkMode.value ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

  return {
    backgroundColor: 'transparent',
    tooltip: { 
      trigger: 'item', 
      confine: true,
      formatter: (param: any) => {
        if (param.componentType === 'series' && param.seriesType === 'boxplot') {
           return `
             <div class="font-bold border-b pb-1 mb-1">${param.name}</div>
             Max: ${param.data[5]?.toFixed(3)}<br/>
             Q3: ${param.data[4]?.toFixed(3)}<br/>
             Median: ${param.data[3]?.toFixed(3)}<br/>
             Q1: ${param.data[2]?.toFixed(3)}<br/>
             Min: ${param.data[1]?.toFixed(3)}
           `;
        }
        return `${param.name}: ${param.data[1]}`;
      }
    },
    grid: { left: 50, right: 20, bottom: 30, top: 30 },
    xAxis: {
      type: 'category',
      data: categories,
      axisLabel: { color: textColor, fontSize: 11 },
      axisLine: { lineStyle: { color: gridColor } },
      splitLine: { show: false }
    },
    yAxis: {
      type: 'value',
      name: selectedMetric.value.toUpperCase(),
      scale: true,
      axisLabel: { color: textColor },
      splitLine: { lineStyle: { color: gridColor } }
    },
    series: [
      {
        name: 'boxplot',
        type: 'boxplot',
        data: boxData,
        itemStyle: { color: '#0ea5e9', borderColor: isDarkMode.value ? '#fff' : '#555' },
      },
      {
        name: 'outlier',
        type: 'scatter',
        data: outliers,
        itemStyle: { color: '#ef4444' }
      }
    ]
  };
});

// [핵심] 4. Scatter Plot Type Guard
const scatterOption = computed(() => {
  if (rawData.value.length === 0) return {};

  const textColor = isDarkMode.value ? '#cbd5e1' : '#475569';
  const gridColor = isDarkMode.value ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  
  const series = selectedEqps.value.map(eqp => {
    return {
      name: eqp,
      type: 'scatter',
      symbolSize: 6,
      data: rawData.value
        .filter(
          (r): r is ComparisonRow & Record<string, number> =>
            r.eqpid === eqp &&
            typeof r[scatterX.value] === 'number' &&
            typeof r[scatterY.value] === 'number'
        )
        .map(r => [
          r[scatterX.value] as number,
          r[scatterY.value] as number,
          r.lotid,
          r.waferid
        ]),
      emphasis: { focus: 'series' }
    };
  });

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: isDarkMode.value ? 'rgba(24,24,27,0.9)' : 'rgba(255,255,255,0.95)',
      textStyle: { color: isDarkMode.value ? '#fff' : '#1e293b' },
      formatter: (params: any) => {
        return `
          <div class="font-bold text-xs mb-1">${params.seriesName}</div>
          Lot: ${params.data[2]}<br/>
          Wafer: ${params.data[3]}<br/>
          ${scatterX.value}: <b>${Number(params.data[0]).toFixed(3)}</b><br/>
          ${scatterY.value}: <b>${Number(params.data[1]).toFixed(3)}</b>
        `;
      }
    },
    legend: {
      type: 'scroll',
      top: 0,
      textStyle: { color: textColor }
    },
    grid: { left: 50, right: 30, bottom: 30, top: 40 },
    xAxis: {
      type: 'value',
      name: scatterX.value.toUpperCase(),
      nameLocation: 'middle',
      nameGap: 20,
      scale: true,
      axisLabel: { color: textColor },
      splitLine: { lineStyle: { color: gridColor } }
    },
    yAxis: {
      type: 'value',
      name: scatterY.value.toUpperCase(),
      scale: true,
      axisLabel: { color: textColor },
      splitLine: { lineStyle: { color: gridColor } }
    },
    dataZoom: [
      { type: 'inside', xAxisIndex: 0, filterMode: 'filter' },
      { type: 'inside', yAxisIndex: 0, filterMode: 'filter' }
    ],
    series: series
  };
});
</script>

<style scoped>
:deep(.p-select), :deep(.custom-dropdown) { @apply !bg-slate-100 dark:!bg-zinc-800/50 !border-0 text-slate-700 dark:text-slate-200 rounded-lg font-bold shadow-none transition-colors; }
:deep(.custom-dropdown .p-select-label) { @apply text-[12px] py-[5px] px-3; }
:deep(.custom-dropdown.small) { @apply h-7; }
:deep(.custom-dropdown:hover) { @apply !bg-slate-200 dark:!bg-zinc-800; }
:deep(.date-picker .p-inputtext) { @apply !text-[12px] !py-1 !px-2 !h-7; }
:deep(.p-select-dropdown) { @apply text-slate-400 dark:text-zinc-500 w-6 !bg-transparent !border-0 !shadow-none; }
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 2px; }
.dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; }
.animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
