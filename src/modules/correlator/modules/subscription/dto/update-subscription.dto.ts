import { PartialType } from '@nestjs/swagger';
import { BaseSubscriptionDto } from './base-subscription.dto';

export class UpdateSubscriptionDto extends PartialType(BaseSubscriptionDto) {
  constructor() {
    super();
  }
}
