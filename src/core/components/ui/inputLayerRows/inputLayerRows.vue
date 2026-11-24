<template>
  <lr-button
    v-bind="$attrs"
    :type="type"
    :size="size"
    @click="handleOpen"
    icon-name="ant-design:form-outlined"
    :label="btnText"
  />
  <a-form-item-rest>
    <lr-layer
      :height="height"
      :width="width"
      :before-close="beforeFormClose"
      @closed="handleClosed"
      :has-btns="false"
      ref="layerRef"
    >
      <div class="lr-block" style="padding: 16px; overflow: auto; overflow-x: hidden">
        <lr-input-rows
          v-model:value="inputValue"
          :columns="columns"
          :is-add-btn="isAddBtn"
          :is-remove-btn="isRemoveBtn"
          :add-btn-text="addBtnText"
          :must-has="mustHas"
          :show-num="showNum"
          :show-char="showChar"
          :readonly="readonly"
          :drag="drag"
          :required="required"
          :is-compact="isCompact"
          @change="hanldChange"
          @row-change="handleRowChange"
          ref="tableRef"
        />
      </div>
    </lr-layer>
  </a-form-item-rest>
</template>

<script lang="ts" setup>
  import { PropType, ref, watch } from 'vue';
  import { createNamespace } from '../utils/components';

  defineOptions({ name: createNamespace('inputLayerRows').name });

  const props = defineProps({
    /**
     * @zh 输入值
     * @vModel
     */
    value: {
      type: Array as PropType<Record<string, any>[]>,
      default: () => [],
    },
    /**
     * @zh 列配置
     */
    columns: {
      type: Array as PropType<Record<string, any>[]>,
      default: () => [],
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
     * @zh 添加按钮对齐方式
     * @values left,center, right
     */
    addBtnAlign: {
      type: String as PropType<'left' | 'center' | 'right'>,
      default: 'left',
    },
    /**
     * @zh 是否有移除按钮。
     */
    isRemoveBtn: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 必须有值
     */
    mustHas: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 是否必填
     */
    required: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 是否只读
     */
    readonly: Boolean,
    /**
     * @zh 是否可拖拽
     */
    drag: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 是否紧凑模式
     */
    isCompact: Boolean,
    /**
     * @zh 是否显示序号
     */
    showNum: Boolean,
    /**
     * @zh 是否显示字母
     */
    showChar: Boolean,

    /**
     * @zh 按钮的类型，分为五种：主要按钮、幽灵按钮、虚框按钮、链接按钮、文字按钮、次要按钮。
     * @defaultValue 'default'
     */
    type: {
      type: String as PropType<'primary' | 'ghost' | 'dashed' | 'link' | 'text' | 'default'>,
    },
    /**
     * @zh 按钮文字
     */
    btnText: {
      type: String,
      default: '设置数据',
    },
    /**
     * @zh 弹窗标题
     */
    title: String,
    /**
     * @zh 设置按钮大小
     * @defaultValue 'middle'
     */
    size: {
      type: String as PropType<'large' | 'middle' | 'small'>,
    },
    /**
     * @zh 弹窗类型，弹窗、全屏弹窗、抽屉。
     * @defaultValue 'model'
     */
    layerType: {
      type: String as PropType<'model' | 'full' | 'drawer'>,
    },
    /**
     * @zh 宽度
     * @defaultValue 1000
     */
    width: {
      type: [String, Number],
      default: 1000,
    },
    /**
     * @zh 高度
     * @defaultValue 600
     */
    height: {
      type: Number,
      default: 600,
    },

    /**
     * @zh 弹窗打开回调
     */
    open: Function,
    /**
     * @zh 弹窗关闭前回调
     */
    beforeClose: Function,
    /**
     * @zh 弹窗关闭后回调
     */
    closed: Function,
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
      row: Record<string, any>;
      index: number;
      tableData: Record<string, any>[];
      col: Record<string, any>;
      type: string;
    }) => true,
  });

  const layerRef = ref();
  const inputValue = ref<Record<string, any>[]>();

  const { beforeClose, closed, open } = props;

  const beforeFormClose = () => {
    if (beforeClose) {
      return beforeClose(props.value);
    }
    return true;
  };

  const handleClosed = () => {
    closed && closed();
  };

  const handleOpen = () => {
    layerRef.value.open(props.title || props.btnText, props.layerType);
    setTimeout(() => {
      open && open(props.value);
    }, 200);
  };

  const hanldChange = (data: any) => {
    emit('change', data);
  };

  const handleRowChange = (data: any) => {
    emit('rowChange', data);
  };

  watch(
    () => props.value,
    (value) => {
      inputValue.value = value;
    },
    { immediate: true },
  );
</script>

<style lang="less">
  @import './inputLayerRows';
</style>
