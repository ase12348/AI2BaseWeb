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
  import { computed, ref } from 'vue';
  import { useAuth } from '/@/core/hooks/useAuth';
  import { useForm } from '/@/core/hooks/useForm';
  import { useMenu } from '/@/core/hooks/useMenu';
  import { useMessage } from '@/core/hooks/useMessage';
  import { toTree } from '@/core/utils/jcode';
  import { ruleDefault, ruleSelectDefault } from '/@/core/utils/validator';
  import { api } from '/@/core/modules/system/api/module';
  import pageInfo from './page';
  import { t } from '@/core/locales/setupI18n';

  const { success } = useMessage();
  const { getAllModuleExpands, loadList } = useMenu();

  let isEdit = false;
  let keyValue = '';
  // 上级目录只能选同一维护范围内的目录；null 表示不限（旧入口没传）
  const scopeExpandIds = ref<string[] | null>(null);

  const parentTree = computed(() => {
    const ids = scopeExpandIds.value;
    const list = ids
      ? getAllModuleExpands.value.filter((item) => ids.includes(item.f_ModuleId))
      : getAllModuleExpands.value;
    return toTree(list, 'f_ModuleId', 'f_ParentId', 'f_ModuleId', 'f_FullName');
  });

  const formConfigs: Record<string, FormSchemaConfig> = {
    f_EnCode: {
      config: { span: 12 },
      rule: [...ruleDefault],
    },
    f_FullName: {
      config: { span: 12 },
      rule: [...ruleDefault],
    },
    f_ParentId: {
      type: 'treeSelect',
      config: {
        span: 12,
        loadOptions: () => parentTree,
      },
    },
    f_Icon: {
      type: 'lr-input-icon',
      config: {
        span: 12,
      },
    },

    f_Target: {
      type: 'select',
      config: {
        span: 12,
        options: [
          {
            value: 'expand',
            label: t('菜单目录'),
          },
          {
            value: 'view',
            label: t('功能页面'),
          },
          {
            value: 'blankView',
            label: t('独立页面'),
          },
        ],
        getUpConfig: ({ formData }) => {
          return { display: !['custmerView', 'desktopView', 'biView'].includes(formData.f_Target) };
        },
      },
      rule: [...ruleSelectDefault],
    },
    f_UrlAddress: {
      config: {
        getUpConfig: ({ formData }) => {
          return { display: !['custmerView', 'desktopView', 'biView'].includes(formData.f_Target) };
        },
      },
    },
    f_SortCode: {
      config: { defaultValue: 99, span: 12 },
    },
    f_IsMenu: {
      type: 'switch',
      config: { defaultValue: 1, span: 12 },
    },
    f_EnabledMark: {
      type: 'switch',
      config: { defaultValue: 1, span: 12 },
    },
    f_Description: {
      type: 'textarea',
    },
  };

  const { getFormSchema } = useAuth(pageInfo, { formConfigs });
  const formRef = ref();
  const schemas = getFormSchema();
  const { validateForm, getFormData, setFormData, resetForm } = useForm(formRef, { schemas });

  const getForm = () => {
    // 获取表单数据 对表单数据进行处理
    const formData = getFormData().main;
    if (!formData.f_ParentId) {
      formData.f_ParentId = '0';
    }
    return formData;
  };

  const saveForm = async ({ keyValue, isEdit }: Record<string, any>) => {
    const formData = getForm();
    // console.log(formData);
    formData.f_ModuleId = keyValue;
    if (isEdit) {
      return await api.update(keyValue, formData);
    } else {
      return await api.add(formData);
    }
  };

  const loadFormData = async ({ keyValue }: Record<string, any>) => {
    const formData = await api.get(keyValue);
    if (formData) {
      if (formData.f_ParentId == '0') {
        formData.f_ParentId = '';
      }
      setFormData({ main: formData });
      return true;
    }
    return false;
  };

  // 表单打开
  const open = async (param) => {
    isEdit = param.isEdit;
    scopeExpandIds.value = Array.isArray(param.expandIds) ? param.expandIds : null;
    if (isEdit) {
      keyValue = param.row?.f_ModuleId;
      loadFormData({ keyValue });
    }
  };

  // 表单关闭前
  const beforeClose = () => {};

  // 表单点击确定按钮
  const ok = async () => {
    if (await validateForm()) {
      let res = await saveForm({ keyValue, isEdit });
      if (res) {
        await loadList();
        success(t('保存成功'));
        return true;
      }
    }
  };

  // 表单关闭后
  const closed = () => {
    keyValue = '';
    resetForm();
  };

  // 暴露方法
  defineExpose({ open, beforeClose, ok, closed, loadFormData, validateForm, saveForm });
</script>
