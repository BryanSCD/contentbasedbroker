import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ValidatorTypeEnum } from '../../../validators/validator.manager';

export class BaseMessageDto {
  @ApiProperty({ description: 'Message type' })
  @IsString()
  @IsNotEmpty()
  type: ValidatorTypeEnum;

  @ApiProperty({ description: 'Message content' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'In case of matching, the message is removed if true',
    default: false,
  })
  @IsBoolean()
  @IsNotEmpty()
  @IsOptional()
  on_match_remove: boolean;

  @ApiProperty({ description: 'Routing pattern', default: '' })
  @IsString()
  @IsOptional()
  routing_key: string;
}
