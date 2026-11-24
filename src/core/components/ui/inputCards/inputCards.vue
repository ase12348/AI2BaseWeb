<template>
  <div class="lr-input-cards" v-bind="$attrs">
    <div
      class="lr-input-cards-item"
      v-for="(row, index) in list"
      :key="row.i"
      style="margin-bottom: 8px"
    >
      <a-row :gutter="gutter">
        <a-col
          v-for="col in columns"
          :key="col.prop"
          :span="col.config?.span || span || 24"
          :style="{
            'margin-bottom':
              (col.getInputType ? col.getInputType(row, formState) : col.inputType) == 'inputRows'
                ? '8px'
                : undefined,
          }"
        >
          <lr-input-rows
            v-if="
              (col.getInputType ? col.getInputType(row, formState) : col.inputType) == 'inputRows'
            "
            v-bind="getConfig(col.config, index)"
            v-model:value="row[col.config.valueIdKey || col.prop]"
            :columns="getTableColumns(col.children || [])"
            :id="`${id}.${index}.${col.prop}`"
            :parent-row="row"
            @change="
              hanldChildChange({
                index: index,
                column: col,
              })
            "
            @row-change="
              hanldChildChange({
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
            :label="$t(col.label || '')"
            :extra="col.config?.labelExtra"
            :tooltip="col.config?.labelTooltip"
            :required="col.required"
            v-show="getConfig(col.config, index).display !== false"
          >
            <lr-c-input
              :type="col.getInputType ? col.getInputType(row, formState) : col.inputType"
              :config="getConfig(col.config, index)"
              :table-index="index"
              :id="`${id}.${index}.${col.prop}`"
              v-model="row[col.config.valueIdKey || col.prop]"
              @change="
                hanldChange($event, {
                  index: index,
                  column: col,
                })
              "
              @keydown.enter.prevent.stop
            />
          </a-form-item>
        </a-col>
        <lr-button
          v-if="isRemoveBtn && (!mustHas || list.length > 1) && !readonly"
          class="lr-input-cards-delete"
          size="small"
          shape="circle"
          danger
          @click="handleRemove(index)"
        >
          <template #icon>
            <lr-icon icon="ant-design:close-outlined" />
          </template>
        </lr-button>
      </a-row>
    </div>
  </div>
  <div v-if="isAddBtn && !readonly">
    <lr-button type="dashed" @click="handleAdd">
      <template #icon>
        <lr-icon class="lr-buttons-icon" icon="ant-design:plus-outlined" :is-div="false" />
      </template>
      {{ $t(addBtnText) }}
    </lr-button>
  </div>
</template>

<script lang="ts" setup>
  import { PropType, watch, ref, inject } from 'vue';
  import { createNamespace } from '../utils/components';
  import { buildUUID, deepClone } from '../utils/method';
  import { isNullOrEmpty } from '../utils/is';
  import { useFramework } from '../utils/useFramework';

  defineOptions({ name: createNamespace('inputCards').name });
  const props = defineProps({
    /**
     * @zh 组件Id
     */
    id: String,
    /**
     * @zh 输入值
     * @vModel
     */
    value: {
      type: Array as PropType<Record<string, any>[]>,
    },
    /**
     * @zh 列信息
     */
    columns: {
      type: Array as PropType<Record<string, any>[]>,
      default: () => [],
    },
    /**
     * @zh 间隔
     */
    gutter: {
      type: Number as PropType<number>,
      default: 16,
    },
    /**
     * @zh 是否有添加按钮。
     */
    isAddBtn: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 添加按钮的文本
     */
    addBtnText: {
      type: String,
      default: '添加',
    },
    /**
     * @zh 是否有移除按钮。
     */
    isRemoveBtn: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 行所占比例
     */
    span: Number,
    /**
     * @zh 标签所占比例
     */
    labelSpan: Number,
    /**
     * @zh 标签所占宽度
     */
    labelWidth: [String, Number],
    /**
     * @zh 是否必填
     */
    required: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 必须有值
     */
    mustHas: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 是否只读
     */
    readonly: Boolean,
  });
  const emit = defineEmits({
    'update:value': (value: Record<string, any>[]) => true,
    /**
     * @zh 数据改变时触发
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    change: (data: {
      value: any;
      data?: any;
      index?: number;
      tableData?: Record<string, any>[];
      col?: Record<string, any>;
      type?: string;
    }) => true,
    /**
     * @zh 行数据改变
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    rowChange: (data: {
      value: any;
      data: Record<string, any> | Record<string, any>[];
      row?: Record<string, any>;
      index: number;
      tableData: Record<string, any>[];
      col: Record<string, any>;
      type?: string;
    }) => true,
  });

  const { t } = useFramework({});
  const list = ref<Record<string, any>[]>([]);
  const hanldChange = (
    changeData: { value: any; data: any },
    data: { column: Record<string, any>; index: number },
  ) => {
    emit('rowChange', {
      value: changeData.value,
      data: changeData.data,
      row: list.value[data.index],
      index: data.index,
      tableData: list.value,
      col: data.column,
      type: 'update',
    });
  };

  const handleAdd = () => {
    const row: Record<string, any> = { i: buildUUID() };
    props.columns.forEach((col) => {
      row[col.prop] = deepClone(col.config?.defaultValue);
    });
    list.value.push(row);
    emit('change', {
      value: row,
      data: row,
      index: list.value.length - 1,
      tableData: list.value,
      type: 'add',
    });
  };

  const handleRemove = (index: number) => {
    const row = list.value[index];
    list.value.splice(index, 1);
    emit('change', { value: row, data: row, index, tableData: list.value, type: 'delete' });
  };

  const hanldChildChange = (data: { column: Record<string, any>; index: number }) => {
    const value = list.value[data.index][data.column.config.valueIdKey || data.column.prop] || [];
    emit('rowChange', {
      value,
      data: value,
      col: data.column,
      index: data.index,
      tableData: list.value,
    });
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

  const pValidate = () => {
    const res = {
      isOk: true,
      info: '',
    };
    if (props.required) {
      if (list.value.length === 0) {
        res.isOk = false;
        res.info = '请添加表格数据';
        return res;
      }
    }
    const rowLen = list.value.length;
    const unrefColumns = props.columns;
    const colLen = unrefColumns.length;
    for (let rowIndex = 0; rowIndex < rowLen; rowIndex++) {
      const row = list.value[rowIndex];
      for (let colIndex = 0; colIndex < colLen; colIndex++) {
        const col = unrefColumns[colIndex];
        if (getConfig(col.config, rowIndex).display !== false) {
          if (col.rule && col.rule.length > 0) {
            const patternLen = col.rule.length;
            for (let i = 0; i < patternLen; i++) {
              const ruleItem = col.rule[i];
              ruleItem.pattern = ruleItem.pattern ? ruleItem.pattern + '' : '';
              if (
                ruleItem.pattern &&
                !isNullOrEmpty(row[col.prop || '']) &&
                !new RegExp(ruleItem.pattern.substring(1, ruleItem.pattern.length - 1)).test(
                  row[col.prop || ''],
                )
              ) {
                res.info = `${t('第')}${rowIndex + 1}${t('行')}，${t('第')}${colIndex + 1}${t('列')}，${t(
                  col.label,
                )}：${t(ruleItem.message)}`;
                res.isOk = false;
                return res;
              }

              if (ruleItem.required && isNullOrEmpty(row[col.prop || ''])) {
                res.isOk = false;
                res.info = `${t('第')}${rowIndex + 1}${t('行')}，${t('第')}${colIndex + 1}${t('列')}，${t(
                  col.label,
                )}：${t('不能为空')}`;
                return res;
              }
            }
          }
        }
      }
    }
    return res;
  };

  if (props.value) {
    list.value = props.value || [];
  } else {
    emit('update:value', list.value);
  }

  const { formState, components, rules } = inject('jcode_form_provide', {} as Record<string, any>);
  const getConfig = (config: Record<string, any>, index: number) => {
    const myConfig = { ...config };
    if (myConfig.getUpConfig) {
      const _config = config.getUpConfig({
        formData: formState,
        index,
        row: list.value[index],
        tableData: list.value,
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
  const getTableColumns = (children: Record<string, any>) =>
    children?.map((t: any) => {
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

  watch(
    () => props.value,
    (value) => {
      list.value = props.value || [];
      list.value = value || [];
      list.value.forEach((row) => {
        if (!row.i) {
          row.i = buildUUID();
        }
      });
    },
  );

  /**
   * @zh 表格校验
   * @public
   */
  function validate() {
    return pValidate();
  }

  defineExpose({ validate });
</script>

<style lang="less">
  @import './inputCards';
</style>
