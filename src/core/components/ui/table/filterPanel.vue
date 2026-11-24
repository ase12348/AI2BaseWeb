<template>
  <div class="lr-table-filter">
    <a-input-search v-model:value.trim="searchValue" style="margin-bottom: 8px" />
    <a-tree
      v-model:checked-keys="value"
      v-model:selected-keys="selectedKeys"
      :tree-data="treeData"
      :checkable="multiple"
      :check-strictly="multiple"
      default-expand-all
      :field-names="{
        title: 'label',
        key: 'value',
      }"
      @check="handleCheck"
      @select="handleSelect"
    />
  </div>
</template>

<script lang="ts" setup>
  import type { columns } from './columns';
  import { PropType, computed, ref, onBeforeMount } from 'vue';
  import { useFramework } from '../utils/useFramework';

  defineOptions({ name: 'FilterPanel' });
  const props = defineProps({
    /**
     * @zh 输入值
     * @vModel
     */
    modelValue: {
      type: [String] as PropType<string>,
      default: undefined,
    },
    /**
     * @zh 列信息
     */
    column: Object as PropType<columns>,
    /**
     * @zh 筛选值
     */
    filterValues: {
      type: Object as PropType<Record<string, string>>,
      default: () => ({}),
    },
    /**
     * @zh 过滤字段别名对照表
     */
    propMap: {
      type: Object as PropType<Record<string, string>>,
      default: () => ({}),
    },
  });
  const emit = defineEmits({
    'update:modelValue': (value: string | undefined) => true,
    /**
     * @zh 值改变事件
     * @param data
     */
    change: (data: { value: string[] }) => true,
  });

  // const config = props.column?.config

  const config = computed(() => props.column?.config);
  const {
    getCompanyTree,
    getCompanyList,
    getDataItemOptions,
    getDataItemList,
    loadDataItemList,
    getDataItem,

    getDbSourceList,
    loadDbSourceList,
    getDbSourceOptions,
    getDbSourceKey,

    loadDepartmentList,
    getDepartmentList,
    getDepartmentTree,
  } = useFramework({
    hasCompany: config.value?.dataType === 'company',
    dataItemCodes: [],
    loadCompanyCache: true,
  });

  const value = computed({
    get() {
      const checked = props.modelValue ? props.modelValue.split(',') : [];
      // 如果是多选模式，根据是否全选来判断是否添加'all'
      if (multiple.value && checked.length > 0 && options.value.length > 0) {
        const allValues = options.value.map((item: any) => item.value);
        // 如果选中的项包含所有选项，则自动添加'all'
        if (allValues.every((val: string) => checked.includes(val))) {
          if (!checked.includes('all')) {
            checked.unshift('all');
          }
        }
      }
      return {
        checked,
      };
    },
    set(val: any) {
      if (val.checked.length > 0) {
        // 过滤掉'all'，只保存实际的数据项
        const dataValues = val.checked.filter((item: string) => item !== 'all');
        emit('update:modelValue', dataValues.length > 0 ? String(dataValues) : '');
      } else {
        emit('update:modelValue', '');
      }
    },
  });

  const selectedKeys = ref<string[]>([]);

  const searchValue = ref('');

  const options = computed(() => {
    const keyword = searchValue.value;
    if (config.value?.dataType === 'dataItem' && getDataItem) {
      loadDataItemList(config.value?.dataCode, true);
      return getDataItemOptions(
        getDataItemList(config.value?.dataCode || ''),
        config.value?.valueKey,
        config.value?.labelKey,
        keyword,
      );
    }
    if (config.value?.dataType === 'dataSource' && getDbSourceList) {
      const upId =
        config.value?.upValue || props.filterValues[props.propMap[config.value?.upId || '']] || '';
      const params: Record<string, any> = {};
      params[config.value?.upKey || config.value?.upId || ''] = upId;
      loadDbSourceList(config.value?.dataCode || '', params, true);
      return getDbSourceOptions(
        getDbSourceList.value[getDbSourceKey(config.value?.dataCode || '', params)],
        config.value?.valueKey,
        config.value?.labelKey,
        keyword,
        config.value?.idKey,
        config.value?.pidKey,
      );
    }

    if (config.value?.dataType === 'company' && getCompanyList) {
      return getCompanyTree(getCompanyList.value, keyword, config.value?.dataFilterIds);
    }
    if (config.value?.dataType === 'department' && getDepartmentTree) {
      const companyId =
        config.value?.upValue || props.filterValues[props.propMap[config.value?.upId || '']] || '';
      if (companyId) {
        loadDepartmentList(companyId);
      }
      return getDepartmentTree(
        getDepartmentList.value[companyId],
        keyword,
        config.value?.dataFilterIds,
        config.value?.valueKey,
      );
    }

    const list = config.value?.options || [];
    if (keyword) {
      return list.filter((item: any) => item.label.indexOf(keyword) > -1);
    }
    return list;
  });

  const treeData = computed(() => {
    if (multiple.value) {
      return [{ label: '全选', value: 'all', children: options.value }];
    }
    return options.value;
  });
  const multiple = computed(() => config.value?.multiple);

  const handleCheck = (checkedKeys: any, e: any) => {
    const nowCheck = e.node.value; // 当前选中的节点值
    const nowChecked = e.checked; // 当前节点是否选中
    // 当check-strictly为true时，处理"全选"逻辑
    if (multiple.value) {
      const allValues = options.value.map((item: any) => item.value);
      const optionsLen = options.value.length;

      if (nowCheck === 'all') {
        // 检测到"全选"被选中
        if (nowChecked) {
          emit('update:modelValue', allValues.join(','));
          emit('change', { value: ['all', ...allValues] });
        } else {
          // "全选"被取消勾选
          emit('update:modelValue', '');
          emit('change', { value: [] });
        }
      } else {
        // 点击了普通选项
        const dataValues = checkedKeys.checked.filter((item: string) => item !== 'all');
        // 判断是否已全选
        if (dataValues.length === optionsLen) {
          // 已全选，需要添加'all'
          emit('update:modelValue', dataValues.join(','));
          emit('change', { value: ['all', ...dataValues] });
        } else {
          // 未全选
          emit('update:modelValue', dataValues.length > 0 ? dataValues.join(',') : '');
          emit('change', { value: dataValues });
        }
      }
    } else {
      // 非多选模式
      if (checkedKeys.checked.length > 0) {
        emit('update:modelValue', checkedKeys.checked.join(','));
      } else {
        emit('update:modelValue', '');
      }
      emit('change', { value: checkedKeys.checked });
    }
  };

  const handleSelect = (node: any) => {
    if (!multiple.value) {
      if (node) {
        emit('update:modelValue', node[0]);
      } else {
        emit('update:modelValue', '');
      }
      emit('change', { value: selectedKeys.value });
    }
  };

  onBeforeMount(() => {
    selectedKeys.value = value.value.checked;

    // console.log(selectedKeys.value,value.value,'selectedKeys');
  });
</script>
<style>
  .lr-table-filter {
    width: 200px;
    max-height: 280px;
    padding: 8px;
    overflow: auto;
    overflow-x: hidden;
  }
</style>
