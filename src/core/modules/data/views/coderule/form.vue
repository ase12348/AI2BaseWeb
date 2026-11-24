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
  import { useMessage } from '@/core/hooks/useMessage';
  import { ruleDefault } from '/@/core/utils/validator';
  import pageInfo from './page';
  import { api } from '../../api/coderule';
  import { t } from '@/core/locales/setupI18n';

  const { success } = useMessage();
  let isEdit = false;
  let keyValue = '';

  const formConfigs: Record<string, FormSchemaConfig> = {
    f_FullName: {
      rule: [...ruleDefault],
    },
    f_Description: {
      type: 'textarea',
    },
    f_EnCode: {
      rule: [
        ...ruleDefault,
        {
          type: 'only',
          lr_table: 'lr_base_coderule',
          lr_key: 'f_RuleId',
        },
      ],
    },

    ruleFormat: {
      type: 'gridtable',
      config: {
        isAddBtn: true,
        isRemoveBtn: true,
        rowChange: (data) => {
          const { col, tableData, index } = data;
          if (col.field === 'itemType') {
            const row = tableData[index];
            row.formatStr = undefined;
            row.stepValue = undefined;
            row.initValue = undefined;
          }
        },
      },
    },
    'ruleFormat.itemType': {
      type: 'select',
      config: {
        dataType: 'options',
        options: [
          { value: '0', label: t('自定义') },
          { value: '1', label: t('日期') },
          { value: '2', label: t('流水号') },
          { value: '3', label: t('公司') },
          { value: '4', label: t('部门') },
          { value: '5', label: t('用户') },
          { value: '6', label: t('表字段') },
        ],
      },
    },
    'ruleFormat.formatStr': {
      config: {
        getInputType: (row: Record<string, any>) => {
          if (row.itemType == '0') {
            return 'input';
          } else {
            return 'select';
          }
        },
        isInputType: (row: Record<string, any>) => {
          return !!row.itemType && row.itemType !== '6';
        },
        getUpConfig: ({
          row,
        }: {
          formData: Record<string, any>;
          index: number;
          row: Record<string, any>;
          tableData: Record<string, any>[];
        }) => {
          switch (row.itemType) {
            case '1':
              return {
                options: [
                  { value: 'mmdd', label: 'mmdd' },
                  { value: 'ddmm', label: 'ddmm' },
                  { value: 'mmyy', label: 'mmyy' },
                  { value: 'yymm', label: 'yymm' },
                  { value: 'yyyy', label: 'yyyy' },
                  { value: 'yy', label: 'yy' },
                  { value: 'yyyymm', label: 'yyyymm' },
                  { value: 'yymmdd', label: 'yymmdd' },
                  { value: 'yyyymmdd', label: 'yyyymmdd' },
                ],
              };
            case '2':
              return {
                options: [
                  { value: '000', label: '000' },
                  { value: '0000', label: '0000' },
                  { value: '00000', label: '00000' },
                  { value: '000000', label: '000000' },
                ],
              };
            case '3':
              return {
                options: [
                  { value: 'code', label: t('公司编号') },
                  { value: 'name', label: t('公司名称') },
                ],
              };
            case '4':
              return {
                options: [
                  { value: 'code', label: t('部门编号') },
                  { value: 'name', label: t('部门名称') },
                ],
              };
            case '5':
              return {
                options: [
                  { value: 'code', label: t('用户编号') },
                  { value: 'name', label: t('用户名称') },
                ],
              };
          }
        },
      },
    },
    'ruleFormat.stepValue': {
      type: 'number',
      config: {
        notShowColLabel: true,
        isInputType: (row: Record<string, any>) => {
          return row.itemType === '2';
        },
      },
    },
    'ruleFormat.initValue': {
      type: 'number',
      config: {
        notShowColLabel: true,
        isInputType: (row: Record<string, any>) => {
          return row.itemType === '2';
        },
      },
    },
  };

  const { getFormSchema } = useAuth(pageInfo, { formConfigs });
  const formRef = ref();
  const schemas = getFormSchema();

  const { getFormData, setFormData, validateForm, resetForm } = useForm(formRef, { schemas });

  const saveForm = async ({ keyValue, isEdit }: Record<string, any>) => {
    const formData = getFormData();
    const postData = {
      ...formData.main,
      f_RuleFormatJson: JSON.stringify(formData.ruleFormat),
    };
    if (isEdit) {
      return await api.update(keyValue, postData);
    } else {
      return await api.add(postData);
    }
  };

  // 表单打开
  const open = (param) => {
    isEdit = param.isEdit;
    keyValue = '';
    if (isEdit) {
      keyValue = param.entity.f_RuleId;
      const entity = param.entity;
      setFormData({
        main: entity,
        ruleFormat: entity.f_RuleFormatJson ? JSON.parse(entity.f_RuleFormatJson) : [],
      });
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
