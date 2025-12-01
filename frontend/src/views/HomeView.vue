<!-- frontend/src/views/HomeView.vue -->
<template>
  <div
    class="min-h-full transition-colors duration-500 ease-in-out bg-[#F8FAFC] dark:bg-[#09090B] font-sans"
  >
    <div
      class="flex flex-col md:flex-row justify-between items-center mb-4 gap-3"
    >
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 shadow-sm flex items-center justify-center border border-slate-100 dark:border-zinc-800"
        >
          <i class="pi pi-objects-column text-xl text-indigo-500"></i>
        </div>
        <div>
          <h1
            class="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2"
          >
            Overview
            <span
              v-if="hasSearched"
              class="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-[9px] font-bold uppercase tracking-wider fade-in shadow-sm select-none"
            >
              <span class="relative flex h-1.5 w-1.5">
                <span
                  class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
                ></span>
                <span
                  class="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"
                ></span>
              </span>
              Live
            </span>
          </h1>
          <p class="text-slate-500 dark:text-slate-400 font-medium text-[10px]">
            System performance summary.
          </p>
        </div>
      </div>
    </div>

    <div
      class="mb-5 bg-white dark:bg-[#111111] p-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 flex flex-wrap gap-2 items-center justify-between shadow-sm"
    >
      <div class="flex gap-2 flex-1 overflow-x-auto px-1">
        <div class="min-w-[140px]">
          <Select
            v-model="filterStore.selectedSite"
            :options="sites"
            placeholder="Select Site"
            class="w-full custom-dropdown small"
            overlayClass="custom-dropdown-panel small"
            :class="{ '!text-slate-400': !filterStore.selectedSite }"
            showClear
            @change="onSiteChanged"
          />
        </div>
        <div class="min-w-[140px]">
          <Select
            v-model="filterStore.selectedSdwt"
            :options="sdwts"
            placeholder="Select SDWT"
            class="w-full custom-dropdown small"
            overlayClass="custom-dropdown-panel small"
            :class="{ '!text-slate-400': !filterStore.selectedSdwt }"
            :disabled="!filterStore.selectedSite"
            showClear
            @change="onSdwtChange"
          />
        </div>
      </div>

      <div class="flex items-center gap-1 pr-1">
        <div v-if="hasSearched" class="flex items-center justify-center w-6">
          <span
            class="text-[10px] font-bold font-mono text-slate-400 dark:text-slate-500"
            >{{ refreshCount }}s</span
          >
        </div>
        <Button
          icon="pi pi-sync"
          rounded
          text
          severity="secondary"
          @click="manualRefresh"
          :disabled="!hasSearched"
          v-tooltip.left="'Refresh Now'"
          class="!w-7 !h-7 !text-slate-400 hover:!text-slate-600 dark:!text-zinc-500 dark:hover:!text-zinc-300 transition-colors"
        />
      </div>
    </div>

    <div
      v-if="!hasSearched"
      class="flex flex-col justify-center items-center h-72 fade-in border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-3xl"
    >
      <div
        class="w-12 h-12 bg-slate-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-3 text-slate-400 dark:text-zinc-500"
      >
        <i class="pi pi-search text-lg"></i>
      </div>
      <h3 class="text-sm font-bold text-slate-700 dark:text-slate-200">
        Ready to Analyze
      </h3>
      <p class="text-slate-500 dark:text-slate-500 text-[10px] mt-1">
        Please select a <b>Site</b> and <b>SDWT</b> to view the dashboard.
      </p>
    </div>

    <div v-else class="space-y-5 fade-in">
      <div
        v-if="isSummaryLoading"
        class="flex flex-col justify-center items-center h-20"
      >
        <ProgressSpinner style="width: 20px; height: 20px" strokeWidth="4" />
        <p class="text-[10px] text-slate-400 mt-2">Loading Summary...</p>
      </div>

      <div
        v-else
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3"
      >
        <div
          @click="setActiveFilter('All')"
          class="relative h-20 rounded-xl p-3 cursor-pointer transition-all duration-300 hover:-translate-y-1 border overflow-hidden"
          :class="[
            activeFilter === 'All'
              ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/20 ring-2 ring-offset-2 ring-indigo-500 dark:ring-offset-black border-transparent'
              : 'bg-white dark:bg-[#111111] border-slate-200 dark:border-zinc-800 hover:border-indigo-400',
          ]"
        >
          <div class="flex justify-between items-center h-full relative z-10">
            <div>
              <p
                class="text-[9px] font-bold uppercase tracking-widest mb-0.5"
                :class="
                  activeFilter === 'All'
                    ? 'text-indigo-100'
                    : 'text-slate-500 dark:text-slate-400'
                "
              >
                Total Agents
              </p>
              <p
                class="text-2xl font-black tracking-tight"
                :class="
                  activeFilter === 'All'
                    ? 'text-white'
                    : 'text-slate-700 dark:text-white'
                "
              >
                {{ summary.totalEqpCount }}
              </p>
            </div>
            <div
              class="w-10 h-10 rounded-lg flex items-center justify-center"
              :class="
                activeFilter === 'All'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-50 dark:bg-zinc-800 text-indigo-500'
              "
            >
              <i class="pi pi-server text-xl"></i>
            </div>
          </div>
        </div>

        <div
          @click="setActiveFilter('Online')"
          class="relative h-20 rounded-xl p-3 cursor-pointer transition-all duration-300 hover:-translate-y-1 border overflow-hidden"
          :class="[
            activeFilter === 'Online'
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 ring-2 ring-offset-2 ring-emerald-500 dark:ring-offset-black border-transparent'
              : 'bg-white dark:bg-[#111111] border-slate-200 dark:border-zinc-800 hover:border-emerald-400',
          ]"
        >
          <div class="flex justify-between items-center h-full relative z-10">
            <div>
              <p
                class="text-[9px] font-bold uppercase tracking-widest mb-0.5"
                :class="
                  activeFilter === 'Online'
                    ? 'text-emerald-100'
                    : 'text-slate-500 dark:text-slate-400'
                "
              >
                Online
              </p>
              <p
                class="text-2xl font-black tracking-tight"
                :class="
                  activeFilter === 'Online'
                    ? 'text-white'
                    : 'text-slate-700 dark:text-white'
                "
              >
                {{ summary.onlineAgentCount }}
              </p>
            </div>
            <div
              class="w-10 h-10 rounded-lg flex items-center justify-center"
              :class="
                activeFilter === 'Online'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-50 dark:bg-zinc-800 text-emerald-500'
              "
            >
              <i class="pi pi-wifi text-xl"></i>
            </div>
          </div>
        </div>

        <div
          @click="setActiveFilter('Offline')"
          class="relative h-20 rounded-xl p-3 cursor-pointer transition-all duration-300 hover:-translate-y-1 border overflow-hidden"
          :class="[
            activeFilter === 'Offline'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/20 ring-2 ring-offset-2 ring-rose-500 dark:ring-offset-black border-transparent'
              : 'bg-white dark:bg-[#111111] border-slate-200 dark:border-zinc-800 hover:border-rose-400',
          ]"
        >
          <div class="flex justify-between items-center h-full relative z-10">
            <div>
              <p
                class="text-[9px] font-bold uppercase tracking-widest mb-0.5"
                :class="
                  activeFilter === 'Offline'
                    ? 'text-rose-100'
                    : 'text-slate-500 dark:text-slate-400'
                "
              >
                Offline
              </p>
              <p
                class="text-2xl font-black tracking-tight"
                :class="[
                  activeFilter === 'Offline'
                    ? 'text-white'
                    : 'text-slate-700 dark:text-white',
                  activeFilter !== 'Offline' &&
                  summary.totalEqpCount - summary.onlineAgentCount > 0
                    ? '!text-rose-500'
                    : '',
                ]"
              >
                {{ summary.totalEqpCount - summary.onlineAgentCount }}
              </p>
            </div>
            <div
              class="w-10 h-10 rounded-lg flex items-center justify-center"
              :class="
                activeFilter === 'Offline'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-50 dark:bg-zinc-800 text-rose-500'
              "
            >
              <i class="pi pi-ban text-xl"></i>
            </div>
          </div>
        </div>

        <div
          @click="setActiveFilter('Alarm')"
          class="relative h-20 rounded-xl p-3 cursor-pointer transition-all duration-300 hover:-translate-y-1 border overflow-hidden"
          :class="[
            activeFilter === 'Alarm'
              ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20 ring-2 ring-offset-2 ring-amber-500 dark:ring-offset-black border-transparent'
              : 'bg-white dark:bg-[#111111] border-slate-200 dark:border-zinc-800 hover:border-amber-400',
          ]"
        >
          <div class="flex justify-between items-center h-full relative z-10">
            <div>
              <p
                class="text-[9px] font-bold uppercase tracking-widest mb-0.5"
                :class="
                  activeFilter === 'Alarm'
                    ? 'text-amber-100'
                    : 'text-slate-500 dark:text-slate-400'
                "
              >
                Alerts
              </p>
              <div class="flex items-baseline gap-1.5">
                <p
                  class="text-2xl font-black tracking-tight"
                  :class="
                    activeFilter === 'Alarm'
                      ? 'text-white'
                      : 'text-slate-700 dark:text-white'
                  "
                >
                  {{ summary.todayErrorCount }}
                  <span
                    class="text-[10px] font-medium opacity-80"
                    v-if="summary.todayErrorTotalCount > 0"
                  >
                    (Total: {{ summary.todayErrorTotalCount }})
                  </span>
                </p>
                <span
                  v-if="summary.newAlarmCount > 0"
                  class="text-[9px] font-bold px-1 py-0.5 rounded"
                  :class="
                    activeFilter === 'Alarm'
                      ? 'bg-white/30 text-white'
                      : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                  "
                  >+{{ summary.newAlarmCount }}</span
                >
              </div>
            </div>
            <div
              class="w-10 h-10 rounded-lg flex items-center justify-center"
              :class="
                activeFilter === 'Alarm'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-50 dark:bg-zinc-800 text-amber-500'
              "
            >
              <i class="pi pi-bell text-xl"></i>
            </div>
          </div>
        </div>

        <div
          @click="setActiveFilter('TimeSync')"
          class="relative h-20 rounded-xl p-3 cursor-pointer transition-all duration-300 hover:-translate-y-1 border overflow-hidden"
          :class="[
            activeFilter === 'TimeSync'
              ? 'bg-pink-600 text-white shadow-lg shadow-pink-500/20 ring-2 ring-offset-2 ring-pink-500 dark:ring-offset-black border-transparent'
              : 'bg-white dark:bg-[#111111] border-slate-200 dark:border-zinc-800 hover:border-pink-400',
          ]"
        >
          <div class="flex justify-between items-center h-full relative z-10">
            <div>
              <p
                class="text-[9px] font-bold uppercase tracking-widest mb-0.5"
                :class="
                  activeFilter === 'TimeSync'
                    ? 'text-pink-100'
                    : 'text-slate-500 dark:text-slate-400'
                "
              >
                Time Sync Err
              </p>
              <p
                class="text-2xl font-black tracking-tight"
                :class="[
                  activeFilter === 'TimeSync'
                    ? 'text-white'
                    : 'text-slate-700 dark:text-white',
                  activeFilter !== 'TimeSync' && timeSyncErrorCount > 0
                    ? '!text-pink-500'
                    : '',
                ]"
              >
                {{ timeSyncErrorCount }}
              </p>
            </div>
            <div
              class="w-10 h-10 rounded-lg flex items-center justify-center"
              :class="
                activeFilter === 'TimeSync'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-50 dark:bg-zinc-800 text-pink-500'
              "
            >
              <i class="pi pi-clock text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      <div
        class="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 overflow-hidden"
      >
        <DataTable
          :value="displayedAgents"
          :paginator="false"
          :rows="rowsPerPage"
          :first="first"
          class="p-datatable-sm text-sm"
          :rowHover="true"
          :loading="isTableLoading"
          stripedRows
        >
          <template #header>
            <div
              class="flex flex-col md:flex-row justify-between items-center gap-3 px-2 py-1"
            >
              <div class="flex items-center gap-2">
                <div class="w-1 h-3 bg-indigo-500 rounded-full"></div>
                <h3 class="font-bold text-sm text-slate-800 dark:text-white">
                  Agent Status
                </h3>
              </div>

              <div
                class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400"
              >
                <div class="flex items-center gap-1">
                  <span class="font-medium">Rows:</span>
                  <select
                    v-model="rowsPerPage"
                    class="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded px-1 py-0.5 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                    @change="first = 0"
                  >
                    <option :value="15">15</option>
                    <option :value="30">30</option>
                    <option :value="50">50</option>
                  </select>
                </div>

                <span class="font-medium min-w-[60px] text-right">
                  {{ totalRecords === 0 ? 0 : first + 1 }} -
                  {{ Math.min(first + rowsPerPage, totalRecords) }} of
                  {{ totalRecords }}
                </span>

                <div class="flex items-center gap-1">
                  <button
                    @click="first = 0"
                    :disabled="first === 0"
                    class="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="First Page"
                  >
                    <i class="pi pi-angle-double-left text-[10px]"></i>
                  </button>
                  <button
                    @click="prevPage"
                    :disabled="first === 0"
                    class="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Previous Page"
                  >
                    <i class="pi pi-angle-left text-[10px]"></i>
                  </button>
                  <button
                    @click="nextPage"
                    :disabled="first + rowsPerPage >= totalRecords"
                    class="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Next Page"
                  >
                    <i class="pi pi-angle-right text-[10px]"></i>
                  </button>
                  <button
                    @click="lastPage"
                    :disabled="first + rowsPerPage >= totalRecords"
                    class="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Last Page"
                  >
                    <i class="pi pi-angle-double-right text-[10px]"></i>
                  </button>
                </div>
              </div>
            </div>
          </template>

          <template #empty>
            <div
              class="flex flex-col items-center justify-center py-12 text-gray-400"
            >
              <i class="pi pi-filter text-2xl mb-2 opacity-20"></i>
              <p class="text-[10px] font-medium">No match found.</p>
            </div>
          </template>

          <Column
            header="Connection"
            sortable
            field="isOnline"
            style="width: 110px"
            :bodyStyle="{ paddingLeft: '16px' }"
            headerStyle="padding-left: 16px"
          >
            <template #body="{ data }">
              <span
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors"
                :class="
                  data.isOnline
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                    : 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
                "
              >
                <i
                  :class="
                    data.isOnline
                      ? 'pi pi-check-circle'
                      : 'pi pi-exclamation-circle'
                  "
                  class="text-[9px]"
                ></i>
                {{ data.isOnline ? "Online" : "Offline" }}
              </span>
            </template>
          </Column>

          <Column header="Status" style="width: 100px">
            <template #body="{ data }">
              <span
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors"
                :class="getStatusBadgeClass(data)"
              >
                <i :class="getStatusIcon(data)" class="text-[9px]"></i>
                {{ getStatusLabel(data) }}
              </span>
            </template>
          </Column>

          <Column field="eqpId" header="EQP ID" sortable style="width: 120px">
            <template #body="{ data }"
              ><span class="font-bold text-slate-700 dark:text-slate-200">{{
                data.eqpId
              }}</span></template
            >
          </Column>
          <Column field="type" header="Type" sortable style="width: 70px">
            <template #body="{ data }"
              ><span class="text-slate-600 dark:text-slate-300">{{
                data.type
              }}</span></template
            >
          </Column>
          <Column field="ipAddress" header="IP Address" style="width: 110px">
            <template #body="{ data }"
              ><span class="text-slate-600 dark:text-slate-300">{{
                data.ipAddress
              }}</span></template
            >
          </Column>
          <Column field="pcName" header="PC Name" style="width: 140px">
            <template #body="{ data }"
              ><span class="text-slate-600 dark:text-slate-300">{{
                data.pcName
              }}</span></template
            >
          </Column>

          <Column header="Operating System(OS)" style="width: 170px">
            <template #body="{ data }">
              <div class="flex items-center gap-1.5">
                <span
                  class="inline-flex items-center justify-center w-5 h-5 rounded border text-[10px] transition-colors"
                  :class="getOsStyle(data.os).badge"
                >
                  <i class="pi pi-microsoft"></i>
                </span>
                <span class="truncate" :class="getOsStyle(data.os).text">{{
                  formatOperatingSystem(data.os, data.systemType)
                }}</span>
              </div>
            </template>
          </Column>

          <Column header="CPU / Memory" style="width: 160px">
            <template #body="{ data }">
              <div
                class="flex flex-col gap-1 cursor-pointer opacity-90 hover:opacity-100"
                @click="openChart(data)"
              >
                <div
                  class="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-1 relative overflow-hidden"
                >
                  <div
                    class="bg-blue-500 h-full rounded-full"
                    :style="{ width: data.cpuUsage + '%' }"
                  ></div>
                </div>
                <div
                  class="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-1 relative overflow-hidden"
                >
                  <div
                    class="bg-teal-500 h-full rounded-full"
                    :style="{ width: data.memoryUsage + '%' }"
                  ></div>
                </div>
              </div>
            </template>
          </Column>

          <Column style="width: 90px">
            <template #header>
              <span
                v-tooltip.top="'+: Agent Fast\n-: Agent Slow'"
                class="cursor-help border-b border-dotted border-slate-400 dark:border-slate-600 whitespace-nowrap"
              >
                Time Diff
              </span>
            </template>
            <template #body="{ data }">
              <span
                class="text-xs font-mono tracking-tight"
                :class="getClockDriftColor(data.clockDrift)"
                >{{ formatTimeDifference(data.clockDrift) }}</span
              >
            </template>
          </Column>

          <Column
            field="lastContact"
            header="Last Contact"
            style="width: 140px"
          >
            <template #body="{ data }"
              ><span
                class="font-mono text-[11px] text-slate-600 dark:text-slate-300"
                >{{ formatDate(data.lastContact) }}</span
              ></template
            >
          </Column>

          <Column field="appVersion" header="Agent Ver" style="width: 90px">
            <template #body="{ data }">
              <span
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors"
                :class="getAgentVerStyle(data.appVersion)"
              >
                <i class="pi pi-tag text-[9px] opacity-70"></i>
                {{ data.appVersion }}
              </span>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <Dialog
      v-model:visible="showChart"
      modal
      :header="
        (selectedAgentId || '') + ' 호기 Performance Trend (Last 24 Hours)'
      "
      :style="{ width: '80vw' }"
      class="backdrop-blur-xl"
      :dismissableMask="true"
    >
      <div
        class="h-[500px] w-full bg-white dark:bg-zinc-950 rounded-xl p-4 border border-slate-100 dark:border-zinc-800 relative"
      >
        <div
          v-if="isChartLoading"
          class="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-zinc-950/80 z-10 rounded-xl"
        >
          <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="4" />
          <p class="text-sm text-slate-500 mt-4 font-medium animate-pulse">
            데이터를 불러오는 중입니다...
          </p>
        </div>

        <AmChart
          v-if="!isChartLoading && chartData.length > 0"
          chartType="PerformanceLineChart"
          :data="chartData"
          :config="chartConfig"
          height="100%"
          :isDarkMode="false"
        />

        <div
          v-else-if="!isChartLoading && chartData.length === 0"
          class="h-full flex flex-col items-center justify-center text-slate-400 select-none"
        >
          <div
            class="w-24 h-24 bg-slate-50 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-4 shadow-inner"
          >
            <i
              class="pi pi-chart-bar text-4xl text-slate-300 dark:text-zinc-700"
            ></i>
          </div>
          <h3 class="text-lg font-bold text-slate-600 dark:text-slate-300 mb-1">
            데이터가 없습니다
          </h3>
          <p class="text-sm text-slate-500 dark:text-slate-500">
            선택된 장비의 최근 24시간 성능 로그가 존재하지 않습니다.
          </p>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useFilterStore } from "@/stores/filter";
import {
  dashboardApi,
  type DashboardSummaryDto,
  type AgentStatusDto,
} from "@/api/dashboard";
import { performanceApi } from "@/api/performance";
import AmChart from "@/components/common/AmChart.vue";
import Select from "primevue/select";
import Button from "primevue/button";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Dialog from "primevue/dialog";
import ProgressSpinner from "primevue/progressspinner";

const filterStore = useFilterStore();

const isSummaryLoading = ref(false);
const isTableLoading = ref(false);
const isChartLoading = ref(false);
const hasSearched = ref(false);

const activeFilter = ref<"All" | "Online" | "Offline" | "Alarm" | "TimeSync">(
  "All"
);

const sites = ref<string[]>([]);
const sdwts = ref<string[]>([]);
const summary = ref<DashboardSummaryDto>({
  totalEqpCount: 0,
  onlineAgentCount: 0,
  todayErrorCount: 0,
  todayErrorTotalCount: 0, // [수정] 타입 오류 해결을 위한 초기값 추가
  newAlarmCount: 0,
  latestAgentVersion: "",
});
const agentList = ref<AgentStatusDto[]>([]);
const showChart = ref(false);
const selectedAgentId = ref<string | null>(null);
const chartData = ref<any[]>([]);

const refreshCount = ref(30);
let refreshTimer: number | null = null;

onMounted(async () => {
  try {
    sites.value = await dashboardApi.getSites();
    const savedSite = localStorage.getItem("dashboard_site");
    const savedSdwt = localStorage.getItem("dashboard_sdwt");

    if (savedSite && sites.value.includes(savedSite)) {
      filterStore.selectedSite = savedSite;
      sdwts.value = await dashboardApi.getSdwts(savedSite);

      if (savedSdwt) {
        filterStore.selectedSdwt = savedSdwt;
        await loadData(true);
      }
    }
  } catch (e) {
    console.error(e);
  }
});

onUnmounted(() => {
  stopAutoRefresh();
});

const onSiteChanged = async () => {
  if (filterStore.selectedSite) {
    localStorage.setItem("dashboard_site", filterStore.selectedSite);
    sdwts.value = await dashboardApi.getSdwts(filterStore.selectedSite);
  } else {
    localStorage.removeItem("dashboard_site");
    sdwts.value = [];
  }
  filterStore.selectedSdwt = "";
  localStorage.removeItem("dashboard_sdwt");

  hasSearched.value = false;
  stopAutoRefresh();
};

const onSdwtChange = async () => {
  if (filterStore.selectedSdwt) {
    localStorage.setItem("dashboard_sdwt", filterStore.selectedSdwt);
    await loadData(true);
  } else {
    localStorage.removeItem("dashboard_sdwt");
    stopAutoRefresh();
  }
};

const loadData = async (showLoading = true) => {
  if (!filterStore.selectedSite || !filterStore.selectedSdwt) return;

  if (showLoading) {
    isSummaryLoading.value = true;
    isTableLoading.value = true;
  }
  hasSearched.value = true;

  dashboardApi
    .getSummary(filterStore.selectedSite, filterStore.selectedSdwt)
    .then((data) => {
      summary.value = data;
    })
    .catch((e) => console.error("Summary load failed", e))
    .finally(() => {
      isSummaryLoading.value = false;
    });

  dashboardApi
    .getAgentStatus(filterStore.selectedSite, filterStore.selectedSdwt)
    .then((data) => {
      agentList.value = data;
      startAutoRefresh();
    })
    .catch((e) => console.error("Agent status load failed", e))
    .finally(() => {
      isTableLoading.value = false;
    });
};

const startAutoRefresh = () => {
  if (refreshTimer) clearInterval(refreshTimer);
  refreshCount.value = 30;
  refreshTimer = setInterval(() => {
    refreshCount.value--;
    if (refreshCount.value <= 0) {
      loadData(false);
      refreshCount.value = 30;
    }
  }, 1000);
};

const stopAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
};

const manualRefresh = () => {
  loadData(true);
  refreshCount.value = 30;
};

const openChart = async (agent: AgentStatusDto) => {
  selectedAgentId.value = agent.eqpId;
  showChart.value = true;
  chartData.value = [];
  isChartLoading.value = true;

  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);

  try {
    const data = await performanceApi.getHistory(
      startDate.toISOString(),
      endDate.toISOString(),
      agent.eqpId,
      600
    );
    chartData.value = data;
  } catch (e) {
    console.error("Failed to load chart data", e);
    chartData.value = [];
  } finally {
    isChartLoading.value = false;
  }
};

const chartConfig = {
  xField: "timestamp",
  xTimeUnit: "minute",
  xAxisDateFormat: "yy-MM-dd HH:mm",
  tooltipDateFormat: "yy-MM-dd HH:mm",
  series: [
    {
      name: "CPU",
      valueField: "cpuUsage",
      color: "#3b82f6",
      tooltipText: "CPU: {valueY.formatNumber('#.00')}%",
      bulletRadius: 3,
    },
    {
      name: "MEM",
      valueField: "memoryUsage",
      color: "#10b981",
      tooltipText: "MEM: {valueY.formatNumber('#.00')}%",
      bulletRadius: 3,
    },
  ],
};

const first = ref(0);
const rowsPerPage = ref(15);

const filteredAgents = computed(() => {
  switch (activeFilter.value) {
    case "Online":
      return agentList.value.filter((a) => a.isOnline);
    case "Offline":
      return agentList.value.filter((a) => !a.isOnline);
    case "Alarm":
      return agentList.value.filter((a) => a.todayAlarmCount > 0);
    case "TimeSync":
      return agentList.value.filter((a) => Math.abs(a.clockDrift || 0) > 1800);
    default:
      return agentList.value;
  }
});

const displayedAgents = computed(() => {
  const start = first.value;
  const end = start + rowsPerPage.value;
  return filteredAgents.value.slice(start, end);
});

const timeSyncErrorCount = computed(() => {
  return agentList.value.filter((a) => Math.abs(a.clockDrift || 0) > 1800)
    .length;
});

const totalRecords = computed(() => filteredAgents.value.length);

const getAgentVerStyle = (ver: string | null) => {
  if (!ver)
    return "bg-transparent border-slate-200 text-slate-400 dark:border-slate-700 dark:text-slate-600";
  if (ver === summary.value.latestAgentVersion) {
    return "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-500/20 dark:border-indigo-500/50 dark:text-indigo-300 shadow-sm";
  }
  return "bg-transparent border-slate-300 text-slate-500 dark:border-zinc-600 dark:text-zinc-400";
};

const prevPage = () => {
  if (first.value > 0) first.value -= rowsPerPage.value;
};
const nextPage = () => {
  if (first.value + rowsPerPage.value < totalRecords.value)
    first.value += rowsPerPage.value;
};
const lastPage = () => {
  first.value =
    Math.floor(Math.max(totalRecords.value - 1, 0) / rowsPerPage.value) *
    rowsPerPage.value;
};

const setActiveFilter = (
  filter: "All" | "Online" | "Offline" | "Alarm" | "TimeSync"
) => {
  activeFilter.value = filter;
  first.value = 0;
};

const getOsStyle = (os: string | null) => {
  const lowerOs = (os || "").toLowerCase();
  if (lowerOs.includes("11"))
    return {
      badge:
        "bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30",
      text: "text-indigo-700 dark:text-indigo-200 font-medium",
    };
  if (lowerOs.includes("10"))
    return {
      badge:
        "bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-500/20 dark:text-sky-300 dark:border-sky-500/30",
      text: "text-slate-700 dark:text-slate-200",
    };
  if (lowerOs.includes("7"))
    return {
      badge:
        "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30",
      text: "text-blue-700 dark:text-blue-200",
    };
  if (lowerOs.includes("server"))
    return {
      badge:
        "bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600",
      text: "text-slate-600 dark:text-slate-400",
    };
  return {
    badge:
      "bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
    text: "text-gray-500 dark:text-gray-500",
  };
};

const getStatusLabel = (data: AgentStatusDto) => {
  if (!data.isOnline) return "Unknown";
  if (data.todayAlarmCount > 0) return "Alert";
  return "Run";
};
const getStatusIcon = (data: AgentStatusDto) => {
  if (!data.isOnline) return "pi pi-question-circle";
  if (data.todayAlarmCount > 0) return "pi pi-exclamation-triangle";
  return "pi pi-shield";
};
const getStatusBadgeClass = (data: AgentStatusDto) => {
  if (!data.isOnline)
    return "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20";
  if (data.todayAlarmCount > 0)
    return "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";
  return "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20";
};
const formatOperatingSystem = (os: string | null, sys: string | null) =>
  `${(os || "")
    .replace("Microsoft Windows", "Win")
    .replace("Professional", "Pro")
    .replace("Enterprise", "Ent")} ${(sys || "").replace(
    "-bit",
    "bit"
  )}`.trim();

const formatTimeDifference = (s: number | null | undefined) => {
  if (s == null) return "-";
  if (Math.abs(s) < 0.1) return "✔";

  const sign = s > 0 ? "-" : "+";
  const abs = Math.abs(s);
  const h = Math.floor(abs / 3600);
  const m = Math.floor((abs % 3600) / 60);
  const sec = Math.floor(abs % 60);

  const mm = String(m).padStart(2, "0");
  const ss = String(sec).padStart(2, "0");

  if (h > 0) {
    return `${sign}${h}:${mm}:${ss}`;
  } else {
    return `${sign}${m}:${ss}`;
  }
};

const getClockDriftColor = (s: number | null | undefined) => {
  if (s == null) return "text-slate-600 dark:text-slate-300";
  const absDrift = Math.abs(s);
  if (absDrift > 1800) return "text-red-500 dark:text-red-400 font-bold";
  if (absDrift > 600) return "text-orange-500 dark:text-orange-400 font-bold";
  return "text-slate-600 dark:text-slate-300";
};

const formatDate = (d: string | null) => {
  if (!d) return "-";
  const date = new Date(d);
  
  // getFullYear() 대신 getUTCFullYear() 등을 사용
  const yy = date.getUTCFullYear().toString().slice(2);
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const min = String(date.getUTCMinutes()).padStart(2, "0");
  const ss = String(date.getUTCSeconds()).padStart(2, "0");
  
  return `${yy}-${mm}-${dd} ${hh}:${min}:${ss}`;
};
</script>

<style scoped>
/* Select Styles */
:deep(.p-select),
:deep(.custom-dropdown) {
  @apply !bg-slate-100 dark:!bg-zinc-800/50 !border-0 text-slate-700 dark:text-slate-200 rounded-lg font-bold text-xs shadow-none transition-colors;
}
:deep(.custom-dropdown.small) {
  @apply h-7 text-[10px];
}
:deep(.custom-dropdown.small .p-select-label) {
  padding: 0.3rem 0.6rem;
}

:deep(.custom-dropdown:hover) {
  @apply !bg-slate-200 dark:!bg-zinc-800;
}
:deep(.p-select-dropdown) {
  @apply text-slate-400 dark:text-zinc-500 w-8;
}
:deep(.p-datatable .p-datatable-thead > tr > th) {
  font-weight: 800;
  font-size: 0.65rem;
  color: #64748b;
  background-color: transparent;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.6rem 0.8rem;
  border-bottom: 1px solid #e2e8f0;
}
:deep(.dark .p-datatable .p-datatable-thead > tr > th) {
  color: #71717a;
  border-bottom: 1px solid #27272a;
}
:deep(.p-datatable-tbody > tr) {
  background: transparent !important;
  border-bottom: 1px solid #f1f5f9;
}
:deep(.dark .p-datatable-tbody > tr) {
  border-bottom: 1px solid #18181b;
}
:deep(.p-datatable-tbody > tr:hover) {
  background-color: #f8fafc !important;
}
:deep(.dark .p-datatable-tbody > tr:hover) {
  background-color: #09090b !important;
}
:deep(.p-datatable-tbody > tr > td) {
  padding: 0.75rem 1rem;
  font-size: 0.8rem;
  color: #334155;
}
:deep(.dark .p-datatable-tbody > tr > td) {
  color: #e2e8f0 !important;
}
.fade-in {
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

<style>
body .p-tooltip .p-tooltip-text {
  font-size: 10px !important;
  background-color: #64748b !important;
  white-space: nowrap !important;
  padding: 3px 6px !important;
}
body .p-tooltip .p-tooltip-arrow {
  border-top-color: #64748b !important;
  border-bottom-color: #64748b !important;
}

/* 추가된 드롭다운 패널 스타일 */
.custom-dropdown-panel.small .p-select-option {
  padding: 6px 10px !important;
  font-size: 12px !important; /* 11px -> 12px로 변경 */
}
.custom-dropdown-panel.small .p-select-empty-message {
  padding: 6px 10px !important;
  font-size: 12px !important; /* 11px -> 12px로 변경 */
}
</style>
