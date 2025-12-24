// backend/src/menu/menu.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RefMenu, Prisma } from '@prisma/client';

export interface MenuNode {
  menuId: number;
  label: string;
  routerPath: string | null;
  icon: string | null;
  parentId: number | null;
  sortOrder: number | null;
  children: MenuNode[];
  statusTag?: string | null;
  isVisible?: boolean; 
  roles?: string[];
}

// (DTO 정의 부분은 기존과 동일하므로 생략 가능하나, 전체 코드 제공 원칙에 따라 포함)
export interface CreateMenuDto {
  label: string;
  routerPath?: string;
  parentId?: number | null;
  icon?: string;
  sortOrder?: number;
  statusTag?: string;
  isVisible?: boolean;
  roles?: string[];
}

export interface UpdateMenuDto {
  label?: string;
  routerPath?: string;
  parentId?: number | null;
  icon?: string;
  sortOrder?: number;
  statusTag?: string;
  isVisible?: boolean;
  roles?: string[];
}

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}

  // [핵심 로직] 권한 및 노출 여부에 따른 메뉴 트리 구성 (사용자용)
  async getMyMenus(role: string): Promise<MenuNode[]> {
    // 1. 활성화된(isVisible='Y') 메뉴만 가져오기
    const allMenus = await this.prisma.refMenu.findMany({
      where: { isVisible: 'Y' },
      orderBy: { sortOrder: 'asc' },
    });

    // [수정] 데모 모드이거나 ADMIN 권한이면 전체 메뉴 반환 (권한 테이블 조회 패스)
    // 이렇게 하면 DB에 USER 권한 매핑이 없어도 메뉴가 보입니다.
    if (process.env.ENABLE_DEMO_MODE === 'true' || role === 'ADMIN') {
      return this.buildMenuTree(allMenus);
    }

    // 3. 해당 Role이 접근 가능한 메뉴 ID 목록 조회 (일반 모드 로직)
    const accessible = await this.prisma.cfgMenuRole.findMany({
      where: { role: role },
      select: { menuId: true },
    });
    const allowedIds = new Set(accessible.map((a) => a.menuId));

    // 4. 권한 기반 필터링 (부모 노드 자동 포함 로직)
    const validMenus = this.filterMenusRecursive(allMenus, allowedIds);

    return this.buildMenuTree(validMenus);
  }

  // [관리자용] 전체 메뉴 및 권한 매핑 정보 조회 (숨김 메뉴 포함)
  async getAllMenus(): Promise<MenuNode[]> {
    const menus = await this.prisma.refMenu.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    const roleMappings = await this.prisma.cfgMenuRole.findMany();
    
    const roleMap = new Map<number, string[]>();
    roleMappings.forEach(mapping => {
      if (!roleMap.has(mapping.menuId)) {
        roleMap.set(mapping.menuId, []);
      }
      roleMap.get(mapping.menuId)?.push(mapping.role);
    });

    return this.buildMenuTree(menus, roleMap);
  }

  // --- CRUD Operations ---

  async createMenu(data: CreateMenuDto) {
    const { label, routerPath, parentId, icon, sortOrder, statusTag, roles, isVisible } = data;

    const newMenu = await this.prisma.refMenu.create({
      data: {
        label,
        routerPath: routerPath || null,
        parentId: parentId || null,
        icon: icon || null,
        sortOrder: sortOrder || 0,
        statusTag: statusTag || null,
        isVisible: isVisible === false ? 'N' : 'Y',
      },
    });

    if (roles && roles.length > 0) {
      await this.prisma.cfgMenuRole.createMany({
        data: roles.map((role) => ({
          menuId: newMenu.menuId,
          role,
        })),
      });
    }
    return newMenu;
  }

  async updateMenu(id: number, data: UpdateMenuDto) {
    const { label, routerPath, parentId, icon, sortOrder, statusTag, roles, isVisible } = data;

    const updateData: Prisma.RefMenuUpdateInput = {
      ...(label !== undefined && { label }),
      ...(routerPath !== undefined && { routerPath: routerPath || null }),
      ...(parentId !== undefined && { parentId }),
      ...(icon !== undefined && { icon: icon || null }),
      ...(sortOrder !== undefined && { sortOrder }),
      ...(statusTag !== undefined && { statusTag: statusTag || null }),
      ...(isVisible !== undefined && { isVisible: isVisible ? 'Y' : 'N' }),
    };

    const updatedMenu = await this.prisma.refMenu.update({
      where: { menuId: id },
      data: updateData,
    });

    if (roles && Array.isArray(roles)) {
      await this.prisma.$transaction(async (tx) => {
        await tx.cfgMenuRole.deleteMany({ where: { menuId: id } });
        if (roles.length > 0) {
          await tx.cfgMenuRole.createMany({
            data: roles.map((role) => ({
              menuId: id,
              role,
            })),
          });
        }
      });
    }
    return updatedMenu;
  }

  async deleteMenu(id: number) {
    await this.prisma.cfgMenuRole.deleteMany({ where: { menuId: id } });
    return this.prisma.refMenu.delete({ where: { menuId: id } });
  }

  async updateRolePermissions(role: string, menuIds: number[]): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.cfgMenuRole.deleteMany({ where: { role } });
      if (menuIds.length > 0) {
        await tx.cfgMenuRole.createMany({
          data: menuIds.map((menuId) => ({ role, menuId })),
        });
      }
    });
  }

  async getAllRolePermissions() {
    return this.prisma.cfgMenuRole.findMany();
  }

  // --- Helper Methods ---

  private filterMenusRecursive(allMenus: RefMenu[], allowedIds: Set<number>): RefMenu[] {
    const menuMap = new Map<number, RefMenu>(allMenus.map(m => [m.menuId, m]));
    const resultIds = new Set<number>();

    allowedIds.forEach(id => resultIds.add(id));

    allowedIds.forEach(id => {
      let current = menuMap.get(id);
      while (current && current.parentId) {
        const parent = menuMap.get(current.parentId);
        if (parent) {
          resultIds.add(parent.menuId);
          current = parent;
        } else {
          break;
        }
      }
    });

    return allMenus.filter(m => resultIds.has(m.menuId));
  }

  private buildMenuTree(menus: RefMenu[], roleMap?: Map<number, string[]>): MenuNode[] {
    const map = new Map<number, MenuNode>();
    const roots: MenuNode[] = [];

    menus.forEach((menu) => {
      map.set(menu.menuId, {
        menuId: menu.menuId,
        label: menu.label,
        routerPath: menu.routerPath,
        icon: menu.icon,
        parentId: menu.parentId,
        sortOrder: menu.sortOrder,
        statusTag: menu.statusTag,
        isVisible: menu.isVisible === 'Y',
        children: [],
        roles: roleMap ? (roleMap.get(menu.menuId) || []) : undefined,
      });
    });

    menus.forEach((menu) => {
      if (menu.parentId && map.has(menu.parentId)) {
        const parent = map.get(menu.parentId);
        parent?.children.push(map.get(menu.menuId)!);
      } else {
        roots.push(map.get(menu.menuId)!);
      }
    });

    const sortNodes = (nodes: MenuNode[]) => {
      nodes.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      nodes.forEach(node => {
        if (node.children.length > 0) sortNodes(node.children);
      });
    };
    sortNodes(roots);

    return roots;
  }
}
