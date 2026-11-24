import RawAsyncValidator from 'async-validator';
import type { RuleObject } from './interface';

// Remove incorrect original ts define
const AsyncValidator: any = RawAsyncValidator;

async function validateRule(name: string, value: any, rule: RuleObject) {
  const cloneRule = { ...rule };

  // Bug of `async-validator`
  delete (cloneRule as any).ruleIndex;
  delete (cloneRule as any).trigger;

  const validator = new AsyncValidator({
    [name]: [cloneRule],
  });

  let result = [];

  try {
    await validator.validate({ [name]: value });
  } catch (errObj: any) {
    if (errObj.errors) {
      result = errObj.errors.map(({ message }: { message: any }) => message);
    } else {
      result = [cloneRule.message || '校验错误'];
    }
  }

  if (result.length > 0) {
    return result[0];
  }

  return '';
}

export async function validateRules(name: string, value: any, rules: RuleObject[]) {
  // Fill rule with context
  const filledRules: RuleObject[] = rules
    .map((currentRule, ruleIndex) => {
      const cloneRule = {
        ...currentRule,
        ruleIndex,
      };
      return cloneRule;
    })
    .sort(({ warningOnly: w1, ruleIndex: i1 }, { warningOnly: w2, ruleIndex: i2 }) => {
      if (!!w1 === !!w2) {
        // Let keep origin order
        return i1 - i2;
      }

      if (w1) {
        return 1;
      }

      return -1;
    });

  for (let i = 0; i < filledRules.length; i += 1) {
    const rule = filledRules[i];
    if ('pattern' in rule) {
      value += '';
    }
    const errors = await validateRule(name, value, rule);
    if (errors !== '') {
      return { name, errors };
    }
  }
}
