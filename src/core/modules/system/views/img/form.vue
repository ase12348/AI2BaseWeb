<template>
  <lr-c-schema-form ref="formRef" />
</template>
<script lang="ts" setup>
  import type { FormSchemaConfig } from '/#/form';
  import { ref } from 'vue';
  import { useAuth } from '/@/core/hooks/useAuth';
  import { useForm } from '/@/core/hooks/useForm';
  import { useMessage } from '@/core/hooks/useMessage';
  import { api as imgApi } from '../../api/img';
  import pageInfo from './page';

  let keyValue = '';
  const { success } = useMessage();
  const formConfigs: Record<string, FormSchemaConfig> = {
    src: {
      type: 'a-image',
      config: {
        style: {
          height: '200px',
        },
        colStyle: {
          'margin-bottom': '8px',
          'text-align': 'center',
        },
        getUpConfig: ({ formData }) => {
          return {
            src: formData.src,
          };
        },
      },
    },
    f_FileName: { config: { readOnly: true } },
    f_FileType: { type: 'select', config: { dataType: 'dataItem', dataCode: 'ImgType' } },
    f_IsPublic: { type: 'switch' },
  };

  const { getFormSchema } = useAuth(pageInfo, { formConfigs });
  const formRef = ref();
  const schemas = getFormSchema();
  const { setFormData, getFormData } = useForm(formRef, { schemas });

  // 表单打开
  const open = (param) => {
    keyValue = param.f_Id;
    setFormData({ main: param });
  };
  // 表单关闭前
  const beforeClose = () => {};

  const saveForm = async ({ keyValue }: Record<string, any>) => {
    const formData = getFormData().main;
    return await imgApi.update(keyValue, formData);
  };
  // 表单点击确定按钮
  const ok = async () => {
    let res = await saveForm({ keyValue });
    if (res) {
      success('保存成功');
      return true;
    }
  };

  // 表单关闭后
  const closed = () => {};

  // 暴露方法
  defineExpose({ open, beforeClose, ok, closed });
</script>
