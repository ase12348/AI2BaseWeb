<template>
  <a-input-group style="display: flex; width: 100%" v-bind="$attrs" compact>
    <a-input
      style="flex: 1; width: 0"
      v-model:value="inputValue"
      :placeholder="placeholder ? $t(placeholder) : undefined"
      :readonly="readonly"
      :size="size"
      :allow-clear="readonly ? false : clearable"
      @focus="handleInputFocus"
      @click="handleInputClick"
      ref="inputRef"
      v-if="!onlyButton"
    />
    <lr-button
      v-if="!readonly"
      :type="buttonType"
      :size="size"
      :label="buttonLabel"
      @click="handleClick"
    >
      <template #icon>
        <lr-icon :is-div="!buttonLabel" :class="{ 'lr-button-icon': !!buttonLabel }" :icon="icon" />
      </template>
    </lr-button>
  </a-input-group>
  <a-form-item-rest>
    <lr-layer
      ref="layerRef"
      :width="layerWidth"
      :height="height"
      btn-text="确认"
      @ok="handleLayerOk"
      @closed="handleClosed"
    >
      <lr-c-schema-index :schemas="indexSchemas" ref="indexRef" />
    </lr-layer>
  </a-form-item-rest>
</template>

<script lang="ts" setup>
  import type { columns as ColumnsType } from '../table/columns';

  import { PropType, computed, ref, watch } from 'vue';
  import { isNullOrEmpty } from '../utils/is';

  defineOptions({ name: 'LrInputLayer' });

  const props = defineProps({
    /**
     * @zh 输入值
     * @vModel
     */
    value: {
      type: [String] as PropType<string>,
      default: undefined,
    },
    /**
     * @zh 按钮图标。
     */
    icon: {
      type: String as PropType<string>,
      default: 'ant-design:link-outlined',
    },
    /**
     * @zh 弹窗宽度
     */
    layerWidth: {
      type: Number as PropType<number>,
      default: 800,
    },
    /**
     * @zh 弹窗高度
     */
    height: {
      type: Number as PropType<number>,
      default: 600,
    },
    /**
     * @zh 弹窗标题
     */
    title: {
      type: String as PropType<string>,
    },
    /**
     * @zh 占位符
     */
    placeholder: {
      type: String as PropType<string>,
      default: '请选择',
    },
    /**
     * @zh 是否多选
     * @defaultValue false
     */
    isMultiSelect: Boolean,
    /**
     * @zh 弹窗打开是否显示选择项
     * @defaultValue false
     */
    layerOpenSelectShow: {
      type: Boolean,
      default: false,
    },
    /**
     * 值Key
     */
    valueKey: {
      type: String,
      default: 'value',
    },
    /**
     * 显示key
     */
    labelKey: {
      type: String,
      default: 'label',
    },
    /**
     * @zh 父级节点ID
     */
    idKey: String,
    /**
     * @zh 父级节点ID
     */
    pidKey: {
      type: String,
      default: 'value',
    },
    /**
     * @zh 是否显示树形结构
     */
    isTree: Boolean,

    /**
     * @zh 是否分页
     */
    isPage: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 排序字段
     */
    sidx: String,

    /**
     * @zh 配置表格的列描述， [columns](#columns)。
     */
    columns: { type: Array<ColumnsType>, default: () => [] },
    /**
     * @zh 加载数据方法
     */
    loadLayerData: Function,
    /**
     * @zh 获取显示值方法
     */
    getText: Function,
    /**
     * @zh 打开前的回调函数，返回 `false` 可阻止弹窗打开。
     */
    beforeOpen: Function,
    /**
     * @zh 是否禁用。
     */
    readonly: Boolean,
    /**
     * @zh 选框尺寸
     */
    size: {
      type: String as PropType<'small' | 'large' | 'middle'>,
    },
    /**
     * @zh 是否可以清除
     * @defaultValue true
     */
    clearable: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 树形结构时是否默认展开所有行
     * @defaultValue true
     */
    defaultExpandAll: {
      type: Boolean,
      default: true,
    },
    // 查询参数
    /**
     * @zh 数据加载方式
     */
    mode: {
      type: String,
      default: 'serve',
    },
    /**
     * @zh 查询框
     */
    searchInputList: {
      type: Array as PropType<Record<string, any>[]>,
      default: () => [],
    },
    /**
     * @zh 只显示按钮
     */
    onlyButton: Boolean,
    /**
     * @zh 按钮文本
     */
    buttonLabel: String,
    /**
     * @zh 按钮类型
     */
    buttonType: String,
    /**
     * @zh 特定场合下使用
     */
    isSaveSelectData: Boolean,
    /**
     * @zh 按钮组
     */
    buttons: Array as PropType<Record<string, any>[]>,
    /**
     * @zh 多选框选中改变时触发
     */
    selectChange: Function,
  });

  const emit = defineEmits({
    'update:value': (val: string | undefined) => true,
    /**
     * @zh 值变化时触发
     */
    change: (data: { value: string | undefined; data: any }) => true,
  });
  const inputRef = ref();
  const layerRef = ref();
  const indexRef = ref();
  const myColumns = computed(() => props.columns.filter((t) => !t.hidden));
  const indexSchemas = computed(() => [
    {
      id: 'mainTable',
      type: 'lr-table-panel',
      config: {
        mode: props.mode,
        columns: myColumns.value,
        rowKey: props.valueKey,
        idKey: props.idKey || props.valueKey,
        pidKey: props.pidKey,
        isTree: props.isTree,
        isPage: props.isPage,
        sidx: props.sidx,
        isRadio: !props.isMultiSelect,
        isMultiSelect: props.isMultiSelect,
        isSaveSelectData: props.isSaveSelectData,
        defaultExpandAll: props.defaultExpandAll,
        searchInputList: props.searchInputList,
        buttons: props.buttons,
        tableButtons: [],
        immediate: true,
        selectChange: async (data: any) => {
          props.selectChange && props.selectChange(data);
        },
        loadData: async (param: any) => {
          let res = [];
          if (props.loadLayerData) {
            res = await props.loadLayerData(param);
          }
          return res;
        },
      },
    },
  ]);
  const getRef = (id: string) => indexRef.value?.getRef(id);

  const myValue = computed({
    get() {
      return props.value;
    },
    set(value) {
      emit('update:value', value);
    },
  });

  const showLabel = ref('');
  const inputValue = computed({
    get() {
      if (isNullOrEmpty(myValue.value)) {
        return '';
      }
      if (isNullOrEmpty(showLabel.value)) {
        if (props.getText) {
          return props.getText(myValue.value);
        }
        return myValue.value;
      }
      return showLabel.value;
    },
    set() {
      showLabel.value = '';
      myValue.value = '';

      emit('change', { value: undefined, data: undefined });
    },
  });

  const handleClick = async () => {
    inputRef.value?.blur();
    if (props.beforeOpen) {
      const res = props.beforeOpen();
      if (res === false) {
        return;
      }
    }
    await pResetData();
    layerRef.value.open(props.title || props.placeholder);
    if (props.layerOpenSelectShow && props.isMultiSelect) {
      loadTableComponent();
    }
  };

  let loadTableNum = 0;
  const loadTableComponent = async () => {
    const tableRef = getRef('mainTable');
    if (tableRef) {
      tableRef.toggleRowSelection(props.value?.split(',') || [], true);
    } else {
      if (loadTableNum > 600) {
        console.warn('表单组件加载超时');
        return;
      }
      loadTableNum++;
      setTimeout(async () => {
        await loadTableComponent();
      }, 100);
    }
  };

  const handleInputFocus = () => {
    inputRef.value?.blur();
  };
  const handleInputClick = async () => {
    if (!props.readonly) {
      await handleClick();
    }
  };

  const handleLayerOk = async () => {
    const rows = await getRef('mainTable').getSelections();
    if (props.isMultiSelect) {
      const labels: any[] = [];
      const values: any[] = [];
      rows.forEach((item: any) => {
        labels.push(item[props.labelKey] || '');

        if (item[props.valueKey] === 0) {
          values.push(item[props.valueKey]);
        } else {
          values.push(item[props.valueKey] || '');
        }
      });
      showLabel.value = labels.join(',') || '';
      myValue.value = values.join(',') || '';

      emit('change', { value: values.join(',') || '', data: rows });
    } else if (rows.length > 0) {
      const value = rows[0][props.valueKey] || '';
      showLabel.value = rows[0][props.labelKey] || '';
      myValue.value = value;
      emit('change', { value, data: rows[0] });
    } else {
      myValue.value = '';
      showLabel.value = '';

      emit('change', { value: undefined, data: undefined });
    }
    // console.log(rows)

    layerRef.value.close();
  };

  const handleClosed = () => {
    getRef('mainTable').clearSelection();
  };

  const pResetData = async () => {
    const tableRef = getRef('mainTable');
    if (tableRef) {
      await tableRef.resetData();
    }
  };

  watch(
    () => props.value,
    () => {
      showLabel.value = '';
    },
  );

  /**
   * @zh 刷新数据
   * @pubilc
   */
  function resetData() {
    pResetData();
  }

  defineExpose({ resetData });
</script>

<style lang="less">
  @import './inputLayer';
</style>
