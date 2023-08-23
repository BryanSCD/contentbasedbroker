import {
  ValidatorTypeEnum,
  getValidator,
} from 'src/modules/correlator/validators/validator.manager';
import { BaseSubscriptionDto } from '../dto/base-subscription.dto';

export class BaseSubscriptionDtoBuilder {
  subscription_dto: BaseSubscriptionDto = null;
  constructor() {
    this.subscription_dto = new BaseSubscriptionDto();
  }

  set_type(type: any) {
    const upper_type = (type as string).toUpperCase();
    const validatorType = ValidatorTypeEnum[upper_type];
    if (validatorType === undefined)
      throw new Error(`Type '${type}' not found.`);
    this.subscription_dto.type = validatorType;
    return this;
  }

  set_rules(rules: any) {
    const array_rules = [].concat(rules);

    if (array_rules.length == 0) {
      throw Error('Empty rules');
    }
    this.subscription_dto.rules = array_rules;
    return this;
  }

  set_callback(callback: any) {
    const stringCallback = String(callback).trim();
    if (!stringCallback) throw Error('Empty callback');
    this.subscription_dto.callback = String(callback);
    return this;
  }

  set_valid_until(valid_until: any) {
    if (!valid_until) {
      this.subscription_dto.valid_until = null;
    } else {
      try {
        const timestamp = Date.parse(valid_until as string);

        if (isNaN(timestamp) == true) throw Error('Date not valid.');

        if (timestamp < new Date().getTime()) throw Error('Date expired.');

        this.subscription_dto.valid_until = valid_until;
      } catch (error) {
        throw new Error(`Wrong date: ${error.message}`);
      }
    }
    return this;
  }

  set_priority(priority: any) {
    this.subscription_dto.priority = Number(priority);
    return this;
  }

  set_matching_expression(matching_expression: any) {
    const stringMatchingExpression = String(matching_expression).trim();
    try {
      new RegExp(stringMatchingExpression);
    } catch (error) {
      throw new Error('Invalid matching_expression.');
    }
    this.subscription_dto.matching_expression = stringMatchingExpression
      ? stringMatchingExpression
      : '';
    return this;
  }

  set_read_old(read_old: any) {
    const stringReadOld = String(read_old).trim();
    if (
      stringReadOld == null ||
      stringReadOld == undefined ||
      stringReadOld == 'false'
    )
      this.subscription_dto.read_old = false;
    else if (stringReadOld == 'true') this.subscription_dto.read_old = true;
    else throw new Error('Invalid message ReadOld');
    return this;
  }

  set_on_match_remove(match_remove: any) {
    const stringMatchRemove = String(match_remove).trim();
    if (
      match_remove == null ||
      match_remove == undefined ||
      stringMatchRemove == 'false'
    )
      this.subscription_dto.on_match_remove = false;
    else if (stringMatchRemove == 'true')
      this.subscription_dto.on_match_remove = true;
    else throw new Error('Invalid message OnMatchRemove');
    return this;
  }

  mapDTO(dto: Partial<BaseSubscriptionDto>) {
    for (const prop in dto) {
      if (prop != undefined) {
        if (`set_${prop}` in this) this[`set_${prop}`](dto[prop]);
        else throw new Error('Property unknown: ' + prop);
      }
    }
    return this;
  }

  build() {
    if (this.subscription_dto.type || this.subscription_dto.rules) {
      if (!this.subscription_dto.type || !this.subscription_dto.rules) {
        throw new Error('Type and content should always be together');
      }
      const validator = getValidator(this.subscription_dto.type);
      try {
        validator.checkSyntaxRules(this.subscription_dto.rules as string[]);
      } catch (error) {
        throw new Error('Rule error: ' + error.message);
      }
    }
    return this.subscription_dto;
  }
}
