import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiParam } from '@nestjs/swagger';
import { Response } from 'express';
import { Types } from 'mongoose';
import { ParseObjectIdPipe } from '../../../../pipes/ParseObjectIdPipe';
import { SwaggerTagsEnum } from '../../../../utils/swagger.util';
import { CorrelatorService } from '../../correlator.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Message } from './entities/message.entity';
import { MessageService } from './message.service';
import { CreateMessagePipe } from './pipes/create-message-pipe';
import { MessageCheckIdPipe } from './pipes/message-check-id-pipe';
import { UpdateMessagePipe } from './pipes/update-message-pipe';

@Controller('message')
export class MessageController {
  constructor(
    private readonly messageService: MessageService,
    private readonly correlatorService: CorrelatorService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Adds a new message to the database',
    tags: [SwaggerTagsEnum.Message],
  })
  async create(
    @Body(CreateMessagePipe) body: CreateMessageDto,
    @Res() response: Response,
  ) {
    const savedMessage = await this.messageService.create(body);
    const matched = await this.correlatorService.notifyMessage(savedMessage);

    if (savedMessage.on_match_remove && matched) {
      await this.messageService.remove(savedMessage._id);
      response.status(HttpStatus.OK).send('');
    } else {
      response.status(HttpStatus.CREATED).send(savedMessage._id.toString());
    }
  }

  /**
   * Get all the messages from the database
   */
  @Get()
  @ApiOperation({
    summary: 'Get all the messages from the database',
    tags: [SwaggerTagsEnum.Message],
  })
  async findAll(): Promise<Message[]> {
    return await this.messageService.findAll();
  }

  /**
   * Finds a message from the database
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Finds a message from the database',
    tags: [SwaggerTagsEnum.Message],
  })
  @ApiParam({
    name: 'id',
    description: 'Id of the message',
    type: String,
  })
  async findOne(
    @Param('id', ParseObjectIdPipe, MessageCheckIdPipe) id: Types.ObjectId,
  ): Promise<Message> {
    return await this.messageService.findOne(id);
  }

  /**
   * Modifies an existing message of the database
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Modifies an existing message of the database',
    tags: [SwaggerTagsEnum.Message],
  })
  @ApiParam({
    name: 'id',
    description: 'Id of the message',
    type: String,
  })
  async update(
    @Param('id', ParseObjectIdPipe, MessageCheckIdPipe)
    id: Types.ObjectId,
    @Body(UpdateMessagePipe) updateMessage: UpdateMessageDto,
    @Res() response: Response,
  ) {
    const savedMessage = await this.messageService.update(
      id as unknown as Types.ObjectId,
      updateMessage,
    );

    const matched = await this.correlatorService.notifyMessage(savedMessage);

    if (savedMessage.on_match_remove && matched) {
      await this.messageService.remove(id);
    }
    response.status(HttpStatus.OK).send('');
  }

  /**
   * Deletes a message from the database
   */
  @Delete(':id')
  @ApiOperation({
    summary: 'Deletes a message from the database',
    tags: [SwaggerTagsEnum.Message],
  })
  @ApiParam({
    name: 'id',
    description: 'Id of the message',
    type: String,
  })
  async remove(
    @Param('id', ParseObjectIdPipe, MessageCheckIdPipe) id: Types.ObjectId,
  ) {
    await this.messageService.remove(id);
  }
}
