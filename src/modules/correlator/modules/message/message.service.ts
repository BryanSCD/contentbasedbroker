import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Message,
  MessageDocument,
  PartialMessage,
} from './entities/message.entity';

import { ValidatorTypeEnum } from '../../validators/validator.manager';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name)
    private messageModel: Model<MessageDocument>,
  ) {}

  /**
   * Check if there is an entry in the database given an ID
   * @param id Id of the message
   * @returns True if message exists
   */
  async checkIfExists(id: Types.ObjectId): Promise<boolean> {
    try {
      const message = await this.findOne(id);
      return !!message;
    } catch (_) {
      return false;
    }
  }

  /**
   * Adds a new message into the database
   * @param body Create message dto
   * @returns The created message
   */
  async create(body: Omit<Message, '_id' | 'creation_date'>): Promise<Message> {
    const newMessage = {
      ...body,
      creation_date: new Date(),
    };
    return await this.messageModel.create(newMessage);
  }

  /**
   * Get all the messages from the DB
   * @returns All the messages
   */
  async findAll(): Promise<Message[]> {
    return this.messageModel.find().exec();
  }

  /**
   * Get all the messages from the DB by custom type and matching expression
   * @returns All the messages
   */
  async findAllCustom(
    type: ValidatorTypeEnum,
    matching_expression: string,
  ): Promise<Message[]> {
    const findQuery = {
      type: type,
    };

    if (matching_expression)
      findQuery['routing_key'] = { $regex: matching_expression };

    return this.messageModel.find(findQuery).sort({ creation_date: 1 }).exec();
  }

  /**
   * Returns a message given an ID
   * @param id Id of the message
   * @returns Message record
   */
  async findOne(id: Types.ObjectId): Promise<Message> {
    return await this.messageModel.findById(id).exec();
  }

  /**
   * Modifies an existing message from the database
   * @param id Id of the message
   * @param body Update message dto
   * @returns The modified message
   */
  async update(id: Types.ObjectId, body: PartialMessage): Promise<Message> {
    return await this.messageModel
      .findByIdAndUpdate(id, body, { new: true })
      .exec();
  }

  /**
   * Removes a message given an ID
   * @param id ID of the message
   */
  async remove(id: Types.ObjectId) {
    return await this.messageModel.findByIdAndDelete(id).exec();
  }
}
