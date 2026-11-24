<template>
  <lr-c-schema-form ref="formRef" :formConfig="{ labelWidth: '80px' }" />
</template>
<script lang="ts" setup>
  import type { FormSchemaConfig } from '/#/form';
  import { ref, computed } from 'vue';
  import { useAuth } from '/@/core/hooks/useAuth';
  import { useForm } from '/@/core/hooks/useForm';
  import { useMessage } from '@/core/hooks/useMessage';
  import { useOrganization } from '/@/core/hooks/data/useOrganization';
  import { api, postEntity } from '../../api/post';
  import pageInfo from './page';
  import { t } from '@/core/locales/setupI18n';

  const { loadPostList, getPostList, getPostTree } = useOrganization();
  const { success } = useMessage();
  const formConfigs: Record<string, FormSchemaConfig> = {
    f_EnCode: {
      config: {},
      rule: [
        { required: true, message: t('请输入') },
        { pattern: /^[-\d]+$/, message: `${t('需要为数字或')}-` },
        {
          type: 'only',
          lr_table: 'lr_base_post',
          lr_key: 'f_PostId',
        },
      ],
    },
    f_Name: { config: {}, rule: [{ required: true, message: t('请输入') }] },
    f_DepartmentId: {
      type: 'lr-input-department',
      config: {
        label: '部门选择',
        companyRequired: true,
        getUpConfig: () => {
          return { companyId: companyId.value };
        },
      },
      rule: [{ required: true, message: t('请选择') }],
    },
    f_ParentId: {
      type: 'treeSelect',
      config: {
        'tree-default-expand-all': true,
        loadOptions: () => postTree,
      },
    },
    f_Description: { type: 'textarea', config: {} },
  };

  const { getFormSchema } = useAuth(pageInfo, { formConfigs });
  const formRef = ref();
  const schemas = getFormSchema();
  const { getFormData, setFormData, validateForm, resetForm } = useForm(formRef, { schemas });
  let isEdit = false;
  let keyValue = ref('');
  let companyId = ref('');
  const postTree = computed(() => {
    if (companyId.value) {
      return getPostTree(
        getPostList.value[companyId.value],
        '',
        keyValue.value ? [keyValue.value] : [],
      );
    }
    return [];
  });
  const getForm = () => {
    const formData = getFormData().main as postEntity;
    formData.f_ParentId = formData.f_ParentId || '0';
    formData.f_CompanyId = companyId.value;
    formData.f_PostId = keyValue.value;
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
    keyValue.value = param.keyValue;
    loadPostList(param.companyId);
    companyId.value = param.companyId;
    if (isEdit) {
      const entity = await api.get(keyValue.value);
      if (entity) {
        setFormData({ main: entity }, (key, value) => {
          if (key === 'f_ParentId' && value === '0') {
            return false;
          }
          return true;
        });
      }
    }
  };
  // 表单关闭前
  const beforeClose = () => {};

  // 表单点击确定按钮
  const ok = async () => {
    if (await validateForm()) {
      let res = await saveForm({ keyValue: keyValue.value, isEdit });
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
