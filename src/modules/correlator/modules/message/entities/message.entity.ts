import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { OmitType, PartialType } from '@nestjs/swagger';
import { IsDate, IsString } from 'class-validator';
import { HydratedDocument, Types } from 'mongoose';
import { ValidatorTypeEnum } from '../../../validators/validator.manager';

export type MessageDocument = HydratedDocument<Message>;

@Schema()
export class Message {
  _id: Types.ObjectId;

  @Prop({ required: true })
  @IsString()
  type: ValidatorTypeEnum;

  @Prop({ required: true })
  content: string;

  @Prop()
  routing_key: string;

  @Prop({ required: true })
  on_match_remove: boolean;

  @Prop({ required: true })
  @IsDate()
  creation_date: Date;
}

export class PartialMessage extends OmitType(PartialType(Message), [
  '_id',
  'creation_date',
]) {}

export const MessageSchema = SchemaFactory.createForClass(Message);
