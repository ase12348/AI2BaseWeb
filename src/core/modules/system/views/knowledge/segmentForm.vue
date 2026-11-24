<template>
  <lr-c-schema-form :formConfig="{ layout: 'vertical' }" ref="formRef" />
</template>
<script lang="ts" setup>
  import type { FormSchemaConfig } from '/#/form';
  import { ref } from 'vue';
  import { useForm } from '/@/core/hooks/useForm';
  import { ruleDefault } from '/@/core/utils/validator';

  const schemas: FormSchemaConfig[] = [
    {
      name: '分段内容',
      field: 'content',
      type: 'textarea',
      rule: [...ruleDefault],
      config: { placeholder: '请输入分段内容', autoSize: { minRows: 12, maxRows: 20 } },
    },
  ];

  const formRef = ref();
  const { getFormData, setFormData, validateForm, resetForm } = useForm(formRef, {
    schemas,
    needFormatter: true,
  });

  let keyValue = '';

  // 表单打开
  const open = (param: { entity: { id?: string; content?: string } }) => {
    keyValue = param.entity.id || '';
    setFormData({
      main: {
        content: param.entity.content,
      },
    });
  };
  // 表单关闭前
  const beforeClose = () => {};

  // 表单点击确定按钮
  const ok = async () => {
    if (await validateForm()) {
      return {
        keyValue,
        content: getFormData().main.content,
      };
    }
  };

  // 表单关闭后
  const closed = () => {
    resetForm();
  };

  // 暴露方法
  defineExpose({ open, beforeClose, ok, closed });
</script>
