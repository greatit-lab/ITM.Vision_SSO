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
import { Prisma } from '@prisma/client'; // [추가] Prisma 타입 가져오기

@Controller('infra')
export class InfraController {
  constructor(private readonly infraService: InfraService) {}

  // 1. SDWT
  @Get('sdwt')
  async getSdwts() {
    return await this.infraService.getSdwts();
  }

  // 2. Infra Server List (cfg_infra_server)
  @Get('server-list')
  async getInfraServers() {
    return await this.infraService.getInfraServers();
  }

  @Post('server-list')
  async createInfraServer(@Body() body: Prisma.CfgInfraServerCreateInput) {
    // any -> Prisma.CfgInfraServerCreateInput 으로 변경
    return await this.infraService.createInfraServer(body);
  }

  @Put('server-list/:id')
  async updateInfraServer(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Prisma.CfgInfraServerUpdateInput, // any -> Prisma.CfgInfraServerUpdateInput 으로 변경
  ) {
    return await this.infraService.updateInfraServer(id, body);
  }

  @Delete('server-list/:id')
  async deleteInfraServer(@Param('id', ParseIntPipe) id: number) {
    return await this.infraService.deleteInfraServer(id);
  }

  // 3. Agent Server (Per Eqp Config)
  @Get('agent-server')
  async getAgentServers() {
    return await this.infraService.getAgentServers();
  }

  @Post('agent-server')
  async createAgentServer(@Body() body: Prisma.CfgServerCreateInput) {
    // any -> Prisma.CfgServerCreateInput 으로 변경
    return await this.infraService.createAgentServer(body);
  }

  @Put('agent-server/:id')
  async updateAgentServer(
    @Param('id') id: string,
    @Body() body: Prisma.CfgServerUpdateInput, // any -> Prisma.CfgServerUpdateInput 으로 변경
  ) {
    return await this.infraService.updateAgentServer(id, body);
  }

  @Delete('agent-server/:id')
  async deleteAgentServer(@Param('id') id: string) {
    return await this.infraService.deleteAgentServer(id);
  }
}
