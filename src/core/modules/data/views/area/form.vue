<template>
  <lr-c-schema-form ref="formRef" />
</template>
<script lang="ts" setup>
  import type { FormSchemaConfig } from '/#/form';
  import { ref } from 'vue';
  import { useMessage } from '@/core/hooks/useMessage';
  import { useAuth } from '/@/core/hooks/useAuth';
  import { useForm } from '/@/core/hooks/useForm';
  import { ruleDefault } from '/@/core/utils/validator';
  import { useArea } from '/@/core/hooks/data/useArea';
  import { api } from '/@/core/modules/data/api/area';
  import pageInfo from './page';
  import { t } from '@/core/locales/setupI18n';

  const { success, warning } = useMessage();

  const { getArea, getAreaOptions, loadAreaList } = useArea();

  let isEdit = false;
  let keyValue = '';
  const labelWidth = '64px';
  const formConfigs: Record<string, FormSchemaConfig> = {
    f_ParentId: {
      type: 'treeSelect',
      config: {
        labelWidth,
        options: getAreaOptions(getArea.value['0']),
        loadData: async (node) => {
          await loadAreaList(node.value);
          node.dataRef.children = node.dataRef.children || [];
          node.dataRef.children.push(...getAreaOptions(getArea.value[node.value]));
          return true;
        },
      },
    },
    f_AreaName: {
      config: { labelWidth },
      rule: ruleDefault,
    },
    f_AreaCode: {
      config: { labelWidth },
      rule: [
        ...ruleDefault,
        {
          type: 'only',
          lr_table: 'lr_base_area',
          lr_key: 'f_AreaId',
        },
      ],
    },
    f_EnabledMark: {
      type: 'switch',
      config: { defaultValue: 1, labelWidth },
    },
    f_Description: {
      type: 'textarea',
      config: { labelWidth },
    },
  };

  const { getFormSchema } = useAuth(pageInfo, { formConfigs });
  const formRef = ref();
  const schemas = getFormSchema();
  const { validateForm, getFormData, setFormData, resetForm } = useForm(formRef, { schemas });

  const validateFormEx = async () => {
    if (await validateForm()) {
      const formData = getFormData().main;
      if (formData.f_AreaId && formData.f_ParentId === formData.f_AreaId) {
        warning(`${t('上级不能选择自己')}!`);
        return false;
      }
      return true;
    }

    return false;
  };

  const saveForm = async ({ keyValue, isEdit }: Record<string, any>) => {
    const formData = getFormData().main;
    formData.f_ParentId = formData.f_ParentId || '0';
    formData.f_AreaId = keyValue;
    if (isEdit) {
      return await api.update(keyValue, formData);
    } else {
      return await api.add(formData);
    }
  };

  // 表单打开
  const open = (param) => {
    isEdit = param.isEdit;
    if (isEdit) {
      keyValue = param.row?.f_AreaId;
      // console.log(param.row, 'param.row');
      setFormData({ main: param.row }, (key, value) => {
        if ((key === 'f_ParentId' && value === '0') || ['children', 'hasChildren'].includes(key)) {
          return false;
        }
        return true;
      });
    }
  };
  // 表单关闭前
  const beforeClose = () => {};

  // 表单点击确定按钮
  const ok = async () => {
    if (await validateFormEx()) {
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
  defineExpose({ open, beforeClose, ok, closed, validateForm: validateFormEx, saveForm });
</script>
