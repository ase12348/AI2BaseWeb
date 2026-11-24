<template>
  <div class="lr-form-design lr-block">
    <div class="lr-form-design-left">
      <div class="lr-form-design-title">
        <a-typography-text ellipsis style="margin: 0; font-size: 14px" :content="$t('组件')" />
      </div>
      <div class="lr-form-design-panel">
        <a-collapse v-model:activeKey="collapseComponentActiveKey">
          <a-collapse-panel v-for="(item, index) of components" :key="index" :header="item.name">
            <lr-drag-tool v-for="(component, i) of item.children" :key="i" :config="component">
              <div
                class="lr-component-tool"
                :style="{
                  'border-bottom': hasBorderBottom(i, item.children.length) ? 0 : undefined,
                  'border-right': (i + 1) % 3 == 0 ? 0 : undefined,
                }"
              >
                <lr-icon class="lr-component-tool-icon" :icon="component.icon" :size="32" />
                <div class="lr-component-tool-name">{{ $t(component.name) }}</div>
              </div>
            </lr-drag-tool>
          </a-collapse-panel>
        </a-collapse>
      </div>
    </div>
    <div class="lr-form-design-mid">
      <div class="lr-form-design-tool">
        <a-space>
          <lr-button v-show="!notBindTable" type="link" @click="handleOpenAddComponentByTable"
            >{{ $t('快速添加组件') }}
          </lr-button>
        </a-space>
        <a-space>
          <a-tooltip :title="$t('清空')">
            <lr-button danger type="text" @click="handleClear">
              <template #icon>
                <lr-icon icon="ant-design:delete-outlined" />
              </template>
            </lr-button>
          </a-tooltip>
          <a-divider type="vertical" />
          <a-tooltip :title="$t('预览')">
            <lr-button type="text" @click="handleOpenPreviewForm">
              <template #icon>
                <lr-icon icon="ant-design:play-circle-outlined" />
              </template>
            </lr-button>
          </a-tooltip>
        </a-space>
      </div>
      <a-form
        class="lr-form-design-body"
        :label-align="form.config.labelPosition == 'top' ? 'left' : form.config.labelPosition"
        :layout="form.config.labelPosition == 'top' ? 'vertical' : 'horizontal'"
      >
        <lr-drag-container
          ref="dragContainer"
          class="lr-form-design-canvas"
          :is-component-container="false"
          :component-data="form"
        >
          <div
            v-if="!form.children || form.children?.length === 0"
            class="lr-block"
            style="display: flex; position: absolute; align-items: center; justify-content: center"
          >
            <a-empty :description="$t('请添加组件')" />
          </div>
          <a-row v-else>
            <lr-drag-list :component-list="form.children" :global-config="form.config" />
          </a-row>
        </lr-drag-container>
      </a-form>
    </div>
    <div class="lr-form-design-right" v-show="activedComponent">
      <div class="lr-form-design-title">
        <a-typography-text
          ellipsis
          style="margin: 0; font-size: 14px"
          :content="`${$t('属性配置')}${activedName}`"
        />
      </div>
      <div class="lr-form-design-panel">
        <lr-c-schema-form
          :form-config="{
            labelWidth: '80px',
            labelAlign: 'left',
          }"
          style="padding: 0"
          ref="configRef"
          @change="handleChange"
        />
      </div>
    </div>

    <lr-layer
      ref="previewFormLayerRef"
      :width="previewForm.width"
      :height="previewForm.height"
      @ok="handlePreviewFormOk"
      @closed="handlePreviewFormClosed"
    >
      <lr-c-schema-form
        :form-config="previewForm.formConfig"
        :is-preview="true"
        ref="previewFormRef"
      />
    </lr-layer>
    <lr-layer
      ref="importFormLayerRef"
      :width="800"
      :height="600"
      btn-text="确认"
      @ok="handleImportFormOk"
      @closed="handleImportFormClosed"
    >
      <importComponent
        :component-list="componentList"
        :table-list="tableList"
        ref="importComponentRef"
      />
    </lr-layer>
  </div>
</template>

<script lang="ts" setup>
  import type { SchemaConfig } from '../cSchemaForm/interface';
  import type {
    FormDesignComponents,
    FormDesignComponent,
    DbTable,
    DbTableColumn,
    FormDeisgnSaveComponent,
  } from './interface';

  import type { DesignComponent } from '../drag/interface';

  import { PropType, computed, ref, provide, reactive, nextTick } from 'vue';
  import { createNamespace } from '../utils/components';
  import {
    toFormSchema,
    toFormSaveSchema,
    toFormDesignSchema,
    resetTable,
    generateUniqueName,
  } from './utils';
  import { useFramework } from '../utils/useFramework';
  import { isNullOrEmpty } from '../utils/is';
  import { deepClone } from '../utils/method';

  import { useDesign } from '../drag/hooks/useDesign';
  import importComponent from './importComponent.vue';

  defineOptions({ name: createNamespace('formDesign').name });
  const props = defineProps({
    /**
     * @zh 是否需要绑定表
     */
    notBindTable: Boolean,
    /**
     * @zh 组件列表
     */
    components: {
      type: Array as PropType<FormDesignComponents[]>,
      default: () => [],
    },
    /**
     * @zh 组件配置
     */
    componentConfigs: {
      type: Object as PropType<Record<string, SchemaConfig[]>>,
      default: () => ({}),
    },
    /**
     * @zh 组件初始化方法
     */
    componentInit: Function,
    /**
     * @zh 容器组件添加组件后调用
     */
    containerAddComponent: Function,
    /**
     * @zh 组件配置初始化方法
     */
    componentConfigInit: Function,
    /**
     * @zh 配置值变更方法
     */
    componentConfigChange: Function,
    /**
     * @zh 配置值校验
     */
    componentConfigValidate: Function,
  });

  //
  const form = reactive<DesignComponent>({
    name: '表单',
    id: 'form',
    type: 'form',
    level: 0,
    children: [],
    dragType: 'container',
    componentName: '',
    containerId: '',
    isInput: false,
    config: {},
  });

  if (props.componentInit) {
    form.config = props.componentInit('form') || {};
  }

  const { useMessage } = useFramework({});
  const { error, warning } = useMessage();

  const tableList = ref<DbTable[]>([]);
  const tableOptions = computed(() =>
    tableList.value.map((item) => ({
      label: item.comment ? `${item.name}(${item.comment})` : item.name,
      value: item.name,
    })),
  );
  const tableColumns = computed(() => {
    if (activedComponent.value) {
      const configFormData = configRef.value.getFormData(false);
      if (configFormData.table) {
        const table = tableList.value.find((item) => item.name === configFormData.table);
        if (table) {
          return table.columns.map((item) => ({
            value: item.name,
            label: item.coment ? `${item.name}(${item.coment})` : item.name,
            coment: item.coment,
          }));
        }
      }
    }
    return [];
  });

  const pSetTables = (list: DbTable[]) => {
    tableList.value = list;
    clearSelect();
    resetTable(form.children || [], list);
  };

  // 可切换的组件类型
  const componentsMap: Record<string, FormDesignComponent> = {};
  const componentList: { label: string; value: string }[] = [];
  props.components.forEach(({ children }) => {
    children.forEach((item) => {
      componentsMap[item.type] = item;
      item.dragType = item.dragType || 'component';
      if (item.isInput !== false) {
        item.isInput = true;
        componentList.push({
          label: item.name,
          value: item.type,
        });
      }
    });
  });

  const myComponentConfigs: Record<string, SchemaConfig[]> = {};
  Object.keys(props.componentConfigs).forEach((key) => {
    const {
      hasBase,
      isInput,
      hasTwoPlaceholder,
      hasPlaceholder,
      hasSpan,
      hasLabel,
      bindTable,
      labelTitle,
    } = componentsMap[key] || { hasBase: false };

    const baseConfig: SchemaConfig[] = [
      {
        id: 'id',
        type: 'input',
        slot: 'c1',
        config: {
          label: 'ID',
          readonly: true,
        },
      },
      {
        id: 'componentType',
        type: 'select',
        slot: 'c1',
        config: {
          label: '类型',
          allowClear: false,
          display: isInput,
          options: componentList,
        },
      },

      {
        id: 'notLabel',
        type: 'switch',
        slot: 'c1',
        config: {
          label: '不显示' + (labelTitle || '标题'),
          checkedValue: true,
          unCheckedValue: false,
          getUpConfig: ({ formData }) => ({
            display: hasLabel !== false && !formData.isSubTable,
          }),
        },
      },
      {
        id: 'label',
        type: 'input',
        slot: 'c1',
        config: {
          label: labelTitle || '标题',
          getUpConfig: ({ formData }) => ({
            display: hasLabel !== false && !formData.notLabel,
          }),
        },
      },
      {
        id: 'labelWidth',
        type: 'number',
        slot: 'c1',
        config: {
          label: '标题宽度',
          getUpConfig: ({ formData }) => ({
            display: isInput && !formData.notLabel && !formData.isSubTable,
          }),
        },
      },
      {
        id: 'placeholder',
        type: 'input',
        slot: 'c1',
        config: {
          display: isInput && !hasTwoPlaceholder && hasPlaceholder !== false,
          label: '占位提示',
        },
      },
      {
        id: 'startPlaceholder',
        type: 'input',
        slot: 'c1',
        config: {
          display: !!hasTwoPlaceholder,
          label: '开始占位',
        },
      },
      {
        id: 'endPlaceholder',
        type: 'input',
        slot: 'c1',
        config: {
          display: !!hasTwoPlaceholder,
          label: '结束占位',
        },
      },
      {
        id: 'span',
        type: 'slider',
        slot: 'c1',
        config: {
          label: '表单栅栏',
          min: 6,
          max: 24,
          showTooltip: true,
          step: null,
          marks: { 6: '', 12: '', 18: '', 24: '' },
          getUpConfig: ({ formData }) => ({
            display: hasSpan !== false && !formData.isSubTable,
          }),
        },
      },
      {
        id: 'width',
        type: 'number',
        slot: 'c1',
        config: {
          label: '单元格宽度',
          min: 1,
          getUpConfig: ({ formData }) => ({ display: !!formData.isSubTable }),
        },
      },

      /// 字段属性
      {
        id: 'isNotSave',
        type: 'switch',
        slot: 'c1',
        config: {
          label: '不存表',
          display: isInput && bindTable !== false,
          checkedValue: true,
          unCheckedValue: false,
        },
      },

      {
        id: 'table',
        type: 'select',
        slot: 'c1',
        config: {
          label: '数据表',
          loadOptions: () => tableOptions,
          getUpConfig: ({ formData }) => ({
            display:
              ((isInput && bindTable !== false) || bindTable === true) &&
              (!formData.isSubTable || bindTable === true) &&
              !formData.isNotSave &&
              !props.notBindTable,
          }),
        },
      },
      {
        id: 'field',
        type: 'select',
        slot: 'c1',
        config: {
          label: '表字段',
          loadOptions: () => tableColumns,
          getUpConfig: ({ formData }) => ({
            display: isInput && bindTable !== false && !formData.isNotSave && !props.notBindTable,
          }),
        },
      },

      {
        id: 'csType',
        type: 'select',
        slot: 'c1',
        config: {
          label: '字段类型',
          allowClear: false,
          options: [
            { label: '短文本', value: 'string' },
            { label: '长文本', value: 'text' },
            { label: '整数', value: 'int' },
            { label: '小数', value: 'decimal' },
            { label: '时间日期', value: 'DateTime' },
            /*
              { label: 'bool', value: 'bool' },
              { label: 'long', value: 'long' },
              { label: 'short', value: 'short' },
              { label: 'double', value: 'double' },
              { label: 'float', value: 'float' },
              { label: 'TimeSpan', value: 'TimeSpan' },
              { label: 'nstring', value: 'nstring' },
               */
          ],
          getUpConfig: ({ formData }) => ({
            display: isInput && bindTable !== false && !formData.isNotSave && props.notBindTable,
          }),
        },
      },
      {
        id: 'fieldLen',
        type: 'number',
        slot: 'c1',
        config: {
          label: '字段长度',
          getUpConfig: ({ formData }) => ({
            display:
              isInput &&
              bindTable !== false &&
              !formData.isNotSave &&
              props.notBindTable &&
              formData.csType === 'string',
          }),
        },
      },
    ];

    const collapseItem: SchemaConfig = {
      type: 'collapse',
      config: {
        groups: [],
        defaultValue: [],
      },
      children: [],
    };

    if (hasBase !== false) {
      collapseItem.config?.groups.push({ i: 'c1', label: '基础属性' });
      collapseItem.config?.defaultValue.push('c1');
      collapseItem.children?.push(...baseConfig);

      /*
        if ((isInput && bindTable !== false) || bindTable) {
          collapseItem.config?.groups.push({ i: 'c2', label: '字段属性' })
          collapseItem.children?.push(...tableConfig)
        }
        */
    }
    // collapseItem.children?.push(...props.componentConfigs[key])

    props.componentConfigs[key].forEach((group, index) => {
      const i = `m${index}`;

      if (hasBase === false && index === 0) {
        collapseItem.config?.defaultValue.push(i);
      }

      collapseItem.config?.groups.push({ i, label: group.config?.label });
      group.children?.forEach((item) => {
        item.slot = i;
        collapseItem.children?.push(item);
      });
    });

    myComponentConfigs[key] = [collapseItem];
  });

  const handleChange = (
    component: Record<string, any>,
    params: {
      value: any;
      data?: any;
      index?: number;
      tableData?: Record<string, any>[];
      type?: string;
    },
  ) => {
    const { value } = params;

    if (component.id === 'componentType') {
      changeComponent(value);
    }

    if (activedComponent.value && props.componentConfigChange) {
      if (component.id === 'field' && params.data?.coment) {
        activedComponent.value.config.label = params.data?.coment;
      }

      props.componentConfigChange(activedComponent.value.type, {
        configRef,
        component,
        configData: activedComponent.value.config,
        ...params,
      });
    }
    if (component.id === 'table') {
      if (activedComponent.value && activedComponent.value.type === 'gridtable') {
        (activedComponent.value.children || []).forEach((item: Record<string, any>) => {
          if (item.isInput) {
            item.config.table = value;
          }
        });
      }
    }
  };

  /* const handleClick = (id: string, even: any, component: Record<string, any>) => {
      console.log(id, even, component,'handleClick')
    } */

  const myComponentConfigInit = (
    type: string,
    data: { components: Record<string, any>[]; configData: Record<string, any> },
  ) => {
    // 如果只有一个表就默认设置

    if (componentsMap[type]?.isInput) {
      if (props.notBindTable) {
        if (!data.configData.csType) {
          configRef.value.setFormData({
            main: {
              csType: componentsMap[type]?.csType,
              fieldLen: componentsMap[type]?.fieldLen,
            },
          });
        }
      }

      if (tableOptions.value.length === 1) {
        configRef.value.setFormData({
          main: { table: tableOptions.value[0].value },
        });
      }
    }

    if (props.componentConfigInit) {
      props.componentConfigInit(type, { configRef, ...data, notBindTable: props.notBindTable });
    }
  };

  const myContainerAddComponent = (
    type: string,
    data: { container: Record<string, any>; groupId: string; configData: Record<string, any> },
    isContainerIdChange: boolean,
  ) => {
    let isSubTableChange = false;
    const component = componentsMap[type];

    if (data.container.type === 'gridtable') {
      if (!data.configData.isSubTable || isContainerIdChange) {
        data.configData.isSubTable = true;
        if (component.isInput) {
          data.configData.table = data.container.config.table;
          data.configData.field = '';
        }
        isSubTableChange = true;
      }
    } else if (data.configData.isSubTable) {
      isSubTableChange = true;
      data.configData.isSubTable = false;
      if (component.isInput) {
        data.configData.table = '';
      }
    }

    if (props.containerAddComponent) {
      props.containerAddComponent(type, data);
    }

    return isSubTableChange;
  };

  const dragContainer = ref();
  const configRef = ref();
  const {
    activedComponent,
    clearComponents,
    changeComponent,
    schemaComponentDic,
    addComponentByTable,
    clearSelect,
  } = useDesign(
    dragContainer,
    configRef,
    form,
    props.componentInit,
    myComponentConfigInit,
    myComponentConfigs,
    componentsMap,
    myContainerAddComponent,
  );

  const activedName = computed(() =>
    activedComponent.value ? `【${activedComponent.value.name}】` : '',
  );

  // 左侧组件
  const collapseComponentActiveKey = ref<number[]>([]);
  const len = props.components.length;
  for (let i = 0; i < len; i++) {
    collapseComponentActiveKey.value.push(i);
  }

  const hasBorderBottom = (i: number, len: number) => {
    if (len % 3 === 0) {
      return i >= len - 3;
    }
    return i >= Math.floor(len / 3) * 3;
  };

  provide('jcode-design-provide', {
    designItemName: 'lr-form-design-item',
  });

  const handleClear = () => {
    clearComponents();
  };

  // 方法
  const pReset = () => {
    if (props.componentInit) {
      form.config = props.componentInit('form') || {};
    }
    clearComponents();
  };

  const pGetSchema = () => {
    let m = 0;
    const res = toFormSaveSchema(form.config, form.children || []);
    if (props.notBindTable) {
      const tableMap: Record<string, any> = {};
      // 用于追踪所有已使用的表名,确保唯一性
      const usedTableNames = new Set<string>();
      // 用于追踪每个表的字段名,key为表名,value为该表的字段名集合
      const tableFieldNames: Record<string, Set<string>> = {};

      res.components.forEach((component) => {
        const { isInput, bindTable } = componentsMap[component.type] || { hasBase: false };
        if (isInput && bindTable !== false) {
          if (component.config.table && !tableMap.main) {
            tableMap.main = {
              name: component.config.table,
              comment: '主表',
              type: 'main',
              pKey: 'F_Id',
            };
            usedTableNames.add(component.config.table);
            // 初始化主表的字段名集合
            tableFieldNames[component.config.table] = new Set<string>();
          }
        } else if (bindTable) {
          // 为子表生成随机表名
          const tableName = component.config.table || `T_${new Date().getTime()}${m}`;
          m++;
          usedTableNames.add(tableName);
          // 初始化子表的字段名集合
          tableFieldNames[tableName] = new Set<string>();

          tableMap[component.id] = {
            name: tableName,
            comment: `子表${component.config.label}`,
            type: 'chlid',
            field: 'F_PId',
            relationField: 'F_Id',
            pKey: 'F_Id',
            // relationName: 'f_parent',
          };
          component.config.table = tableMap[component.id].name;
          m++;
        }
      });
      if (!tableMap.main) {
        // 如果没有主表,生成一个随机主表名称
        const mainTableName = `T_${new Date().getTime()}${m}`;
        m++;
        usedTableNames.add(mainTableName);
        // 初始化主表的字段名集合
        tableFieldNames[mainTableName] = new Set<string>();

        tableMap.main = {
          name: mainTableName,
          comment: '主表',
          type: 'main',
          pKey: 'F_Id',
        };
      }

      res.components.forEach((component) => {
        const { isInput, bindTable } = componentsMap[component.type] || { hasBase: false };
        if (!component.config.isNotSave && isInput && bindTable !== false) {
          if (!component.config.csType) {
            component.config.csType = componentsMap[component.type]?.csType;
            component.config.fieldLen = componentsMap[component.type]?.fieldLen;
          }

          // 确定组件绑定的表名
          let tableName: string;
          if (!component.config.isSubTable) {
            tableName = tableMap.main.name;
            component.config.table = tableName;
          } else {
            tableName = tableMap[component.containerId].name;
            component.config.table = tableName;
          }

          // 确保该表的字段名集合已初始化
          if (!tableFieldNames[tableName]) {
            tableFieldNames[tableName] = new Set<string>();
          }

          // @ts-ignore
          // eslint-disable-next-line radix
          // 如果字段名已存在,使用原有的;否则生成新的有意义的字段名
          // 注意:字段名唯一性是基于当前表的,不同表可以有相同的字段名
          if (!component.config.field) {
            const fieldName = generateUniqueName(
              component.config.label || '字段',
              tableFieldNames[tableName], // 使用当前表的字段名集合
              'F_',
              true,
            );
            component.config.field = fieldName;
            tableFieldNames[tableName].add(fieldName);
          } else {
            tableFieldNames[tableName].add(component.config.field);
          }
        }
      });

      const db: Record<string, any>[] = [];
      Object.keys(tableMap).forEach((key) => {
        if (tableMap[key].type === 'chlid') {
          tableMap[key].relationName = tableMap.main.name;
          tableMap[key].comment += `,关联主表${tableMap.main.name}`;
        }
        db.push(tableMap[key]);
      });
      res.db = db;
    } else {
      const tableColMap: Record<string, string> = {};
      tableList.value.forEach((item) => {
        item.columns.forEach((col) => {
          tableColMap[`${item.name}_${col.name}`] = col.csType;
        });
      });

      res.components.forEach((component) => {
        if (component.config.table && component.config.field) {
          component.config.csType =
            tableColMap[`${component.config.table}_${component.config.field}`];
        }
      });
    }

    // 给表自动添加一个主键（组件）：普通的输入框组件，不在设计中展示
    if (props.notBindTable) {
      res.db.forEach((item: Record<string, any>) => {
        // 判定是否已经有绑定的组件
        const pKeyComponent = res.components.find(
          (c) => c.config.table === item.name && c.config.field === 'F_Id',
        );
        if (!pKeyComponent) {
          const sameTableComponent = res.components.find(
            (c) => c.config.table === item.name && c.config.field,
          );
          if (sameTableComponent) {
            res.components.push({
              id: item.name + '_F_Id',
              name: item.name + '_F_Id',
              type: 'pkey',
              runtimeType: 'input',
              groupId: '',
              config: { display: false, table: item.name, field: 'F_Id', label: '主键' },
              containerId: sameTableComponent.containerId,
              level: sameTableComponent.level,
            });
          }
        }
      });
    } else {
      tableList.value.forEach((item: DbTable) => {
        item.columns.forEach((col: DbTableColumn) => {
          if (col.isPrimary) {
            const pKeyComponent = res.components.find(
              (c) => c.config.table === item.name && c.config.field === col.name,
            );
            if (!pKeyComponent) {
              const sameTableComponent = res.components.find(
                (c) => c.config.table === item.name && c.config.field,
              );
              if (sameTableComponent) {
                res.components.push({
                  id: item.name + '_' + col.name,
                  name: item.name + '_' + col.name,
                  type: 'pkey',
                  runtimeType: 'input',
                  groupId: '',
                  config: {
                    display: false,
                    table: item.name,
                    field: col.name,
                    label: '主键' + col.name,
                    isIdentity: col.isIdentity,
                  },
                  containerId: sameTableComponent.containerId,
                  level: sameTableComponent.level,
                });
              }
            }
          }
        });
      });
    }

    return res;
  };

  const pSetSchema = (schema: Record<string, any>) => {
    clearComponents();
    const res = toFormDesignSchema(schema, componentsMap);
    console.log(res, componentsMap, 'pSetSchema');
    form.config = res.formConfig;
    form.children?.push(...res.componentList);

    Object.keys(res.componentDic).forEach((key) => {
      schemaComponentDic[key] = res.componentDic[key];
    });
  };

  // 表单验证
  const pValidate = () => {
    const schema = toFormSaveSchema(form.config, form.children || []);
    const fieldMap: Record<string, any> = {};
    const tableMap: Record<string, any> = {};
    return validateSchema(schema.components, fieldMap, tableMap);
  };

  const isGridTable = (type: string) => {
    const { isInput, bindTable } = componentsMap[type] || { hasBase: false };
    if (!isInput && bindTable) {
      return true;
    }
  };

  const validateSchema = (
    list: FormDeisgnSaveComponent[],
    fieldMap: Record<string, any>,
    tableMap: Record<string, any>,
  ) => {
    // 先校验表
    if (!props.notBindTable) {
      // eslint-disable-next-line no-restricted-syntax
      for (const component of list) {
        const { isInput, bindTable } = componentsMap[component.type] || { hasBase: false };
        if (!component.config.isNotSave && component.type !== 'pkey') {
          if (isInput && bindTable !== false) {
            if (isNullOrEmpty(component.config.table)) {
              error(`请【${component.config.label}】绑定数据表！`);
              return false;
            }

            if (!component.config.isSubTable) {
              if (
                tableMap[component.config.table] &&
                isGridTable(tableMap[component.config.table].type)
              ) {
                error(
                  `【${component.config.label}】和【${tableMap[component.config.table].config.label}】重复绑定【${
                    component.config.table
                  }】表！`,
                );
                return false;
              }
              if (component.config.table) {
                tableMap[component.config.table] = component;
              }
            }
          } else if (bindTable) {
            if (isNullOrEmpty(component.config.table)) {
              error(`【${component.config.label}】请绑定数据表！`);
              return false;
            }
            if (tableMap[component.config.table]) {
              error(
                `【${component.config.label}】和【${tableMap[component.config.table].config.label}】重复绑定【${
                  component.config.table
                }】表！`,
              );
              return false;
            }
            if (component.config.table) {
              tableMap[component.config.table] = component;
            }
          }
        }
      }
    }

    // 再校验字段
    // eslint-disable-next-line no-restricted-syntax
    for (const component of list) {
      if (!props.notBindTable) {
        const { isInput, bindTable } = componentsMap[component.type] || { hasBase: false };
        if (!component.config.isNotSave) {
          if (isInput && bindTable !== false) {
            // 字段校验
            if (isNullOrEmpty(component.config.field)) {
              error(`请【${component.config.label}】绑定表字段！`);
              return false;
            }

            if (fieldMap[`${component.config.table}-${component.config.field}`]) {
              error(
                `【${component.config.label}】和【${
                  fieldMap[`${component.config.table}-${component.config.field}`].config.label
                }】重复绑定【${component.config.field}】字段！`,
              );
              return false;
            }

            fieldMap[`${component.config.table}-${component.config.field}`] = component;
          }
        }
      }

      if (props.componentConfigValidate) {
        const res = props.componentConfigValidate(component.type, {
          configData: component.config,
          errorTip: error,
        });
        if (!res) {
          return false;
        }
      }
    }

    return true;
  };

  // 表单预览
  const previewFormLayerRef = ref();
  const previewFormRef = ref();
  const previewForm = reactive({
    width: 0,
    height: 0,
    formConfig: {},
  });

  let loadPreviewFormComponentNum = 0;
  const loadPreviewFormComponent = (schema: Record<string, any>[]) => {
    if (previewFormRef.value) {
      loadPreviewFormComponentNum = 0;

      previewFormRef.value.setInit(schema);
    } else {
      if (loadPreviewFormComponentNum > 600) {
        console.warn('表单组件加载超时');
        return;
      }
      loadPreviewFormComponentNum++;
      setTimeout(() => {
        loadPreviewFormComponent(schema);
      }, 100);
    }
  };

  const handlePreviewFormOk = () => {};

  const handlePreviewFormClosed = () => {};

  const handleOpenPreviewForm = () => {
    const schema = toFormSaveSchema(form.config, form.children || []);
    previewForm.width = schema.form.width || 800;
    previewForm.height = schema.form.height || 600;

    previewFormLayerRef.value.open('表单预览', schema.form.layerType);

    nextTick(() => {
      const { formConfig, componentList } = toFormSchema(schema);
      formConfig.labelAlign =
        formConfig.labelPosition === 'top' ? 'left' : formConfig.labelPosition;
      formConfig.layout = formConfig.labelPosition === 'top' ? 'vertical' : 'horizontal';
      previewForm.formConfig = formConfig;

      loadPreviewFormComponent(componentList);
    });
  };

  // 根据选择的表快速导入组件
  const importFormLayerRef = ref();
  const importComponentRef = ref();
  const handleOpenAddComponentByTable = () => {
    importFormLayerRef.value.open('快速添加组件');
  };
  const handleImportFormOk = () => {
    const { addList, table } = importComponentRef.value?.ok() || {
      addList: [],
    };
    if (addList.length <= 0) {
      warning('请选择字段！');
    } else {
      if (
        activedComponent.value?.config.componentType === 'gridtable' ||
        activedComponent.value?.config.isSubTable
      ) {
        if (!activedComponent.value.config.table) {
          let gridtableComponent = activedComponent.value;
          if (activedComponent.value.config.isSubTable) {
            gridtableComponent = schemaComponentDic[activedComponent.value.containerId];
          }
          gridtableComponent.config.table = table;
          (gridtableComponent.children || []).forEach((item: Record<string, any>) => {
            if (item.isInput) {
              item.config.table = table;
            }
          });

          configRef.value.setFormData({
            main: { table },
          });
        } else if (activedComponent.value.config.table !== table) {
          warning('请设置相同的表和子表！');
          return;
        }
      }

      addList.forEach((item: any) => {
        const component = deepClone(componentsMap[item.type]);
        component.config = {
          table,
          field: item.value,
          label: item.label,
        };
        addComponentByTable(component);
      });
      importFormLayerRef.value.close();
    }
  };
  const handleImportFormClosed = () => {
    importComponentRef.value?.closed();
  };

  /**
   * @zh 设置表
   * @public
   * @param list
   */
  function setTables(list: DbTable[]) {
    pSetTables(list);
  }
  /**
   * @zh 获取设计数据
   * @public
   */
  function getSchema() {
    return pGetSchema();
  }
  /**
   * @zh 设置设计数据
   * @public
   */
  function setSchema(data: Record<string, any>) {
    return pSetSchema(data);
  }
  /**
   * @zh 重置
   * @public
   */
  function reset() {
    return pReset();
  }
  /**
   * @zh 校验设计数据
   * @public
   */
  function validate() {
    return pValidate();
  }

  defineExpose({ setTables, getSchema, setSchema, reset, validate });
</script>

<style lang="less">
  @import './formDesign';
</style>
