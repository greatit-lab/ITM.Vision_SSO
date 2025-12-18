// backend/src/menu/menu.controller.ts
import { Controller, Get, Post, Body, UseGuards, Param, Request } from '@nestjs/common';
import { MenuService } from './menu.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../auth/auth.interface';

// Request 객체 타입 정의 확장
interface RequestWithUser extends Request {
  user: User;
}

@Controller('menu')
@UseGuards(JwtAuthGuard)
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  // 내 메뉴 조회 (Sidebar용)
  @Get('my')
  async getMyMenus(@Request() req: RequestWithUser) {
    // [수정] role이 undefined일 경우 기본값 'USER' 사용
    const role = req.user.role ?? 'USER';
    return this.menuService.getMyMenus(role);
  }

  // [관리자] 전체 메뉴 트리 조회
  @Get('all')
  async getAllMenus() {
    return this.menuService.getAllMenus();
  }

  // [관리자] 현재 설정된 모든 권한 매핑 조회
  @Get('permissions')
  async getPermissions() {
    return this.menuService.getAllRolePermissions();
  }

  // [관리자] 특정 Role의 권한 저장
  @Post('permissions/:role')
  async savePermissions(
    @Param('role') role: string,
    @Body('menuIds') menuIds: number[],
  ) {
    return this.menuService.updateRolePermissions(role, menuIds);
  }
}
