<template>
  <lr-c-schema-form
    :formConfig="{
      layout: 'vertical',
    }"
    ref="formRef"
  />
</template>
<script lang="ts" setup>
  import type { FormSchemaConfig } from '/#/form';
  import { ref } from 'vue';
  import { useForm } from '/@/core/hooks/useForm';
  import { useMessage } from '@/core/hooks/useMessage';
  import { ruleDefault } from '/@/core/utils/validator';

  const { success } = useMessage();

  const schemas: FormSchemaConfig[] = [
    {
      name: '指令图标',
      field: 'f_Icon',
      type: 'lr-input-icon',
    },
    {
      name: '指令名称',
      field: 'f_Name',
      rule: [...ruleDefault],
      config: { maxlength: 6, showCount: true, placeholder: '请输入' },
    },
    {
      name: '指令内容',
      field: 'f_Content',
      type: 'textarea',
      rule: [...ruleDefault],
      config: {
        maxlength: 200,
        showCount: true,
        placeholder: '请输入',
        autoSize: { minRows: 4, maxRows: 6 },
      },
    },
  ];

  const formRef = ref();
  const { getFormData, setFormData, validateForm, resetForm } = useForm(formRef, {
    schemas,
    needFormatter: true,
  });

  // 表单打开
  let onSubmit: ((data: Record<string, any>) => void) | null = null;
  const open = (param: {
    onSubmit?: (data: Record<string, any>) => void;
    data?: Record<string, any>;
  }) => {
    onSubmit = param?.onSubmit || null;
    if (param?.data) {
      setFormData(param.data);
    }
  };
  // 表单关闭前
  const beforeClose = () => {};

  // 表单点击确定按钮
  const ok = async () => {
    if (await validateForm()) {
      onSubmit?.(getFormData().main);
      success('保存成功');
      return true;
    }
  };

  // 表单关闭后
  const closed = () => {
    resetForm();
    onSubmit = null;
  };

  // 暴露方法
  defineExpose({ open, beforeClose, ok, closed });
</script>
