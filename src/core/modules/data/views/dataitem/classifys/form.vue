<template>
  <lr-c-schema-form
    :formConfig="{
      labelWidth: '60px',
    }"
    ref="formRef"
  />
</template>
<script lang="ts" setup>
  import type { FormSchemaConfig } from '/#/form';
  import { ref } from 'vue';
  import { useAuth } from '/@/core/hooks/useAuth';
  import { useForm } from '/@/core/hooks/useForm';
  import { ruleDefault } from '/@/core/utils/validator';
  import { useMessage } from '@/core/hooks/useMessage';
  import { api } from '/@/core/modules/data/api/dataitem';
  import pageInfo from './page';
  import { t } from '@/core/locales/setupI18n';

  const { success } = useMessage();

  let isEdit = false;
  let keyValue = '';

  const formConfigs: Record<string, FormSchemaConfig> = {
    f_ParentId: {
      type: 'treeSelect',
      config: {
        dataType: 'dataClassify',
        valueKey: 'f_ItemId',
      },
    },
    f_ItemName: {
      rule: ruleDefault,
    },
    f_ItemCode: {
      rule: ruleDefault,
    },
    f_SortCode: {
      config: { defaultValue: 1 },
      rule: ruleDefault,
    },
    f_IsTree: {
      type: 'switch',
      config: { defaultValue: 1 },
    },
    f_EnabledMark: {
      type: 'switch',
      config: { defaultValue: 1 },
    },
    f_Description: {
      type: 'textarea',
    },
  };

  const { getFormSchema } = useAuth(pageInfo, { formConfigs });
  const formRef = ref();
  const schemas = getFormSchema();
  const { validateForm, getFormData, setFormData, resetForm, setFormItemProps } = useForm(formRef, {
    schemas,
  });

  const saveForm = async ({ keyValue, isEdit }: Record<string, any>) => {
    const formData = getFormData().main;
    formData.f_ParentId = formData.f_ParentId || '0';
    if (isEdit) {
      return await api.updateCategory(keyValue, formData);
    } else {
      return await api.addCategory(formData);
    }
  };

  // 表单打开
  const open = async (param) => {
    isEdit = param.isEdit;
    keyValue = param.row?.f_ItemId;
    if (isEdit) {
      setFormItemProps('f_ParentId', { filterIds: [keyValue] });
      setFormData({ main: param.row || {} }, (key, value) => {
        if ((key === 'f_ParentId' && value === '0') || ['children', 'hasChildren'].includes(key)) {
          return false;
        }
        return true;
      });
    } else {
      setFormItemProps('f_ParentId', { filterIds: [] });
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
