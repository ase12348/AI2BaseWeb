<template>
  <div style="width: 100%; height: 100%">
    <lr-c-schema-form ref="formRef" :formConfig="{ labelWidth: '60px' }" />
  </div>
</template>
<script lang="ts" setup>
  import type { FormSchemaConfig } from '/#/form';
  import { ref } from 'vue';
  import { useAuth } from '/@/core/hooks/useAuth';
  import { useForm } from '/@/core/hooks/useForm';

  import { buildUUID } from '@/core/utils/jcode';
  import { useMessage } from '@/core/hooks/useMessage';
  import { ruleDefault, ruleSelectDefault } from '/@/core/utils/validator';
  import { api } from '/@/core/modules/data/api/codeTable';
  import pageInfo from './page';
  import { t } from '@/core/locales/setupI18n';

  const { success } = useMessage();
  let keyValue = '';
  let isEdit = false;
  let dbCode = '';

  const formConfigs: Record<string, FormSchemaConfig> = {
    layout: { config: { top: 100, topMove: false, autoSize: ['default'] } },
    f_TableName: { rule: ruleDefault },
    dbcode: {
      type: 'gridtable',
      config: {
        isAddBtn: true,
        isRemoveBtn: true,
        height: '100%',
        addRow: (formData: Record<string, any>[]) => {
          const point: Record<string, any> = {};
          point.f_Id = buildUUID();
          point.f_DbColumnName = '';
          point.f_CsType = 'string';
          point.f_Description = '';
          point.f_Length = 55;
          point.f_DecimalDigits = 0;
          point.f_IsNullable = 1;
          point.f_IsPrimaryKey = 0;
          point.f_IsIdentity = 0;
          formData.push(point);
        },
      },
    },
    'dbcode.f_DbColumnName': { type: 'input', config: { minWidth: 120 }, rule: ruleDefault },
    'dbcode.f_CsType': {
      type: 'select',
      config: {
        width: 120,
        options: [
          { label: 'string', value: 'string' },
          { label: 'text', value: 'text' },
          { label: 'int', value: 'int' },
          { label: 'decimal', value: 'decimal' },
          { label: 'DateTime', value: 'DateTime' },
          { label: 'DateTimeOffset', value: 'DateTimeOffset' },
          { label: 'bool', value: 'bool' },
          { label: 'long', value: 'long' },
          { label: 'short', value: 'short' },
          { label: 'double', value: 'double' },
          { label: 'float', value: 'float' },
          { label: 'TimeSpan', value: 'TimeSpan' },
          { label: 'nstring', value: 'nstring' },
        ],
      },
      rule: ruleSelectDefault,
    },
    'dbcode.f_Length': { type: 'number', config: { width: 80 } },
    'dbcode.f_DecimalDigits': { type: 'number', config: { width: 64 } },
    'dbcode.f_IsNullable': {
      type: 'switch',
      config: { width: 64, size: 'small' },
    },
    'dbcode.f_IsPrimaryKey': { type: 'switch', config: { width: 64, size: 'small' } },
    'dbcode.f_IsIdentity': { type: 'switch', config: { width: 64, size: 'small' } },
    'dbcode.f_Description': { type: 'input', config: { minWidth: 120 } },
  };

  const { getFormSchema } = useAuth(pageInfo, { formConfigs });
  const formRef = ref();
  const schemas = getFormSchema();

  const { resetForm, setFormData, getFormData, validateForm } = useForm(formRef, { schemas });

  const saveForm = async ({ keyValue, isEdit, dbCode }: Record<string, any>) => {
    const postData = {
      lr_db_codetableEntity: getFormData().main,
      lr_db_codecolumnsList: getFormData().dbcode,
    };
    postData.lr_db_codetableEntity.f_DbId = dbCode;
    if (isEdit) {
      return await api.update(keyValue, postData);
    } else {
      return await api.add(postData);
    }
  };
  // 表单打开
  const open = async (param) => {
    keyValue = param.keyValue;
    isEdit = param.isEdit;
    dbCode = param.dbCode;
    if (isEdit) {
      const data = await api.get(keyValue);
      // @ts-ignore
      setFormData({ main: data.lr_db_codetableEntity, dbcode: data.lr_db_codecolumnsList });
    }
  };
  // 表单关闭前
  const beforeClose = () => {};

  // 表单点击确定按钮
  const ok = async () => {
    if (await validateForm()) {
      let res = await saveForm({ keyValue, isEdit, dbCode });
      if (res) {
        success(t('保存成功'));
        return true;
      }
    }
  };

  // 表单关闭后
  const closed = () => {
    resetForm();
  };

  // 暴露方法
  defineExpose({ open, beforeClose, ok, closed });
</script>
