<template>
  <lr-button
    v-bind="$attrs"
    :type="type"
    :size="size"
    @click="handleOpen"
    icon-name="ant-design:form-outlined"
  />
  <a-form-item-rest>
    <lr-modal
      v-model:visible="formVisible"
      :title="$t(layerLabel || '设置')"
      :height="layerHeight || 400"
      :width="layerWidth || 600"
      :has-btns="false"
    >
      <div class="lr-block" style="padding: 16px; overflow-y: auto">
        <a-row :gutter="gutter || 16">
          <template v-for="col in formItems" :key="col.prop">
            <a-col
              :span="col.config?.span || span || 24"
              v-show="getConfig(col.config).display !== false"
              :style="{ ...(col.config.colStyle || {}) }"
            >
              <lr-input-rows
                v-if="
                  (col.getInputType
                    ? col.getInputType(tableData[index || 0], formState)
                    : col.inputType) == 'inputRows'
                "
                v-bind="getConfig(col.config)"
                v-model:value="formData[col.config.valueIdKey || col.prop]"
                :columns="getTableColumns(col.children || [])"
                :id="`${id}.${col.prop}`"
                :parent-row="formData"
                @change="
                  hanldChildChange($event, {
                    index: index,
                    column: col,
                  })
                "
                @row-change="
                  hanldChildChange($event, {
                    index: index,
                    column: col,
                  })
                "
              />

              <a-form-item
                v-else
                :label-col="{
                  span: col.config?.labelSpan || labelSpan,
                  style: {
                    width: getLabelWidth(col.config?.labelWidth),
                  },
                }"
                :label="$t(col.config.label || '')"
                :extra="col.config?.labelExtra"
                :required="col.required"
              >
                <lr-c-input
                  :type="
                    col.getInputType
                      ? col.getInputType(tableData[index || 0], formState)
                      : col.inputType
                  "
                  :config="getConfig(col.config)"
                  :table-index="index"
                  :id="`${id}.${col.prop}`"
                  v-model="formData[col.config.valueIdKey || col.prop]"
                  @change="
                    hanldChange($event, {
                      index: index,
                      column: col,
                    })
                  "
                />
              </a-form-item>
            </a-col>
          </template>
        </a-row>
      </div>
    </lr-modal>
  </a-form-item-rest>
</template>

<script lang="ts" setup>
  import type { SchemaRuntimeConfig } from '../cSchemaForm/interface';
  import { PropType, computed, ref, inject } from 'vue';
  import { createNamespace } from '../utils/components';

  defineOptions({ name: createNamespace('inputRowLayerForm').name });

  const props = defineProps({
    /**
     * 数据
     */
    data: {
      type: Object as PropType<Record<string, any>>,
      default: () => ({}),
    },
    /**
     *
     */
    id: String,
    /**
     * @zh 按钮的类型，分为五种：主要按钮、幽灵按钮、虚框按钮、链接按钮、文字按钮、次要按钮。
     * @defaultValue 'default'
     */
    type: {
      type: String as PropType<'primary' | 'ghost' | 'dashed' | 'link' | 'text' | 'default'>,
      default: 'default',
    },
    /**
     * @zh 设置按钮大小
     * @defaultValue 'middle'
     */
    size: {
      type: String as PropType<'large' | 'middle' | 'small'>,
    },
    /**
     * @zh 弹窗标题
     */
    layerLabel: String,
    /**
     * @zh 弹窗高度
     */
    layerHeight: Number,
    /**
     * @zh 弹窗宽度
     */
    layerWidth: Number,

    /**
     * @zh 表单配置 文本宽
     */
    labelWidth: Number,
    /**
     * @zh 表单配置 文本占比
     */
    labelSpan: Number,
    /**
     * @zh 表单配置 占比
     */
    span: Number,
    /**
     * @zh 表单配置 间隔
     */
    gutter: Number,
    /**
     * @zh 表单配置
     */
    schemaList: {
      type: Array as PropType<SchemaRuntimeConfig[]>,
      default: () => [],
    },
    /**
     * @zh 行数据
     */
    index: Number,
    /**
     * @zh 表格数据
     */
    tableData: {
      type: Array as PropType<Record<string, any>[]>,
      default: () => [],
    },
    /**
     * @zh 父级行数据
     */
    parentRow: Object as PropType<Record<string, any>>,

    /**
     * @zh 变更方法
     */
    hanldChange: {
      type: Function,
      required: true,
    },
  });

  // 获取注入的方法
  const { components, formState, rules } = inject('jcode_form_provide', {} as Record<string, any>);

  const formVisible = ref(false);
  const handleOpen = () => {
    formVisible.value = true;
  };

  const getLabelWidth = (labelWidth: string | number) => {
    const myLabelWidth = labelWidth || props.labelWidth;
    if (typeof myLabelWidth === 'string') {
      return myLabelWidth;
    }

    if (typeof myLabelWidth === 'number') {
      return myLabelWidth + 'px';
    }

    return myLabelWidth;
  };

  // 表单
  const formItems = computed(() =>
    props.schemaList?.map((t: any) => {
      const colComponent = components[t.id];
      const config: Record<string, any> = {};

      const ids = t.id.split('.');

      const res: Record<string, any> = {
        prop: ids.length > 1 ? ids[ids.length - 1] : t.id,
        inputType: colComponent.type,
        config,
      };
      if (colComponent.config?.getInputType) {
        res.getInputType = colComponent.config.getInputType;
      }
      // 记录原始id
      res.config.initialId = ids.length > 1 ? ids.slice(1).join('.') : t.id;

      if (t.children && t.children.length > 0) {
        res.children = t.children;
      }

      if (colComponent.config) {
        Object.keys(colComponent.config).forEach((key) => {
          res.config[key] = colComponent.config[key];
        });
      }

      return res;
    }),
  );

  const getConfig = (config: Record<string, any>) => {
    const myConfig = { ...config };
    if (myConfig.getUpConfig) {
      const _config = config.getUpConfig({
        formData: formState,
        index: props.index,
        row: props.tableData[props.index || 0],
        tableData: props.tableData,
        parentRow: props.parentRow,
        config: myConfig,
      });
      if (_config) {
        Object.keys(_config).forEach((key) => {
          myConfig[key] = _config[key];
        });
      }
    }
    return myConfig;
  };

  const formData = computed(() => props.data);

  // 获取孙表的列数据
  const tableColumnProp = [
    'label',
    'width',
    'minWidth',
    'fixed',
    'resizable',
    'align',
    'headerAlign',
    'isNotAutoWrap',
    'sortable',
    'isSummary',
    'required',
    'isKeyword',
    'isFilter',
    'isInputType',
    'getInputType',
    'field',
    'notShowColLabel',
  ];
  const getTableColumns = (children: Record<string, any>) => {
    const res = children?.map((t: any) => {
      const colComponent = components[t.id];
      const config: Record<string, any> = {};

      const ids = t.id.split('.');

      const res: Record<string, any> = {
        prop: ids.length > 1 ? ids[ids.length - 1] : t.id,
        inputType: colComponent.type,
        config,
        rule: rules[t.id || ''],
      };

      if (t.children) {
        res.children = t.children;
      }

      if (colComponent.config) {
        Object.keys(colComponent.config).forEach((key) => {
          if (tableColumnProp.includes(key)) {
            res[key] = colComponent.config[key];
          } else {
            res.config[key] = colComponent.config[key];
          }
        });
      }

      return res;
    });
    return res;
  };
  const hanldChildChange = (
    changeData: Record<string, any>,
    data: { column: Record<string, any>; index: any },
  ) => {
    const value =
      props.tableData[data.index][data.column.config.valueIdKey || data.column.prop] || [];
    props.hanldChange({ value, data: value }, { column: data.column, index: data.index });

    if (data.column.config?.rowChange) {
      const layerIndexData = props.tableData[data.index];
      const path = data.column.config.valueIdKey || data.column.config?.initialId;
      const tableData =
        path.split('.').reduce((item: any, key: number) => item && item[key], layerIndexData) || [];
      data.column.config.rowChange({
        value: changeData.value,
        data: changeData.data,
        index: changeData.index,
        tableData,
        col: changeData.col,
        type: 'update',
      });
    }
  };
</script>

<style lang="less">
  @import './inputRowLayerForm';
</style>
