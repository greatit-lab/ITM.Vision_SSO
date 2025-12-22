// frontend/src/stores/menuManagement.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import http from '@/api/http';

export interface MenuNode {
  id: number;
  label: string;
  routerPath?: string;
  parentId?: number | null;
  roles?: string[];
  children?: MenuNode[];
  data?: any; 
}

export const useMenuManagementStore = defineStore('menuManagement', () => {
  const menuTree = ref<MenuNode[]>([]);
  const isLoading = ref(false);

  // 메뉴 트리 조회
  const fetchMenus = async () => {
    isLoading.value = true;
    try {
      // [수정] 백엔드 경로 변경: /menus/tree -> /menu/all
      const { data } = await http.get<MenuNode[]>('/menu/all');
      menuTree.value = transformToTreeNode(data);
    } catch (error) {
      console.error('Failed to fetch menu tree:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  // 메뉴 생성
  const createMenu = async (menuData: any) => {
    // [수정] /menus -> /menu
    await http.post('/menu', menuData);
  };

  // 메뉴 수정
  const updateMenu = async (id: number, menuData: any) => {
    // [수정] /menus/:id -> /menu/:id
    await http.put(`/menu/${id}`, menuData);
  };

  // 메뉴 삭제
  const deleteMenu = async (id: number) => {
    // [수정] /menus/:id -> /menu/:id
    await http.delete(`/menu/${id}`);
  };

  const transformToTreeNode = (nodes: any[]): any[] => {
    return nodes.map(node => ({
      key: String(node.menuId), // 백엔드 필드명 menuId 사용
      data: {
        id: node.menuId,
        label: node.label,
        routerPath: node.routerPath,
        parentId: node.parentId,
        roles: node.roles,
      },
      children: node.children ? transformToTreeNode(node.children) : []
    }));
  };

  return {
    menuTree,
    isLoading,
    fetchMenus,
    createMenu,
    updateMenu,
    deleteMenu
  };
});
