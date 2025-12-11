import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FrontConfigService {
  private readonly logger = new Logger(CloudinaryService.name);
}
