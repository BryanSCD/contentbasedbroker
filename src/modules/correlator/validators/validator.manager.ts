import { Validator } from './validator';
import { JSONValidator } from './json.validator';
import { XmlValidator } from './xml.validator';
import { TextValidator } from './text.validator';

/**
 * Validator types
 */
export enum ValidatorTypeEnum {
  XML = 'XML',
  JSON = 'JSON',
  PLAIN_TEXT = 'PLAIN_TEXT',
}

/**
 * Get Validator by type
 */
export const getValidator = (type: ValidatorTypeEnum): Validator => {
  switch (type) {
    case ValidatorTypeEnum.XML:
      return new XmlValidator();
    case ValidatorTypeEnum.JSON:
      return new JSONValidator();
    case ValidatorTypeEnum.PLAIN_TEXT:
      return new TextValidator();
    default:
      throw Error(`Validator for type ${type} not implemented yet.`);
  }
};
