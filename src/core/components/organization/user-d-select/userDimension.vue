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
      immediate
      ref="tableRef"
      :columns="columns"
      rowKey="f_UserId"
      :isPage="true"
      :isMultiSelect="true"
      :loadData="loadTableData"
      :searchInputList="searchInputList"
      @select="handleSelect"
      style="background-color: var(--color-bg-layout)"
    />
  </lr-layout>
</template>
<script lang="ts" setup>
  import type { ColumnType } from '/#/page';
  import { ref, h, computed } from 'vue';
  import { Tag } from 'ant-design-vue';
  import { api as userApi } from '@/core/modules/organization/api/user';
  import { useOrganization } from '/@/core/hooks/data/useOrganization';

  const emit = defineEmits(['change']);
  const tableRef = ref();
  let selectList = {};
  let userList: Record<string, any> = [];

  const { getCompanyList, getCompanyTree } = useOrganization();

  const companyTree = computed(() => {
    return getCompanyTree(getCompanyList.value, '', []);
  });

  const companyId = ref('');
  const handleNodeClick = (node) => {
    companyId.value = node[0];
    tableRef.value.refreshData();
  };

  const columns: ColumnType[] = [
    { label: '姓名', prop: 'f_RealName', minWidth: 110, isKeyword: true },
    { label: '账号', prop: 'f_Account', width: 110, isKeyword: true },
    {
      label: '公司',
      prop: 'f_CompanyId',
      width: 200,
      config: {
        dataType: 'company',
      },
    },
    {
      label: '部门',
      prop: 'f_DepartmentId',
      width: 200,
      config: {
        dataType: 'department',
      },
    },
    {
      label: '性别',
      prop: 'f_Gender',
      width: 80,
      align: 'center',
      config: {
        formatter: ({ row }) => {
          return h(
            Tag,
            {
              bordered: false,
              color: row.f_Gender == 1 ? 'success' : 'error',
            },
            () => (row.f_Gender == 1 ? '男' : '女'),
          );
        },
      },
    },
  ];

  const searchInputList = computed(() => {
    let list = [
      {
        id: 'departmentDeepNum',
        type: 'lr-input-department',
        config: {
          isQuickSearch: true,
          label: '',
          companyRequired: true,
          companyId: companyId.value,
          width: 200,
          valueKey: 'f_DeepNum',
        },
      },
    ];
    return list;
  });

  const loadTableData = async (param) => {
    param.companyId = companyId.value;
    const res = await userApi.getPages(param);
    userList = res.rows;
    return res;
  };
  const handleSelect = ({ selects }) => {
    const map = {};
    selects.forEach((t) => {
      map[t] = true;
    });

    const addVList = selects.filter((t) => !selectList[t]);
    const addList: Record<string, any>[] = [];
    userList.forEach((t) => {
      if (addVList.indexOf(t.f_UserId) > -1) {
        addList.push({
          f_UserId: t.f_UserId,
          f_Type: 1,
          f_Name: t.f_RealName,
          f_Category: 1,
        });
      }
    });
    selectList = map;
    emit('change', { values: selects, addList, type: 1 });
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
