<template>
  <lr-c-schema-form
    :formConfig="{
      labelWidth: '64px',
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
  import { ruleDefault, ruleSelectDefault } from '/@/core/utils/validator';
  import { api } from '../../api/icon';
  import pageInfo from './page';
  import { t } from '@/core/locales/setupI18n';

  const { success } = useMessage();
  let isEdit = false;
  let keyValue = '';

  const formConfigs: Record<string, FormSchemaConfig> = {
    hpanel: {
      type: 'hpanel',
    },
    icon: {
      type: 'lr-show-icon',
      config: {
        width: 1024,
        height: 1024,
        getUpConfig: ({ formData }) => {
          return {
            svg: formData.f_Body,
            width: formData.f_Width,
            height: formData.f_Height,
          };
        },
      },
    },
    f_Name: {
      config: {},
      rule: ruleDefault,
    },
    f_Code: {
      config: {},
      rule: [
        ...ruleDefault,
        {
          type: 'only',
          lr_table: 'lr_base_icons',
          lr_key: 'f_Id',
        },
      ],
    },
    f_Category: {
      type: 'treeSelect',
      config: { dataType: 'dataItem', dataCode: 'systemIcon' },
      rule: [...ruleSelectDefault],
    },
    f_Height: {
      type: 'number',
      config: {
        span: 12,
        defaultValue: 1024,
      },
      rule: ruleDefault,
    },
    f_Width: {
      type: 'number',
      config: {
        span: 12,
        defaultValue: 1024,
      },
      rule: ruleDefault,
    },
    f_Body: {
      type: 'textarea',
      config: {
        rows: 6,
        labelExtra: `${t('请在')}path${t('标签里添加')}fill="currentColor"`,
      },
      rule: ruleDefault,
    },
  };

  const { getFormSchema } = useAuth(pageInfo, { formConfigs });
  const formRef = ref();
  const schemas = getFormSchema();
  // const layerRef = ref();

  const { getFormData, setFormData, validateForm, resetForm } = useForm(formRef, { schemas });

  const saveForm = async ({ keyValue, isEdit }: Record<string, any>) => {
    const formData = getFormData().main;
    if (isEdit) {
      return await api.update(keyValue, formData);
    } else {
      return await api.add(formData);
    }
  };

  // 表单打开
  const open = async (param) => {
    // layerRef.value = formLayerRef;
    isEdit = param.isEdit;
    keyValue = '';
    if (isEdit) {
      keyValue = param.keyValue;
      const entity = await api.get(keyValue);
      setFormData({ main: entity || {} });
    } else {
      const category = param.category;
      if (category) {
        setFormData({ main: { f_Category: category } });
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
