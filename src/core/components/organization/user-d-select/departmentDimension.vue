<template>
  <lr-layout class="l-tab-page" style="background-color: var(--color-bg-layout)">
    <template #left>
      <lr-panel title="公司分类">
        <lr-tree
          :list="companyTree"
          :isTreeData="true"
          :defaultExpandAll="true"
          :click="handleNodeClick"
        />
      </lr-panel>
    </template>
    <lr-table-panel
      ref="tableRef"
      rowKey="f_DepartmentId"
      pidKey="f_ParentId"
      isTree
      isMultiSelect
      mode="client"
      :columns="columns"
      :checkStrictly="true"
      :immediate="true"
      :loadData="loadTableData"
      @select="handleSelect"
    />
  </lr-layout>
</template>
<script lang="ts" setup>
  import { ref, computed, PropType } from 'vue';
  import type { ColumnType } from '/#/page';
  import { useOrganization } from '/@/core/hooks/data/useOrganization';
  import { deepClone } from '@/core/utils/jcode';

  const { getCompanyList, getCompanyTree } = useOrganization();

  const emit = defineEmits(['change']);
  const props = defineProps({
    type: Number,
    departments: {
      type: Array as PropType<Record<string, any>[]>,
      default: () => [],
    },
  });

  const companyTree = computed(() => {
    return getCompanyTree(getCompanyList.value, '', []);
  });

  const tableRef = ref();
  let selectList = {};
  let list: Record<string, any>[] = [];
  let companyId = '';
  const columns: ColumnType[] = [
    { label: '名称', prop: 'f_FullName', minWidth: 150, isKeyword: true },
    { label: '公司', prop: 'f_CompanyId', minWidth: 150, config: { dataType: 'company' } },
    { label: '编码', prop: 'f_EnCode', width: 100 },
  ];

  const handleNodeClick = (node) => {
    companyId = node[0];
    tableRef.value.refreshData();
  };
  const loadTableData = () => {
    let res = deepClone(props.departments);
    if (companyId) {
      res = res.filter((t) => t.f_CompanyId == companyId);
    }
    list = res;
    return res;
  };
  const handleSelect = ({ selects }) => {
    const map = {};
    selects.forEach((t) => {
      map[t] = true;
    });

    const addVList = selects.filter((t) => !selectList[t]);
    const addList: Record<string, any>[] = [];
    list.forEach((t) => {
      if (addVList.indexOf(t.f_DepartmentId) > -1) {
        addList.push({
          f_UserId: t.f_DepartmentId,
          f_Type: props.type,
          f_Name: t.f_FullName,
          f_Category: 1,
        });
      }
    });
    selectList = map;
    emit('change', { values: selects, addList, type: props.type });
  };
  const handleDelete = (id) => {
    tableRef.value?.toggleRowSelection([id], false);
  };
  const setForm = (value) => {
    const map = {};
    value.forEach((t) => {
      map[t] = true;
    });
    selectList = map;

    tableRef.value?.toggleRowSelection(value, true);
    tableRef.value.refreshData();
  };
  const clearSelection = () => {
    tableRef.value?.clearSelection();
  };
  const resetForm = () => {
    clearSelection();
  };
  defineExpose({ handleDelete, setForm, clearSelection, resetForm });
</script>
