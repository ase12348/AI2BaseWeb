<template>
  <a-tree-select
    style="width: 100%"
    :size="size"
    :allowClear="clearable"
    :placeholder="$t(placeholder)"
    :showSearch="showSearch"
    :tree-default-expand-all="true"
    :tree-data="options"
    treeNodeFilterProp="label"
    v-model:value="myValue"
    :disabled="readonly || ['create'].includes(mode)"
    :showArrow="!readonly"
    :multiple="isMultiSelect"
    @change="handleChange"
  />
</template>
<script lang="ts" setup>
  import { computed, ref, PropType, watch } from 'vue';
  import { useOrganization } from '/@/core/hooks/data/useOrganization';
  import { isNullOrEmpty } from '@/core/utils/jcode';

  const { loadCompanyList, getCompanyList, getCompanyTree, getLoginInfo } = useOrganization();

  loadCompanyList();
  const props = defineProps({
    /**
     * 输入值
     */
    modelValue: {
      type: String,
      default: undefined,
    },
    /**
     * 占位符
     */
    placeholder: {
      type: String,
      default: '请选择',
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
    /**
     * @zh 是否可以清除
     * @defaultValue true
     */
    showSearch: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 过滤字段
     */
    dataFilterIds: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    /**
     * @zh 是否选中登录者
     */
    isLogin: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 模式，用于区分编辑人员还是创建人员还是选择框
     */
    mode: {
      type: String as PropType<'default' | 'create'>,
      default: 'default',
    },
    /**
     * @zh 是否多选
     * @defaultValue false
     */
    isMultiSelect: Boolean,
  });
  const emit = defineEmits(['update:modelValue', 'change']);

  const options = computed(() => {
    return getCompanyTree(getCompanyList.value, '', props.dataFilterIds);
  });

  const myValue = ref<string | Array<string> | undefined>([]);

  const handleChange = (value: string | Array<string>) => {
    console.log(value, 'handleChange');
    myValue.value = value;

    let outValue = value;
    let outData: any = undefined;
    if (props.isMultiSelect) {
      outValue = String(value);
      outData = getCompanyList.value.filter((item) => value.includes(item.id));
    } else {
      outData = getCompanyList.value.find((item) => item.id === value);
    }

    console.log(outValue, outData, 'handleChange');

    emit('update:modelValue', outValue);
    emit('change', {
      value: outValue,
      data: outData,
    });
  };

  watch(
    () => props.modelValue,
    async (val) => {
      if (isNullOrEmpty(val)) {
        if (props.isLogin || (props.mode === 'create' && !props.readonly)) {
          handleChange(getLoginInfo.value.companyId || '');
          return;
        }
      }

      if (props.isMultiSelect) {
        if (val) {
          myValue.value = val?.split(',');
        } else {
          myValue.value = [];
        }
      } else {
        myValue.value = val;
      }
    },
    { immediate: true },
  );

  watch(
    () => props.isLogin,
    async (val) => {
      if (val) {
        handleChange();
      }
    },
  );
</script>
