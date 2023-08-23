import { Injectable, PipeTransform } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common/exceptions';
import { Types } from 'mongoose';
import { SubscriptionService } from '../subscription.service';

@Injectable()
export class SubscriptionCheckIdPipe implements PipeTransform {
  constructor(private subscriptionService: SubscriptionService) {}

  /**
   * Check if subscription ID exists in the database
   * @param value Pipe value
   * @returns Subscription ObjectID
   */
  async transform(value: Types.ObjectId): Promise<Types.ObjectId> {
    if (!value || !(await this.subscriptionService.checkIfExists(value))) {
      throw new BadRequestException('Subscription id not found');
    }

    return value;
  }
}
