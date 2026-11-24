<template>
  <div class="lr-block" style="padding: 8px">
    <lr-panel>
      <lr-c-schema-form ref="formRef" :formConfig="{ labelWidth: '120px' }" />
    </lr-panel>
  </div>
</template>
<script lang="ts" setup>
  import type { FormSchemaConfig } from '/#/form';
  import { ref, onMounted } from 'vue';
  import { useMessage } from '@/core/hooks/useMessage';
  import { useForm } from '/@/core/hooks/useForm';
  import { fullScreenLoading } from '@/core/utils/jcode';
  import { api } from '../../api/configCommon';
  import { useGlobSetting } from '/@/core/hooks/setting';
  import { t } from '@/core/locales/setupI18n';

  const { isOnline } = useGlobSetting();
  const { success } = useMessage();

  const formRef = ref();
  const schemas: FormSchemaConfig[] = [
    {
      id: 'PwdDay',
      name: `${t('更换周期')}/${t('天')}`,
      type: 'number',
      config: {
        min: 1,
      },
    },
    {
      id: 'PwdLength',
      name: t('密码长度'),
      type: 'number',
      config: {
        min: 6,
      },
    },
    {
      id: 'PwdComplexity',
      name: t('复杂度'),
      type: 'checkbox',
      config: {
        options: [
          { value: '1', label: t('大写字母') },
          { value: '2', label: t('小写字母') },
          { value: '3', label: t('数字') },
          { value: '4', label: t('特殊字符') },
        ],
      },
    },
    {
      id: 'refresh',
      type: 'buttons',
      config: {
        colStyle: {
          'padding-left': '128px',
        },
        list: [
          {
            label: t('刷新'),
            click: async () => {
              await loadFormData();
            },
          },
          {
            label: t('提交'),
            type: 'primary',
            click: async () => {
              await ok();
            },
          },
        ],
        getUpConfig: () => {
          return {
            display: isOnline ? false : true,
          };
        },
      },
    },
  ];
  const { setFormData, getFormData, validateForm } = useForm(formRef, {
    schemas,
    needFormatter: true,
  });

  onMounted(async () => {
    await loadFormData();
  });

  const loadFormData = async () => {
    fullScreenLoading(true);
    const data = await api.getconfig('pwdConfig');
    if (data) {
      const formData = JSON.parse(data.f_Content);
      setFormData({ main: formData });
    }
    fullScreenLoading(false);
  };

  const saveForm = async () => {
    const formData = getFormData(false);
    return await api.SavePwdConfig({ f_Content: JSON.stringify(formData) });
  };

  const ok = async () => {
    fullScreenLoading(true);
    if (await validateForm()) {
      const res = await saveForm();
      if (res) {
        success(t('保存成功'));
        fullScreenLoading(false);
        return true;
      }
    }
    fullScreenLoading(false);
  };
</script>
