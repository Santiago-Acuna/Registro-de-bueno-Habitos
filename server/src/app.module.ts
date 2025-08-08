import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { DatabaseModule } from './infrastructure/database/database.module';
import { HabitsModule } from './habits/habits.module';
import { BooksModule } from './books/books.module';
import { HealthController } from './infrastructure/health/health.controller';
import { configValidation } from './infrastructure/config/config.validation';

@Module({
  imports: [
    // Configuration module with validation
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: configValidation,
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
    }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      useFactory: () => ({
        throttlers: [
          {
            ttl: parseInt(process.env['RATE_LIMIT_WINDOW'] || '60000', 10), // 1 minute
            limit: parseInt(process.env['RATE_LIMIT_MAX'] || '100', 10), // 100 requests
          },
        ],
      }),
    }),

    // Database connection
    DatabaseModule,

    // Feature modules
    HabitsModule,
    BooksModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}