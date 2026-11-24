<template>
  <lr-c-schema-form :formConfig="{ labelWidth: '64px' }" ref="formRef" />
</template>
<script lang="ts" setup>
  import type { FormSchemaConfig } from '/#/form';
  import { ref } from 'vue';
  import { useAuth } from '/@/core/hooks/useAuth';
  import { useForm } from '/@/core/hooks/useForm';

  import { useMessage } from '@/core/hooks/useMessage';
  import { api } from '../../api/role';
  import pageInfo from './page';
  import { t } from '@/core/locales/setupI18n';

  const { success } = useMessage();
  const formConfigs: Record<string, FormSchemaConfig> = {
    f_EnCode: {
      rule: [
        { required: true, message: t('请输入') },
        {
          type: 'only',
          lr_table: 'lr_base_role',
          lr_key: 'f_RoleId',
        },
      ],
    },
    f_FullName: { rule: [{ required: true, message: t('请输入') }] },
    f_Category: {
      type: 'treeSelect',
      config: { dataType: 'dataItem', dataCode: 'rolecategory' },
      rule: [{ required: true, message: t('请选择') }],
    },
    f_EnabledMark: { type: 'switch', config: { defaultValue: 1 } },
    f_Description: { type: 'textarea' },
  };
  const { getFormSchema } = useAuth(pageInfo, { formConfigs });
  const formRef = ref();
  const schemas = getFormSchema();
  const { getFormData, setFormData, validateForm, resetForm } = useForm(formRef, { schemas });
  let isEdit = false;
  let keyValue = '';
  const getForm = () => {
    const formData = getFormData().main;
    formData.f_RoleId = keyValue;
    return formData;
  };

  const saveForm = async ({ keyValue, isEdit }: Record<string, any>) => {
    const formData = getForm();
    if (isEdit) {
      return await api.update(keyValue, formData);
    } else {
      return await api.add(formData);
    }
  };

  // 表单打开
  const open = async (param) => {
    isEdit = param.isEdit;
    keyValue = param.keyValue;
    if (isEdit) {
      const entity = await api.get(keyValue);
      if (entity) {
        setFormData({ main: entity });
      }
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
