import {
  ValidatorTypeEnum,
  getValidator,
} from 'src/modules/correlator/validators/validator.manager';
import { BaseMessageDto } from '../dto/base-message.dto';

export class BaseMessageDtoBuilder {
  message_dto: BaseMessageDto = null;
  constructor() {
    this.message_dto = new BaseMessageDto();
  }

  set_type(type: any) {
    const upper_type = (type as string).toUpperCase();
    const validatorType = ValidatorTypeEnum[upper_type];
    if (validatorType === undefined)
      throw new Error(`Type '${type}' not found.`);
    this.message_dto.type = validatorType;
    return this;
  }

  set_content(content: any) {
    const stringContent = String(content).trim();
    if (!content || !stringContent) {
      throw new Error('Invalid message content');
    }
    this.message_dto.content = stringContent;
    return this;
  }

  set_routing_key(routing_key: any) {
    let stringRoutingKey = String(routing_key).trim();
    if (!routing_key || !stringRoutingKey) {
      stringRoutingKey = '';
    }
    this.message_dto.routing_key = stringRoutingKey;
    return this;
  }

  set_on_match_remove(match_remove: any) {
    const stringMatchRemove = String(match_remove).trim();
    if (
      match_remove == null ||
      match_remove == undefined ||
      stringMatchRemove == 'false'
    )
      this.message_dto.on_match_remove = false;
    else if (stringMatchRemove == 'true')
      this.message_dto.on_match_remove = true;
    else throw new Error('Invalid message OnMatchRemove');
    return this;
  }

  mapDTO(dto: Partial<BaseMessageDto>) {
    for (const prop in dto) {
      if (prop != undefined) {
        if (`set_${prop}` in this) this[`set_${prop}`](dto[prop]);
        else throw new Error('Property unknown: ' + prop);
      }
    }
    return this;
  }

  build() {
    if (this.message_dto.type || this.message_dto.content) {
      if (!this.message_dto.type || !this.message_dto.content) {
        throw new Error('Type and content should always be together');
      }

      const validator = getValidator(this.message_dto.type);
      validator.checkSyntax(this.message_dto.content);
    }
    return this.message_dto;
  }
}
