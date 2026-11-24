import type { RuleType } from '/#/form';
import { api } from '@/core/modules/data/api/dbtable';

import { t } from '@/core/locales/setupI18n';

interface existParam {
  table: string;
  key: string;
  keyName: string;
  field: string;
  value: string;
  keyValue: string;
  formData: Record<string, any>;
  paramNames?: [];
  getParams?: Function;
  getValue?: Function;
}
export const existFiled = async ({
  table,
  key,
  keyName,
  field,
  value,
  keyValue,
  formData,
  paramNames,
  getParams,
  getValue,
}: existParam) => {
  // console.log(table, key, field, value, formData, paramNames, 'existFiled 123');

  const param: Record<string, string> = {
    tableName: table,
    keyName: key,
    keyValue: keyValue || formData[keyName || key],
  };
  const fileds: Record<string, string> = getParams ? getParams() : {};
  if (getValue) {
    fileds[field] = getValue();
  } else {
    fileds[field] = value;
  }
  paramNames?.forEach((t) => (fileds[t] = formData[t]));
  param.filedsJson = JSON.stringify(fileds);
  const res = await api.existFiled(param);

  return res;
};

export const ruleDefault: RuleType[] = [{ required: true, message: t('请输入') }];
export const ruleSelectDefault: RuleType[] = [{ required: true, message: t('请选择') }];
