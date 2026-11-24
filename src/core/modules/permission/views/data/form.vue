<template>
  <lr-c-schema-form ref="formRef" :formConfig="{ labelWidth: '80px' }" @change="handleChange" />
</template>
<script lang="ts" setup>
  import type { FormSchemaConfig } from '/#/form';
  import { computed, ref } from 'vue';
  import { deepClone } from '/@/core/utils/jcode';
  import { useAuth } from '/@/core/hooks/useAuth';
  import { useForm } from '/@/core/hooks/useForm';
  import { useMessage } from '@/core/hooks/useMessage';
  import { useOrganization } from '/@/core/hooks/data/useOrganization';
  import { api } from '@/core/modules/permission/api/data';
  import pageInfo from './page';
  import { t } from '@/core/locales/setupI18n';

  const { loadRoleList, getRoleList } = useOrganization();
  const { success } = useMessage();
  loadRoleList(false);
  const roleList = computed(() => {
    let data = getRoleList.value;
    return data?.map((item) => {
      return { label: item.f_FullName, value: item.f_RoleId };
    });
  });
  const FiledValueTypeOptions = [
    { value: 1, label: `${t('文本')}(String)` },
    { value: 10, label: `${t('文本')}(Int)` },
    { value: 2, label: `${t('登录者')}ID` },
    { value: 3, label: t('登录者账号') },
    { value: 4, label: t('登录者公司') },
    { value: 41, label: t('登录者公司及下属公司') },
    { value: 42, label: t('固定公司') },
    { value: 5, label: t('登录者部门') },
    { value: 51, label: t('登录者部门及下属部门') },
    { value: 52, label: t('固定部门') },
    { value: 6, label: t('登录者岗位') },
    { value: 7, label: t('登录者角色') },
  ];
  const formConfigs: Record<string, FormSchemaConfig> = {
    f_Code: {
      rule: [{ required: true, message: t('请输入') }],
    },
    f_Name: { config: {}, rule: [{ required: true, message: t('请输入') }] },
    f_ObjectType: {
      type: 'radio',
      config: {
        options: [
          { value: 1, label: t('角色') },
          { value: 2, label: t('用户') },
        ],
        defaultValue: 1,
      },
    },
    f_ObjectId: {
      config: {
        getInputType: (formData: Record<string, any>) => {
          if (formData.f_ObjectType == 1) {
            return 'select';
          } else {
            return 'lr-input-user';
          }
        },
        loadOptions: () => roleList,
      },
      rule: [{ required: true, message: t('请选择') }],
    },
    f_Formula: {
      type: 'input',
      config: {
        placeholder: `${t('请输入公式')},${t('默认为')} 1 and 2 and 3 and A and B ${t('这种且方式')}`,
      },
    },
    conditions: {
      type: 'inputRows',
      config: {
        showNum: true,
        colStyle: {
          'margin-bottom': '8px',
          'margin-left': '55px',
        },
        addBtnText: t('添加过滤条件'),
      },
    },
    'conditions.f_FieldId': {
      config: { placeholder: '字段', width: 160 },
      rule: [{ required: true }],
    },
    'conditions.f_FiledValue': {
      config: {
        width: 208,
        placeholder: '字段值',
        isMultiSelect: true,
        getInputType: (row) => {
          if (row.f_FiledValueType == 42) {
            return 'lr-input-company';
          }
          if (row.f_FiledValueType == 52) {
            return 'lr-input-department';
          }
          return 'input';
        },
        getUpConfig: ({ row }) => {
          return {
            readonly:
              row.f_FiledValueType !== 1 &&
              row.f_FiledValueType !== 10 &&
              row.f_FiledValueType !== 42 &&
              row.f_FiledValueType !== 52,
          };
        },
      },
      rule: [{ required: true }],
    },
    'conditions.f_Symbol': {
      type: 'select',
      config: {
        width: 120,
        defaultValue: 1,
        options: [
          { value: 1, label: t('等于') },
          { value: 2, label: t('大于') },
          { value: 3, label: t('大于等于') },
          { value: 4, label: t('小于') },
          { value: 5, label: t('小于等于') },
          { value: 6, label: t('包含') },
          { value: 7, label: t('包含于') },
          { value: 8, label: t('不等于') },
          { value: 9, label: t('不包含') },
          { value: 10, label: t('不包含于') },
        ],
        allowClear: false,
      },
      rule: [{ required: true }],
    },
    'conditions.f_FiledValueType': {
      type: 'select',
      config: {
        width: 120,
        defaultValue: 1,
        options: FiledValueTypeOptions,
        allowClear: false,
      },
      rule: [{ required: true }],
    },
  };
  const handleChange = async (
    component: Record<string, any>,
    { value, col, tableData, index }: Record<string, any>,
  ) => {
    if (component.id == 'conditions' && col && col.field == 'f_FiledValueType') {
      if (value == 1 || value == 10 || value == 42 || value == 52) {
        tableData[index].f_FiledValue = '';
      } else {
        tableData[index].f_FiledValue = FiledValueTypeOptions?.find(
          (t: any) => t.value == value,
        )?.label;
      }
    } else if (component.id == 'f_ObjectType') {
      formRef.value.setFormData({ main: { f_ObjectId: undefined } });
    }
  };
  const { getFormSchema } = useAuth(pageInfo, { formConfigs });
  const formRef = ref();
  const schemas = getFormSchema('form');

  const { getFormData, setFormData, validateForm, resetForm } = useForm(formRef, { schemas });
  let isEdit = false;
  let keyValue = '';

  const saveForm = async ({ keyValue, isEdit }: Record<string, any>) => {
    const formData = getFormData().main;

    let formula = {
      formula: formData.f_Formula,
      conditions: getFormData().conditions || '',
    };
    formData.f_Formula = JSON.stringify(formula);
    formData.f_Type = 1;
    if (isEdit) {
      return await api.update(keyValue, formData);
    } else {
      return await api.add(formData);
    }
  };

  // 表单打开
  const open = async (param) => {
    isEdit = param.isEdit;
    keyValue = param.row?.f_Id;
    if (isEdit) {
      const entity = deepClone(param.row);
      if (entity) {
        const formula = JSON.parse(entity.f_Formula);
        entity.f_Formula = formula.formula;
        setFormData({ main: entity, conditions: formula.conditions || [] });
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
