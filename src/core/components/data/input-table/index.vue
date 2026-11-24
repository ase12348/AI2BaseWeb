<template>
  <a-input-group v-bind="$attrs" style="display: flex; width: 100%" compact>
    <a-input
      style="flex: 1; width: 0"
      v-model:value="inputValue"
      :placeholder="placeholder ? $t(placeholder) : undefined"
      :readonly="readonly"
      :size="size"
      :allow-clear="readonly ? false : clearable"
      @focus="handleInputClick"
      ref="inputRef"
    />
    <lr-button v-if="!readonly" :size="size" @click="handleClick">
      <template #icon>
        <lr-icon :icon="icon" />
      </template>
    </lr-button>
  </a-input-group>
  <a-form-item-rest>
    <lr-layer
      ref="layerRef"
      :width="width"
      :height="height"
      btn-text="确认"
      @ok="handleLayerOk"
      @closed="handleClosed"
    >
      <lr-codetable-panel ref="codetableRef" :multiple="false" :dbCode="dbCode" />
    </lr-layer>
  </a-form-item-rest>
</template>

<script lang="ts" setup>
  import { PropType, computed, ref, nextTick } from 'vue';
  import { useMessage } from '@/core/hooks/useMessage';
  import { t } from '@/core/locales/setupI18n';

  const { warning } = useMessage();

  const emit = defineEmits(['update:modelValue', 'change']);
  const props = defineProps({
    /**
     * 输入值
     */
    modelValue: {
      type: String,
      default: undefined,
    },
    /**
     * @zh 按钮图标。
     */
    icon: {
      type: String as PropType<string>,
      default: 'table',
    },
    /**
     * @zh 弹窗宽度
     */
    width: {
      type: Number as PropType<number>,
      default: 1000,
    },
    /**
     * @zh 弹窗高度
     */
    height: {
      type: Number as PropType<number>,
      default: 600,
    },
    /**
     * @zh 占位符
     */
    placeholder: {
      type: String as PropType<string>,
      default: '请选择表',
    },
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
    dbCode: {
      type: String,
      default: undefined,
    },
  });

  const inputRef = ref();
  const layerRef = ref();
  const codetableRef = ref();

  const inputValue = computed({
    get() {
      return props.modelValue;
    },
    set() {
      emit('update:modelValue', undefined);
      emit('change', { value: undefined, data: undefined });
    },
  });

  const open = () => {
    if (codetableRef.value?.open) {
      codetableRef.value.open();
    } else {
      setTimeout(() => {
        open();
      }, 100);
    }
  };

  const handleInputClick = () => {
    inputRef.value.blur();
  };

  const handleClick = () => {
    if (!props.dbCode) {
      warning('请先配置数据库');
      return;
    }

    inputRef.value.blur();
    layerRef.value.open(t('选择数据表'));

    nextTick(() => {
      open();
    });
  };

  const handleLayerOk = async () => {
    const list = await codetableRef.value.ok();
    if (list.length > 0) {
      emit('update:modelValue', list[0].name);
      emit('change', { value: list[0].name, data: list[0] });
    } else {
      inputValue.value = '';
    }

    layerRef.value.close();
  };

  const handleClosed = () => {
    codetableRef.value.closed();
    // getRef('mainTable').clearSelection();
  };
</script>
