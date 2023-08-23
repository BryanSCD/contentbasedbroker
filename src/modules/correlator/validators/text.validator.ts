import { Validator } from './validator';

export class TextValidator implements Validator {
  checkSyntaxRules(rules: string[]) {
    for (let rule of rules) {
      rule = rule.trim();
      if (!rule || typeof rule !== 'string') {
        throw new Error('Null rule or invalid.');
      }

      new RegExp(rule);
    }
  }

  /**
   * Checks if text is valid
   * @param content Content to be checked
   */
  checkSyntax(content: string) {
    if (!content) throw new Error('Empty content');
  }

  /**
   * Checks if contain accomplish certain rules.
   * @param rules RegExpression rules
   * @param content content
   * @returns True if all rules matches
   */
  check(content: string, rules: string[]): boolean {
    for (const rule of rules) {
      const regExpression = new RegExp(rule);
      const matches = regExpression.test(content);
      if (!matches) {
        return false;
      }
    }
    return true;
  }
}
