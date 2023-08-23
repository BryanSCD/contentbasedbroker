import { Module } from '@nestjs/common';
import { CorrelatorService } from './correlator.service';
import { MessageModule } from './modules/message/message.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';

@Module({
  imports: [MessageModule, SubscriptionModule],
  providers: [CorrelatorService],
  exports: [CorrelatorService],
})
export class CorrelatorModule {}
