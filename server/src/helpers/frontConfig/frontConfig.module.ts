import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { FrontConfigService } from './frontConfig.service';

@Module({
  imports: [ConfigModule],
  providers: [FrontConfigService],
  exports: [FrontConfigService],
})
export class FrontConfigModule {}
