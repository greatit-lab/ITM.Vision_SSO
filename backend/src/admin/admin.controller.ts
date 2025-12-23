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
import {
  CreateAdminDto,
  CreateAccessCodeDto,
  UpdateAccessCodeDto,
  CreateGuestDto,
  ApproveGuestRequestDto,
  RejectGuestRequestDto,
  CreateSeverityDto,
  UpdateSeverityDto,
  CreateMetricDto,
  UpdateMetricDto,
} from './dto/admin.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ==========================================
  // [User & Admin Management]
  // ==========================================
  @Get('users')
  async getUsers() {
    return this.adminService.getAllUsers();
  }

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

  // ==========================================
  // [Access Codes]
  // ==========================================
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

  // ==========================================
  // [Guest Management]
  // ==========================================
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

  @Get('requests')
  async getGuestRequests() {
    return this.adminService.getGuestRequests();
  }

  @Post('requests/approve')
  async approveGuestRequest(@Body() body: ApproveGuestRequestDto) {
    return this.adminService.approveGuestRequest(body);
  }

  @Post('requests/reject')
  async rejectGuestRequest(@Body() body: RejectGuestRequestDto) {
    return this.adminService.rejectGuestRequest(body);
  }

  // ==========================================
  // [System Config] Error Severity Map
  // ==========================================
  @Get('severity')
  async getSeverities() {
    return this.adminService.getSeverities();
  }

  @Post('severity')
  async createSeverity(@Body() body: CreateSeverityDto) {
    return this.adminService.createSeverity(body);
  }

  // [수정] ID(int) 대신 ErrorID(string) 사용
  @Put('severity/:errorId')
  async updateSeverity(
    @Param('errorId') errorId: string,
    @Body() body: UpdateSeverityDto,
  ) {
    return this.adminService.updateSeverity(errorId, body);
  }

  // [수정] ID(int) 대신 ErrorID(string) 사용
  @Delete('severity/:errorId')
  async deleteSeverity(@Param('errorId') errorId: string) {
    return this.adminService.deleteSeverity(errorId);
  }

  // ==========================================
  // [System Config] Analysis Metrics
  // ==========================================
  @Get('metrics')
  async getMetrics() {
    return this.adminService.getMetrics();
  }

  @Post('metrics')
  async createMetric(@Body() body: CreateMetricDto) {
    return this.adminService.createMetric(body);
  }

  @Put('metrics/:name')
  async updateMetric(
    @Param('name') name: string,
    @Body() body: UpdateMetricDto,
  ) {
    return this.adminService.updateMetric(name, body);
  }

  @Delete('metrics/:name')
  async deleteMetric(@Param('name') name: string) {
    return this.adminService.deleteMetric(name);
  }

  // ==========================================
  // [Equipments]
  // ==========================================
  @Get('equipments')
  async getEquipments() {
    return this.adminService.getRefEquipments();
  }
}
