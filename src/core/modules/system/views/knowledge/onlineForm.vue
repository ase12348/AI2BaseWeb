<template>
  <lr-c-schema-form
    :formConfig="{
      labelWidth: '90px',
    }"
    ref="formRef"
  />
</template>
<script lang="ts" setup>
  import type { FormSchemaConfig } from '/#/form';
  import { nextTick, ref } from 'vue';
  import { useForm } from '/@/core/hooks/useForm';
  import { ruleDefault } from '/@/core/utils/validator';

  const nameSchema: FormSchemaConfig = {
    name: '文档名称',
    field: 'f_Name',
    rule: [...ruleDefault],
    config: { maxlength: 50, showCount: true, placeholder: '请输入' },
  };
  const urlSchema: FormSchemaConfig = {
    name: '网页链接',
    field: 'f_Url',
    rule: [...ruleDefault],
    config: { maxlength: 500, placeholder: '请输入' },
  };
  const getSchemas = (type: string) => (type === 'online' ? [nameSchema, urlSchema] : [nameSchema]);

  const formRef = ref();
  let formType = 'custom';
  const { getFormData, setFormData, initForm, validateForm, resetForm } = useForm(formRef, {
    schemas: [nameSchema],
    needFormatter: true,
  });

  // 表单打开
  const open = (param: { type?: string; entity?: { f_Name?: string; f_Url?: string } }) => {
    formType = param?.type || 'custom';
    initForm(getSchemas(formType));
    nextTick(() =>
      setFormData({
        main: {
          f_Name: param?.entity?.f_Name,
          f_Url: param?.entity?.f_Url,
        },
      }),
    );
  };
  // 表单关闭前
  const beforeClose = () => {};

  // 表单点击确定按钮
  const ok = async () => {
    if (await validateForm()) {
      const data = getFormData().main;
      return {
        f_Name: data.f_Name,
        f_Url: formType === 'online' ? data.f_Url : undefined,
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
