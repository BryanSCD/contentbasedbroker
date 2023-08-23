import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { OmitType, PartialType } from '@nestjs/swagger';
import { IsDate, IsString } from 'class-validator';
import { HydratedDocument, Types } from 'mongoose';
import { ValidatorTypeEnum } from '../../../validators/validator.manager';

export type SubscriptionDocument = HydratedDocument<Subscription>;

@Schema()
export class Subscription {
  _id: Types.ObjectId;

  @Prop({ required: true })
  @IsString()
  type: ValidatorTypeEnum;

  @Prop({ required: true })
  rules: string[];

  @Prop({ required: true })
  callback: string;

  @Prop()
  @IsDate()
  valid_until: Date;

  @Prop({ required: true })
  priority: number;

  @Prop()
  matching_expression: string;

  @Prop({ required: true })
  on_match_remove: boolean;

  @Prop({ required: true })
  @IsDate()
  creation_date: Date;
}

export class PartialSubscription extends OmitType(PartialType(Subscription), [
  '_id',
  'creation_date',
]) {}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);
