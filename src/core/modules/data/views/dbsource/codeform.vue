<template>
  <lr-layout class="learurn-dbsource-form-page" :right="320" :top="48">
    <lr-layout
      class="lr-block"
      style="background-color: var(--color-bg-container)"
      :bottom="tableColumns.length > 0 ? 300 : 0"
      :top="40"
    >
      <template #top>
        <div
          style="
            display: flex;
            position: relative;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            height: 40px;
            padding-left: 8px;
          "
        >
          <a-space>
            <lr-button type="primary" iconName="play-circle-outlined" @click="loadTableData" />
          </a-space>
          <lr-button
            :iconName="
              openCodeInfo ? 'ant-design:double-right-outlined' : 'ant-design:question-outlined'
            "
            class="mr-8px"
            @click="openCodeInfo = !openCodeInfo"
          />
        </div>
      </template>
      <lr-layout style="border-top: 1px solid var(--color-border)" :right="openCodeInfo ? 360 : 0">
        <lr-code-mirror v-model:value="currentConfig.sql" mode="application/javascript" />
        <template #right>
          <lr-code-mirror readOnly v-model:value="tempCode" />
        </template>
      </lr-layout>
      <template #bottom>
        <div
          v-if="tableColumns.length > 0"
          class="lr-block"
          style="border-top: 1px solid var(--color-border)"
          ><lr-table
            ref="mainTable"
            :columns="tableColumns"
            :dataSource="tableData"
            :loading="tableLoading"
            :isPage="true"
            :pageTotal="tableTotal"
            v-model:tablePage="tableCurrentPage"
            @load-page-data="turnTablePage"
        /></div>
      </template>
    </lr-layout>
    <template #right>
      <div class="learurn-dbsource-form-page-right">
        <lr-c-schema-form style="padding: 0" ref="formRef" :formConfig="{ labelWidth: '48px' }" />
      </div>
    </template>
  </lr-layout>
</template>
<script lang="ts" setup>
  import type { FormSchemaConfig } from '/#/form';
  import { ref, computed, h } from 'vue';
  import { useAuth } from '/@/core/hooks/useAuth';
  import { useForm } from '/@/core/hooks/useForm';
  import { ruleDefault } from '/@/core/utils/validator';
  import { EncryptionFactory, isNullOrEmpty } from '/@/core/utils/jcode';
  import { useMessage } from '@/core/hooks/useMessage';
  import { api } from '/@/core/modules/data/api/dbsource';
  import { getTypeName, getColor } from './util';
  import pageInfo from './page';
  import { t } from '@/core/locales/setupI18n';

  const { warning, success, error } = useMessage();
  const aesEncryption = EncryptionFactory.createAesEncryption({ key: 'jcode' });

  const myColumns = ref([]);

  const tableLoading = ref(false);
  const tableColumns = ref([]);
  const tableData = ref([]);
  const tableTotal = ref(0);
  const tablePageSize = ref(50);
  const tableCurrentPage = ref(1);

  const openCodeInfo = ref(false);
  const currentConfig = ref({ sql: '' });
  const tempCode = ref(`
  // ${t('获取当前登录用户')}ID
jcode.userId

// ${t('获取当前登录用户账号')}
jcode.userAccount

// ${t('获取当前登录用户公司')}ID
jcode.companyId

// ${t('获取当前登录用户部门')}ID
jcode.departmentId 

// ${t('获取外部输入参数')}
// ${t('数据及联使用')}
jcode.param 

// ${t('获取输入数据源数据')}
// ${t('注')}:${t('需要在右侧输入数据源处先添加')}
var list = jcode.data['${t('数据源编码')}']

// sql${t('查询')}
jcode.findTable(sql,params)

// ${t('返回结果')}
return list
  `);

  const colOptions = computed(() => myColumns.value.map((item: any) => ({ value: item.prop })));

  const getSettingJson = () => {
    const { sql } = currentConfig.value;
    const settingJson = {
      orders: getFormData().orders,
      type: 'code',
      dataSourceInputs: inputDbSource.value,
      sqls: [
        {
          sql,
        },
      ],
      columns: myColumns.value.map((t: any) => ({
        prop: t.prop,
        label: t.label,
        csType: t.csType,
      })),
      queryFields: getFormData().queryFields,
    };
    return aesEncryption.encrypt(JSON.stringify(settingJson));
  };

  const loadTableData = async (isNotFirst?: boolean) => {
    const { sql } = currentConfig.value;

    if (!sql) {
      error(t('请填写脚本'));
      return;
    }

    if (!isNotFirst) {
      tableCurrentPage.value = 1;
    }
    tableLoading.value = true;
    const queryData = {
      rows: tablePageSize.value,
      page: tableCurrentPage.value,
      sidx: '',
    };

    const res = await api.getViewPageByEntity(queryData, {
      f_DbId: 'jcode_view',
      f_Sql: getSettingJson(),
    });
    if (res) {
      setColumns(res.cols.map((t) => ({ ...t, minWidth: 10 * t.label.length })));
      tableData.value = res.rows;
      tableTotal.value = res.records;
    } else {
      setColumns([]);
      tableData.value = [];
      tableTotal.value = 0;
    }

    tableLoading.value = false;
  };

  const turnTablePage = ({ rows }) => {
    tablePageSize.value = rows;
    loadTableData(true);
  };

  const setColumns = (columns) => {
    myColumns.value = columns;
    let fields = myColumns.value.map((item: any) => {
      let column = {
        ...item,
        name: getColNames(item),
      };
      return column;
    });
    setFormData({ fields: fields });
    tableColumns.value = columns;
  };

  const inputDbSource = ref([]);
  const formConfigs: Record<string, FormSchemaConfig> = {
    collapse: { type: 'collapse' },
    f_Name: { rule: [...ruleDefault] },
    f_Code: {
      rule: [
        ...ruleDefault,
        {
          type: 'only',
          lr_table: 'lr_base_datasource',
          lr_key: 'f_Id',
        },
      ],
    },
    // 分类目录已去掉：改用标签输入（lr-input-tag 的值本身就是逗号分隔字符串），
    // 继续存 F_Category，历史单值分类打开后天然是一个标签；标签允许留空
    f_Category: { type: 'inputTag' },
    f_Description: { type: 'textarea' },

    queryFields: { type: 'inputCards', config: { labelWidth: '64px' } },
    'queryFields.name': {
      type: 'autoComplete',
      config: {
        loadOptions: () => colOptions,
      },
    },
    'queryFields.type': {
      type: 'select',
      config: {
        options: [
          { label: t('字串'), value: 'string' },
          { label: t('模糊字串'), value: 'like' },
          { label: t('数字'), value: 'int' },
          { label: t('时间'), value: 'DateTime' },
        ],
      },
    },
    orders: { type: 'inputCards', config: { labelWidth: '48px' } },
    'orders.field': {
      type: 'autoComplete',
      config: {
        loadOptions: () => colOptions,
      },
    },
    'orders.isDESC': {
      type: 'switch',
      config: {
        checkedValue: true,
        unCheckedValue: false,
      },
    },
    fields: {
      type: 'inputRows',
      config: { labelWidth: '48px', isRemoveBtn: false, isAddBtn: false, drag: false },
    },
    'fields.name': {
      type: 'input',
      config: {
        readonly: true,
        getUpConfig: ({ row }) => {
          return {
            addonBefore: h(
              'span',
              {
                // @ts-ignore
                style: { color: getColor(row) },
              },
              // @ts-ignore
              getTypeName(row),
            ),
          };
        },
      },
    },
    inputDbSource: {
      type: 'inputCards',
      config: {
        labelWidth: '48px',
        rowChange: ({ data, tableData, index }) => {
          tableData[index].code2 = tableData[index].code;
          tableData[index].name = data.f_Name;
          tableData[index].type = data.f_Type;
          inputDbSource.value = tableData;
          setFormData({ inputDbSource: tableData });
        },
      },
    },
    'inputDbSource.code': {
      type: 'lr-input-dbsource',
      config: {
        label: '名称',
      },
    },
    'inputDbSource.code2': {
      type: 'input',
      config: {
        label: '编码',
        readonly: true,
      },
    },
  };
  const { getFormSchema } = useAuth(pageInfo, { formConfigs });
  const formRef = ref();
  const schemas = getFormSchema('codeform');
  const { setFormData, validateForm, getFormData, resetForm } = useForm(formRef, { schemas });

  let keyValue = '';
  let isEdit = false;
  let code = '';

  const open = async (param) => {
    keyValue = param.keyValue || '';
    isEdit = param.isEdit;
    code = param.code;
    if (isEdit) {
      const data = await api.get(code);
      // 记住原有应用归属，供编辑保存时带回
      const { orders, sqls, columns, dataSourceInputs, queryFields } = JSON.parse(data.f_Sql);
      inputDbSource.value = dataSourceInputs.map((item) => {
        return { ...item, code2: item.code };
      });
      setFormData({ queryFields: queryFields, orders: orders, inputDbSource: inputDbSource.value });
      const { sql } = sqls[0];
      currentConfig.value = { sql };
      myColumns.value = columns;
      let fields = myColumns.value.map((item: any) => {
        let column = {
          ...item,
          name: getColNames(item),
        };
        return column;
      });
      setFormData({ fields: fields });
      setFormData({
        main: {
          f_Id: data.f_Id,
          f_Name: data.f_Name,
          f_Code: data.f_Code,
          f_Category: data.f_Category,
          f_Description: data.f_Description,
        },
      });
      loadTableData();
    }
  };
  /**获取字段信息*/
  const getColNames = ({ prop, label }) => {
    let name = prop;
    if (prop != label) {
      name = `${prop}(${label})`;
    }
    return name;
  };
  const validateFormAll = async () => {
    if (!(await validateForm())) {
      return false;
    }
    const formData = getFormData();
    if (formData.orders.findIndex((t) => !t.field) > -1) {
      warning(t('请完善排序字段设置'));
      return false;
    }
    const { sql } = currentConfig.value;
    if (isNullOrEmpty(sql)) {
      error(t('请填写脚本'));
      return false;
    }
    const res = await api.getViewPageByEntity(
      {
        rows: 1,
        page: 1,
        sidx: '',
      },
      {
        f_DbId: 'jcode_view',
        f_Sql: getSettingJson(),
      },
    );
    if (!res) {
      return false;
    }
    myColumns.value = res.cols;
    return true;
  };
  // 表单关闭前
  const beforeClose = () => {};

  const saveForm = async ({ keyValue, isEdit }: Record<string, any>) => {
    const formData = getFormData();
    const postData: Record<string, any> = {
      f_Name: formData.main.f_Name,
      f_Code: formData.main.f_Code,
      f_Category: formData.main.f_Category,
      f_Description: formData.main.f_Description,

      f_DbId: 'jcode_view',
      f_Type: 2, // js脚本视图
      f_Sql: getSettingJson(),
    };
    if (isEdit) {
      return await api.update(keyValue, postData);
    } else {
      return await api.add(postData);
    }
  };
  // 表单点击确定按钮
  const ok = async () => {
    if (await validateFormAll()) {
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
    myColumns.value = [];
    tableData.value = [];
    tableColumns.value = [];
    openCodeInfo.value = false;
    currentConfig.value = { sql: '' };
  };

  // 暴露方法
  defineExpose({ open, beforeClose, ok, closed, validateFormAll });
</script>
<style lang="less">
  .learurn-dbsource-form-page {
    &-right {
      position: relative;
      width: 100%;
      height: 100%;
      border-left: 1px solid var(--color-border);
      background-color: var(--color-bg-container);

      .ant-collapse > {
        border-top: 0;
        border-right: 0;
        border-left: 0;
        border-radius: 0;
      }

      .ant-collapse > .ant-collapse-item:last-child,
      .ant-collapse > .ant-collapse-item:last-child > .ant-collapse-header {
        border-radius: 0 !important;
      }
    }
  }
</style>
