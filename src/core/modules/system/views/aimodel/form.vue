<template>
  <lr-c-schema-form
    :formConfig="{
      labelWidth: '80px',
    }"
    ref="formRef"
    @change="handleChange"
  />
</template>
<script lang="ts" setup>
  import type { FormSchemaConfig } from '/#/form';
  import { h, markRaw, ref } from 'vue';
  import { useAuth } from '/@/core/hooks/useAuth';
  import { useForm } from '/@/core/hooks/useForm';
  import { useMessage } from '@/core/hooks/useMessage';
  import { ruleDefault, ruleSelectDefault } from '/@/core/utils/validator';
  import pageInfo from './page';
  import { providerOptions, getModelOptions, getKeyUrl } from './options';
  import { api } from '../../api/aimodel';
  import { t } from '@/core/locales/setupI18n';

  const { success, error } = useMessage();
  let isEdit = false;
  let keyValue = '';

  // 自定义（OpenAI 兼容）提供商，模型/接口地址改为手动输入
  const CUSTOM_PROVIDER = 'custom';
  const isCustom = (provider: string) => provider === CUSTOM_PROVIDER;

  // 跳转提供商密钥管理页获取API密钥
  const openKeyPage = () => {
    const keyUrl = getKeyUrl(getValue('f_Provider'));
    if (!keyUrl) {
      error(t('请先选择提供商'));
      return;
    }
    window.open(keyUrl, '_blank');
  };

  const formConfigs: Record<string, FormSchemaConfig> = {
    f_Provider: {
      type: 'select',
      config: {
        options: providerOptions,
        allowClear: false,
      },
      rule: [...ruleSelectDefault],
    },
    f_Model: {
      type: 'select',
      config: {
        allowClear: false,
        // 自定义提供商时手动输入模型，其余提供商下拉选择
        getInputType: (formData: Record<string, any>) =>
          isCustom(formData.f_Provider) ? 'input' : 'select',
        // 模型选项跟随提供商联动
        getUpConfig: ({ formData }) => ({
          options: getModelOptions(formData.f_Provider),
          placeholder: isCustom(formData.f_Provider) ? t('请输入模型名称') : undefined,
        }),
      },
      rule: [{ required: true, message: t('请输入或选择模型') }],
    },
    f_ApiKey: {
      type: 'password',
      config: {
        placeholder: `API${t('密钥')}`,
        // 密钥输入框下方的获取密钥链接
        labelExtra: markRaw(
          h(
            'a',
            {
              style: { color: 'var(--color-success)', cursor: 'pointer' },
              onClick: openKeyPage,
            },
            `${t('获取')} API ${t('密钥')}`,
          ),
        ),
      },
      rule: [...ruleDefault],
    },
    f_Url: {
      type: 'input',
      config: {
        placeholder: `${t('接口地址')}，${t('如')} https://your-gateway/v1`,
        // 仅自定义提供商时显示（隐藏时自动跳过必填校验）
        getUpConfig: ({ formData }) => ({
          display: isCustom(formData.f_Provider),
        }),
      },
      rule: [...ruleDefault],
    },
  };

  const { getFormSchema } = useAuth(pageInfo, { formConfigs });
  const formRef = ref();
  const schemas = getFormSchema();

  const { getFormData, setFormData, getValue, validateForm, resetForm } = useForm(formRef, {
    schemas,
  });

  // 上级字段变化时清空下级已选值
  const handleChange = (component: Record<string, any>) => {
    const field = component.config?.field;
    if (field == 'f_Provider') {
      setFormData({ main: { f_Model: undefined, f_Url: undefined } });
    }
  };

  const saveForm = async ({ keyValue, isEdit }: Record<string, any>) => {
    const postData = getFormData();
    if (isEdit) {
      return await api.update(keyValue, postData.main);
    } else {
      return await api.add(postData.main);
    }
  };

  // 表单打开
  const open = (param) => {
    isEdit = param.isEdit;
    keyValue = '';
    if (isEdit) {
      keyValue = param.entity.f_Id;
      const entity = param.entity;
      setFormData({
        main: entity,
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
