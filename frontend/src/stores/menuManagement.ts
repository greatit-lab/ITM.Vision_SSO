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
  icon?: string;
  sortOrder?: number;
  statusTag?: string;
  isVisible?: boolean; // [추가] 노출 여부
  children?: MenuNode[];
  data?: any; 
}

export const useMenuManagementStore = defineStore('menuManagement', () => {
  const menuTree = ref<MenuNode[]>([]);
  const isLoading = ref(false);

  const fetchMenus = async () => {
    isLoading.value = true;
    try {
      const { data } = await http.get<MenuNode[]>('/menu/all');
      menuTree.value = transformToTreeNode(data);
    } catch (error) {
      console.error('Failed to fetch menu tree:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const createMenu = async (menuData: any) => {
    await http.post('/menu', menuData);
  };

  const updateMenu = async (id: number, menuData: any) => {
    await http.put(`/menu/${id}`, menuData);
  };

  const deleteMenu = async (id: number) => {
    await http.delete(`/menu/${id}`);
  };

  const transformToTreeNode = (nodes: any[]): any[] => {
    return nodes.map(node => ({
      key: String(node.menuId),
      data: {
        id: node.menuId,
        label: node.label,
        routerPath: node.routerPath,
        parentId: node.parentId,
        roles: node.roles,
        icon: node.icon,
        sortOrder: node.sortOrder,
        statusTag: node.statusTag,
        isVisible: node.isVisible ?? true, // [추가] 기본값 true 처리
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
