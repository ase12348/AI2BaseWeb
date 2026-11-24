<template>
  <lr-c-schema-form ref="formRef" />
</template>
<script lang="ts" setup>
  import type { FormSchemaConfig } from '/#/form';
  import { ref } from 'vue';
  import { useForm } from '/@/core/hooks/useForm';
  import { useMessage } from '@/core/hooks/useMessage';
  import { HashingFactory } from '@/core/utils/jcode';
  import { api } from '/@/core/modules/organization/api/user';
  import { api as ruleApi } from '@/core/modules/systemconfig/api/configCommon';
  import { t } from '@/core/locales/setupI18n';
  import { useGlobSetting } from '/@/core/hooks/setting';

  const { isOnline } = useGlobSetting();

  const { success } = useMessage();
  const labelWidth = '80px';
  const getRule = async (rule, value) => {
    const ruleData = await ruleApi.getconfig('pwdConfig');
    if (ruleData) {
      const rulePwd = JSON.parse(ruleData.f_Content);

      let passComplexity = rulePwd.PwdComplexity;
      let passLength = rulePwd.PwdLength;
      if (passLength > value.length) {
        throw t('密码长度需要大于等于') + passLength;
      } else {
        // 判断对应密级密码规范
        let check;
        if (passComplexity.indexOf(1) !== -1) {
          // 大写
          check = /^(?=.*[A-Z]).*$/;
          if (!check.test(value)) {
            throw t('密码需要有大写字母');
          }
        }
        if (passComplexity.indexOf(2) !== -1) {
          // 小写
          check = /^(?=.*[a-z]).*$/;
          if (!check.test(value)) {
            throw t('密码需要有小写字母');
          }
        }
        if (passComplexity.indexOf(3) !== -1) {
          // 数字
          check = /^(?=.*\d).*$/;
          if (!check.test(value)) {
            throw t('密码需要有数字');
          }
        }

        if (passComplexity.indexOf(4) !== -1) {
          // 特殊字符
          check = /^(?=.*[*?!&￥$%^#,./@";:><\\[\]}{\-=+_\\|》《。，、？’‘“”~ `]).*$/;
          if (!check.test(value)) {
            throw t('密码需要有特殊字符');
          }
        }
      }
    }
  };
  const schemas: FormSchemaConfig[] = [
    {
      id: 'oldPassword',
      type: 'password',
      name: t('旧密码'),
      config: { labelWidth },
      rule: [
        { required: true, message: t('请输入') },
        {
          validator: async (rule, value) => {
            let res = await api.validatorPassword(HashingFactory.createMD5Hashing().hash(value));
            if (!res) {
              throw t('密码验证失败');
            }
          },
          trigger: 'null',
        },
      ],
    },
    {
      id: 'password',
      type: 'password',
      name: t('新密码'),
      config: { labelWidth },
      rule: [
        { required: true, message: t('请输入') },
        {
          validator: getRule,
          trigger: 'null',
        },
      ],
    },
    {
      id: 'password2',
      type: 'password',
      name: t('重复新密码'),
      config: { labelWidth },
      rule: [
        { required: true, message: t('请输入') },
        {
          validator: async () => {
            if (getForm().password2 != getForm().password) {
              throw t('两次密码输入不一致');
            }
          },
          trigger: 'null',
        },
      ],
    },
    {
      id: 'submit',
      type: 'button',
      name: t('提交'),
      config: {
        colStyle: { 'padding-left': '88px' },
        onClick: () => {
          ok();
        },
        getUpConfig: () => {
          return {
            display: isOnline ? false : true,
          };
        },
      },
    },
  ];
  const formRef = ref();
  const { getFormData, validateForm, resetForm } = useForm(formRef, {
    schemas,
    needFormatter: true,
  });
  const getForm = () => {
    const formData = getFormData(false);
    return formData;
  };

  const saveForm = async () => {
    const formData = getForm();
    const req = {
      password: HashingFactory.createMD5Hashing().hash(formData.password),
      oldPassword: HashingFactory.createMD5Hashing().hash(formData.oldPassword),
    };
    let res = api.updatePassword(req);
    return res;
  };

  // 表单点击确定按钮
  const ok = async () => {
    if (await validateForm()) {
      let res = await saveForm();
      if (res) {
        success(t('保存成功'));
        resetForm();
        return true;
      }
    }
  };
</script>
