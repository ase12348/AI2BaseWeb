<template>
  <lr-c-schema-form :formConfig="{ labelWidth: '80px' }" ref="formRef" />
</template>
<script lang="ts" setup>
  import type { FormSchemaConfig } from '/#/form';
  import { ref } from 'vue';
  import { useAuth } from '/@/core/hooks/useAuth';
  import { useForm } from '/@/core/hooks/useForm';
  import { useMessage } from '@/core/hooks/useMessage';
  import { ruleDefault } from '/@/core/utils/validator';

  import { api as userApi } from '/@/core/modules/message/api/user';
  import pageInfo from './page';
  import { t } from '@/core/locales/setupI18n';

  const { success } = useMessage();

  let isEdit = false;
  let keyValue = '';

  const formConfigs: Record<string, FormSchemaConfig> = {
    f_Name: {
      config: { span: 12 },
      rule: ruleDefault,
    },
    f_Code: {
      config: { span: 12 },
      rule: ruleDefault,
    },
    f_Icon: {
      type: 'lr-input-icon',
      config: {
        defaultValue: 'star-outlined',
      },
      rule: ruleDefault,
    },
    f_Colour: {
      config: { span: 12 },
      rule: ruleDefault,
    },
    f_Description: {
      type: 'textarea',
    },
  };

  const { getFormSchema } = useAuth(pageInfo, { formConfigs });
  const formRef = ref();
  const schemas = getFormSchema();
  const { validateForm, getFormData, setFormData, resetForm } = useForm(formRef, { schemas });

  const getForm = () => {
    // 获取表单数据 对表单数据进行处理
    const formData = getFormData().main;
    return formData;
  };

  const saveForm = async ({ keyValue, isEdit }: Record<string, any>) => {
    const formData = getForm();
    if (isEdit) {
      return await userApi.update(keyValue, formData);
    } else {
      return await userApi.add(formData);
    }
  };

  // 表单打开
  const open = (param) => {
    isEdit = param.isEdit;
    keyValue = param.row?.f_Id;
    if (isEdit) {
      setFormData({ main: param.row || {} });
    }
  };
  // 表单关闭前
  const beforeClose = () => {};

  // 表单点击确定按钮
  const ok = async () => {
    if (await validateForm()) {
      let res = await saveForm({ keyValue, isEdit });
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
