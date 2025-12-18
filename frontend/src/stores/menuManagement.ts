// frontend/src/stores/menuManagement.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { 
  fetchAllMenus, 
  fetchPermissions, 
  saveRolePermissions, 
  type MenuNode, 
  type UIMenuNode,
  type RolePermission 
} from '@/api/menu';

export const useMenuManagementStore = defineStore('menuManagement', () => {
  const allMenus = ref<UIMenuNode[]>([]);
  const rolePermissions = ref<Record<string, number[]>>({});
  const isLoading = ref(false);

  // 메뉴 트리와 권한 정보를 서버에서 로드
  const loadManagementData = async () => {
    isLoading.value = true;
    try {
      const [menusRes, permsRes] = await Promise.all([
        fetchAllMenus(),
        fetchPermissions()
      ]);

      // 1. 메뉴 트리 저장
      allMenus.value = transformToTreeTable(menusRes.data);

      // 2. 권한 매핑 변환
      const permMap: Record<string, number[]> = {};
      permsRes.data.forEach((p: RolePermission) => {
        if (!permMap[p.role]) permMap[p.role] = [];
        permMap[p.role]!.push(p.menuId);
      });
      rolePermissions.value = permMap;
      
    } finally {
      isLoading.value = false;
    }
  };

  // 변경사항 저장
  const saveChanges = async (role: string, menuIds: number[]) => {
    await saveRolePermissions(role, menuIds);
    // 저장 후 로컬 상태 업데이트
    rolePermissions.value[role] = menuIds;
  };

  // Helper: API 응답을 PrimeVue TreeTable 구조로 변환
  const transformToTreeTable = (nodes: MenuNode[]): UIMenuNode[] => {
    return nodes.map(node => {
      // [타입 호환 처리] null 값을 undefined로 변환하여 UIMenuNode 타입 준수
      // 빈 문자열('')도 false로 취급되어 undefined가 될 수 있으나, 
      // 아이콘/경로가 빈 문자열인 경우는 없거나 undefined와 동일하게 처리해도 무방함
      return {
        key: String(node.menuId),
        // 기본 속성 복사 (MenuNode의 number, string 타입 필드들)
        menuId: node.menuId,
        label: node.label,
        parentId: node.parentId,
        
        // [재정의 필드] null -> undefined 변환
        icon: node.icon || undefined,
        routerPath: node.routerPath || undefined,
        statusTag: node.statusTag || undefined,

        // 원본 데이터 및 자식 노드
        data: { ...node },
        children: node.children ? transformToTreeTable(node.children) : []
      };
    });
  };

  return { allMenus, rolePermissions, isLoading, loadManagementData, saveChanges };
});
