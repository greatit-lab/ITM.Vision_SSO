// backend/src/menu/menu.controller.ts
import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MenuService } from './menu.service';

// [1] Request 내 User 객체 타입 정의 (JwtStrategy 반환값과 일치)
interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    role: string;
    groups: string[];
  };
}

@Controller('menus')
@UseGuards(AuthGuard('jwt'))
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get('my-menus')
  async getMyMenus(@Request() req: AuthenticatedRequest) {
    // [2] req.user가 이제 타입 안전함
    return this.menuService.getMyMenus(req.user.role);
  }
}
