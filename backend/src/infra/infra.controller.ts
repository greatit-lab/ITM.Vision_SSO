// backend/src/infra/infra.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { InfraService } from './infra.service';

@Controller('infra')
export class InfraController {
  constructor(private readonly infraService: InfraService) {}

  // 1. SDWT
  @Get('sdwt')
  async getSdwts() {
    return this.infraService.getSdwts();
  }

  // 2. New Server (Global Config)
  @Get('new-server')
  async getNewServers() {
    return this.infraService.getNewServers();
  }

  @Post('new-server')
  async createNewServer(@Body() body: any) {
    return this.infraService.createNewServer(body);
  }

  @Put('new-server/:id')
  async updateNewServer(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    return this.infraService.updateNewServer(id, body);
  }

  @Delete('new-server/:id')
  async deleteNewServer(@Param('id', ParseIntPipe) id: number) {
    return this.infraService.deleteNewServer(id);
  }

  // 3. Agent Server (Per Eqp Config)
  @Get('agent-server')
  async getAgentServers() {
    return this.infraService.getAgentServers();
  }

  @Post('agent-server')
  async createAgentServer(@Body() body: any) {
    return this.infraService.createAgentServer(body);
  }

  @Put('agent-server/:id')
  async updateAgentServer(@Param('id') id: string, @Body() body: any) {
    return this.infraService.updateAgentServer(id, body);
  }

  @Delete('agent-server/:id')
  async deleteAgentServer(@Param('id') id: string) {
    return this.infraService.deleteAgentServer(id);
  }
}
