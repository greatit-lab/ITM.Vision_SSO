<!-- frontend/src/views/admin/InfraManagementView.vue -->
<template>
  <div class="h-full flex flex-col gap-4">
    <div class="shrink-0">
      <h2 class="text-lg font-bold text-slate-800 dark:text-white">인프라 관리</h2>
      <p class="text-xs text-slate-500">장비(Equipment), SDWT, 서버 연결 정보를 관리합니다.</p>
    </div>

    <div class="flex-1 bg-white dark:bg-[#111111] rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col">
      <Tabs value="0">
        <TabList>
          <Tab value="0">장비 목록 (ref_equipment)</Tab>
          <Tab value="1">SDWT 구성 (ref_sdwt)</Tab>
          <Tab value="2">서버 설정 (cfg_server)</Tab>
        </TabList>
        <TabPanels class="!p-0 flex-1 overflow-auto">
          <TabPanel value="0" class="h-full">
            <div class="p-4 h-full flex flex-col">
              <div class="flex justify-end mb-2"><Button label="Add Equipment" size="small" /></div>
              <div class="flex-1 border rounded bg-slate-50 flex items-center justify-center text-slate-400">
                ref_equipment 테이블 데이터 그리드
              </div>
            </div>
          </TabPanel>
          <TabPanel value="1">
            <div class="p-4">
               <div class="flex-1 border rounded bg-slate-50 flex items-center justify-center text-slate-400 h-64">
                ref_sdwt 테이블 데이터 그리드
              </div>
            </div>
          </TabPanel>
          <TabPanel value="2">
            <div class="p-4">
               <div class="flex-1 border rounded bg-slate-50 flex items-center justify-center text-slate-400 h-64">
                cfg_server, cfg_new_server 테이블 데이터 그리드
              </div>
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
import Button from 'primevue/button';
</script>
