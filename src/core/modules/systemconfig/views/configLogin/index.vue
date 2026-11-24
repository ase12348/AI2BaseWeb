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
      id: 'LoginType',
      name: t('登录方式'),
      type: 'select',
      config: {
        defaultValue: 1,
        options: [
          { label: t('单一登录'), value: 1 },
          { label: t('同时登录'), value: 2 },
        ],
      },
      rule: [{ required: true, message: t('请输入') }],
    },
    {
      id: 'TokenTimeout',
      name: `${t('登录时长')}(${t('小时')})`,
      type: 'number',
      config: {
        min: 1,
        defaultValue: 24,
      },
      rule: [{ required: true, message: t('请输入') }],
    },
    {
      id: 'IsPwdVerify',
      name: t('密码错误验证'),
      type: 'switch',
      config: {
        checkedValue: 1,
        unCheckedValue: 0,
      },
    },
    {
      id: 'ErrorPwdCount',
      name: t('密码错误次数'),
      type: 'number',
      config: {
        min: 3,
        getUpConfig: ({ formData }) => {
          return { display: formData.IsPwdVerify === 1 ? true : false };
        },
      },
      rule: [{ required: true, message: t('请输入') }],
    },
    {
      id: 'ErrorPwdType',
      name: t('限制登录类型'),
      type: 'radio',
      config: {
        options: [
          { label: t('账号锁定'), value: 1 },
          { label: t('延时登录'), value: 2 },
        ],
        defaultValue: 1,
        getUpConfig: ({ formData }) => {
          return { display: formData.IsPwdVerify === 1 ? true : false };
        },
      },
    },
    {
      id: 'IsLoginTime',
      name: t('限制登录时间'),
      type: 'switch',
      config: {
        checkedValue: 1,
        unCheckedValue: 0,
      },
    },
    {
      id: 'LoginTimes',
      name: t('登陆时间'),
      type: 'inputRows',
      config: {
        addBtnText: t('添加可登录时间区间'),
        colStyle: {
          'margin-bottom': '8px',
          'margin-left': '40px',
        },
        getUpConfig: ({ formData }) => {
          return { display: formData.IsLoginTime === 1 ? true : false };
        },
        rule: [{ required: true, message: t('请输添加') }],
      },
      children: [
        {
          type: 'date',
          name: t('开始时间'),
          id: 'LoginTimes.startTime',
          config: {
            picker: 'dateTime',
            format: 'YYYY-MM-DD HH:mm:ss',
          },
          rule: [{ required: true, message: t('请输入') }],
        },
        {
          type: 'date',
          name: t('结束时间'),
          id: 'LoginTimes.endTime',
          config: {
            picker: 'dateTime',
            format: 'YYYY-MM-DD HH:mm:ss',
          },
          rule: [{ required: true, message: t('请输入') }],
        },
      ],
    },
    {
      id: 'IsIpAuth',
      name: `${t('限定')}IP`,
      type: 'switch',
      config: {
        checkedValue: 1,
        unCheckedValue: 0,
      },
    },
    {
      id: 'IpAuthType',
      name: t('限定类型'),
      type: 'radio',
      config: {
        options: [
          { label: t('黑名单'), value: 2 },
          { label: t('白名单'), value: 1 },
        ],
        defaultValue: 1,
        getUpConfig: ({ formData }) => {
          return { display: formData.IsIpAuth === 1 ? true : false };
        },
      },
    },
    {
      id: 'IpAuth',
      name: `${t('限定')}IP`,
      type: 'textarea',
      config: {
        placeholder: `${t('多个')}IP${t('设置')}，${t('请用英文符号隔开')}，${t('例如')}:192.168.0.1,192.168.0.2`,
        getUpConfig: ({ formData }) => {
          return { display: formData.IsIpAuth === 1 ? true : false };
        },
      },
      rule: [{ required: true, message: t('请输入') }],
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
    const data = await api.getconfig('loginConfig');
    if (data) {
      const formData = JSON.parse(data.f_Content);
      setFormData({ main: formData });
    }
    fullScreenLoading(false);
  };

  const saveForm = async () => {
    const formData = getFormData(false);
    return await api.saveLoginConfig({ f_Content: JSON.stringify(formData) });
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
