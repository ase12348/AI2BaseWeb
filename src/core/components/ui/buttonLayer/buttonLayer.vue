<template>
  <div class="lr-block">
    <lr-button
      :type="type"
      :size="size"
      :disabled="readonly"
      :label="content"
      :icon-name="iconName"
      :danger="danger"
      :ghost="ghost"
      :shape="shape"
      @click.stop="handleClick"
    />
    <lr-layer
      ref="layerRef"
      :width="layerWidth"
      :height="layerHeight"
      btn-text="确认"
      @ok="handleLayerOk"
      @closed="handleClosed"
    >
      <lr-c-schema-index :schemas="indexSchemas" ref="indexRef" />
    </lr-layer>
  </div>
</template>

<script lang="ts" setup>
  import type { columns as Columns } from '../table/columns';

  import { PropType, computed, ref } from 'vue';
  import { createNamespace } from '../utils/components';

  defineOptions({ name: createNamespace('buttonLayer').name });
  const props = defineProps({
    /**
     * @zh 按钮的类型，分为五种：主要按钮、幽灵按钮、虚框按钮、链接按钮、文字按钮、次要按钮。
     * @defaultValue 'default'
     */
    type: {
      type: String as PropType<'primary' | 'ghost' | 'dashed' | 'link' | 'text' | 'default'>,
    },
    /**
     * @zh 设置按钮大小
     * @defaultValue 'middle'
     */
    size: {
      type: String as PropType<'large' | 'middle' | 'small'>,
    },
    /**
     * @zh 设置按钮形状
     * @defaultValue 'default'
     */
    shape: {
      type: String as PropType<'default' | 'circle' | 'round'>,
    },
    /**
     * @zh 幽灵属性，使按钮背景透明
     * @defaultValue false
     */
    ghost: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 设置危险按钮
     * @defaultValue false
     */
    danger: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 按钮不可用状态。
     * @defaultValue false
     */
    disabled: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 按钮内容
     */
    content: {
      type: String,
    },
    iconName: {
      type: String as PropType<string>,
      default: '',
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
    layerHeight: {
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
    columns: { type: Array<Columns>, default: () => [] },
    /**
     * @zh 加载数据方法
     */
    loadLayerData: Function,
    /**
     * @zh 打开前的回调函数，返回 `false` 可阻止弹窗打开。
     */
    beforeOpen: Function,
    /**
     * @zh 是否禁用。
     */
    readonly: Boolean,
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
  });
  const emit = defineEmits({
    /**
     * @zh 值变化时触发
     */
    change: (data: { value: string | undefined; data: any }) => true,
  });

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
        defaultExpandAll: props.defaultExpandAll,
        searchInputList: props.searchInputList,
        buttons: [],
        tableButtons: [],
        immediate: true,
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
  const handleClick = async () => {
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
    if (!tableRef) {
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

  const handleLayerOk = async () => {
    const rows = await getRef('mainTable').getSelections();
    if (rows.length > 0) {
      const value = rows[0][props.valueKey] || '';
      emit('change', { value, data: rows[0] });
    } else {
      emit('change', { value: undefined, data: undefined });
    }
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
  @import './buttonLayer';
</style>
