<template>
  <lr-layout class="learurn-dbsource-form-page" :right="320">
    <lr-layout
      class="lr-block"
      style="padding-top: 2px; background-color: var(--color-bg-container)"
      :bottom="tableColumns.length > 0 ? 300 : 0"
    >
      <a-tabs
        type="editable-card"
        class="isFixedNotPadding"
        v-model:activeKey="activeKey"
        @edit="onEdit"
      >
        <a-tab-pane
          :closable="item.id == 'main' ? false : true"
          v-for="item of sqls"
          :key="`tab${item.id}`"
          :tab="item.label"
        >
          <div class="lr-block" style="display: flex; flex-direction: column">
            <div
              style="
                display: flex;
                position: relative;
                align-items: center;
                width: 100%;
                height: 40px;
                padding-left: 8px;
              "
            >
              <a-space
                ><lr-input-dblink style="width: 200px" v-model="item.dbCode" />
                <a-input
                  style="width: 200px"
                  v-if="item.type == '2'"
                  :placeholder="$t('用与主查询条件的参数名')"
                  v-model:value="item.paramName"
                />

                <lr-button type="primary" iconName="play-circle-outlined" @click="loadTableData" />
              </a-space>
            </div>
            <div
              style="
                position: relative;
                flex: 2;
                width: 100%;
                height: 0;
                border-top: 1px solid var(--color-border);
              "
            >
              <lr-code-mirror
                v-if="`tab${item.id}` == activeKey"
                mode="text/x-sql"
                v-model:value="item.sql"
              />
            </div>
          </div>
        </a-tab-pane>
      </a-tabs>
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
  import { buildShortUUID, EncryptionFactory, isNullOrEmpty } from '/@/core/utils/jcode';
  import { useMessage } from '@/core/hooks/useMessage';
  import { api } from '/@/core/modules/data/api/dbsource';
  import { getTypeName, getColor } from './util';
  import pageInfo from './page';
  import { t } from '@/core/locales/setupI18n';

  const { warning, success } = useMessage();
  const aesEncryption = EncryptionFactory.createAesEncryption({ key: 'jcode' });

  const activeKey = ref('tabmain');
  const myColumns = ref([]);

  const tables: Record<string, any> = {};
  const tableLoading = ref(false);
  const tableColumns = ref([]);
  const tableData = ref([]);
  const tableTotal = ref(0);
  const tablePageSize = ref(50);
  const tableCurrentPage = ref(1);

  const colOptions = computed(() => myColumns.value.map((item: any) => ({ value: item.prop })));

  const getSql = () => {
    const id = activeKey.value.replace('tab', '');
    if (id === 'main') {
      return sqls.value;
    }
    return sqls.value.filter((item) => item.id === id);
  };
  const validateSqls = (sqls) => {
    for (let i = 0, len = sqls.length; i < len; i++) {
      const { sql, type, paramName, label, dbCode } = sqls[i];
      if (!dbCode) {
        warning(`请选择${label}的数据库`);
        return false;
      }
      if (!sql) {
        warning(`请填写${label}的sql语句`);
        return false;
      }

      if (type == '2' && sqls.length > 1) {
        if (!paramName) {
          warning(`请填写${label}的参数名`);
          return false;
        }
      }
    }
    return true;
  };

  const getSettingJson = (sqls) => {
    const formData = getFormData();
    const settingJson = {
      orders: formData.orders,
      type: 'sql',
      sqls: sqls,
      columns: myColumns.value.map((t: any) => ({
        prop: t.prop,
        label: t.label,
        csType: t.csType,
      })),
      queryFields: formData.queryFields,
    };
    return aesEncryption.encrypt(JSON.stringify(settingJson));
  };

  const loadTableData = async (isNotFirst?: boolean) => {
    const sqls = getSql();

    if (!validateSqls(sqls)) {
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
      f_Sql: getSettingJson(sqls),
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

    const tableInfo = {
      tableColumns: tableColumns.value,
      tableData: tableData.value,
      tableTotal: tableTotal.value,
      tablePageSize: tablePageSize.value,
      tableCurrentPage: tableCurrentPage.value,
    };
    tables[sqls[0].id] = tableInfo;

    tableLoading.value = false;
  };

  const turnTablePage = ({ rows }) => {
    tablePageSize.value = rows;
    loadTableData(true);
  };

  const setColumns = (columns) => {
    if (activeKey.value === 'tabmain') {
      myColumns.value = columns;
      let fields = myColumns.value.map((item: any) => {
        let column = {
          ...item,
          name: getColNames(item),
        };
        return column;
      });
      setFormData({ fields: fields });
    }
    tableColumns.value = columns;
  };

  const sqls = ref([
    {
      id: 'main',
      label: t('主查询'),
      sql: '',
      type: '1',
      dbCode: 'lrsystemdb',
      paramName: '',
    },
  ]);

  const addChildSql = () => {
    const child = {
      id: buildShortUUID(),
      label: t('子查询'),
      sql: '',
      dbCode: 'lrsystemdb',
      type: '2',
      paramName: '',
    };
    sqls.value.push(child);
    activeKey.value = `tab${child.id}`;

    const tableInfo = {
      tableColumns: [],
      tableData: [],
      tableTotal: 0,
      tablePageSize: 50,
      tableCurrentPage: 1,
    };
    setTable(tableInfo);
  };

  const removeChildSql = (value) => {
    const id = value.replace('tab', '');
    const index = sqls.value.findIndex((item) => item.id === id);
    sqls.value.splice(index, 1);
    delete tables[id];
    activeKey.value = 'tabmain';
    setTable(tables[sqls.value[0].id]);
  };

  const onEdit = (targetKey: string | MouseEvent, action: string) => {
    if (action === 'add') {
      addChildSql();
    } else {
      removeChildSql(targetKey as string);
    }
  };

  const setTable = (tableInfo) => {
    console.log(tableInfo);
  };

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
  };
  const { getFormSchema } = useAuth(pageInfo, { formConfigs });
  const formRef = ref();
  const schemas = getFormSchema();
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
      if (data.f_DbId == 'jcode_view' || data.f_DbId == 'jcode_new_data') {
        const { orders, sqls: _sqls, columns, queryFields } = JSON.parse(data.f_Sql);
        setFormData({ queryFields: queryFields || [], orders: orders || [] });
        sqls.value = _sqls
          .filter((t) => !(t.relations && t.relations.length > 0))
          .map((item) => {
            if (item.label === '主查询' || item.id == 'main') {
              return {
                id: item.id || 'main',
                label: item.label,
                sql: item.sql,
                type: '1',
                dbCode: item.dbCode,
                paramName: item.paramName || '',
              };
            } else {
              return item;
            }
          });
        myColumns.value = columns;
        let fields = myColumns.value.map((item: any) => {
          let column = {
            ...item,
            name: getColNames(item),
          };
          return column;
        });
        setFormData({ fields: fields });
      } else {
        sqls.value[0].sql = data.f_Sql;
        sqls.value[0].dbCode = data.f_DbId;
      }
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
    if (isNullOrEmpty(sqls.value)) {
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
        f_Sql: getSettingJson(sqls.value),
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
      f_Type: 0, // sql视图
      f_Sql: getSettingJson(sqls.value),
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
    sqls.value = [
      {
        id: 'main',
        label: t('主查询'),
        sql: '',
        type: '1',
        dbCode: 'lrsystemdb',
        paramName: '',
      },
    ];
    myColumns.value = [];
    tableData.value = [];
    tableColumns.value = [];
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
