// backend/src/menu/menu.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RefMenu, CfgMenuRole } from '@prisma/client';

export interface MenuNode {
  menuId: number;
  label: string;
  routerPath: string | null;
  icon: string | null;
  parentId: number | null;
  children: MenuNode[];
  statusTag?: string | null;
}

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}

  /**
   * 사용자 역할(Role)에 기반한 메뉴 트리 조회
   */
  async getMyMenus(role: string): Promise<MenuNode[]> {
    // [수정] ADMIN 권한은 모든 메뉴 접근 가능 (Super User Bypass)
    // DB 매핑 여부와 관계없이 'isVisible'인 모든 메뉴를 가져옵니다.
    if (role === 'ADMIN') {
      const allMenus = await this.prisma.refMenu.findMany({
        where: { isVisible: 'Y' },
        orderBy: { sortOrder: 'asc' },
      });
      return this.buildMenuTree(allMenus);
    }

    // [일반 사용자] 해당 Role이 접근 가능한 메뉴 ID 목록 조회
    const accessibleMenuIds = await this.prisma.cfgMenuRole.findMany({
      where: { role: role },
      select: { menuId: true },
    });

    const menuIds = accessibleMenuIds.map((item) => item.menuId);

    // 메뉴 마스터에서 실제 메뉴 정보 조회
    const menus = await this.prisma.refMenu.findMany({
      where: {
        menuId: { in: menuIds },
        isVisible: 'Y',
      },
      orderBy: { sortOrder: 'asc' },
    });

    return this.buildMenuTree(menus);
  }

  /**
   * 모든 메뉴 목록 조회 (관리자 설정 화면용)
   */
  async getAllMenus(): Promise<MenuNode[]> {
    const menus = await this.prisma.refMenu.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return this.buildMenuTree(menus);
  }

  /**
   * [Admin] 특정 Role에 대한 메뉴 접근 권한을 일괄 업데이트 (Transaction)
   */
  async updateRolePermissions(role: string, menuIds: number[]): Promise<void> {
    // 트랜잭션을 사용하여 기존 권한 삭제 -> 새 권한 부여를 원자적으로 처리
    await this.prisma.$transaction(async (tx) => {
      // 1. 해당 Role의 기존 매핑 제거
      await tx.cfgMenuRole.deleteMany({
        where: { role },
      });

      // 2. 새로운 매핑 생성
      if (menuIds.length > 0) {
        await tx.cfgMenuRole.createMany({
          data: menuIds.map((menuId) => ({
            role,
            menuId,
          })),
        });
      }
    });
  }

  /**
   * [Admin] 모든 Role별 권한 매핑 정보 조회
   */
  async getAllRolePermissions(): Promise<CfgMenuRole[]> {
    return this.prisma.cfgMenuRole.findMany();
  }

  /**
   * 재귀적으로 메뉴 트리 구성
   */
  private buildMenuTree(menus: RefMenu[]): MenuNode[] {
    const map = new Map<number, MenuNode>();
    const roots: MenuNode[] = [];

    // 1. 모든 노드를 Map에 등록 및 children 초기화
    menus.forEach((menu) => {
      map.set(menu.menuId, {
        menuId: menu.menuId,
        label: menu.label,
        routerPath: menu.routerPath,
        icon: menu.icon,
        parentId: menu.parentId,
        statusTag: menu.statusTag,
        children: [],
      });
    });

    // 2. 부모-자식 관계 연결
    menus.forEach((menu) => {
      if (menu.parentId && map.has(menu.parentId)) {
        const parent = map.get(menu.parentId);
        parent?.children.push(map.get(menu.menuId)!);
      } else {
        roots.push(map.get(menu.menuId)!);
      }
    });

    return roots;
  }
}

<!-- frontend/src/components/layout/SidebarItem.vue -->
<template>
  <li class="relative group/item">
    <div
      @click="handleClick"
      class="relative flex items-center transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] cursor-pointer select-none rounded-xl mx-1.5 my-1 overflow-hidden border border-transparent"
      :class="[
        // 높이 설정 (조금 더 슬림하게)
        'min-h-[36px]',

        // 사이드바 상태에 따른 패딩
        isSidebarOpen ? 'px-3' : 'justify-center px-0',

        // 활성화(Active) vs 비활성화 상태 디자인
        isActive
          ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 shadow-sm shadow-indigo-100/40 dark:shadow-none border-indigo-100/50 dark:border-indigo-500/20'
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50/80 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200',
      ]"
    >
      <div
        v-if="isActive"
        class="absolute left-0 top-1/2 -translate-y-1/2 bg-gradient-to-b from-indigo-400 to-indigo-600 rounded-r-full shadow-[2px_0_8px_rgba(99,102,241,0.4)] transition-all duration-300"
        :class="
          isSidebarOpen ? 'w-[4px] h-[20px]' : 'w-[4px] h-[20px] left-0.5'
        "
      ></div>

      <div class="z-10 flex items-center min-w-0 gap-3">
        <div class="relative flex items-center justify-center w-5 h-5 shrink-0">
          <i
            v-if="item.icon"
            :class="[
              item.icon,
              'text-[1.15rem] transition-all duration-300',
              isActive
                ? 'text-indigo-600 dark:text-indigo-400 scale-110 drop-shadow-sm'
                : 'text-slate-400 group-hover/item:text-slate-600 dark:text-slate-500 dark:group-hover/item:text-slate-300 group-hover/item:scale-105',
            ]"
          ></i>
          <span
            v-else
            class="w-1.5 h-1.5 rounded-full transition-all duration-300 ring-2 ring-offset-1 ring-offset-white dark:ring-offset-zinc-900"
            :class="
              isActive
                ? 'bg-indigo-500 ring-indigo-200'
                : 'bg-slate-300 ring-transparent'
            "
          ></span>

          <span
            v-if="!isSidebarOpen && item.statusTag"
            class="absolute -top-0.5 -right-0.5 flex w-2 h-2"
          >
            <span
              class="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping"
              :class="getBadgeDotColor(item.statusTag)"
            ></span>
            <span
              class="relative inline-flex w-2 h-2 border border-white rounded-full dark:border-zinc-900"
              :class="getBadgeDotColor(item.statusTag)"
            ></span>
          </span>
        </div>

        <div
          v-if="isSidebarOpen"
          class="flex items-center justify-between flex-1 min-w-0"
        >
          <span
            class="text-[13.5px] tracking-tight truncate transition-colors duration-300 ml-1"
            :class="isActive ? 'font-bold' : 'font-medium'"
          >
            {{ item.label }}
          </span>

          <div
            v-if="item.statusTag"
            class="ml-2 px-1 py-[1px] rounded-[3px] text-[8px] leading-none font-bold uppercase tracking-wider shadow-sm transition-transform duration-300 hover:scale-105 cursor-help opacity-90 hover:opacity-100 transform scale-90 origin-right"
            :class="getBadgeStyle(item.statusTag)"
          >
            {{ item.statusTag }}
          </div>
        </div>
      </div>

      <div
        v-if="hasChildren && isSidebarOpen"
        class="flex items-center pl-2 ml-auto"
      >
        <i
          class="pi pi-chevron-right text-[9px] transition-all duration-300"
          :class="[
            isExpanded
              ? 'rotate-90 text-indigo-500 font-bold'
              : 'text-slate-400',
            isActive ? 'text-indigo-400' : 'group-hover/item:text-slate-500',
          ]"
        ></i>
      </div>

      <div
        v-if="!isSidebarOpen"
        class="absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-800 dark:bg-zinc-700 text-white text-[12px] font-medium rounded-md opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all duration-200 cubic-bezier(0.2,0,0.2,1) whitespace-nowrap z-[100] shadow-[4px_0_15px_-3px_rgba(0,0,0,0.1)] pointer-events-none translate-x-[-8px] group-hover/item:translate-x-0"
      >
        {{ item.label }}

        <div
          class="absolute left-0 w-2 h-2 rotate-45 -translate-x-1 -translate-y-1/2 top-1/2 bg-slate-800 dark:bg-zinc-700"
        ></div>

        <span
          v-if="item.statusTag"
          class="ml-1.5 px-1 py-[0.5px] rounded text-[8px] font-bold uppercase tracking-wider bg-white/20 text-white"
        >
          {{ item.statusTag }}
        </span>
      </div>
    </div>

    <div
      v-if="hasChildren && isSidebarOpen"
      class="overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out"
      :style="{
        maxHeight: isExpanded ? '600px' : '0px',
        opacity: isExpanded ? '1' : '0',
      }"
    >
      <ul
        class="relative mt-0.5 space-y-0.5 before:absolute before:left-[27px] before:top-0 before:bottom-3 before:w-[1px] before:bg-slate-200/60 dark:before:bg-slate-800"
      >
        <SidebarItem
          v-for="child in item.children"
          :key="child.menuId"
          :item="child"
          :is-sidebar-open="isSidebarOpen"
          :depth="depth + 1"
          class="pl-5"
        />
      </ul>
    </div>
  </li>
</template>

<script setup lang="ts">
import { ref, computed, toRefs, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { MenuNode } from "@/api/menu";

const props = withDefaults(
  defineProps<{
    item: MenuNode;
    isSidebarOpen: boolean;
    depth?: number;
  }>(),
  {
    depth: 0,
  }
);

const { item, isSidebarOpen } = toRefs(props);
const route = useRoute();
const router = useRouter();

const hasChildren = computed(
  () => !!item.value.children && item.value.children.length > 0
);

// 활성화 로직
const isActive = computed(() => {
  if (item.value.routerPath === route.path) return true;
  if (hasChildren.value) {
    return checkChildActive(item.value.children);
  }
  return false;
});

const checkChildActive = (children: MenuNode[]): boolean => {
  return children.some((child) => {
    if (child.routerPath === route.path) return true;
    if (child.children && child.children.length > 0) {
      return checkChildActive(child.children);
    }
    return false;
  });
};

const isExpanded = ref(false);

const handleClick = () => {
  if (hasChildren.value) {
    isExpanded.value = !isExpanded.value;
    // 닫힘 상태에서 그룹 메뉴 클릭 시 사이드바 열기 (사용성 고려)
    if (!isSidebarOpen.value) {
      window.dispatchEvent(new CustomEvent("sidebar-toggle", { detail: true }));
    }
  } else if (item.value.routerPath) {
    router.push(item.value.routerPath);
  }
};

const autoExpand = () => {
  if (hasChildren.value && checkChildActive(item.value.children)) {
    isExpanded.value = true;
  }
};

// [Design System] Badge Styles (Refined Colors)
const getBadgeStyle = (tag: string) => {
  const t = tag.toUpperCase();
  switch (t) {
    case "NEW":
      return "bg-rose-50 text-rose-600 border border-rose-100 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30";
    case "BETA":
      return "bg-violet-50 text-violet-600 border border-violet-100 dark:bg-violet-500/20 dark:text-violet-300 dark:border-violet-500/30";
    case "HOT":
      return "bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30";
    case "UPD":
      return "bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30";
    default:
      return "bg-slate-100 text-slate-500 border border-slate-200 dark:bg-white/10 dark:text-slate-400";
  }
};

// [Design System] Dot Colors (Flat)
const getBadgeDotColor = (tag: string) => {
  const t = tag.toUpperCase();
  switch (t) {
    case "NEW":
      return "bg-rose-500";
    case "BETA":
      return "bg-violet-500";
    case "HOT":
      return "bg-amber-500";
    default:
      return "bg-slate-500";
  }
};

watch(() => route.path, autoExpand);
onMounted(autoExpand);
</script>

<style scoped>
/* Interaction Tweaks */
.group\/item:hover .group-hover\/item\:visible {
  transition-delay: 0.05s;
}
</style>
