import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { BaseMessageDto } from '../dto/base-message.dto';
import { UpdateMessageDto } from '../dto/update-message.dto';
import { BaseMessageDtoBuilder } from '../utils/base-message.dto.builder';

@Injectable()
export class UpdateMessagePipe implements PipeTransform {
  /**
   * Check if body of message is valid to update.
   * @param uncheckedMessage body
   * @returns body
   */
  async transform(
    uncheckedMessage: Partial<BaseMessageDto>,
  ): Promise<UpdateMessageDto> {
    try {
      const messageBuilder = new BaseMessageDtoBuilder();
      messageBuilder.mapDTO(uncheckedMessage);
      return messageBuilder.build();
    } catch (error) {
      throw new BadRequestException('Invalid modify request: ' + error.message);
    }
  }
}
