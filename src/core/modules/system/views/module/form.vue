<template>
  <div class="module-form">
    <a-tabs
      v-model:activeKey="activeTab"
      class="module-form__tabs"
      :destroy-inactive-tab-pane="false"
    >
      <a-tab-pane key="base" :tab="$t('基本信息')">
        <lr-c-schema-form :formConfig="{ labelWidth: '64px' }" ref="formRef" />
      </a-tab-pane>

      <template v-if="isMobile">
        <a-tab-pane key="btns" :tab="$t('按钮字段')">
          <div class="scheme-panel">
            <div class="scheme-panel__bar">
              <span class="scheme-panel__tip">
                {{ $t('配置该移动端功能的操作按钮，编码供 App 端按权限显示') }}
              </span>
              <lr-button type="primary" :label="$t('新增按钮')" @click="addRow('btns')">
                <template #icon>
                  <lr-icon icon="ant-design:plus-outlined" :is-div="false" class="lr-button-icon" />
                </template>
              </lr-button>
            </div>
            <a-table
              :columns="btnColumns"
              :data-source="scheme.btns"
              :pagination="false"
              :locale="{ emptyText: $t('暂无按钮，点击右上角新增') }"
              size="small"
              row-key="__key"
              :scroll="{ y: 400 }"
            >
              <template #bodyCell="{ column, record, index }">
                <template v-if="column.dataIndex === 'label'">
                  <a-input v-model:value="record.label" :placeholder="$t('如：新增')" />
                </template>
                <template v-else-if="column.dataIndex === 'prop'">
                  <a-input v-model:value="record.prop" :placeholder="$t('如：Add')" />
                </template>
                <template v-else-if="column.dataIndex === 'actionKey'">
                  <span class="scheme-panel__action" @click="moveRow('btns', index, -1)">
                    {{ $t('上移') }}
                  </span>
                  <span class="scheme-panel__action" @click="moveRow('btns', index, 1)">
                    {{ $t('下移') }}
                  </span>
                  <span class="scheme-panel__action is-danger" @click="removeRow('btns', index)">
                    {{ $t('删除') }}
                  </span>
                </template>
              </template>
            </a-table>
          </div>
        </a-tab-pane>

        <a-tab-pane key="columns" :tab="$t('列表字段')">
          <div class="scheme-panel">
            <div class="scheme-panel__bar">
              <span class="scheme-panel__tip">
                {{ $t('配置该移动端功能列表显示的字段') }}
              </span>
              <lr-button type="primary" :label="$t('新增字段')" @click="addRow('columns')">
                <template #icon>
                  <lr-icon icon="ant-design:plus-outlined" :is-div="false" class="lr-button-icon" />
                </template>
              </lr-button>
            </div>
            <a-table
              :columns="columnColumns"
              :data-source="scheme.columns"
              :pagination="false"
              :locale="{ emptyText: $t('暂无字段，点击右上角新增') }"
              size="small"
              row-key="__key"
              :scroll="{ y: 400 }"
            >
              <template #bodyCell="{ column, record, index }">
                <template v-if="column.dataIndex === 'prop'">
                  <a-input v-model:value="record.prop" :placeholder="$t('如：f_Name')" />
                </template>
                <template v-else-if="column.dataIndex === 'label'">
                  <a-input v-model:value="record.label" :placeholder="$t('如：名称')" />
                </template>
                <template v-else-if="column.dataIndex === 'actionKey'">
                  <span class="scheme-panel__action" @click="moveRow('columns', index, -1)">
                    {{ $t('上移') }}
                  </span>
                  <span class="scheme-panel__action" @click="moveRow('columns', index, 1)">
                    {{ $t('下移') }}
                  </span>
                  <span class="scheme-panel__action is-danger" @click="removeRow('columns', index)">
                    {{ $t('删除') }}
                  </span>
                </template>
              </template>
            </a-table>
          </div>
        </a-tab-pane>

        <a-tab-pane key="formFields" :tab="$t('表单字段')">
          <div class="scheme-panel">
            <div class="scheme-panel__bar">
              <span class="scheme-panel__tip">
                {{ $t('配置该移动端功能新增/编辑表单的字段') }}
              </span>
              <lr-button type="primary" :label="$t('新增字段')" @click="addRow('formFields')">
                <template #icon>
                  <lr-icon icon="ant-design:plus-outlined" :is-div="false" class="lr-button-icon" />
                </template>
              </lr-button>
            </div>
            <a-table
              :columns="formFieldColumns"
              :data-source="scheme.formFields"
              :pagination="false"
              :locale="{ emptyText: $t('暂无字段，点击右上角新增') }"
              size="small"
              row-key="__key"
              :scroll="{ y: 400 }"
            >
              <template #bodyCell="{ column, record, index }">
                <template v-if="column.dataIndex === 'prop'">
                  <a-input v-model:value="record.prop" :placeholder="$t('如：f_Name')" />
                </template>
                <template v-else-if="column.dataIndex === 'label'">
                  <a-input v-model:value="record.label" :placeholder="$t('如：名称')" />
                </template>
                <template v-else-if="column.dataIndex === 'actionKey'">
                  <span class="scheme-panel__action" @click="moveRow('formFields', index, -1)">
                    {{ $t('上移') }}
                  </span>
                  <span class="scheme-panel__action" @click="moveRow('formFields', index, 1)">
                    {{ $t('下移') }}
                  </span>
                  <span
                    class="scheme-panel__action is-danger"
                    @click="removeRow('formFields', index)"
                  >
                    {{ $t('删除') }}
                  </span>
                </template>
              </template>
            </a-table>
          </div>
        </a-tab-pane>
      </template>
    </a-tabs>
  </div>
</template>
<script lang="ts" setup>
  import type { FormSchemaConfig } from '/#/form';
  import { computed, reactive, ref } from 'vue';
  import { useAuth } from '/@/core/hooks/useAuth';
  import { useForm } from '/@/core/hooks/useForm';
  import { useMenu } from '/@/core/hooks/useMenu';
  import { useMessage } from '@/core/hooks/useMessage';
  import { toTree } from '@/core/utils/jcode';
  import { ruleDefault, ruleSelectDefault } from '/@/core/utils/validator';
  import { api } from '/@/core/modules/system/api/module';
  import pageInfo from './page';
  import { t } from '@/core/locales/setupI18n';

  const { success } = useMessage();
  const { loadList } = useMenu();

  let isEdit = false;
  let keyValue = '';
  // 终端在新增/编辑时固定（新增取当前 tab，编辑取原有值），不允许在表单里改
  const terminalType = ref(0);
  const isMobile = computed(() => terminalType.value === 1);
  // 编辑电脑端时保留原方案，避免保存时把移动端方案清空
  const originalScheme = ref<string>('');
  const activeTab = ref('base');

  // 上级目录只能选同一维护范围内的目录；null 表示不限（旧入口没传）
  const scopeExpandIds = ref<string[] | null>(null);
  // 当前终端的目录数据：由菜单管理页按终端传入，避免依赖只含电脑端的全局菜单
  const parentSource = ref<any[]>([]);

  const parentTree = computed(() => {
    const ids = scopeExpandIds.value;
    const list = ids
      ? parentSource.value.filter((item) => ids.includes(item.f_ModuleId))
      : parentSource.value;
    return toTree(list, 'f_ModuleId', 'f_ParentId', 'f_ModuleId', 'f_FullName');
  });

  /** 移动端功能方案：按钮 / 列表字段 / 表单字段 */
  type SchemeKind = 'btns' | 'columns' | 'formFields';
  type SchemeRow = Record<string, any>;
  const scheme = reactive<Record<SchemeKind, SchemeRow[]>>({
    btns: [],
    columns: [],
    formFields: [],
  });

  let rowSeq = 0;
  const nextKey = () => `r${++rowSeq}`;

  const btnColumns = [
    { title: t('按钮名称'), dataIndex: 'label', width: 150 },
    { title: t('按钮编码'), dataIndex: 'prop', width: 160 },
    { title: t('操作'), dataIndex: 'actionKey', width: 130, align: 'center' },
  ];
  const columnColumns = [
    { title: t('字段名'), dataIndex: 'prop', width: 150 },
    { title: t('标题'), dataIndex: 'label', width: 140 },
    { title: t('操作'), dataIndex: 'actionKey', width: 130, align: 'center' },
  ];
  const formFieldColumns = [
    { title: t('字段名'), dataIndex: 'prop', width: 150 },
    { title: t('标题'), dataIndex: 'label', width: 140 },
    { title: t('操作'), dataIndex: 'actionKey', width: 130, align: 'center' },
  ];

  const rowDefault = {
    btns: () => ({ label: '', prop: '' }),
    columns: () => ({ prop: '', label: '' }),
    formFields: () => ({ prop: '', label: '' }),
  };

  const addRow = (kind: SchemeKind) => {
    scheme[kind].push({ __key: nextKey(), ...rowDefault[kind]() });
  };

  const removeRow = (kind: SchemeKind, index: number) => {
    scheme[kind].splice(index, 1);
  };

  const moveRow = (kind: SchemeKind, index: number, step: number) => {
    const list = scheme[kind];
    const target = index + step;
    if (target < 0 || target >= list.length) {
      return;
    }
    const [row] = list.splice(index, 1);
    list.splice(target, 0, row);
  };

  /** 各组方案保留的字段 */
  const schemeFields: Record<SchemeKind, string[]> = {
    btns: ['label', 'prop'],
    columns: ['prop', 'label'],
    formFields: ['prop', 'label'],
  };

  /** 解析方案 JSON */
  const loadScheme = (value?: string) => {
    scheme.btns = [];
    scheme.columns = [];
    scheme.formFields = [];
    if (!value) {
      return;
    }
    try {
      const data = JSON.parse(value) || {};
      (['btns', 'columns', 'formFields'] as SchemeKind[]).forEach((kind) => {
        const list = Array.isArray(data[kind]) ? data[kind] : [];
        const keys = schemeFields[kind];
        scheme[kind] = list.map((item) => ({
          __key: nextKey(),
          ...Object.fromEntries(keys.map((key) => [key, item[key]])),
        }));
      });
    } catch (e) {
      console.warn('移动端功能方案解析失败', e);
    }
  };

  /** 生成方案 JSON：去掉空行与内部 key */
  const buildScheme = () => {
    const pick = (kind: SchemeKind) =>
      scheme[kind]
        .filter((row) => String(row.prop || '').trim() || String(row.label || '').trim())
        .map(({ __key, ...rest }) => rest);
    return JSON.stringify({
      btns: pick('btns'),
      columns: pick('columns'),
      formFields: pick('formFields'),
    });
  };

  const formConfigs: Record<string, FormSchemaConfig> = {
    f_EnCode: {
      config: { span: 12 },
      rule: [...ruleDefault],
    },
    f_FullName: {
      config: { span: 12 },
      rule: [...ruleDefault],
    },
    f_ParentId: {
      type: 'treeSelect',
      config: {
        span: 12,
        loadOptions: () => parentTree,
      },
    },
    f_TerminalType: {
      type: 'select',
      config: {
        span: 12,
        disabled: true,
        defaultValue: 0,
        options: [
          { value: 0, label: t('电脑端') },
          { value: 1, label: t('移动端') },
        ],
      },
    },
    f_Icon: {
      type: 'lr-input-icon',
      config: {
        span: 12,
      },
    },

    // 移动端用「分类」组织功能（数据字典 function），不再配置导航目标
    f_Type: {
      type: 'select',
      config: {
        span: 12,
        dataType: 'dataItem',
        dataCode: 'function',
        placeholder: t('请选择功能分类'),
        getUpConfig: () => {
          return { display: isMobile.value };
        },
      },
    },

    f_Target: {
      type: 'select',
      config: {
        span: 12,
        options: [
          {
            value: 'expand',
            label: t('菜单目录'),
          },
          {
            value: 'view',
            label: t('功能页面'),
          },
          {
            value: 'blankView',
            label: t('独立页面'),
          },
        ],
        getUpConfig: ({ formData }) => {
          return {
            display:
              !isMobile.value &&
              !['custmerView', 'desktopView', 'biView'].includes(formData.f_Target),
          };
        },
      },
      rule: [...ruleSelectDefault],
    },
    f_UrlAddress: {
      config: {
        getUpConfig: ({ formData }) => {
          return { display: !['custmerView', 'desktopView', 'biView'].includes(formData.f_Target) };
        },
      },
    },
    f_SortCode: {
      config: { defaultValue: 99, span: 12 },
    },
    f_IsMenu: {
      type: 'switch',
      config: { defaultValue: 1, span: 12 },
    },
    f_EnabledMark: {
      type: 'switch',
      config: { defaultValue: 1, span: 12 },
    },
    f_Description: {
      type: 'textarea',
    },
  };

  const { getFormSchema } = useAuth(pageInfo, { formConfigs });
  const formRef = ref();
  const schemas = getFormSchema();
  const { validateForm, getFormData, setFormData, resetForm } = useForm(formRef, { schemas });

  const getForm = () => {
    // 获取表单数据 对表单数据进行处理
    const formData = getFormData().main;
    if (!formData.f_ParentId) {
      formData.f_ParentId = '0';
    }
    // 终端固定：新增取当前 tab，编辑取原有值，始终以打开时确定的值为准
    formData.f_TerminalType = terminalType.value;
    if (isMobile.value) {
      formData.f_Scheme = buildScheme();
    } else if (originalScheme.value !== undefined) {
      formData.f_Scheme = originalScheme.value || null;
    }
    return formData;
  };

  const saveForm = async ({ keyValue, isEdit }: Record<string, any>) => {
    const formData = getForm();
    // console.log(formData);
    formData.f_ModuleId = keyValue;
    if (isEdit) {
      return await api.update(keyValue, formData);
    } else {
      return await api.add(formData);
    }
  };

  const loadFormData = async ({ keyValue }: Record<string, any>) => {
    const formData = await api.get(keyValue);
    if (formData) {
      if (formData.f_ParentId == '0') {
        formData.f_ParentId = '';
      }
      originalScheme.value = formData.f_Scheme || '';
      loadScheme(formData.f_Scheme);
      setFormData({ main: formData });
      return true;
    }
    return false;
  };

  // 表单打开
  const open = async (param) => {
    isEdit = param.isEdit;
    activeTab.value = 'base';
    scopeExpandIds.value = Array.isArray(param.expandIds) ? param.expandIds : null;
    parentSource.value = Array.isArray(param.expandList) ? param.expandList : [];
    if (isEdit) {
      keyValue = param.row?.f_ModuleId;
      terminalType.value = param.row?.f_TerminalType ?? 0;
      loadFormData({ keyValue });
    } else {
      // 新增时终端跟随当前维护的 tab
      terminalType.value = param.terminalType ?? 0;
      originalScheme.value = '';
      loadScheme('');
      // 移动端从左侧分类进入新增时，默认选中该分类
      setFormData({
        main: {
          f_TerminalType: terminalType.value,
          ...(param.category ? { f_Type: param.category } : {}),
        },
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
        await loadList();
        success(t('保存成功'));
        return true;
      }
    }
  };

  // 表单关闭后
  const closed = () => {
    keyValue = '';
    activeTab.value = 'base';
    resetForm();
  };

  // 暴露方法
  defineExpose({ open, beforeClose, ok, closed, loadFormData, validateForm, saveForm });
</script>

<style lang="less" scoped>
  .module-form {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    min-height: 0;

    &__tabs {
      display: flex;
      flex: 1;
      flex-direction: column;
      min-height: 0;

      :deep(.ant-tabs-nav) {
        flex: none;
        margin-bottom: 0;
        padding: 0 8px;
      }

      :deep(.ant-tabs-content-holder) {
        flex: 1;
        min-height: 0;
        overflow: hidden;
      }

      :deep(.ant-tabs-content) {
        height: 100%;
      }

      :deep(.ant-tabs-tabpane) {
        height: 100%;
        overflow: auto;
      }
    }
  }

  .scheme-panel {
    display: flex;
    box-sizing: border-box;
    flex-direction: column;
    height: 100%;
    padding: 8px;

    // 表格撑满面板剩余高度：表头固定，表体按剩余高度滚动
    :deep(.ant-table-wrapper),
    :deep(.ant-spin-nested-loading),
    :deep(.ant-spin-container),
    :deep(.ant-table),
    :deep(.ant-table-container) {
      height: 100%;
      min-height: 0;
    }

    :deep(.ant-table-wrapper) {
      flex: 1;
      min-height: 0;
    }

    :deep(.ant-table-container) {
      display: flex;
      flex-direction: column;
    }

    :deep(.ant-table-header) {
      flex: none;
    }

    :deep(.ant-table-body) {
      flex: 1;
      min-height: 0;
      max-height: none !important;
      overflow-y: auto !important;
    }
  }

  .scheme-panel__bar {
    display: flex;
    flex: none;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;

    // 与列表页的新增按钮保持一致，不被提示文字挤压
    :deep(.lr-button) {
      flex: none;
    }
  }

  .scheme-panel__tip {
    color: var(--color-text-tertiary);
    font-size: 12px;
  }

  .scheme-panel__action {
    margin-right: 8px;
    color: var(--color-primary);
    cursor: pointer;

    &:last-child {
      margin-right: 0;
    }

    &.is-danger {
      color: var(--color-error);
    }
  }
</style>
