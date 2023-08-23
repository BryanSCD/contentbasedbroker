import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ValidatorTypeEnum } from '../../../validators/validator.manager';

export class BaseSubscriptionDto {
  @ApiProperty({
    description: 'Type of the message',
    required: true,
    type: 'string',
  })
  @IsString()
  type: ValidatorTypeEnum;

  @ApiProperty({
    description: 'Rules content',
    type: Array<string>,
    required: true,
  })
  rules: string[];

  @ApiProperty({
    description: 'Address to be called after a succesful match',
    required: false,
    type: 'string',
  })
  @IsOptional()
  @IsString()
  callback: string;

  @ApiProperty({
    description: 'ISO 8601 UTC date when the request expires',
    required: false,
    type: 'string',
    format: 'date-time',
  })
  @IsOptional()
  @IsString()
  valid_until: string;

  @ApiProperty({
    description:
      'Number from 0..255 where 0 is the lowest priority and 255 the highest. Default 0',
    required: false,
    type: 'number',
    minimum: 0,
    maximum: 255,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(255)
  @Type(() => Number)
  priority: number;

  @ApiProperty({
    description: 'Regular expression to match pattern string',
    required: false,
    type: 'string',
  })
  @IsOptional()
  @IsString()
  matching_expression: string;

  @ApiProperty({
    description: 'If true reads old existing messages once added',
    required: false,
    type: 'boolean',
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) =>
    value === 'false' ? false : value === 'true' ? true : value,
  )
  read_old: boolean;

  @ApiProperty({
    description: 'Remove subscription once matched',
    required: false,
    type: 'boolean',
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) =>
    value === 'false' ? false : value === 'true' ? true : value,
  )
  on_match_remove: boolean;
}
