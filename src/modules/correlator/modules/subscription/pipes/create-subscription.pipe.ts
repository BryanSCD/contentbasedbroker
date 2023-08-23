import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { BaseSubscriptionDto } from '../dto/base-subscription.dto';
import { CreateSubscriptionDto } from '../dto/create-subscription.dto';
import { BaseSubscriptionDtoBuilder } from '../utils/subscription.dto.builder';

@Injectable()
export class CreateSubscriptionPipe implements PipeTransform {
  /**
   * Check if the query parameters to create the subscription are valid.
   * @param value pipe value
   * @returns subscription
   */
  async transform(
    uncheckedSubscription: Partial<BaseSubscriptionDto>,
  ): Promise<CreateSubscriptionDto> {
    try {
      const partialMessageBuilder = new BaseSubscriptionDtoBuilder();
      partialMessageBuilder.mapDTO(uncheckedSubscription);
      return partialMessageBuilder.build() as CreateSubscriptionDto;
    } catch (error) {
      throw new BadRequestException('Invalid create request: ' + error.message);
    }
  }
}
