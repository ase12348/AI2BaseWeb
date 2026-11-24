<template>
  <lr-c-schema-form
    v-show="stepActive == 0"
    ref="formRef"
    :formConfig="{ labelWidth: '80px' }"
    @change="handleChange"
  />
  <lr-c-schema-form
    v-show="stepActive == 1"
    ref="formRef2"
    :formConfig="{ labelWidth: '80px' }"
    @change="handleChange"
  />
</template>
<script lang="ts" setup>
  import { ref, inject } from 'vue';
  import { useMessage } from '@/core/hooks/useMessage';
  import { deepClone } from '@/core/utils/jcode';
  import { ruleDefault, ruleSelectDefault } from '/@/core/utils/validator';
  import { api as quartzSchemeApi } from '/@/core/modules/quartz/api/scheme';
  import { t } from '@/core/locales/setupI18n';

  const { stepActive } = inject('jcode_layer_provide', {} as Record<string, any>);

  const { success, error } = useMessage();
  let isEdit = false;
  let keyValue = '';

  const formConfig1 = [
    {
      id: 'f_Name',
      type: 'input',
      config: {
        label: '任务名称',
      },
      rule: [...ruleDefault],
    },
    {
      id: 'startType',
      type: 'radio',
      config: {
        label: '开始类型',
        defaultValue: '1',
        options: [
          { label: t('立即执行'), value: '1' },
          { label: t('设置开始时间'), value: '2' },
        ],
      },
    },
    {
      id: 'startTime',
      type: 'date',
      config: {
        label: '开始时间',
        picker: 'dateTime',
        format: 'YYYY-MM-DD HH:mm:ss',
        getUpConfig: ({ formData }) => {
          return { display: formData.startType == '2' };
        },
      },
      rule: [...ruleDefault],
    },
    {
      id: 'executeType',
      type: 'radio',
      config: {
        label: '执行频率',
        defaultValue: '1',
        options: [
          { label: t('执行一次'), value: '1' },
          { label: t('重复执行'), value: '2' },
          { label: t('频率明细'), value: '3' },
          { label: t('表达式设置'), value: '4' },
        ],
      },
    },
    {
      id: 'simpleValue',
      type: 'input',
      config: {
        label: '每隔',
        defaultValue: '1',
        span: 12,
        getUpConfig: ({ formData }) => {
          return { display: formData.executeType == '2' };
        },
      },
      rule: [...ruleDefault],
    },
    {
      id: 'simpleType',
      type: 'select',
      config: {
        label: '',
        defaultValue: 'minute',
        allowClear: false,
        options: [
          { label: t('分钟'), value: 'minute' },
          { label: t('小时'), value: 'hours' },
          { label: t('天'), value: 'day' },
          { label: t('周'), value: 'week' },
        ],
        span: 12,
        getUpConfig: ({ formData }) => {
          return { display: formData.executeType == '2' };
        },
      },
    },
    {
      id: 'frequencyList',
      type: 'inputCards',
      config: {
        addBtnText: t('新增调度明细'),
        colStyle: {
          'margin-bottom': '8px',
        },
        getUpConfig: ({ formData }) => {
          return { display: formData.executeType == '3' };
        },
      },
      children: [
        {
          type: 'input',
          id: 'frequencyList.hour',
          config: {
            label: '执行小时',
            span: 12,
          },
          rule: [
            { required: true, message: t('执行小时不能为空') },
            { pattern: /^(2[0-3]|[0-1]?\d)$/, message: `${t('请输入')}0-23${t('的有效正整数')}` },
          ],
        },
        {
          type: 'input',
          id: 'frequencyList.minute',
          config: {
            label: '执行分钟',
            span: 12,
          },
          rule: [
            { required: true, message: t('执行分钟不能为空') },
            { pattern: /^(?:[1-5]?\d)$/, message: `${t('请输入')}0-59${t('的有效正整数')}` },
          ],
        },
        {
          type: 'select',
          id: 'frequencyList.type',
          config: {
            label: '执行日',
            span: 12,
            options: [
              { label: t('每日'), value: 'day' },
              { label: t('每周'), value: 'week' },
              { label: t('每月'), value: 'month' },
            ],
          },
        },
        {
          type: 'select',
          id: 'frequencyList.mounth',
          config: {
            label: '执行月',
            mode: 'multiple',
            span: 12,
            options: [
              { value: '1', label: t('一月') },
              { value: '2', label: t('二月') },
              { value: '3', label: t('三月') },
              { value: '4', label: t('四月') },
              { value: '5', label: t('五月') },
              { value: '6', label: t('六月') },
              { value: '7', label: t('七月') },
              { value: '8', label: t('八月') },
              { value: '9', label: t('九月') },
              { value: '10', label: t('十月') },
              { value: '11', label: t('十一月') },
              { value: '12', label: t('十二月') },
            ],
          },
          rule: [{ required: true, message: t('每月不能为空') }],
        },
        {
          type: 'select',
          id: 'frequencyList.week',
          config: {
            label: '每周',
            mode: 'multiple',
            getUpConfig: ({ row }) => {
              return { display: row.type == 'week' };
            },
            options: [
              { value: '1', label: t('周一') },
              { value: '2', label: t('周二') },
              { value: '3', label: t('周三') },
              { value: '4', label: t('周四') },
              { value: '5', label: t('周五') },
              { value: '6', label: t('周六') },
              { value: '7', label: t('周日') },
            ],
          },
          rule: [{ required: true, message: t('每周不能为空') }],
        },
        {
          type: 'select',
          id: 'frequencyList.day',
          config: {
            label: '每月',
            mode: 'multiple',
            getUpConfig: ({ row }) => {
              return { display: row.type == 'month' };
            },
            options: [
              { value: '1', label: `1${t('号')}` },
              { value: '2', label: `2${t('号')}` },
              { value: '3', label: `3${t('号')}` },
              { value: '4', label: `4${t('号')}` },
              { value: '5', label: `5${t('号')}` },
              { value: '6', label: `6${t('号')}` },
              { value: '7', label: `7${t('号')}` },
              { value: '8', label: `8${t('号')}` },
              { value: '9', label: `9${t('号')}` },
              { value: '10', label: `10${t('号')}` },
              { value: '11', label: `11${t('号')}` },
              { value: '12', label: `12${t('号')}` },
              { value: '13', label: `13${t('号')}` },
              { value: '14', label: `14${t('号')}` },
              { value: '15', label: `15${t('号')}` },
              { value: '16', label: `16${t('号')}` },
              { value: '17', label: `17${t('号')}` },
              { value: '18', label: `18${t('号')}` },
              { value: '19', label: `19${t('号')}` },
              { value: '20', label: `20${t('号')}` },
              { value: '21', label: `21${t('号')}` },
              { value: '22', label: `22${t('号')}` },
              { value: '23', label: `23${t('号')}` },
              { value: '24', label: `24${t('号')}` },
              { value: '25', label: `25${t('号')}` },
              { value: '26', label: `26${t('号')}` },
              { value: '27', label: `27${t('号')}` },
              { value: '28', label: `28${t('号')}` },
              { value: '29', label: `29${t('号')}` },
              { value: '30', label: `30${t('号')}` },
              { value: '31', label: `31${t('号')}` },
            ],
          },
          rule: [{ required: true, message: t('每月不能为空') }],
        },
      ],
    },
    {
      id: 'cornValue',
      type: 'autoComplete',
      config: {
        label: '表达式',
        options: [
          { label: t('每天12点运行'), value: '0 0 12 * * ?' },
          { label: `${t('每天')}10:15${t('运行')}`, value: '0 15 10 * * ? *' },
          { label: `${t('在2018年的每天')}10：15${t('运行')}`, value: '0 15 10 * * ? 2018' },
          {
            label: `${t('每天14点到15点之间每分钟运行一次')}，${t('开始于')}14:00，${t('结束于')}14:59`,
            value: '0 * 14 * * ?',
          },
          {
            label: `${t('每天14点到15点每5分钟运行一次')}，${t('开始于')}14:00，${t('结束于')}14:55`,
            value: '0 0/5 14 * * ?',
          },
          {
            label: `${t('每天14点到15点每5分钟运行一次')}，${t('此外每天18点到19点每5钟也运行一次')}`,
            value: '0 0/5 14,18 * * ?',
          },
          {
            label: `${t('每天')}14:00${t('点到')}14:05，${t('每分钟运行一次')}`,
            value: '0 0-5 14 * * ?',
          },
          {
            label: `3${t('月每周三的')}14:10${t('分到')}14:44，${t('每分钟运行一次')}`,
            value: '0 10,44 14 ? 3 WED',
          },
          {
            label: `${t('每周一')}，${t('二')}，${t('三')}，${t('四')}，${t('五的')}10:15${t('分运行')}`,
            value: '0 15 10 ? * MON-FRI',
          },
          { label: `${t('每月15日')}10:15${t('分运行')}`, value: '0 15 10 15 * ?' },
          { label: `${t('每月最后一天')}10:15${t('分运行')}`, value: '0 15 10 L * ?' },
          { label: `${t('每月最后一个星期五')}10:15${t('分运行')}`, value: '0 15 10 ? * 6L' },
          {
            label: `${t('在')}2018,2019,2010${t('年每个月的最后一个星期五的')}10:15${t('分运行')}`,
            value: '0 15 10 ? * 6L 2017-2019',
          },
          { label: `${t('每月第三个星期五的')}10:15${t('分运行')}`, value: '0 15 10 ? * 6#3' },
        ],
        span: 24,
        getUpConfig: ({ formData }) => {
          return { display: formData.executeType == '4' };
        },
      },
    },
    {
      id: 'endType',
      type: 'radio',
      config: {
        label: '结束类型',
        defaultValue: '1',
        options: [
          { label: t('无期限'), value: '1' },
          { label: t('设置结束时间'), value: '2' },
        ],
      },
    },
    {
      id: 'endTime',
      type: 'date',
      config: {
        label: '结束时间',
        picker: 'dateTime',
        format: 'YYYY-MM-DD HH:mm:ss',
        getUpConfig: ({ formData }) => {
          return { display: formData.endType == '2' };
        },
      },
      rule: [...ruleDefault],
    },
    {
      id: 'isRestart',
      type: 'switch',
      config: {
        label: '任务重启',
        defaultValue: 0,
      },
    },
    {
      id: 'restartMinute',
      type: 'input',
      config: {
        label: '重启频率',
        getUpConfig: ({ formData }) => {
          return { display: formData.isRestart == 1 };
        },
      },
      rule: [...ruleDefault],
    },
    {
      id: 'restartNum',
      type: 'input',
      config: {
        label: '重启次数',
        getUpConfig: ({ formData }) => {
          return { display: formData.isRestart == 1 };
        },
      },
      rule: [...ruleDefault],
    },
  ];
  const formConfig2 = [
    {
      id: 'methodType',
      type: 'radio',
      config: {
        label: '任务类型',
        defaultValue: '1',
        options: [
          { label: `SQL${t('语句')}`, value: '1' },
          { label: t('存储过程'), value: '2' },
          { label: t('接口'), value: '3' },
          { label: `Ioc${t('依赖注入')}`, value: '4' },
        ],
      },
    },
    {
      id: 'dbId',
      type: 'lr-input-dblink',
      config: {
        label: '数据库',
        getUpConfig: ({ formData }) => {
          return { display: formData.methodType == '1' || formData.methodType == '2' };
        },
      },
      rule: [...ruleSelectDefault],
    },
    {
      id: 'strSql',
      type: 'textarea',
      config: {
        label: 'SQL语句',
        getUpConfig: ({ formData }) => {
          return { display: formData.methodType == '1' };
        },
      },
      rule: [...ruleDefault],
    },
    {
      id: 'procName',
      type: 'textarea',
      config: {
        label: '存储过程',
        getUpConfig: ({ formData }) => {
          return { display: formData.methodType == '2' };
        },
      },
      rule: [...ruleDefault],
    },
    {
      id: 'urlType',
      type: 'radio',
      config: {
        label: '接口类型',
        defaultValue: '1',
        options: [
          { label: 'Get', value: '1' },
          { label: 'Post', value: '2' },
        ],
        getUpConfig: ({ formData }) => {
          return { display: formData.methodType == '3' };
        },
      },
      rule: [...ruleSelectDefault],
    },
    {
      id: 'url',
      type: 'textarea',
      config: {
        label: '接口地址',
        getUpConfig: ({ formData }) => {
          return { display: formData.methodType == '3' };
        },
      },
      rule: [...ruleDefault],
    },
    {
      id: 'iocName',
      type: 'textarea',
      config: {
        label: 'IOC方法',
        getUpConfig: ({ formData }) => {
          return { display: formData.methodType == '4' };
        },
      },
      rule: [...ruleDefault],
    },
  ];
  const formRef = ref();
  const formRef2 = ref();
  const getAllFormData = () => {
    const formData = getForm();
    const formData2 = getForm2();
    const postData: Record<string, any> = {
      f_Name: formData.f_Name,
      f_IsActive: formData.f_IsActive,
    };

    const scheme: Record<string, any> = {
      startType: formData.startType,
      startTime: formData.startTime,
      endType: formData.endType,
      endTime: formData.endTime,
      executeType: formData.executeType,
      isRestart: formData.isRestart,
    };
    switch (scheme.executeType) {
      case '1': // 只执行一次
        break;
      case '2': // 简单重复执行
        scheme.simpleValue = formData.simpleValue;
        scheme.simpleType = formData.simpleType;
        break;
      case '3': // 明细频率设置
        scheme.frequencyList = formData.frequencyList;
        break;
      case '4': //  表达式设置
        scheme.cornValue = formData.cornValue;
        break;
    }
    if (scheme.isRestart == '1') {
      scheme.restartMinute = formData.restartMinute;
      scheme.restartNum = formData.restartNum;
    }

    scheme.methodType = formData2.methodType;
    switch (formData2.methodType) {
      case '1': // SQL语句
        scheme.dbId = formData2.dbId;
        scheme.strSql = formData2.strSql;
        break;
      case '2': // 存储过程
        scheme.dbId = formData2.dbId;
        scheme.procName = formData2.procName;
        break;
      case '3': // 接口
        scheme.urlType = formData2.urlType;
        scheme.url = formData2.url;
        break;
      case '4': // Ioc依赖注入
        scheme.iocName = formData2.iocName;
        break;
    }
    postData.f_Scheme = JSON.stringify(scheme);
    return postData;
  };

  const saveForm = async ({ keyValue, isEdit }: Record<string, any>) => {
    const formData = getAllFormData();
    if (isEdit) {
      return await quartzSchemeApi.update(keyValue, formData);
    } else {
      return await quartzSchemeApi.add(formData);
    }
  };
  const setForm = (data: Record<string, any>) => {
    const formData = getForm();
    formData.f_Name = data.f_Name;
    formData.f_IsActive = data.f_IsActive;
    const scheme = JSON.parse(data.f_Scheme);
    formData.startType = scheme.startType;
    formData.startTime = scheme.startTime;
    formData.endType = scheme.endType;
    formData.endTime = scheme.endTime;
    formData.executeType = scheme.executeType;
    formData.isRestart = scheme.isRestart;
    switch (formData.executeType) {
      case '1': // 只执行一次
        break;
      case '2': // 简单重复执行
        formData.simpleValue = scheme.simpleValue;
        formData.simpleType = scheme.simpleType;
        break;
      case '3': // 明细频率设置
        formData.frequencyList = scheme.frequencyList;
        break;
      case '4': //  表达式设置
        formData.cornValue = scheme.cornValue;
        break;
    }
    if (formData.isRestart == '1') {
      formData.restartMinute = scheme.restartMinute;
      formData.restartNum = scheme.restartNum;
    }
    const formData2 = getForm2();
    formData2.methodType = scheme.methodType;

    switch (formData2.methodType) {
      case '1': // SQL语句
        formData2.dbId = scheme.dbId;
        formData2.strSql = scheme.strSql;
        break;
      case '2': // 存储过程
        formData2.dbId = scheme.dbId;
        formData2.procName = scheme.procName;
        break;
      case '3': // 接口
        formData2.urlType = scheme.urlType;
        formData2.url = scheme.url;
        break;
      case '4': // Ioc依赖注入
        formData2.iocName = scheme.iocName;
        break;
    }

    formRef.value.setFormData({ main: formData });
    formRef2.value.setFormData({ main: formData2 });
  };
  const handleChange = async (component: Record<string, any>) => {
    const type = component.id;
    if (type == 'executeType') {
      formRef.value.setFormData({ main: { frequencyList: [] } });
    }
  };
  const getForm = () => {
    const formData = formRef.value.getFormData(false);
    return formData;
  };
  const getForm2 = () => {
    const formData = formRef2.value.getFormData(false);
    return formData;
  };

  // 表单打开
  const open = async (param) => {
    isEdit = param.isEdit;
    keyValue = param.keyValue;
    formRef.value.setInit(deepClone(formConfig1));
    formRef2.value.setInit(deepClone(formConfig2));
    if (isEdit) {
      let data = await quartzSchemeApi.get(keyValue);
      setForm(data);
    }
  };
  // 表单关闭前
  const beforeClose = () => {};

  // 表单点击确定按钮
  const ok = async () => {
    if (await formRef2.value.validate()) {
      let res = await saveForm({ keyValue, isEdit });
      if (res) {
        success(t('保存成功'));
        return true;
      }
    }
  };

  // 表单关闭后
  const closed = () => {
    formRef.value.resetFields();
    formRef2.value.resetFields();
  };
  // 返回表单设置
  const getConfig = () => {
    return {
      isStep: true,
      steps: ['基础信息', '任务配置'],
    };
  };
  const validateSteps = async () => {
    if (!(await formRef.value.validate())) return false;
    let formData = getForm();
    if (formData.executeType == '3' && formData.frequencyList.length == 0) {
      error(`${t('请添加频率明细')}!`);
      return false;
    }
    return true;
  };
  // 暴露方法
  defineExpose({ open, beforeClose, ok, closed, validateSteps, getConfig });
</script>
