import { BaseSubscriptionDto } from './base-subscription.dto';

export class CreateSubscriptionDto extends BaseSubscriptionDto {
  constructor() {
    super();
    this.valid_until = null;
    this.priority = 0;
    this.matching_expression = '';
    this.read_old = false;
    this.on_match_remove = false;
  }
}
