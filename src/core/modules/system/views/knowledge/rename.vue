<template>
  <lr-c-schema-form
    :formConfig="{
      labelCol: { style: { display: 'none' } },
    }"
    ref="formRef"
  />
</template>
<script lang="ts" setup>
  import type { FormSchemaConfig } from '/#/form';
  import { ref } from 'vue';
  import { useForm } from '/@/core/hooks/useForm';
  import { ruleDefault } from '/@/core/utils/validator';

  const schemas: FormSchemaConfig[] = [
    {
      name: '名称',
      field: 'f_Name',
      rule: [...ruleDefault],
      config: { maxlength: 50, showCount: true, placeholder: '请输入' },
    },
  ];

  const formRef = ref();
  const { getFormData, setFormData, validateForm, resetForm } = useForm(formRef, {
    schemas,
    needFormatter: true,
  });

  let keyValue = '';

  // 表单打开
  const open = (param: { entity: { f_Id?: string; f_Name?: string } }) => {
    keyValue = param.entity.f_Id || '';
    setFormData({
      main: {
        f_Name: param.entity.f_Name,
      },
    });
  };
  // 表单关闭前
  const beforeClose = () => {};

  const ok = async () => {
    if (await validateForm()) {
      return {
        keyValue,
        f_Name: getFormData().main.f_Name,
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
