import { IsString, IsNotEmpty, IsInt, IsIn, IsOptional  } from '@nestjs/class-validator';


export class configValidation {
  @IsString()
  @IsNotEmpty()
  NODE_ENV!: string;
  @IsInt()
  @IsOptional()
  PORT:number = 3000;
  @IsString()
  @IsOptional()
  API_VERSION: string = 'v1';
  @IsString()
  @IsNotEmpty()
  DATABASE_URL!: string;
  @IsString()
  @IsOptional()
  CORS_ORIGIN: string= "http://localhost:5173";
  @IsInt()
  RATE_LIMIT_MAX: number = 100;
  @IsInt()
  @IsOptional()
  RATE_LIMIT_WINDOW: number = 60000;
  @IsIn(['error', 'warn', 'log', 'debug', 'verbose'])
  @IsOptional()
  LOG_LEVEL: string = 'log';
}