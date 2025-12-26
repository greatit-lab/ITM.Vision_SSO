<!-- frontend/src/views/HomeView.vue -->
<template>
  <div
    class="min-h-full transition-colors duration-500 ease-in-out bg-[#F8FAFC] dark:bg-[#09090B] font-sans"
  >
    <div class="flex items-center justify-between gap-3 px-1 mb-2 shrink-0">
      <div class="flex items-center gap-2">
        <div
          class="flex items-center justify-center w-8 h-8 bg-white border rounded-lg shadow-sm dark:bg-zinc-900 border-slate-100 dark:border-zinc-800"
        >
          <i class="text-lg text-indigo-500 pi pi-objects-column"></i>
        </div>

        <div class="flex items-baseline gap-2">
          <h1
            class="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white"
          >
            Overview
          </h1>
          <span
            class="text-slate-400 dark:text-slate-500 font-medium text-[11px]"
          >
            System performance summary.
          </span>
        </div>
      </div>

      <div
        v-if="hasSearched"
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
      class="mb-5 bg-white dark:bg-[#111111] p-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 flex flex-wrap gap-2 items-center justify-between shadow-sm transition-colors duration-300"
    >
      <div
        class="flex items-center flex-1 gap-2 px-1 py-1 overflow-x-auto scrollbar-hide"
      >
        <div class="min-w-[140px] shrink-0">
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
        <div class="min-w-[160px] shrink-0">
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

      <div
        class="flex items-center gap-1 pr-1 pl-2 border-l border-slate-100 dark:border-zinc-800"
      >
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
      class="flex flex-col items-center justify-center h-72 border-2 border-dashed fade-in border-slate-200 dark:border-zinc-800 rounded-3xl"
    >
      <div
        class="flex items-center justify-center w-12 h-12 mb-3 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500"
      >
        <i class="text-lg pi pi-search"></i>
      </div>
      <h3 class="text-sm font-bold text-slate-700 dark:text-slate-200">
        Ready to Analyze
      </h3>
      <p class="mt-1 text-[10px] text-slate-500 dark:text-slate-500">
        Please select a <b>Site</b> and <b>SDWT</b> to view the dashboard.
      </p>
    </div>

    <div v-else class="space-y-5 fade-in">
      <div
        v-if="isSummaryLoading"
        class="flex flex-col items-center justify-center h-20"
      >
        <ProgressSpinner style="width: 20px; height: 20px" strokeWidth="4" />
        <p class="mt-2 text-[10px] text-slate-400">Loading Summary...</p>
      </div>

      <div v-else class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
        <div
          @click="setActiveFilter('All')"
          class="relative h-20 p-3 overflow-hidden transition-all duration-300 border cursor-pointer rounded-xl hover:-translate-y-1"
          :class="[
            activeFilter === 'All'
              ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/20 ring-2 ring-offset-2 ring-indigo-500 dark:ring-offset-black border-transparent'
              : 'bg-white dark:bg-[#111111] border-slate-200 dark:border-zinc-800 hover:border-indigo-400',
          ]"
        >
          <div class="relative z-10 flex items-center justify-between h-full">
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
              class="flex items-center justify-center w-10 h-10 rounded-lg"
              :class="
                activeFilter === 'All'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-50 dark:bg-zinc-800 text-indigo-500'
              "
            >
              <i class="text-xl pi pi-server"></i>
            </div>
          </div>
        </div>

        <div
          @click="setActiveFilter('Online')"
          class="relative h-20 p-3 overflow-hidden transition-all duration-300 border cursor-pointer rounded-xl hover:-translate-y-1"
          :class="[
            activeFilter === 'Online'
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 ring-2 ring-offset-2 ring-emerald-500 dark:ring-offset-black border-transparent'
              : 'bg-white dark:bg-[#111111] border-slate-200 dark:border-zinc-800 hover:border-emerald-400',
          ]"
        >
          <div class="relative z-10 flex items-center justify-between h-full">
            <div>
              <p
                class="text-[9px] font-bold uppercase tracking-widest mb-0.5"
                :class="
                  activeFilter === 'Online'
                    ? 'text-emerald-100'
                    : 'text-slate-500 dark:text-slate-400'
                "
              >
                Server Health ({{ summary.serverHealth }}%)
              </p>
              <p
                class="text-2xl font-black tracking-tight"
                :class="
                  activeFilter === 'Online'
                    ? 'text-white'
                    : 'text-slate-700 dark:text-white'
                "
              >
                {{ summary.onlineAgentCount }} <span class="text-xs font-medium opacity-70">/ {{ summary.totalServers }}</span>
              </p>
            </div>
            <div
              class="flex items-center justify-center w-10 h-10 rounded-lg"
              :class="
                activeFilter === 'Online'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-50 dark:bg-zinc-800 text-emerald-500'
              "
            >
              <i class="text-xl pi pi-wifi"></i>
            </div>
          </div>
        </div>

        <div
          @click="setActiveFilter('Offline')"
          class="relative h-20 p-3 overflow-hidden transition-all duration-300 border cursor-pointer rounded-xl hover:-translate-y-1"
          :class="[
            activeFilter === 'Offline'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/20 ring-2 ring-offset-2 ring-rose-500 dark:ring-offset-black border-transparent'
              : 'bg-white dark:bg-[#111111] border-slate-200 dark:border-zinc-800 hover:border-rose-400',
          ]"
        >
          <div class="relative z-10 flex items-center justify-between h-full">
            <div>
              <p
                class="text-[9px] font-bold uppercase tracking-widest mb-0.5"
                :class="
                  activeFilter === 'Offline'
                    ? 'text-rose-100'
                    : 'text-slate-500 dark:text-slate-400'
                "
              >
                Offline Servers
              </p>
              <p
                class="text-2xl font-black tracking-tight"
                :class="[
                  activeFilter === 'Offline'
                    ? 'text-white'
                    : 'text-slate-700 dark:text-white',
                  activeFilter !== 'Offline' &&
                  summary.inactiveAgentCount > 0
                    ? '!text-rose-500'
                    : '',
                ]"
              >
                {{ summary.inactiveAgentCount }}
              </p>
            </div>
            <div
              class="flex items-center justify-center w-10 h-10 rounded-lg"
              :class="
                activeFilter === 'Offline'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-50 dark:bg-zinc-800 text-rose-500'
              "
            >
              <i class="text-xl pi pi-ban"></i>
            </div>
          </div>
        </div>

        <div
          @click="setActiveFilter('Alarm')"
          class="relative h-20 p-3 overflow-hidden transition-all duration-300 border cursor-pointer rounded-xl hover:-translate-y-1"
          :class="[
            activeFilter === 'Alarm'
              ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20 ring-2 ring-offset-2 ring-amber-500 dark:ring-offset-black border-transparent'
              : 'bg-white dark:bg-[#111111] border-slate-200 dark:border-zinc-800 hover:border-amber-400',
          ]"
        >
          <div class="relative z-10 flex items-center justify-between h-full">
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
                  class="px-1 py-0.5 text-[9px] font-bold rounded"
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
              class="flex items-center justify-center w-10 h-10 rounded-lg"
              :class="
                activeFilter === 'Alarm'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-50 dark:bg-zinc-800 text-amber-500'
              "
            >
              <i class="text-xl pi pi-bell"></i>
            </div>
          </div>
        </div>

        <div
          @click="setActiveFilter('TimeSync')"
          class="relative h-20 p-3 overflow-hidden transition-all duration-300 border cursor-pointer rounded-xl hover:-translate-y-1"
          :class="[
            activeFilter === 'TimeSync'
              ? 'bg-pink-600 text-white shadow-lg shadow-pink-500/20 ring-2 ring-offset-2 ring-pink-500 dark:ring-offset-black border-transparent'
              : 'bg-white dark:bg-[#111111] border-slate-200 dark:border-zinc-800 hover:border-pink-400',
          ]"
        >
          <div class="relative z-10 flex items-center justify-between h-full">
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
              class="flex items-center justify-center w-10 h-10 rounded-lg"
              :class="
                activeFilter === 'TimeSync'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-50 dark:bg-zinc-800 text-pink-500'
              "
            >
              <i class="text-xl pi pi-clock"></i>
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-4">
        <div
          class="flex flex-col items-center justify-between px-2 md:flex-row"
        >
          <div class="flex items-center gap-2 mb-2 md:mb-0">
            <div class="w-1 h-4 bg-indigo-500 rounded-full"></div>
            <h3 class="text-base font-bold text-slate-800 dark:text-white">
              Agent Status Monitoring
            </h3>
            <span
              class="ml-1 text-xs font-medium text-slate-400 dark:text-slate-500"
            >
              ({{ totalRecords }} Machines)
            </span>
          </div>

          <div
            class="flex items-center gap-3 px-3 py-1.5 text-xs text-slate-500 bg-white border rounded-lg shadow-sm dark:text-slate-400 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800"
          >
            <div class="flex items-center gap-2">
              <span class="font-medium">Rows:</span>
              <select
                v-model="rowsPerPage"
                class="px-1 py-0.5 font-medium border rounded cursor-pointer bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                @change="first = 0"
              >
                <option :value="20">20</option>
                <option :value="40">40</option>
                <option :value="60">60</option>
              </select>
            </div>
            <div class="h-3 w-px mx-1 bg-slate-200 dark:bg-zinc-700"></div>
            <span class="font-medium min-w-[60px] text-right">
              {{ totalRecords === 0 ? 0 : first + 1 }} -
              {{ Math.min(first + rowsPerPage, totalRecords) }}
            </span>
            <div class="flex items-center gap-1 ml-1">
              <button
                @click="first = 0"
                :disabled="first === 0"
                class="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30"
              >
                <i class="pi pi-angle-double-left"></i>
              </button>
              <button
                @click="prevPage"
                :disabled="first === 0"
                class="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30"
              >
                <i class="pi pi-angle-left"></i>
              </button>
              <button
                @click="nextPage"
                :disabled="first + rowsPerPage >= totalRecords"
                class="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30"
              >
                <i class="pi pi-angle-right"></i>
              </button>
              <button
                @click="lastPage"
                :disabled="first + rowsPerPage >= totalRecords"
                class="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30"
              >
                <i class="pi pi-angle-double-right"></i>
              </button>
            </div>
          </div>
        </div>

        <div v-if="isTableLoading" class="flex justify-center py-20">
          <ProgressSpinner style="width: 40px; height: 40px" strokeWidth="4" />
        </div>

        <div
          v-else
          class="grid grid-cols-1 gap-4 pb-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
        >
          <div
            v-for="agent in displayedAgents"
            :key="agent.eqpId"
            class="relative flex flex-col overflow-hidden transition-all duration-300 bg-white border shadow-sm dark:bg-[#111111] border-slate-200 dark:border-zinc-800 rounded-xl hover:shadow-lg group hover:-translate-y-1"
          >
            <div
              class="absolute top-0 left-0 w-full h-2 transition-colors duration-300"
              :class="getStatusBarClass(agent)"
            ></div>

            <div class="flex flex-col h-full gap-1 p-2 pt-3">
              <div class="flex items-start justify-between">
                <div>
                  <h4
                    class="flex items-center gap-1.5 text-sm font-black tracking-tight text-slate-800 dark:text-slate-100"
                  >
                    {{ agent.eqpId }}
                    <span
                      class="px-1 py-[1px] rounded text-[10px] scale-90 origin-left font-bold bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-zinc-700"
                    >
                      {{ agent.type || "Unknown" }}
                    </span>
                  </h4>
                  <div
                    class="flex items-center gap-1 mt-0.5 text-[10px] scale-90 origin-left text-slate-400 font-mono cursor-pointer hover:text-slate-600 dark:hover:text-slate-300"
                    title="Click to copy IP"
                    @click="copyToClipboard(agent.ipAddress)"
                  >
                    <i class="text-[9px] pi pi-globe"></i> {{ agent.ipAddress }}
                  </div>
                </div>

                <div class="flex flex-col items-end gap-0.5">
                  <span
                    class="px-1.5 py-[1px] text-[10px] scale-90 origin-right font-bold rounded-full uppercase tracking-wider flex items-center gap-1 border shadow-sm"
                    :class="getStatusBadgeClass(agent)"
                  >
                    <i :class="getStatusIcon(agent)" class="text-[9px]"></i>
                    {{ getStatusLabel(agent) }}
                  </span>
                  <span
                    class="text-[10px] scale-90 origin-right font-mono font-bold flex items-center gap-1 transition-colors"
                    :class="getAgentVerStyle(agent.appVersion)"
                  >
                    {{ agent.appVersion }}
                  </span>
                </div>
              </div>

              <div
                class="grid grid-cols-5 gap-1.5 text-[10px] scale-95 origin-left w-[105%]"
              >
                <div
                  class="flex items-center justify-between col-span-5 p-1 border rounded bg-slate-50 dark:bg-zinc-800/50 border-slate-100 dark:border-zinc-800"
                >
                  <span
                    class="flex items-center gap-1 font-semibold text-slate-400"
                    ><i class="text-[9px] pi pi-microsoft"></i> OS</span
                  >
                  <span
                    class="font-medium truncate text-slate-600 dark:text-slate-300 max-w-[180px]"
                    :class="getOsStyle(agent.os).text"
                  >
                    {{ formatOperatingSystem(agent.os, agent.systemType) }}
                  </span>
                </div>

                <div
                  class="flex items-center justify-between col-span-3 p-1 overflow-hidden border rounded bg-slate-50 dark:bg-zinc-800/50 border-slate-100 dark:border-zinc-800"
                >
                  <span
                    class="font-semibold text-slate-400 text-[9px] whitespace-nowrap flex items-center gap-1"
                  >
                    <i class="pi pi-desktop text-[9px]"></i> PC
                  </span>
                  <span
                    class="ml-1 font-medium text-right truncate text-slate-600 dark:text-slate-300"
                    :title="agent.pcName"
                    >{{ agent.pcName }}</span
                  >
                </div>

                <div
                  class="flex items-center justify-between col-span-2 p-1 overflow-hidden border rounded bg-slate-50 dark:bg-zinc-800/50 border-slate-100 dark:border-zinc-800"
                >
                  <span
                    v-tooltip.top="'+: Agent Fast, -: Agent Slow'"
                    class="flex items-center gap-1 font-semibold text-slate-400 text-[9px] whitespace-nowrap cursor-help hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    <i class="text-[9px] pi pi-clock"></i>
                  </span>
                  <span
                    class="ml-1 font-mono font-bold text-right truncate"
                    :class="getClockDriftColor(agent.clockDrift)"
                  >
                    {{ formatTimeDifference(agent.clockDrift) }}
                  </span>
                </div>
              </div>

              <div
                class="pt-1.5 mt-auto border-t border-dashed border-slate-200 dark:border-zinc-800 cursor-pointer group/chart scale-95 origin-left w-[105%]"
                @click="openChart(agent)"
              >
                <div class="flex items-center gap-1 mb-1">
                  <span class="text-[9px] font-bold text-slate-400 w-6"
                    >CPU</span
                  >
                  <div
                    class="flex-1 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800"
                  >
                    <div
                      class="h-full transition-all duration-500 bg-blue-500 rounded-full"
                      :style="{ width: `${Math.min(agent.cpuUsage, 100)}%` }"
                    ></div>
                  </div>
                  <span
                    class="text-[9px] font-mono text-right text-slate-500 w-8"
                    >{{ agent.cpuUsage.toFixed(0) }}%</span
                  >
                </div>

                <div class="flex items-center gap-1">
                  <span class="text-[9px] font-bold text-slate-400 w-6"
                    >MEM</span
                  >
                  <div
                    class="flex-1 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800"
                  >
                    <div
                      class="h-full transition-all duration-500 bg-teal-500 rounded-full"
                      :style="{
                        width: `${Math.min(agent.memoryUsage, 100)}%`,
                      }"
                    ></div>
                  </div>
                  <span
                    class="text-[9px] font-mono text-right text-slate-500 w-8"
                    >{{ agent.memoryUsage.toFixed(0) }}%</span
                  >
                </div>
              </div>

              <div
                class="flex items-center justify-between pt-1 text-[9px] scale-95 origin-left w-[105%]"
              >
                <span class="text-slate-400">Last Contact</span>
                <span
                  class="font-mono font-medium"
                  :class="
                    agent.isOnline
                      ? 'text-slate-500 dark:text-slate-400'
                      : 'text-rose-500'
                  "
                >
                  {{ formatDate(agent.lastContact) }}
                </span>
              </div>
            </div>
          </div>
        </div>
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
          class="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-white/80 dark:bg-zinc-950/80"
        >
          <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="4" />
          <p class="mt-4 text-sm font-medium text-slate-500 animate-pulse">
            데이터를 불러오는 중입니다...
          </p>
        </div>

        <EChart
          v-if="!isChartLoading && chartData.length > 0"
          :option="chartOption"
        />

        <div
          v-else-if="!isChartLoading && chartData.length === 0"
          class="flex flex-col items-center justify-center h-full select-none text-slate-400"
        >
          <div
            class="flex items-center justify-center w-24 h-24 mb-4 rounded-full shadow-inner bg-slate-50 dark:bg-zinc-900"
          >
            <i
              class="text-4xl pi pi-chart-bar text-slate-300 dark:text-zinc-700"
            ></i>
          </div>
          <h3 class="mb-1 text-lg font-bold text-slate-600 dark:text-slate-300">
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
import { useAuthStore } from "@/stores/auth";
import {
  dashboardApi,
  type DashboardSummaryDto,
  type AgentStatusDto,
} from "@/api/dashboard";
import { performanceApi } from "@/api/performance";
import EChart from "@/components/common/EChart.vue";
import Select from "primevue/select";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import ProgressSpinner from "primevue/progressspinner";

const filterStore = useFilterStore();
const authStore = useAuthStore();

const isSummaryLoading = ref(false);
const isTableLoading = ref(false);
const isChartLoading = ref(false);
const hasSearched = ref(false);

const activeFilter = ref<"All" | "Online" | "Offline" | "Alarm" | "TimeSync">(
  "All"
);

const sites = ref<string[]>([]);
const sdwts = ref<string[]>([]);

// Summary 초기값 설정
const summary = ref<DashboardSummaryDto & { 
  totalServers: number; 
  inactiveAgentCount: number; 
  totalSdwts: number; 
  serverHealth: number; 
}>({
  totalEqpCount: 0,
  onlineAgentCount: 0,
  todayErrorCount: 0,
  todayErrorTotalCount: 0,
  newAlarmCount: 0,
  latestAgentVersion: "",
  totalServers: 0,
  inactiveAgentCount: 0,
  totalSdwts: 0,
  serverHealth: 0,
});

const agentList = ref<AgentStatusDto[]>([]);
const showChart = ref(false);
const selectedAgentId = ref<string | null>(null);
const chartData = ref<any[]>([]);

const refreshCount = ref(30);
let refreshTimer: number | null = null;

const isDarkMode = ref(document.documentElement.classList.contains("dark"));
let themeObserver: MutationObserver | null = null;

// [수정] onMounted 로직 교체
onMounted(async () => {
  try {
    // 1. Site 목록 로드
    sites.value = await dashboardApi.getSites();

    // 2. 초기 필터 값 결정 (우선순위: Store > LocalStorage > Auth)
    let targetSite = filterStore.selectedSite;
    let targetSdwt = filterStore.selectedSdwt;

    if (!targetSite) {
      targetSite = localStorage.getItem("dashboard_site") || "";
      if (targetSite) {
        targetSdwt = localStorage.getItem("dashboard_sdwt") || "";
      }
    }

    if (!targetSite) {
      targetSite = authStore.user?.site || "";
      targetSdwt = authStore.user?.sdwt || "";
    }

    // 3. Site 적용 및 SDWT 로드
    if (targetSite && sites.value.includes(targetSite)) {
      filterStore.selectedSite = targetSite;
      sdwts.value = await dashboardApi.getSdwts(targetSite);

      // 4. SDWT 적용 및 데이터 로드
      if (targetSdwt && sdwts.value.includes(targetSdwt)) {
        filterStore.selectedSdwt = targetSdwt;
        await loadData(true); // 데이터 자동 조회
      } else {
        filterStore.selectedSdwt = "";
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
  } catch (e) {
    console.error(e);
  }
});

onUnmounted(() => {
  stopAutoRefresh();
  if (themeObserver) themeObserver.disconnect();
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
    .then((res: any) => {
      const data = res.data || res;
      if (data) {
        summary.value = { ...summary.value, ...data };
      }
    })
    .catch((e) => {
      console.error("Summary load failed", e);
    })
    .finally(() => {
      isSummaryLoading.value = false;
    });

  dashboardApi
    .getAgentStatus(filterStore.selectedSite, filterStore.selectedSdwt)
    .then((data) => {
      agentList.value = data || [];
      startAutoRefresh();
    })
    .catch((e) => {
      console.error("Agent status load failed", e);
      agentList.value = [];
    })
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
    // [수정] performanceApi.getHistory는 eqpids 배열을 받으므로 배열로 감싸서 전달
    const data = await performanceApi.getHistory(
      startDate.toISOString(),
      endDate.toISOString(),
      [agent.eqpId], 
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

const chartOption = computed(() => {
  if (!chartData.value || chartData.value.length === 0) return {};

  const timestamps = chartData.value.map((d) => d.timestamp);
  const cpuValues = chartData.value.map((d) => d.cpuUsage);
  const memValues = chartData.value.map((d) => d.memoryUsage);

  const textColor = isDarkMode.value ? "#cbd5e1" : "#475569";
  const gridColor = isDarkMode.value
    ? "rgba(255, 255, 255, 0.1)"
    : "rgba(0, 0, 0, 0.1)";
  const tooltipBg = isDarkMode.value
    ? "rgba(24, 24, 27, 0.9)"
    : "rgba(255, 255, 255, 0.9)";
  const tooltipBorder = isDarkMode.value ? "#3f3f46" : "#e2e8f0";
  const tooltipText = isDarkMode.value ? "#fff" : "#1e293b";

  return {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      backgroundColor: tooltipBg,
      borderColor: tooltipBorder,
      textStyle: {
        color: tooltipText,
      },
      axisPointer: { type: "cross", label: { backgroundColor: "#6b7280" } },
      formatter: (params: any) => {
        let html = `<div class="font-bold mb-1" style="color:${tooltipText}">${params[0].axisValueLabel}</div>`;
        params.forEach((p: any) => {
          const colorDot = `<span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:${p.color};"></span>`;
          html += `<div style="color:${tooltipText}">${colorDot} ${
            p.seriesName
          }: ${p.value.toFixed(2)}%</div>`;
        });
        return html;
      },
    },
    legend: {
      data: ["CPU Usage", "Memory Usage"],
      bottom: 0,
      textStyle: { color: textColor },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "10%",
      top: "10%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: timestamps.map((t: string) => {
        const d = new Date(t);
        return `${String(d.getMonth() + 1).padStart(2, "0")}-${String(
          d.getDate()
        ).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(
          d.getMinutes()
        ).padStart(2, "0")}`;
      }),
      axisLabel: { color: textColor },
      axisLine: { lineStyle: { color: gridColor } },
    },
    yAxis: {
      type: "value",
      name: "Usage (%)",
      min: 0,
      max: 100,
      axisLabel: { color: textColor },
      nameTextStyle: { color: textColor, padding: [0, 0, 0, 20] },
      splitLine: { show: true, lineStyle: { color: gridColor } },
    },
    series: [
      {
        name: "CPU Usage",
        type: "line",
        data: cpuValues,
        smooth: true,
        showSymbol: false,
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
      {
        name: "Memory Usage",
        type: "line",
        data: memValues,
        smooth: true,
        showSymbol: false,
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

const first = ref(0);
const rowsPerPage = ref(20);

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
  if (!ver) return "text-slate-400 dark:text-zinc-600";
  if (ver === summary.value.latestAgentVersion) {
    return "px-1.5 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-700 dark:bg-indigo-500/20 dark:border-indigo-500/50 dark:text-indigo-300 shadow-sm";
  }
  return "text-slate-400 dark:text-zinc-500";
};

const prevPage = () => {
  if (first.value > 0) first.value -= rowsPerPage.value;
};
const nextPage = () => {
  if (first.value + rowsPerPage.value < totalRecords.value)
    first.value += rowsPerPage.value;
  loadData(true);
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

const getStatusBarClass = (agent: AgentStatusDto) => {
  if (!agent.isOnline) return "bg-slate-300 dark:bg-zinc-700";
  if (agent.todayAlarmCount > 0) return "bg-amber-500";
  return "bg-emerald-500";
};

const copyToClipboard = async (text: string) => {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    console.error("Failed to copy: ", err);
  }
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
:deep(.p-select),
:deep(.custom-dropdown) {
  @apply !bg-slate-100 dark:!bg-zinc-800/50 !border-0 text-slate-700 dark:text-slate-200 rounded-lg font-bold shadow-none transition-colors;
}

:deep(.custom-dropdown .p-select-label) {
  @apply text-[13px] py-[5px] px-3;
}

:deep(.custom-dropdown.small) {
  @apply h-7;
}

:deep(.custom-dropdown:hover) {
  @apply !bg-slate-200 dark:!bg-zinc-800;
}

:deep(.p-select-dropdown) {
  @apply text-slate-400 dark:text-zinc-500 w-6;
}
:deep(.p-select-dropdown svg) {
  @apply w-3 h-3;
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
.custom-dropdown-panel .p-select-option {
  padding: 6px 10px !important;
  font-size: 11px !important;
}
.custom-dropdown-panel .p-select-empty-message {
  padding: 6px 10px !important;
  font-size: 11px !important;
}
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

.custom-dropdown-panel.small .p-select-option {
  padding: 6px 10px !important;
  font-size: 12px !important;
}
.custom-dropdown-panel.small .p-select-empty-message {
  padding: 6px 10px !important;
  font-size: 12px !important;
}
</style>

