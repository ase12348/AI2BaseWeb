<template>
  <div class="lr-block" style="padding: 8px">
    <lr-panel>
      <lr-c-schema-form ref="formRef" :formConfig="{ labelWidth: '160px' }" />
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
  const { success, error, createMessage } = useMessage();

  const formRef = ref();
  const schemas: FormSchemaConfig[] = [
    {
      id: 'IsEnabled',
      name: '启用短信发送',
      type: 'switch',
      config: {
        checkedValue: 1,
        unCheckedValue: 0,
        defaultValue: 1,
      },
    },
    {
      id: 'SmsType',
      name: '短信服务商',
      type: 'radio',
      config: {
        defaultValue: 'ali',
        options: [
          { label: '阿里云短信', value: 'ali' },
          { label: '腾讯云短信', value: 'tencent' },
        ],
      },
      rule: [{ required: true, message: '请选择短信服务商' }],
    },
    {
      id: 'SmsSignName',
      name: '短信签名',
      type: 'input',
      config: {
        placeholder: '两家服务商共用，需与短信平台审核通过的签名一致',
      },
      rule: [{ required: true, message: '请输入短信签名' }],
    },
    {
      id: 'SmsAccessKeyId',
      name: 'AccessKeyId（阿里云）',
      type: 'input',
      config: {
        placeholder: '阿里云短信 AccessKeyId',
        getUpConfig: ({ formData }) => {
          return { display: formData.SmsType !== 'tencent' };
        },
      },
      rule: [{ required: true, message: '请输入 AccessKeyId' }],
    },
    {
      id: 'SmsSecret',
      name: 'AccessKeySecret（阿里云）',
      type: 'password',
      config: {
        placeholder: '保持 ****** 表示不修改',
        getUpConfig: ({ formData }) => {
          return { display: formData.SmsType !== 'tencent' };
        },
      },
      rule: [{ required: true, message: '请输入 AccessKeySecret' }],
    },
    {
      id: 'TemplateCode',
      name: '短信模板 CODE（阿里云）',
      type: 'input',
      config: {
        placeholder: '阿里云短信后台已审核通过的模板 CODE',
        getUpConfig: ({ formData }) => {
          return { display: formData.SmsType !== 'tencent' };
        },
      },
      rule: [{ required: true, message: '请输入模板 CODE' }],
    },
    {
      id: 'TencentSecretId',
      name: 'SecretId（腾讯云）',
      type: 'input',
      config: {
        placeholder: '腾讯云 API SecretId',
        getUpConfig: ({ formData }) => {
          return { display: formData.SmsType === 'tencent' };
        },
      },
      rule: [{ required: true, message: '请输入 SecretId' }],
    },
    {
      id: 'TencentSecretKey',
      name: 'SecretKey（腾讯云）',
      type: 'password',
      config: {
        placeholder: '保持 ****** 表示不修改',
        getUpConfig: ({ formData }) => {
          return { display: formData.SmsType === 'tencent' };
        },
      },
      rule: [{ required: true, message: '请输入 SecretKey' }],
    },
    {
      id: 'TencentSmsAccessKeyId',
      name: 'SdkAppId（腾讯云）',
      type: 'input',
      config: {
        placeholder: '腾讯云短信应用的 SdkAppId',
        getUpConfig: ({ formData }) => {
          return { display: formData.SmsType === 'tencent' };
        },
      },
      rule: [{ required: true, message: '请输入 SdkAppId' }],
    },
    {
      id: 'TemplateId',
      name: '短信模板 ID（腾讯云）',
      type: 'input',
      config: {
        placeholder: '腾讯云短信后台已审核通过的模板 ID',
        getUpConfig: ({ formData }) => {
          return { display: formData.SmsType === 'tencent' };
        },
      },
      rule: [{ required: true, message: '请输入模板 ID' }],
    },
    {
      id: 'TemplateParamName',
      name: '模板变量名',
      type: 'input',
      config: {
        defaultValue: 'content',
        placeholder: '阿里云模板变量的名称；腾讯云按第一个模板参数传入',
      },
    },
    {
      id: 'TestPhone',
      name: '测试手机号',
      type: 'input',
      config: {
        placeholder: '点「保存并测试发送」时接收短信的手机号',
      },
    },
    {
      id: 'TestContent',
      name: '测试内容',
      type: 'input',
      config: {
        placeholder: '留空默认「短信配置测试」，作为模板变量的值',
      },
    },
    {
      id: 'actions',
      type: 'buttons',
      config: {
        colStyle: {
          'padding-left': '168px',
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
          {
            label: '保存并测试发送',
            click: async () => {
              await saveAndTest();
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
    try {
      // getForm 接口对 smsConfig 已把密钥打码，页面保持 ****** 提交即可保留原密钥
      const data = await api.getconfig('smsConfig');
      if (data && data.f_Content) {
        setFormData({ main: JSON.parse(data.f_Content) });
      } else {
        setFormData({
          main: { IsEnabled: 1, SmsType: 'ali', TemplateParamName: 'content' },
        });
      }
    } finally {
      fullScreenLoading(false);
    }
  };

  const saveForm = (formData: Record<string, any>) => {
    // 测试手机号与测试内容只是本地辅助输入，不写进配置
    const config = { ...formData };
    delete config.TestPhone;
    delete config.TestContent;
    return api.saveSmsConfig({ f_Content: JSON.stringify(config) });
  };

  const ok = async () => {
    fullScreenLoading(true);
    try {
      if (!(await validateForm())) {
        return false;
      }
      const res = await saveForm(getFormData(false));
      if (res) {
        success(t('保存成功'));
        return true;
      }
      return false;
    } finally {
      fullScreenLoading(false);
    }
  };

  const saveAndTest = async () => {
    const formData = getFormData(false);
    if (!formData.TestPhone) {
      error('请先填写测试手机号');
      return;
    }
    // 测试发送只从服务端已保存的配置取密钥，所以先落库再发
    const saved = await ok();
    if (!saved) {
      return;
    }
    fullScreenLoading(true);
    try {
      const res = await api.sendTestSms({
        phone: formData.TestPhone,
        content: formData.TestContent || '',
      });
      if (res) {
        success('测试短信已提交');
        createMessage.info({ content: String(res), duration: 8 });
      } else {
        error('测试发送失败，请检查短信平台参数与模板');
      }
    } finally {
      fullScreenLoading(false);
    }
  };
</script>
