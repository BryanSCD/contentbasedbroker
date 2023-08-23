import { Injectable, PipeTransform } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common/exceptions';
import { Types } from 'mongoose';
import { MessageService } from '../message.service';

@Injectable()
export class MessageCheckIdPipe implements PipeTransform {
  constructor(private messageService: MessageService) {}

  /**
   * Check if ID exists in the database
   * @param value ID
   * @returns ID
   */
  async transform(value: Types.ObjectId): Promise<Types.ObjectId> {
    if (!value || !(await this.messageService.checkIfExists(value))) {
      throw new BadRequestException('Message id not found');
    }

    return value;
  }
}
