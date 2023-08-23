import * as jpath from 'jsonpath';
import * as json5 from 'json5';
import { Validator } from './validator';

export class JSONValidator implements Validator {
  checkSyntaxRules(rules: string[]) {
    for (const rule of rules) {
      if (!rule || typeof rule !== 'string') {
        throw new Error('Null rule or invalid.');
      }

      try {
        jpath.parse(rule);
      } catch (error) {
        const errorObject = error as Error;
        let message = errorObject.message;
        if (message.includes('Lexical error'))
          try {
            const sub_messages = errorObject.message.split('\n');
            const position = sub_messages[2].length - 1;

            message = `${
              sub_messages[0] +
              " In '" +
              sub_messages[1] +
              "' at position " +
              position +
              ' (' +
              sub_messages[1].charAt(position) +
              ')'
            }`;
          } catch (error) {}
        throw new Error(message);
      }
    }
  }

  /**
   * Checks if JSON is syntactically valid
   * @param content JSON content to be checked
   */
  checkSyntax(content: string) {
    const obj = json5.parse(content);
    if (Object.keys(obj).length == 0) throw new Error('Empty object.');
  }

  /**
   * Checks if JSON accomplish certain rules.
   * @param rules JSONPath rules
   * @param content JSON content
   * @returns True if all rules matches
   */
  check(content: string, rules: string[]): boolean {
    const json = json5.parse(content);
    for (const rule of rules) {
      const nodes = jpath.nodes(json, rule);
      if (Array.isArray(nodes) && nodes.length === 0) {
        return false;
      }
    }
    return true;
  }
}
