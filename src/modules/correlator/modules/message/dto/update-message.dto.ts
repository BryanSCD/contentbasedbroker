import { PartialType } from '@nestjs/swagger';
import { BaseMessageDto } from './base-message.dto';

export class UpdateMessageDto extends PartialType(BaseMessageDto) {
  constructor() {
    super();
  }
}
