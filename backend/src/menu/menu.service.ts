// backend/src/menu/menu.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RefMenu, CfgMenuRole, Prisma } from '@prisma/client';

export interface MenuNode {
  menuId: number;
  label: string;
  routerPath: string | null;
  icon: string | null;
  parentId: number | null;
  sortOrder: number | null;
  children: MenuNode[];
  statusTag?: string | null; // 이미 존재함
  roles?: string[];
}

// [수정] DTO에 statusTag 추가
interface CreateMenuDto {
  label: string;
  routerPath?: string;
  parentId?: number | null;
  icon?: string;
  sortOrder?: number;
  statusTag?: string; // Added
  roles?: string[];
}

interface UpdateMenuDto {
  label?: string;
  routerPath?: string;
  parentId?: number | null;
  icon?: string;
  sortOrder?: number;
  statusTag?: string; // Added
  roles?: string[];
}

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}

  async getMyMenus(role: string): Promise<MenuNode[]> {
    if (role === 'ADMIN') {
      const allMenus = await this.prisma.refMenu.findMany({
        where: { isVisible: 'Y' },
        orderBy: { sortOrder: 'asc' },
      });
      return this.buildMenuTree(allMenus);
    }

    const accessibleMenuIds = await this.prisma.cfgMenuRole.findMany({
      where: { role: role },
      select: { menuId: true },
    });

    const menuIds = accessibleMenuIds.map((item) => item.menuId);

    const menus = await this.prisma.refMenu.findMany({
      where: {
        menuId: { in: menuIds },
        isVisible: 'Y',
      },
      orderBy: { sortOrder: 'asc' },
    });

    return this.buildMenuTree(menus);
  }

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

  // [수정] createMenu에 statusTag 반영
  async createMenu(data: CreateMenuDto) {
    const { label, routerPath, parentId, icon, sortOrder, statusTag, roles } = data;

    const newMenu = await this.prisma.refMenu.create({
      data: {
        label,
        routerPath: routerPath || null,
        parentId: parentId || null,
        icon: icon || null, // [수정] 빈 문자열이 오면 null로 처리하거나 그대로 저장 (여기선 값이 없으면 null)
        sortOrder: sortOrder || 0,
        statusTag: statusTag || null, // [추가]
        isVisible: 'Y',
      },
    });

    if (roles && roles.length > 0) {
      await this.prisma.cfgMenuRole.createMany({
        data: roles.map((role: string) => ({
          menuId: newMenu.menuId,
          role,
        })),
      });
    }

    return newMenu;
  }

  // [수정] updateMenu에 statusTag 반영
  async updateMenu(id: number, data: UpdateMenuDto) {
    const { label, routerPath, parentId, icon, sortOrder, statusTag, roles } = data;

    const updateData: Prisma.RefMenuUpdateInput = {
      ...(label !== undefined && { label }),
      ...(routerPath !== undefined && { routerPath }),
      ...(parentId !== undefined && { parentId }),
      // [수정] icon이 undefined가 아닐 때만 업데이트하되, 빈 문자열이면 null로 저장할 수도 있음
      // 여기서는 프론트에서 빈 값('')을 보내면 그대로 저장하거나 null 변환 로직 필요.
      // Prisma는 nullable 컬럼에 null을 넣어야 함.
      ...(icon !== undefined && { icon: icon || null }), 
      ...(sortOrder !== undefined && { sortOrder }),
      ...(statusTag !== undefined && { statusTag: statusTag || null }), // [추가]
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

  async getAllRolePermissions(): Promise<CfgMenuRole[]> {
    return this.prisma.cfgMenuRole.findMany();
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
        statusTag: menu.statusTag, // [확인] 이미 매핑되어 있음
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
