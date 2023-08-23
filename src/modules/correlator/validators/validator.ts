export interface Validator {
  checkSyntaxRules(rules: string[]): void;
  checkSyntax(content: string): void;
  check(content: string, rules: string[]): boolean;
}
