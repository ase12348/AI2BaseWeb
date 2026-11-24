<template>
  <a-form
    :class="[{ 'lr-block': isAutoSize }, 'lr-c-schema-form']"
    style="padding: 8px 8px 0; overflow: auto; overflow-x: hidden"
    ref="refForm"
    v-bind="formConfig"
    :model="formState"
    :key="formKey"
    v-if="ready"
  >
    <lr-c-schema-item
      v-if="isAutoWindow"
      v-bind="schemaList[0]"
      :label-width="formConfig?.labelWidth"
      :label-span="formConfig?.labelSpan"
    />
    <a-row v-else :gutter="gutter">
      <template v-for="item of schemaList" :key="item.id">
        <lr-c-schema-item
          v-bind="item"
          :span="formConfig?.span"
          :label-width="formConfig?.labelWidth"
          :label-span="formConfig?.labelSpan"
        />
      </template>
    </a-row>
  </a-form>
</template>

<script lang="ts" setup>
  import type { SchemaConfig, SchemaRuntimeConfig } from './interface';
  import { PropType, reactive, ref, computed, provide, nextTick } from 'vue';
  import { set } from 'lodash-es';
  import { createNamespace } from '../utils/components';
  import {
    buildShortUUID,
    buildUUID,
    deepMerge,
    clearData,
    deepClone,
    clone,
    getFunction,
    fullScreenLoading,
  } from '../utils/method';
  import { isArray, isNullOrEmpty } from '../utils/is';
  import { formatToDateTime } from '../utils/date';
  import { useFramework } from '../utils/useFramework';
  import useForm from './useForm/useForm';

  defineOptions({ name: createNamespace('cSchemaForm').name });

  const props = defineProps({
    /**
     * @zh 表单配置方式,具体参考antd文档
     */
    formConfig: Object as PropType<Record<string, any>>,
    /**
     * @zh 模版配置信息
     */
    schemas: Array as PropType<SchemaConfig[]>,
    /**
     * @zh 是否编辑状态（相对于新建）
     */
    isEditState: Boolean,
    /**
     * @zh 表单整体是否只读
     */
    readonlyForm: Boolean,

    /**
     * @zh 子表虚拟删除数据
     */
    isChildTableVirtualDel: Boolean,
    /**
     * @zh 表单是否自适应外部容器大小
     */
    isAutoSize: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 表单是否预览
     */
    isPreview: {
      type: Boolean,
      default: false,
    },
  });

  const emit = defineEmits({
    /**
     * @zh 点击事件
     */
    click: (id: string, even: any, component: SchemaConfig) => true,
    /**
     * @zh 值改变事件
     */
    change: (
      component: SchemaConfig,
      params: {
        value: any;
        data?: any;
        index?: number;
        list?: Record<string, any>[];
        type?: string;
      },
    ) => true,
  });

  const {
    getLoginInfo,
    loadCompanyList,
    useMessage,
    useHttp,
    loadDbSourceList,
    getDbSourceList,
    getDbSourceKey,
    getLabelByComponent,
    fetchDbSourceList,

    useData,
    t,
  } = useFramework({});

  const useDataRes = useData();

  const { error, success, info, warning } = useMessage();
  const { httpGet, httpPost, httpPut, httpDelete } = useHttp();

  const ready = ref(false);
  let isLoadCompany = false;
  let idToField: Record<string, string> = {};
  let tableToField: Record<string, string> = {};
  let defaultFormState: Record<string, any> = {};
  let gridtableList: SchemaConfig[] = [];

  const schemaList = reactive<SchemaRuntimeConfig[]>([]);
  const components = reactive<Record<string, SchemaConfig>>({});
  const rules = reactive<Record<string, any>>({});
  const errorFields = ref<any>({});
  const formState = reactive<Record<string, any>>({});
  const lowerCtrlTab = reactive<Record<string, any[]>>({});
  const gridtableLoadDic = reactive<Record<string, any>>({});

  const formKey = ref(1);
  const isAutoWindow = computed(
    () =>
      schemaList.length === 1 &&
      (components[schemaList[0].id || ''].type === 'tabs' ||
        components[schemaList[0].id || ''].type === 'layout' ||
        components[schemaList[0].id || ''].config?.isAutoWindow),
  );

  const isFormItem = (id: string) =>
    [
      'input',
      'inputSearch',
      'autoComplete',
      'inputTag',
      'cascaderSelect',
      'password',
      'textarea',
      'select',
      'selectMultiple',
      'treeSelect',
      'radio',
      'checkbox',
      'switch',
      'date',
      'dateRange',
      'time',
      'timeRange',
      'slider',
      'sliderCaptcha',
      'rate',
      'number',
      'segmented',
      'inputCount',
      'count',
      'codeMirror',
      'inputCode',
      'inputColor',
      'textEditor',
      'inputLayer',
      'inputMap',
      'upload',
      'uploadimg',
      'guid',
      'createTime',
      'modifyTime',
      'qrcode',
      'barcode',
      'cascader',
      'pkey', // 为系统自动添加的组件（主键组件）
      'buttonLayer',
    ].includes(components[id]?.type) ||
    components[id]?.type?.indexOf('lr-input') > -1 ||
    components[id]?.config?.getInputType !== undefined;
  const isGridtable = (id: string) =>
    ['gridtable', 'inputRows', 'inputCards'].includes(components[id]?.type);

  const errorMessage = (message: string) => {
    if (error) {
      error(message);
    }
  };

  const refForm = ref();

  // 设置方法
  let outFormData: Record<string, any> | undefined;
  const setFormDataToState = (formData: Record<string, any>, path: string) => {
    Object.keys(formData).forEach((key) => {
      const value = formData[key];
      if (path) {
        key = path + '.' + key;
      }
      if (value !== null && value !== undefined && typeof value === 'object' && !isArray(value)) {
        setFormDataToState(value, key);
      }
      formState[key] = value;
    });
  };

  const pInit = async (
    schemas: SchemaConfig[],
    formData?: Record<string, any>,
    formParam?: Record<string, any>,
  ) => {
    ready.value = false;
    formKey.value += 1;
    schemaList.splice(0, schemaList.length);
    idToField = {};
    tableToField = {};
    gridtableList = [] as SchemaConfig[];
    const notSetFormData = !!formData;
    outFormData = formData;
    clearData(components);
    clearData(formState);
    clearData(rules);
    clearData(lowerCtrlTab);
    clearData(gridtableLoadDic);
    if (notSetFormData) {
      setFormDataToState(formData, '');
    }

    isLoadCompany = false;

    forEachChild(schemas, schemaList, notSetFormData);

    await defaultValueChange();

    defaultFormState = deepClone(formState) as Record<string, any>;

    ready.value = true;

    // 执行初始化事件脚本
    nextTick(() => {
      executeEvent(props.formConfig?.codeInit, formParam || {});
    });
  };

  const componentProp = (key: string) => {
    const config = { ...components[key].config };

    if (config.getUpConfig) {
      const _config = config.getUpConfig({
        formData: formState,
        // index: props.tableIndex,
        // row: props.row,
        // tableData: props.tableList,
      });
      if (_config) {
        Object.keys(_config).forEach((key) => {
          config[key] = _config[key];
        });
      }
    }

    return config;
  };
  const formRules = computed(() => {
    const res: Record<string, any> = {};
    Object.keys(rules).forEach((key) => {
      if (
        !isGridtable(key) &&
        !components[key].parentTableId &&
        componentProp(key).isNotRule !== true &&
        componentProp(key).display !== false
      ) {
        res[key] = rules[key];
        const onlyRule = res[key].find((rule: any) => rule.type === 'only');
        if (onlyRule) {
          onlyRule.validator = async (rule: any, value: string) => {
            if (value) {
              const param: Record<string, any> = {
                table: rule.lr_table,
                key: rule.lr_key,
                keyName: rule.lr_keyName,
                field: rule.lr_field,
                keyValue: rule.lr_getKeyValue ? rule.lr_getKeyValue() : '',
                value,
                formData: formState,
                paramNames: rule.paramNames,
                getParams: rule.getParams,
                withProjectId: rule.withProjectId,
                getValue: rule.getValue,
              };
              const res = await rule.lr_existFiled(param);
              if (!res) {
                throw t(rule.message) || t('数据值重复');
              }
            }
          };
        }
      }
    });
    return res;
  });

  const { validate: formValidate } = useForm(formState, formRules);

  /* watch(formState, () => {
      if (ready.value && outFormData) {
        Object.keys(formState).forEach((key) => {
          // @ts-ignore
          outFormData[key] = formState[key]
        })
      }
    }) */

  if (props.schemas) {
    pInit(props.schemas);
  }
  // 便利组件设置id值和默认值
  const forEachChild = (
    schemas: SchemaConfig[],
    res: SchemaRuntimeConfig[],
    notSetFormData: boolean,
    parentTableId = '',
  ) => {
    schemas.forEach((schema) => {
      schema.id = schema.id || buildShortUUID('c');
      const schemaItem: SchemaConfig = { type: schema.type, config: {} };
      const runtimeConifg = { id: schema.id, slot: schema.slot, children: [] };
      const { children, rule } = schema;
      clone(schemaItem, schema, ['children', 'rule', 'config']);
      // @ts-ignore
      clone(schemaItem.config, schema.config || {}, []);

      if (rule) {
        rules[schema.id] = rule;
      }
      if (components[schema.id]) {
        console.warn('有重复的组件id:' + schema.id);
      }
      components[schema.id] = schemaItem;
      if (props.readonlyForm === true) {
        // @ts-ignore
        schemaItem.config.readonly = true;
      }
      if (schemaItem.config?.readonly) {
        schemaItem.config.disabled = true;
      }

      res.push(runtimeConifg);

      let isParentTable = false;
      if (parentTableId !== '' && isGridtable(parentTableId)) {
        isParentTable = true;
        schemaItem.parentTableId = parentTableId;
        schemaItem.config = schemaItem.config || {};
        // schemaItem.config.prop = schemaItem.id
      }
      const config = schemaItem.config || {};

      if (isFormItem(schema.id)) {
        if (isParentTable === false && !notSetFormData) {
          if (config?.defaultValue === 0) {
            formState[schema.id] = config?.defaultValue;
          } else {
            formState[schema.id] = config?.defaultValue || undefined;
          }
        }

        if (config.table && config.field) {
          idToField[`${config.table}_${config.field}`.toLowerCase()] = schema.id;
        } else if (config.field) {
          if (isParentTable) {
            idToField[`${parentTableId}_${config.field}`.toLowerCase()] = schema.id;
          } else {
            idToField[`${config.field}`.toLowerCase()] = schema.id;
          }
        }
      } else if (isParentTable && config.field) {
        idToField[`${parentTableId}_${config.field}`.toLowerCase()] = schema.id;
      } else if (isGridtable(schema.id)) {
        if (!notSetFormData && !config.isSubTable) {
          formState[schema.id] = [];
        }

        if (config.table) {
          idToField[config.table.toLowerCase() || ''] = schema.id;
        }

        if (!config.isSubTable) {
          gridtableList.push(schemaItem);
        }
      } else if (config?.defaultValue) {
        // 处理类似选项卡 和 折叠面板
        formState[schema.id] = config?.defaultValue;
      } else if (schema.type === 'collapse' && config?.isExpand) {
        const defaultValue: string[] = [];
        (config?.groups || []).forEach((group: any) => {
          defaultValue.push(group.i);
        });
        formState[schema.id] = defaultValue;
      }

      // 判断是否需要加载数据
      if (!isLoadCompany && config?.dataType === 'company') {
        isLoadCompany = true;
        loadCompanyList();
      }

      if (children && children.length > 0) {
        forEachChild(children, runtimeConifg.children, notSetFormData, schemaItem.id);
      }
      if (schema.type === 'gridtable' && schema.config?.isRowFixed) {
        // 子表固定行数
        // 获取设置默认值
        const gridDefault = getGridDefault(schema);
        let tableData = formState[schema.id];

        if (!notSetFormData) {
          tableData = gridDefault;
        }
        const gridData = [];
        for (let i = 0, len = tableData.length; i < len; i++) {
          const row = tableData[i];
          const rowTmp: Record<string, any> = {};
          if (children) {
            for (let j = 0, jlen = children.length; j < jlen; j++) {
              const cell: any = children[j];
              if (cell.field) {
                let cellValue = !isNullOrEmpty(row[cell.field.toLowerCase()])
                  ? row[cell.field.toLowerCase()]
                  : row[cell.id];
                if (!isNullOrEmpty(cellValue)) {
                  if (['slider', 'rate'].includes(cell.type)) {
                    cellValue = parseInt(cellValue, 10);
                    if (isNaN(cellValue)) {
                      cellValue = 0;
                    }
                  }
                  rowTmp[cell.id] = cellValue;
                }
              } else if (gridDefault.length > i) {
                const cellValue = gridDefault[i][cell.id];
                if (!isNullOrEmpty(cellValue)) {
                  rowTmp[cell.id] = cellValue;
                }
                rowTmp.jcode_table_flag = gridDefault[i].jcode_table_flag;
              }
            }
          }

          gridData.push(rowTmp);
        }
        formState[schema.id] = gridData;
      } else if (
        !props.isEditState &&
        !notSetFormData &&
        schema.type === 'gridtable' &&
        !schema.config?.isRowFixed &&
        schema.config?.dataCode &&
        schemaItem.id
      ) {
        gridtableLoadDic[schemaItem.id] = schema;
      }
      // 选项卡关联
      if (schema.type === 'tabs' && schemaItem.config?.tabKey) {
        if (schemaItem.config?.options?.length) {
          schemaItem.config.options = schemaItem.config.options.filter(
            (item: any) => !isNullOrEmpty(item.value) && !isNullOrEmpty(item.label),
          );
          if (schemaItem.config.options?.length) {
            lowerCtrlTab[schemaItem.config.tabKey] = lowerCtrlTab[schemaItem.config.tabKey] || [];
            lowerCtrlTab[schemaItem.config.tabKey].push(schemaItem.id);
          }
        }
      }
    });
  };
  const getGridDefault = (component: Record<string, any>) => {
    const dataSource = [];
    if (component.config.isRowFixed) {
      const defaultList = component.config?.dataSource || [];
      for (let i = 0; i < component.config?.rowNum; i++) {
        const row = defaultList[i];
        const point: Record<string, any> = {};
        component.children?.forEach((col: Record<string, any>) => {
          if (row) {
            point[col.id] = row[col.id] || col.config?.defaultValue || undefined;
          } else {
            point[col.id] = col.config?.defaultValue || undefined;
            if (!col.config?.display) {
              switch (col.type) {
                case 'encode':
                  point[col.id] = `jcode_code_${col.code}|${buildUUID()}`;
                  break;
                case 'pkey':
                  point[col.id] = buildUUID();
                  break;
                case 'company':
                  point[col.id] = getLoginInfo?.value?.f_CompanyId;
                  break;
                case 'department':
                  point[col.id] = getLoginInfo?.value?.f_DepartmentId;
                  break;
                case 'createuser':
                  point[col.id] = getLoginInfo?.value?.f_UserId;
                  break;
                case 'modifyuser':
                  point[col.id] = getLoginInfo?.value?.f_UserId;
                  break;
                case 'createtime':
                  point[col.id] = formatToDateTime();
                  break;
                case 'modifytime':
                  point[col.id] = formatToDateTime();
                  break;
              }
            }
          }
        });
        point.jcode_table_flag = 'add';
        dataSource.push(point);
      }
    }
    return dataSource;
  };
  const defaultValueChange = async () => {
    setTabDefault();
    // 加载默认的数据
    await setGridTableDefault();
  };
  const setTabDefault = () => {
    Object.keys(lowerCtrlTab).forEach((key) => {
      const tabIds = lowerCtrlTab[key];
      if (tabIds.length) {
        tabIds.forEach((id) => {
          const com = components[id];
          if (com && com.config?.options) {
            const groups = deepClone(com.config?.groups || []);
            for (let i = 0; i < groups.length; i++) {
              const item = groups[i];
              const option = (com.config.options || []).find((t: any) => t.label === item.i);
              if (!option) {
                formState[id] = item.i;
                break;
              }
              let display = true;
              if (option.value === formState[key]) {
                display = !!option.display;
              } else {
                display = !option.display;
              }
              if (display) {
                formState[id] = item.i;
                break;
              }
            }
          }
        });
      }
    });
  };

  const setGridTableDefault = async () => {
    Object.keys(gridtableLoadDic).forEach(async (id) => {
      const component = gridtableLoadDic[id];
      if (component && component.config?.dataMaps && component.config?.dataCode) {
        const dataSource = (await fetchDbSourceList(component.config.dataCode)) || [];
        const data: any[] = [];
        dataSource.forEach((item: any) => {
          const point: Record<string, any> = {};
          component.children?.forEach((col: Record<string, any>) => {
            const map =
              (component.config?.dataMaps || []).find((t: any) => t.valueKey === col.id) || {};
            if (map.prop) {
              point[col.id] = item[map.prop];
            } else if (isGridtable(col.id)) {
              point[col.id] = formState[col.id] || [];
            } else {
              point[col.id] = undefined;
            }
          });
          point.jcode_table_flag = 'add';
          data.push(point);
        });
        formState[id] = data;
      }
    });
  };

  const pGetComponent = (id: string) => {
    let component = components[id];
    if (component === undefined && idToField[id.toLowerCase()]) {
      component = components[idToField[id.toLowerCase()]];
    }
    return component;
  };

  const pSetProps = (id: string, config: any) => {
    const component = pGetComponent(id);
    if (component) {
      component.config = deepMerge(component.config || {}, config);
    }
  };

  const pSetDisplay = (showIds?: string | string[], hideIds?: string | string[]) => {
    if (Array.isArray(showIds)) {
      showIds.forEach((id) => {
        pSetProps(id, { display: true });
      });
    } else if (showIds) {
      pSetProps(showIds, { display: true });
    }
    if (Array.isArray(hideIds)) {
      hideIds.forEach((id) => {
        pSetProps(id, { display: false });
      });
    } else if (hideIds) {
      pSetProps(hideIds, { display: false });
    }
  };

  const pSetReqRule = (id: string, isReq: boolean) => {
    if (!isReq && !rules[id]) return;
    if (isReq && !rules[id]) {
      rules[id] = [{ required: true, message: `${t('请输入')}` }];
    } else if (rules[id]) {
      const index = rules[id].findIndex((t: any) => !isNullOrEmpty(t.required));
      if (index === -1 && isReq) {
        rules[id].push({ required: true, message: `${t('请输入')}` });
      } else if (index !== -1) {
        rules[id][index] = {
          required: isReq,
          message: rules[id][index].message || `${t('请输入')}`,
        };
      }
    }
  };

  const pSetRequired = (id: string, isRequired = true) => {
    pSetReqRule(id, isRequired);
  };

  const pSetDisabled = (id: string, isDisabled = true) => {
    pSetProps(id, { disabled: isDisabled, readonly: isDisabled });
  };

  const pSetHide = (id: string, isHide = true) => {
    pSetProps(id, { display: !isHide });
  };

  const pGetValue = (id: string, useTable?: boolean) => {
    const component = pGetComponent(id);
    if (component) {
      if (component.parentTableId) {
        const tableValue = formState[component.parentTableId];
        const id = component.id ? component.id.replace(`${component.parentTableId}.`, '') : '';
        const valueList: any[] = [];
        if (tableValue) {
          tableValue.forEach((row: Record<string, any>) => {
            if (row.jcode_table_flag !== 'delete') {
              valueList.push(row[id || '']);
            }
          });
        }
        return valueList;
      }

      if (isGridtable(component.id || '') && useTable) {
        const gridData: Record<string, any>[] = [];
        formState[component.id || ''].forEach((row: Record<string, any>) => {
          gridData.push(idToFieldByFormData(row, true));
        });
        return gridData;
      }

      return formState[component.id || ''];
    }

    if (formState[id]) {
      return formState[id];
    }

    return undefined;
  };

  const idToFieldByFormData = (dataByForm: Record<string, any>, isGridData = false) => {
    const resFormData: Record<string, any> = {};
    Object.keys(dataByForm).forEach((key) => {
      const component = components[key];
      if (component) {
        const table = component.config?.table;
        const field = component.config?.field;

        if (isGridData) {
          if (field) {
            resFormData[field] = dataByForm[key];
          } else {
            resFormData[key] = dataByForm[key];
          }
        } else if (table && field) {
          resFormData[component.config?.table] = resFormData[component.config?.table] || {};
          resFormData[component.config?.table][field] = dataByForm[key];
        } else if (isGridtable(key)) {
          const gridData: Record<string, any>[] = [];
          dataByForm[key].forEach((row: Record<string, any>) => {
            gridData.push(idToFieldByFormData(row, true));
          });
          resFormData[component.config?.table] = gridData;
        } else if (field) {
          resFormData.main = resFormData.main || {};
          resFormData.main[field] = dataByForm[key];
        }
      } else if (isGridData) {
        if (key !== '_X_ROW_KEY' && key !== '_isHover') {
          resFormData[key] = dataByForm[key];
        }
      } else if (tableToField[key]) {
        resFormData[tableToField[key]] = resFormData[tableToField[key]] || {};
        resFormData[tableToField[key]][key.replace(`${tableToField[key]}_`, '')] = dataByForm[key];
      }
    });

    return resFormData;
  };

  const pGetFormData = (useTable?: boolean) => {
    const formData = JSON.parse(
      JSON.stringify(formState, (key, value) => {
        if (key === 'parentRow') return undefined; // 忽略 parentRow 属性
        return value;
      }),
    );
    if (useTable) {
      return idToFieldByFormData(formData);
    }
    const resFormData: Record<string, any> = {};
    Object.keys(formData || {}).forEach((key) => {
      resFormData[key] = formData[key];
    });
    return resFormData;
  };

  const getGridTableData = (
    table: string,
    tableData: Record<string, any>[],
    filter?: (key: string, value: any, table: string) => boolean,
    isTable?: boolean,
    isCopy?: boolean,
  ) => {
    const gridData: Record<string, any>[] = [];
    tableData.forEach((row: any) => {
      const myRow: Record<string, any> = {};
      Object.keys(row).forEach((key) => {
        if (!filter || filter(key, row[key], table)) {
          if (isTable) {
            // 没有设置组件的时候
            myRow[key] = row[key];
          } else {
            const tableComponet = pGetComponent(key);

            if (tableComponet?.type === 'gridtable') {
              myRow[tableComponet?.id || ''] = getGridTableData(
                key,
                row[key],
                filter,
                isTable,
                isCopy,
              );
            } else {
              let field = idToField[`${table}_${key}`.toLowerCase()] || key;

              if (isCopy) {
                const tableComponetItem = pGetComponent(field);

                if (tableComponetItem?.config?.isPkey) {
                  row[key] = undefined;
                }
              }

              field = field.indexOf('.') !== -1 ? field.split('.')[1] : field;
              myRow[field] = row[key];
            }
          }
        }
      });

      // console.log(myRow, 'myRow')

      if (isCopy) {
        myRow.jcode_table_flag = 'add';
      }
      gridData.push(myRow);
    });
    return gridData;
  };

  const pSetFormData = (
    data: Record<string, any>,
    filter?: (key: string, value: any, table: string) => boolean,
    isTable?: boolean,
    isCopy?: boolean,
  ) => {
    Object.keys(data || {}).forEach((table) => {
      const tableData = data[table];
      const tableComponet = pGetComponent(table);
      if (table !== 'main' && (tableComponet || isTable) && tableData?.length > 0) {
        formState[idToField[table.toLowerCase()] || table] = getGridTableData(
          table,
          tableData,
          filter,
          isTable,
          isCopy,
        );
      } else if (table !== 'main' && (tableComponet || isTable) && tableData?.length === 0) {
        formState[idToField[table.toLowerCase()] || table] = [];
      } else {
        const formDataByTable = isArray(tableData) ? tableData[0] || {} : tableData;
        if (formDataByTable) {
          Object.keys(formDataByTable).forEach((key: string) => {
            if (!filter || filter(key, formDataByTable[key], table)) {
              let id = key;
              if (table !== 'main') {
                id = `${table}_${key}`;
              }
              tableToField[id] = table;

              if (isCopy) {
                const itemComponent = pGetComponent(id);
                if (itemComponent?.config?.isPkey) {
                  formDataByTable[key] = undefined;
                }
              }

              formState[idToField[id.toLowerCase()] || id] = formDataByTable[key];
            }
          });
        }
      }
    });

    if (outFormData) {
      Object.keys(formState).forEach((key) => {
        const component = pGetComponent(key);
        if (component === undefined || !['tabs', 'collapse'].includes(component.type)) {
          // @ts-ignore
          set(outFormData, key, formState[key]);
        }
      });
    }

    setTabDefault();
  };

  const pValidate = async () => {
    if (!formValidate) {
      return true;
    }
    errorFields.value = {};
    const res = await formValidate();
    if (Object.keys(res).length > 0) {
      errorFields.value = res;

      errorMessage(
        `${t(components[Object.keys(res)[0]]?.config?.label)}：${t(res[Object.keys(res)[0]].msg)}`,
      );
      return false;
    }
    // 子表校验
    // eslint-disable-next-line no-restricted-syntax
    for (const item of gridtableList) {
      if (item.config?.display !== false && item.$ref?.validate) {
        const res = item.$ref.validate();
        if (!res.isOk) {
          if (res.info === '请添加表格数据') {
            errorMessage(
              t(item.config?.requiredMsg) ||
                t(res.info) + t(item.config?.label ? `(${item.config?.label})` : ''),
            );
          } else {
            errorMessage(t(res.info));
          }

          return false;
        }
      }
    }
    return true;
  };
  const pClearValidate = () => {
    errorFields.value = {};
  };
  const pResetFields = () => {
    errorFields.value = {};
    clearData(formState);
    Object.keys(defaultFormState || {}).forEach((key) => {
      formState[key] = defaultFormState[key];
    });
  };
  const pGetRef = (id: string) => {
    const component = pGetComponent(id);
    return component?.$ref;
  };
  const pGetLabel = async (id: string, value?: any, row?: Record<string, any>) => {
    const myValue = value || pGetValue(id);
    const component = pGetComponent(id);
    if (component) {
      const label = await getLabelByComponent({
        value: myValue,
        component,
        formData: formState,
        row,
      });
      return label;
    }

    return value;
  };

  const pGetFormDataLabel = async (useTable?: boolean) => {
    const resFormData: Record<string, any> = {};
    // eslint-disable-next-line no-restricted-syntax
    for (const key in formState) {
      if (isGridtable(key)) {
        const gridData: Record<string, any>[] = [];
        // eslint-disable-next-line no-restricted-syntax
        for (const row of formState[key]) {
          const newRow: Record<string, any> = {};
          // eslint-disable-next-line no-restricted-syntax, guard-for-in
          for (const rowKey in row) {
            newRow[rowKey] = await pGetLabel(rowKey, row[rowKey], row);
          }
          gridData.push(newRow);

          resFormData[key] = gridData;
        }
      } else {
        resFormData[key] = await pGetLabel(key);
      }
    }

    if (useTable) {
      return idToFieldByFormData(resFormData);
    }

    return resFormData;
  };

  const componentClick = (id: string, even: any) => {
    emit('click', id, even, components[id]);
    if (components[id]?.config?.clickCode) {
      executeEvent(components[id]?.config?.clickCode, { prop: id });
    }
    if (components[id]?.config?.rowClickCode) {
      executeEvent(components[id]?.config?.rowClickCode, { prop: id });
    }
    // 子表内组件点击
    if (components[id]?.config?.componentType === 'gridtable') {
      if (even?.config?.clickCode) {
        executeEvent(even?.config?.clickCode, { prop: even.config?.id });
      }
      if (even?.config?.rowClickCode) {
        executeEvent(even?.config?.rowClickCode, { prop: even.config?.id });
      }
    }
  };

  const rowMouseEvent = (id: string, even: any) => {
    if (even?.config?.componentType === 'gridtable') {
      if (even.isEnter && even?.config?.rowMouseEnterCode) {
        executeEvent(even?.config?.rowMouseEnterCode, {
          prop: even.config?.id,
          row: even.row,
          rowIndex: even.rowIndex,
          $rowIndex: even.$rowIndex,
        });
      }
      if (even.isLeave && even?.config?.rowMouseLeaveCode) {
        executeEvent(even?.config?.rowMouseLeaveCode, {
          prop: even.config?.id,
          row: even.row,
          rowIndex: even.rowIndex,
          $rowIndex: even.$rowIndex,
        });
      }
      return;
    }
    if (even.isEnter && components[id]?.config?.rowMouseEnterCode) {
      executeEvent(components[id]?.config?.rowMouseEnterCode, {
        prop: id,
        row: even.row,
        rowIndex: even.rowIndex,
        $rowIndex: even.$rowIndex,
      });
    }
    if (even.isLeave && components[id]?.config?.rowMouseLeaveCode) {
      executeEvent(components[id]?.config?.rowMouseLeaveCode, {
        prop: id,
        row: even.row,
        rowIndex: even.rowIndex,
        $rowIndex: even.$rowIndex,
      });
    }
  };

  const valueChange = (
    key: string,
    params: {
      value: any;
      data?: any;
      index?: number;
      tableData?: Record<string, any>[];
      type?: string;
      col?: Record<string, any>;
      parentData?: Record<string, any>;
    },
  ) => {
    if (ready.value && outFormData) {
      if (params.tableData) {
        if (!params.parentData) {
          set(outFormData, key, params.tableData);
        }
      } else {
        set(outFormData, key, params.value);
      }
    }

    // 如果组件变更请调用改变事件
    emit('change', components[key], params);

    // 调用设置的脚本（方法）
    // @ts-ignore
    params.prop = key;
    if (components[key]?.config?.changeCode) {
      executeEvent(components[key]?.config?.changeCode, params);
    }
    // 子表内组件变更
    if (components[key]?.config?.componentType === 'gridtable') {
      if (params.col && params.col?.config?.changeCode) {
        executeEvent(params.col?.config?.changeCode, params);
      }
    }

    executeEvent(props.formConfig?.codeDataChange, params);
  };

  // 脚本处理
  const setValue = ({
    id,
    value,
    i,
    type,
  }: {
    id: string;
    i: number;
    value: any;
    type: string;
  }) => {
    if (type === 'add') {
      formState[id].push(value);
    } else if (type === 'delete') {
      formState[id].splice(i, 1);
    } else {
      const component = pGetComponent(id);
      if (component) {
        let path = id;
        if (component.parentTableId) {
          const tableData = formState[component.parentTableId] || [];
          let index = 0;
          tableData.forEach((row: Record<string, any>, _index: number) => {
            if (row.jcode_table_flag !== 'delete') {
              if (i === index) {
                path = `${component.parentTableId}.${_index}.${id}`;
              }
              index++;
            }
          });
        }

        set(formState, path, value);
      }
    }
  };

  const eventParam = (param: Record<string, any>) => {
    param.isUpdate = props.isEditState;
    param.loginUser = getLoginInfo.value;
    param.readonly = props.readonlyForm;

    param.set = setValue;
    param.get = pGetValue;
    param.setFormData = pSetFormData;
    param.getFormData = pGetFormData;
    param.getLabel = async (id: string, i: number) => {
      const value = pGetValue(id);
      const component = pGetComponent(id);
      if (component) {
        if (i !== undefined) {
          const cellValue = value[i];
          const row = formState[component.parentTableId || ''][i];
          const label = await getLabelByComponent({
            value: cellValue,
            component,
            formData: formState,
            row,
          });
          return label;
        }
        const label = await getLabelByComponent({
          value,
          component,
          formData: formState,
        });
        return label;
      }
      return value;
    };

    param.getSourceData = async (code: string, params: any) => {
      await loadDbSourceList(code, params, false);
      return getDbSourceList.value[getDbSourceKey(code, params)];
    };
    param.getDateNow = (format: string) =>
      formatToDateTime(new Date(), format || 'YYYY-MM-DD HH:mm:ss');

    param.httpGet = httpGet;
    param.httpPost = httpPost;
    param.httpPut = httpPut;
    param.httpDelete = httpDelete;

    // error, success, info, warning, loading
    param.loading = () => {
      fullScreenLoading(true);
    };
    param.hideLoading = () => {
      fullScreenLoading(false);
    };
    param.message = (text: string, type: string) => {
      switch (type) {
        case 'success':
          success && success(text);
          break;
        case 'warning':
          warning && warning(text);
          break;
        case 'error':
          error && error(text);
          break;
        case 'info':
          info && info(text);
          break;
        default:
          info && info(text);
          break;
      }
    };

    param.setRequired = pSetRequired;
    param.setDisabled = pSetDisabled;
    param.setHide = pSetHide;
    param.setProps = pSetProps;

    return param;
  };

  const executeEvent = async (eventStr: string, param: Record<string, any>) => {
    if (eventStr && eventStr.trim()) {
      eventStr = `async (jcode) => {${eventStr}}`;
      const { res, msg, fn } = getFunction(eventStr);
      if (res) {
        await fn(eventParam(param));
      } else {
        errorMessage(msg as string);
      }
    }
  };

  const isEditState = computed(() => props.isEditState);
  const gutter = computed(() => props.formConfig?.gutter || 16);

  // 保存设置数据后
  const pAfterSetData = () => {
    executeEvent(props.formConfig?.codeAfterSetData, {});
  };

  // 保存前
  const pBeforeSave = () => {
    executeEvent(props.formConfig?.codeBeforeSave, {});
  };

  // 保存后
  const pAfterSave = () => {
    executeEvent(props.formConfig?.codeAfterSave, {});
  };

  // 注入方法
  provide('jcode_form_provide', {
    components,
    rules,
    errorFields,
    formState,
    gutter,
    isEditState,
    isAutoWindow,
    isChildTableVirtualDel: props.isChildTableVirtualDel,
    lowerCtrlTab,

    // 方法
    isFormItem,
    isGridtable,
    componentClick,
    rowMouseEvent,
    setFormData: pSetFormData,
    getValue: pGetValue,
    valueChange,
    isPreview: props.isPreview,

    useDataRes,
  });

  /**
   * @zh 初始化表单
   * @public
   */
  function setInit(
    schemas: SchemaConfig[],
    formData?: Record<string, any>,
    formParam?: Record<string, any>,
  ) {
    pInit(schemas, formData, formParam);
  }
  /**
   * @zh 获取表单组件
   * @public
   */
  function getComponent(id: string) {
    return pGetComponent(id);
  }
  /**
   * @zh 设置表单组件属性
   * @public
   */
  function setProps(id: string, config: any) {
    pSetProps(id, config);
  }
  /**
   * @zh 设置表单字段是否必填
   * @public
   */
  function setReqRule(id: string, isReq: boolean) {
    pSetReqRule(id, isReq);
  }
  /**
   * @zh 获取数据值
   * @public
   */
  function getValue(id: string, useTable = true) {
    return pGetValue(id, useTable);
  }
  /**
   * @zh 获取表单数据
   * @public
   */
  function getFormData(useTable = true) {
    return pGetFormData(useTable);
  }
  /**
   * @zh 获取表单数据
   * @public
   */
  function getFormDataLabel(useTable = true) {
    return pGetFormDataLabel(useTable);
  }

  /**
   * @zh 设置表单数据
   * @public
   */
  function setFormData(
    data: Record<string, any>,
    filter?: (key: string, value: any, table: string) => boolean,
    isTable?: boolean,
    isCopy?: boolean,
  ) {
    return pSetFormData(data, filter, isTable, isCopy);
  }
  /**
   * @zh 校验表单
   * @public
   */
  function validate() {
    return pValidate();
  }
  /**
   * @zh 清空校验
   * @public
   */
  function clearValidate() {
    return pClearValidate();
  }
  /**
   * @zh 清空值
   * @public
   */
  function resetFields() {
    return pResetFields();
  }
  /**
   * @zh 获取组件
   * @public
   */
  function getRef(id: string) {
    return pGetRef(id);
  }
  /**
   * @zh 设置组件的隐藏显示
   * @public
   */
  function setDisplay(showIds?: string | string[], hideIds?: string | string[]) {
    return pSetDisplay(showIds, hideIds);
  }

  /**
   * @zh 赋值后执行脚本
   */
  function afterSetData() {
    return pAfterSetData();
  }
  /**
   * @zh 保存前执行脚本
   */
  function beforeSave() {
    return pBeforeSave();
  }
  /**
   * @zh 保存后执行脚本
   */
  function afterSave() {
    return pAfterSave();
  }

  defineExpose({
    setInit,
    getComponent,
    setProps,
    setReqRule,
    getValue,
    getFormData,
    getFormDataLabel,
    setFormData,
    validate,
    clearValidate,
    resetFields,
    getRef,
    setDisplay,
    afterSetData,
    beforeSave,
    afterSave,
  });
</script>

<style lang="less">
  @import './cSchemaForm';
</style>
