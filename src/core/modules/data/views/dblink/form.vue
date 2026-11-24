<template>
  <lr-c-schema-form ref="formRef" :formConfig="{ labelWidth: '64px' }" />
</template>
<script lang="ts" setup>
  import type { FormSchemaConfig } from '/#/form';
  import { ref } from 'vue';
  import { useAuth } from '/@/core/hooks/useAuth';
  import { useForm } from '/@/core/hooks/useForm';
  import { ruleDefault, ruleSelectDefault } from '/@/core/utils/validator';
  import { EncryptionFactory, deepClone } from '@/core/utils/jcode';
  import { api as dblinkApi } from '/@/core/modules/data/api/dblink';
  import { useMessage } from '@/core/hooks/useMessage';
  import pageInfo from './page';
  import { t } from '@/core/locales/setupI18n';

  const { success, warning, error } = useMessage();
  const aesEncryption = EncryptionFactory.createAesEncryption({ key: 'jcode_db' });
  let isEdit = false;
  let keyValue = '';

  const dbTypeData = [
    { value: 'MySql', label: 'MySql' },
    { value: 'SqlServer', label: 'SqlServer' },
    { value: 'Oracle', label: 'Oracle' },
    { value: 'PostgreSQL', label: 'PostgreSQL' },
    { value: 'Dameng', label: t('达梦') },
    { value: 'Kdbndp', label: t('人大金仓') },
    { value: 'HG', label: t('瀚高') },
    { value: 'Oscar', label: t('神通') },
    { value: 'OpenGauss', label: `${t('华为')}OpenGauss` },
    { value: 'OceanBase', label: 'OceanBase' },
    { value: 'Tidb', label: 'Tidb' },
    { value: 'GBase', label: `${t('南大通用')}GBase` },
    { value: 'TDengine', label: 'TDengine' },
    { value: 'ClickHouse', label: 'ClickHouse' },
    { value: 'QuestDB', label: 'QuestDB' },
  ];

  const dbTypeLink: Record<string, string> = {
    MySql: 'server=localhost;Database=xxx;Uid=root;Pwd=haosql;',
    SqlServer: 'server=.;uid=sa;pwd=haosql;database=xxx',
    Oracle: 'Data Source=localhost/orcl;User ID=system;Password=haha;',
    PostgreSQL: 'PORT=5432;DATABASE=xxx;HOST=localhost;PASSWORD=haosql;USER ID=postgres',
    Dameng: 'Server=localhost; User Id=SYSDBA; PWD=SYSDBA;DATABASE=xxx',
    Kdbndp: 'Server=127.0.0.1;Port=54321;UID=SYSTEM;PWD=system;database=xxx',
    HG: 'Server=127.0.0.1;Port=5866;UId=design;Password=000;Database=design;searchpath=design',
    Oscar: 'PORT=2003;DATABASE=osrdb;HOST=localhost;PASSWORD=szoscar55;USER ID=SYSDBA',
    OpenGauss:
      'PORT=5432;DATABASE=SqlSugar4xTest;HOST=localhost;PASSWORD=haosql;USER ID=postgres;No Reset On Close=true',
    OceanBase: 'server=localhost;Database=SqlSugar4xTest;Uid=root;Pwd=haosql;',
    Tidb: 'server=localhost;Database=SqlSugar4xTest;Uid=root;Pwd=haosql;',
    GBase:
      'Driver={GBase ODBC DRIVER (64-Bit)};Host=localhost;Service=19088;Server=gbase01;Database=testdb;Protocol=onsoctcp;Uid=gbasedbt;Pwd=GBase123;Db_locale=zh_CN.utf8;Client_locale=zh_CN.utf8',
    TDengine: 'Host=localhost;Port=6030;Username=root;Password=taosdata;Database=power',
    ClickHouse:
      'Database=SqlSugarTest2;Username=default;Password=;Host=localhost;Port=8123;Compression=False;UseSession=False;Timeout=120;',
    QuestDB:
      'host=localhost;port=8812;username=admin;password=quest;database=qdb;ServerCompatibilityMode=NoTypeLoading;',
  };

  const dbTypePort: Record<string, string> = {
    MySql: '3306',
    SqlServer: '1433',
    Oracle: '1521',
    PostgreSQL: '5432',
    Dameng: '5236',
    Kdbndp: '54321',
    HG: '5866',
    Oscar: '2003',
    OpenGauss: '5432',
    OceanBase: '26257',
    Tidb: '4000',
    GBase: '19088',
    TDengine: '6030',
    ClickHouse: '8123',
    QuestDB: '8812',
  };

  const formConfigs: Record<string, FormSchemaConfig> = {
    f_DBAlias: {
      rule: ruleDefault,
    },
    f_DBName: {
      rule: [
        ...ruleDefault,
        {
          type: 'only',
          lr_table: 'lr_base_databaselink',
          lr_key: 'f_Id',
        },
      ],
    },
    f_Description: {
      type: 'textarea',
    },
    f_DbType: {
      type: 'select',
      config: {
        options: dbTypeData,
        allowClear: false,
        change: ({ value }) => {
          setFormData({
            main: {
              f_Port: dbTypePort[value],
              f_DbConnection: dbTypeLink[value],
            },
          });
        },
      },
      rule: ruleSelectDefault,
    },
    f_Server: {
      rule: ruleDefault,
      config: {
        getUpConfig: ({ formData }) => {
          return { isNotRule: formData.f_Type == 'c1' };
        },
      },
    },
    f_Port: {
      rule: ruleDefault,
      config: {
        getUpConfig: ({ formData }) => {
          return { isNotRule: formData.f_Type == 'c1' };
        },
      },
    },
    f_UserId: {
      rule: ruleDefault,
      config: {
        getUpConfig: ({ formData }) => {
          return { isNotRule: formData.f_Type == 'c1' };
        },
      },
    },
    f_Password: {
      rule: ruleDefault,
      config: {
        getUpConfig: ({ formData }) => {
          return { isNotRule: formData.f_Type == 'c1' };
        },
      },
    },
    f_DataBase: {
      rule: ruleDefault,
      config: {
        getUpConfig: ({ formData }) => {
          return { isNotRule: formData.f_Type == 'c1' };
        },
      },
    },
    f_DbConnection: {
      rule: ruleDefault,
      config: {
        getUpConfig: ({ formData }) => {
          return { isNotRule: formData.f_Type == 'c0' };
        },
      },
    },
  };

  const { getFormSchema } = useAuth(pageInfo, { formConfigs });
  const formRef = ref();
  const schemas = getFormSchema();

  const { validateForm, getFormData, setFormData, resetForm } = useForm(formRef, { schemas });

  const getForm = () => {
    // 获取表单数据 对表单数据进行处理
    const formData = getFormData(false);

    formData.f_DESEncrypt = 1;
    if (formData.f_Type == 'c0') {
      formData.f_Type = 0;
      formData.f_Password = aesEncryption.encrypt(formData.f_Password);
      formData.f_DbConnection = '';
    } else {
      formData.f_Type = 1;
      formData.f_DbConnection = aesEncryption.encrypt(formData.f_DbConnection);
      formData.f_Password = '';
    }
    return formData;
  };

  const saveForm = async ({ keyValue, isEdit }: Record<string, any>) => {
    const formData = getForm();

    if (formData.f_DBName === 'lrsystemdb') {
      error(`${t('编码不可与系统数据库相同')}!`);
      return false;
    }

    if (isEdit) {
      return await dblinkApi.update(keyValue, formData);
    } else {
      return await dblinkApi.add(formData);
    }
  };

  //数据连接测试
  const handleTest = async () => {
    const formData = getForm();
    if (
      (formData.f_Type != 0 && !formData.f_DbConnection) ||
      (formData.f_Type == 0 &&
        (!formData.f_Server || !formData.f_Port || !formData.f_UserId || !formData.f_Password))
    ) {
      warning(`${t('请将数据库信息补充完整')}!`);
      return;
    }
    const res = await dblinkApi.test(formData);
    if (res && res.data) {
      success(`${t('连接成功')}!`);
    } else if (res) {
      warning(res.info);
    } else {
      warning(t('连接失败'));
    }
  };

  // 返回表单设置
  const getConfig = () => {
    return {
      buttons: [
        {
          label: '测试链接',
          click: async () => {
            await handleTest();
          },
        },
      ],
    };
  };

  // 表单打开
  const open = (param) => {
    isEdit = param.isEdit;
    keyValue = param.row?.f_Id;

    if (isEdit) {
      const formData = deepClone(param.row);
      if (formData.f_DESEncrypt == 1) {
        // 解密
        if (formData.f_Type == 0) {
          formData.f_Type = 'c0';
          formData.f_Password = aesEncryption.decrypt(formData.f_Password);
        } else {
          formData.f_Type = 'c1';
          formData.f_DbConnection = aesEncryption.decrypt(formData.f_DbConnection);
        }
      }
      setFormData({ main: formData });
    }
  };
  // 表单关闭前
  const beforeClose = () => {};

  // 表单点击确定按钮
  const ok = async () => {
    const formData = getForm();
    console.log(formData);
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
  defineExpose({ getConfig, open, beforeClose, ok, closed });
</script>
