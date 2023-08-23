import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  PartialSubscription,
  Subscription,
  SubscriptionDocument,
} from './entities/subscription.entity';
import { ValidatorTypeEnum } from '../../validators/validator.manager';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<SubscriptionDocument>,
  ) {}

  /**
   * Check if a subscription exists in the database given an ID
   * @param id Id of the subscription
   * @returns true if exists, otherwise false
   */
  async checkIfExists(id: Types.ObjectId): Promise<boolean> {
    try {
      const subscription = await this.findOne(id);
      return !!subscription;
    } catch (_) {
      return false;
    }
  }

  /**
   * Add a new subscription to the database
   * @param body subscription dto
   * @returns The created subscription
   */
  async create(
    body: Omit<Subscription, '_id' | 'creation_date'>,
  ): Promise<Subscription> {
    const subscriptionCreated = {
      ...body,
      creation_date: new Date(),
    };
    return await this.subscriptionModel.create(subscriptionCreated);
  }

  /**
   * Get all the subscriptions
   * @returns All the subscriptions
   */
  async findAll(): Promise<Subscription[]> {
    return await this.subscriptionModel.find().exec();
  }

  /**
   * Get all the subscriptions from the DB by custom type
   * @returns All the messages
   */
  async findAllCustom(type: ValidatorTypeEnum): Promise<Subscription[]> {
    return this.subscriptionModel
      .find({
        type: type,
      })
      .sort({ priority: -1, creation_date: 1 })
      .exec();
  }

  /**
   * Returns an subscription given an ID
   * @param id Id of the subscription
   * @returns Subscription record
   */
  async findOne(id: Types.ObjectId): Promise<Subscription> {
    return await this.subscriptionModel.findById(id).exec();
  }

  /**
   * Modify an existing database subscription
   * @param id Id of the subscription
   * @param body Update subscription dto
   * @returns The modified subscription
   */
  async update(
    id: Types.ObjectId,
    body: Omit<PartialSubscription, '_id' | 'creation_date'>,
  ): Promise<Subscription> {
    return await this.subscriptionModel
      .findByIdAndUpdate(id, body, { new: true })
      .exec();
  }

  /**
   * Removes one subscription from the database
   * @param id The ID of the subscription
   */
  async remove(id: Types.ObjectId) {
    return await this.subscriptionModel.findByIdAndDelete(id).exec();
  }
}
