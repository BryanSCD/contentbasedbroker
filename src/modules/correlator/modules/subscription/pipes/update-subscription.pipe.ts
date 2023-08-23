import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { BaseSubscriptionDto } from '../dto/base-subscription.dto';
import { UpdateSubscriptionDto } from '../dto/update-subscription.dto';
import { BaseSubscriptionDtoBuilder } from '../utils/subscription.dto.builder';

@Injectable()
export class UpdateSubscriptionPipe implements PipeTransform {
  /**
   * Check if the body of the update subscription is valid
   * @param value Pipe value
   * @returns Checked subscription
   */
  async transform(
    uncheckedSubscription: Partial<BaseSubscriptionDto>,
  ): Promise<UpdateSubscriptionDto> {
    try {
      const partialMessageBuilder = new BaseSubscriptionDtoBuilder();
      partialMessageBuilder.mapDTO(uncheckedSubscription);
      return partialMessageBuilder.build() as UpdateSubscriptionDto;
    } catch (error) {
      throw new BadRequestException('Invalid create request: ' + error.message);
    }
  }
}
