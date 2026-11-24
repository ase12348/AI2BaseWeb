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
  import { promptApi } from './data';

  const { success } = useMessage();

  const schemas: FormSchemaConfig[] = [
    {
      name: '提示词名称',
      field: 'f_Name',
      rule: [...ruleDefault],
      config: { maxlength: 20, showCount: true, placeholder: '请输入' },
    },
    {
      name: '提示词描述',
      field: 'f_Description',
      rule: [...ruleDefault],
      config: { maxlength: 50, showCount: true, placeholder: '请输入' },
    },
    {
      name: '提示词内容',
      field: 'f_Content',
      type: 'textarea',
      rule: [...ruleDefault],
      config: { placeholder: '请输入', autoSize: { minRows: 12, maxRows: 16 } },
    },
  ];

  const formRef = ref();
  const { getFormData, setFormData, validateForm, resetForm } = useForm(formRef, {
    schemas,
    needFormatter: true,
  });

  // 表单打开
  let promptType = 1;
  const open = (param: { content?: string; type?: number }) => {
    promptType = param?.type ?? 1;
    if (param?.content) {
      setFormData({
        main: { f_Content: param.content },
      });
    }
  };
  // 表单关闭前
  const beforeClose = () => {};

  // 表单点击确定按钮
  const ok = async () => {
    if (await validateForm()) {
      const postData = { ...getFormData().main, f_Type: promptType };
      const res = await promptApi.add(postData);
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
