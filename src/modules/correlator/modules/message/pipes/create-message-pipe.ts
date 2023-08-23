import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { BaseMessageDto } from '../dto/base-message.dto';
import { CreateMessageDto } from '../dto/create-message.dto';
import { BaseMessageDtoBuilder } from '../utils/base-message.dto.builder';

@Injectable()
export class CreateMessagePipe implements PipeTransform {
  /**
   * Check if body of message is valid to create.
   * @param uncheckedMessage body
   * @returns body
   */
  async transform(uncheckedMessage: BaseMessageDto): Promise<CreateMessageDto> {
    try {
      const partialMessageBuilder = new BaseMessageDtoBuilder();
      partialMessageBuilder.mapDTO(uncheckedMessage);
      return partialMessageBuilder.build() as CreateMessageDto;
    } catch (error) {
      throw new BadRequestException('Invalid create request: ' + error.message);
    }
  }
}
