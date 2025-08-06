import { Controller, Get, Version } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';

interface HealthCheckResponse {
  status: 'ok' | 'error';
  timestamp: string;
  version: string;
  environment: string;
  database: {
    connected: boolean;
  };
  uptime: number;
}

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService
  ) {}

  @Get()
  @Version('1')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Application health status',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['ok', 'error'] },
        timestamp: { type: 'string', format: 'date-time' },
        version: { type: 'string' },
        environment: { type: 'string' },
        database: {
          type: 'object',
          properties: {
            connected: { type: 'boolean' },
          },
        },
        uptime: { type: 'number' },
      },
    },
  })
  async healthCheck(): Promise<HealthCheckResponse> {
    const isDatabaseConnected = await this.prismaService.healthCheck();

    return {
      status: isDatabaseConnected ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      version: this.configService.get('API_VERSION', 'v1'),
      environment: this.configService.get('NODE_ENV', 'development'),
      database: {
        connected: isDatabaseConnected,
      },
      uptime: process.uptime(),
    };
  }
}