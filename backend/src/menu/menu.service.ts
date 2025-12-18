// backend/src/menu/menu.service.ts
import { Injectable } from '@nestjs/common';
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
    // 1. 해당 Role이 접근 가능한 메뉴 ID 목록 조회
    const accessibleMenuIds = await this.prisma.cfgMenuRole.findMany({
      where: { role: role },
      select: { menuId: true },
    });

    const menuIds = accessibleMenuIds.map((item) => item.menuId);

    // 2. 메뉴 마스터에서 실제 메뉴 정보 조회
    const menus = await this.prisma.refMenu.findMany({
      where: {
        OR: [
          { menuId: { in: menuIds } },
        ],
        isVisible: 'Y',
      },
      orderBy: { sortOrder: 'asc' },
    });

    // 3. Flat Data -> Tree Structure 변환
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
