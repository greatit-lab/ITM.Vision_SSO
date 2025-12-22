// backend/src/infra/infra.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { InfraService } from './infra.service';
import { Prisma } from '@prisma/client';

@Controller('infra')
export class InfraController {
  constructor(private readonly infraService: InfraService) {}

  // 1. SDWT
  @Get('sdwt')
  async getSdwts() {
    return await this.infraService.getSdwts();
  }

  // 3. Agent Server (Per Eqp Config)
  @Get('agent-server')
  async getAgentServers() {
    return await this.infraService.getAgentServers();
  }

  @Post('agent-server')
  async createAgentServer(@Body() body: Prisma.CfgServerCreateInput) {
    return await this.infraService.createAgentServer(body);
  }

  @Put('agent-server/:id')
  async updateAgentServer(
    @Param('id') id: string,
    @Body() body: Prisma.CfgServerUpdateInput,
  ) {
    return await this.infraService.updateAgentServer(id, body);
  }

  @Delete('agent-server/:id')
  async deleteAgentServer(@Param('id') id: string) {
    return await this.infraService.deleteAgentServer(id);
  }
}
