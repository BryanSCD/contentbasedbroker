import { XMLValidator } from 'fast-xml-parser';
import { DOMParserImpl as dom } from 'xmldom-ts';
import * as xpath from 'xpath-ts';
import { Validator } from './validator';

export class XmlValidator implements Validator {
  checkSyntaxRules(rules: string[]) {
    const xml = '<book><title>Bryan Duran Test</title></book>';
    const doc = new dom().parseFromString(xml);
    for (const rule of rules) {
      if (!rule || typeof rule !== 'string') {
        throw new Error('Null rule or invalid.');
      }

      try {
        xpath.select(rule, doc);
      } catch (error) {
        error.message = error.message + ". In '" + rule + "'.";
        throw error;
      }
    }
  }

  /**
   * Checks if XML is syntactically valid
   * @param content Xml content to be checked
   */
  checkSyntax(content: string) {
    const validation = XMLValidator.validate(content);
    if (validation !== true) {
      throw new Error(JSON.stringify(validation.err));
    }
  }

  /**
   * Checks if XML accomplish certain rules.
   * @param rules XPath rules
   * @param content XML content
   * @returns True if all rules matches
   */
  check(content: string, rules: string[]): boolean {
    const doc = new dom().parseFromString(content);
    for (const rule of rules) {
      const nodes = xpath.select(rule, doc);
      if (Array.isArray(nodes) && nodes.length === 0) {
        return false;
      }
    }
    return true;
  }
}
