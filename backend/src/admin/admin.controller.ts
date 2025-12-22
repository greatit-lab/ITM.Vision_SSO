// backend/src/admin/admin.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { AdminService } from './admin.service';
// import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // 보안 적용 시 주석 해제
// import { UseGuards } from '@nestjs/common'; // 보안 적용 시 주석 해제
import {
  CreateAdminDto,
  CreateAccessCodeDto,
  UpdateAccessCodeDto,
  CreateGuestDto,
} from './dto/admin.dto';

@Controller('admin')
// @UseGuards(JwtAuthGuard) // 실제 운영 환경 배포 시 주석을 해제하여 보안을 적용하세요.
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // 1. Users
  @Get('users')
  async getUsers() {
    return this.adminService.getAllUsers();
  }

  // 2. Admins
  @Get('admins')
  async getAdmins() {
    return this.adminService.getAllAdmins();
  }

  @Post('admins')
  async addAdmin(@Body() body: CreateAdminDto) {
    return this.adminService.addAdmin(body);
  }

  @Delete('admins/:id')
  async deleteAdmin(@Param('id') id: string) {
    return this.adminService.deleteAdmin(id);
  }

  // 3. Access Codes
  @Get('access-codes')
  async getAccessCodes() {
    return this.adminService.getAllAccessCodes();
  }

  @Post('access-codes')
  async createAccessCode(@Body() body: CreateAccessCodeDto) {
    return this.adminService.createAccessCode(body);
  }

  @Put('access-codes/:id')
  async updateAccessCode(
    @Param('id') id: string,
    @Body() body: UpdateAccessCodeDto,
  ) {
    return this.adminService.updateAccessCode(id, body);
  }

  @Delete('access-codes/:id')
  async deleteAccessCode(@Param('id') id: string) {
    return this.adminService.deleteAccessCode(id);
  }

  // 4. Guests
  @Get('guests')
  async getGuests() {
    return this.adminService.getAllGuests();
  }

  @Post('guests')
  async addGuest(@Body() body: CreateGuestDto) {
    return this.adminService.addGuest(body);
  }

  @Delete('guests/:id')
  async deleteGuest(@Param('id') id: string) {
    return this.adminService.deleteGuest(id);
  }

  // 5. [New] Equipments
  @Get('equipments')
  async getEquipments() {
    return this.adminService.getRefEquipments();
  }
}
