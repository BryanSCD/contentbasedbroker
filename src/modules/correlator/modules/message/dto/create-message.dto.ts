import { BaseMessageDto } from './base-message.dto';

export class CreateMessageDto extends BaseMessageDto {
  constructor() {
    super();
    this.on_match_remove = false;
    this.routing_key = '';
  }
}
