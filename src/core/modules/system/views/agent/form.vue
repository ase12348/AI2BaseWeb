<template>
  <lr-c-schema-form
    :formConfig="{
      labelWidth: '80px',
    }"
    ref="formRef"
  />
</template>
<script lang="ts" setup>
  import type { FormSchemaConfig } from '/#/form';
  import { ref } from 'vue';
  import { useAuth } from '/@/core/hooks/useAuth';
  import { useForm } from '/@/core/hooks/useForm';
  import { useMessage } from '@/core/hooks/useMessage';
  import { ruleDefault } from '/@/core/utils/validator';
  import pageInfo from './page';
  import { api } from './data';

  const { success } = useMessage();
  let isEdit = false;
  let keyValue = '';

  const formConfigs: Record<string, FormSchemaConfig> = {
    f_Name: {
      rule: [...ruleDefault],
    },
    f_Icon: {
      type: 'lr-input-icon',
    },
    f_Description: {
      type: 'textarea',
    },
    f_IsBuiltIn: {
      type: 'switch',
      config: { defaultValue: 0, span: 12 },
    },
    f_Published: {
      type: 'switch',
      config: { defaultValue: 0, span: 12 },
    },
  };

  const { getFormSchema } = useAuth(pageInfo, { formConfigs });
  const formRef = ref();
  const schemas = getFormSchema();

  const { getFormData, setFormData, validateForm, resetForm } = useForm(formRef, { schemas });

  const saveForm = async () => {
    const postData = getFormData().main;
    if (isEdit) {
      return await api.update(keyValue, postData);
    } else {
      return await api.add(postData);
    }
  };

  // 表单打开
  const open = (param) => {
    isEdit = param.isEdit;
    keyValue = '';
    if (isEdit) {
      keyValue = param.entity.f_Id;
      setFormData({
        main: param.entity,
      });
    }
  };
  // 表单关闭前
  const beforeClose = () => {};

  // 表单点击确定按钮
  const ok = async () => {
    if (await validateForm()) {
      const res = await saveForm();
      if (res) {
        success('保存成功');
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
