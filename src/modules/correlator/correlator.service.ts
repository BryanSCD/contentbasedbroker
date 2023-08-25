import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { ConnectionHandler } from '../../utils/connection-handler.util';
import { Message } from './modules/message/entities/message.entity';
import { MessageService } from './modules/message/message.service';
import { Subscription } from './modules/subscription/entities/subscription.entity';
import { SubscriptionService } from './modules/subscription/subscription.service';
import { getValidator } from './validators/validator.manager';

/**
 * Callback when request successful
 */
type ConnectionHandlerCallback = () => void;

@Injectable()
export class CorrelatorService {
  constructor(
    private readonly messageService: MessageService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  /**
   * Notifies to the correlator a new message in the DB
   * @param message Added message
   */
  async notifyMessage(message: Message) {
    const subscriptions = await this.subscriptionService.findAllCustom(
      message.type,
    );
    let matched = false;
    for (const sub of subscriptions) {
      if (sub.valid_until && sub.valid_until < new Date()) {
        this.subscriptionService.remove(sub._id);
      } else {
        const regex = new RegExp(sub.matching_expression);
        if (!sub.matching_expression || regex.test(message.routing_key)) {
          const validator = getValidator(message.type);
          if (validator.check(message.content, sub.rules)) {
            this.sendPutRequest(sub.callback, [message]);
            if (sub.on_match_remove) {
              await this.subscriptionService.remove(sub._id);
            }
            matched = true;
          }
        }
      }
    }

    return matched;
  }

  /**
   * Notifies to the correlator a new subscription in the DB, only if it wants to recover existing messages
   * @param message Added subscription
   */
  async notifySubscription(subscription: Subscription): Promise<boolean> {
    const messages = await this.messageService.findAllCustom(
      subscription.type,
      subscription.matching_expression,
    );

    const validator = getValidator(subscription.type);
    const filteredMessages = messages.filter((message) =>
      validator.check(message.content, subscription.rules),
    );

    if (filteredMessages.length > 0) {
      await this.sendPutRequest(subscription.callback, filteredMessages);
      for (const message of filteredMessages) {
        if (message.on_match_remove) {
          await this.messageService.remove(message._id);
        }
      }
      return true;
    }
    return false;
  }

  /**
   * Send a PUT request to a certain host
   * @param message Message to be sent
   * @param host URL of the callback
   * @param callback Callback once finished
   */
  private async sendPutRequest(
    host: string,
    messages: Message[],
  ): Promise<AxiosResponse<any, any>> {
    const messages_content = messages.map((message) => message.content);
    const res = await ConnectionHandler.putRequest(
      host,
      JSON.stringify(messages_content),
    );
    return res;
  }
}
