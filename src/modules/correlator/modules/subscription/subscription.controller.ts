import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Headers,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiParam } from '@nestjs/swagger';
import { Response } from 'express';
import { Types } from 'mongoose';
import { ParseObjectIdPipe } from '../../../../pipes/ParseObjectIdPipe';
import { SwaggerTagsEnum } from '../../../../utils/swagger.util';
import { CorrelatorService } from '../../correlator.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { Subscription } from './entities/subscription.entity';
import { CreateSubscriptionPipe } from './pipes/create-subscription.pipe';
import { SubscriptionCheckIdPipe } from './pipes/subscription-check-id-pipe';
import { UpdateSubscriptionPipe } from './pipes/update-subscription.pipe';
import { SubscriptionService } from './subscription.service';

@Controller('subscription')
export class SubscriptionController {
  constructor(
    private readonly correlatorService: CorrelatorService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Creates a new subscription.',
    tags: [SwaggerTagsEnum.Subscription],
  })
  @ApiHeader({
    name: 'CPEE-CALLBACK',
    description: 'URL with the callback.',
    required: false,
  })
  async create(
    @Headers('CPEE-CALLBACK') cpeeCallback: string,
    @Query(CreateSubscriptionPipe)
    createSubscriptionDto: CreateSubscriptionDto,
    @Res() response: Response,
  ) {
    if (!cpeeCallback && !createSubscriptionDto.callback) {
      throw new BadRequestException('No callback provided.');
    }
    const tempSubscription: Omit<Subscription, '_id' | 'creation_date'> = {
      ...createSubscriptionDto,
      callback: cpeeCallback ? cpeeCallback : createSubscriptionDto.callback,
      valid_until: createSubscriptionDto.valid_until
        ? new Date(createSubscriptionDto.valid_until)
        : null,
    };

    const subscription = await this.subscriptionService.create(
      tempSubscription,
    );

    if (cpeeCallback)
      response
        .header({ 'CPEE-CALLBACK': 'true' })
        .status(HttpStatus.CREATED)
        .send(subscription._id.toString());

    if (createSubscriptionDto.read_old) {
      const matchedSubscription =
        await this.correlatorService.notifySubscription(subscription);
      if (matchedSubscription && subscription.on_match_remove) {
        await this.subscriptionService.remove(subscription._id);
        response.status(HttpStatus.OK).send('');
        return;
      }
    }

    if (!cpeeCallback)
      response.status(HttpStatus.CREATED).send(subscription._id.toString());
  }

  /**
   * Get all the subscriptions from the database
   */
  @Get()
  @ApiOperation({
    summary: 'Get all the subscriptions from the database',
    tags: [SwaggerTagsEnum.Subscription],
  })
  async findAll() {
    return await this.subscriptionService.findAll();
  }

  /**
   * Search for a subscription in the database
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Search for a subscription in the database',
    tags: [SwaggerTagsEnum.Subscription],
  })
  @ApiParam({
    name: 'id',
    description: 'Id of the subscription',
    type: String,
  })
  async findOne(
    @Param('id', ParseObjectIdPipe, SubscriptionCheckIdPipe)
    id: Types.ObjectId,
  ) {
    return await this.subscriptionService.findOne(id);
  }

  /**
   * Modify an existing database subscription
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Modify an existing database subscription',
    tags: [SwaggerTagsEnum.Subscription],
  })
  @ApiParam({
    name: 'id',
    description: 'Id of the subscription',
    type: String,
  })
  @ApiHeader({
    name: 'CPEE-CALLBACK',
    description: 'URL with the callback.',
    required: false,
  })
  async update(
    @Param('id', ParseObjectIdPipe, SubscriptionCheckIdPipe)
    id: Types.ObjectId,
    @Headers('CPEE-CALLBACK') cpeeCallback: string,
    @Query(UpdateSubscriptionPipe)
    updateRequestSubscriptionDto: UpdateSubscriptionDto,
    @Res() response: Response,
  ) {
    const requestSubscriptionDto: any = {
      ...updateRequestSubscriptionDto,
    };

    if (cpeeCallback !== undefined) {
      if (!cpeeCallback) {
        throw new BadRequestException('CPEE callback empty (remove header)');
      }
      requestSubscriptionDto.callback = cpeeCallback;
    }

    if (updateRequestSubscriptionDto.valid_until) {
      requestSubscriptionDto.valid_until = new Date(
        updateRequestSubscriptionDto.valid_until,
      );
    }

    const subscription = await this.subscriptionService.update(
      id,
      requestSubscriptionDto,
    );

    if (updateRequestSubscriptionDto.read_old) {
      const matchedSubscription =
        await this.correlatorService.notifySubscription(subscription);

      if (matchedSubscription && subscription.on_match_remove) {
        await this.subscriptionService.remove(id);
      }
    }

    response.status(HttpStatus.OK).send();
  }

  /**
   * Deletes a subscription from the database
   */
  @Delete(':id')
  @ApiOperation({
    summary: 'Deletes a subscription from the database',
    tags: [SwaggerTagsEnum.Subscription],
  })
  @ApiParam({
    name: 'id',
    description: 'Id of the subscription',
    type: String,
  })
  async remove(
    @Param('id', ParseObjectIdPipe, SubscriptionCheckIdPipe)
    id: Types.ObjectId,
  ) {
    await this.subscriptionService.remove(id);
  }
}
