<template>
  <lr-table-panel
    v-model:value="tableValue"
    immediate
    :rowKey="rowKey"
    :pidKey="pidKey"
    ref="tableRef"
    mode="client"
    :columns="columns"
    :isMultiSelect="true"
    :loadData="loadTableData"
    :isTree="isTree"
    :checkStrictly="true"
    :defaultExpandAll="true"
    @select="handleSelect"
    style="background-color: var(--color-bg-layout)"
  />
</template>
<script lang="ts" setup>
  import { ref } from 'vue';

  const emit = defineEmits(['change']);
  const props = defineProps({
    columns: {
      type: Array,
      default: () => [],
    },
    rowKey: {
      type: String,
      default: 'f_ItemValue',
    },
    labelKey: {
      type: String,
      default: 'f_ItemName',
    },
    pidKey: {
      type: String,
    },
    isTree: {
      type: Boolean,
      default: false,
    },
    type: Number,
    loadData: Function,
  });
  const tableRef = ref();
  const tableValue = ref('');
  let selectList = {};
  let list = [];
  const loadTableData = async () => {
    if (props.loadData) {
      const res = await props.loadData();
      list = res;
      return res;
    }
    return [];
  };
  const handleSelect = ({ selects }) => {
    const map = {};
    selects.forEach((t) => {
      map[t] = true;
    });

    const addVList = selects.filter((t) => !selectList[t]);
    const addList: Record<string, any>[] = [];
    list.forEach((t) => {
      if (addVList.indexOf(t[props.rowKey]) > -1) {
        addList.push({
          f_UserId: t[props.rowKey],
          f_Type: props.type,
          f_Name: t[props.labelKey],
          f_Category: 1,
        });
      }
    });
    selectList = map;
    emit('change', { values: selects, addList, type: props.type });
  };
  const handleDelete = (id) => {
    console.log(id, 'handleDelete');
    tableRef.value?.toggleRowSelection([id], false);
  };
  const setForm = (value) => {
    tableValue.value = String(value);

    const map = {};
    value.forEach((t) => {
      map[t] = true;
    });
    selectList = map;
    tableRef.value?.toggleRowSelection(value, true);
    tableRef.value.refreshData();
  };
  const clearSelection = () => {
    console.log('clearSelection');
    tableRef.value?.clearSelection();
  };
  const resetForm = () => {
    clearSelection();
  };
  defineExpose({ handleDelete, setForm, clearSelection, resetForm });
</script>
