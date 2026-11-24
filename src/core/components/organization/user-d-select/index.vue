<template>
  <div class="lr-block lr-user-d-select-form">
    <lr-layout :right="400">
      <div class="lr-block">
        <a-tabs class="isFixedNotPadding" v-model:activeKey="activeName" @change="handleTabChange">
          <a-tab-pane key="ref1" :tab="$t('用户')">
            <user-dimension ref="ref1" @change="handleChange" />
          </a-tab-pane>
          <a-tab-pane key="ref12" :tab="$t('公司')">
            <options-dimension
              :columns="companyColumns"
              ref="ref12"
              rowKey="f_CompanyId"
              pidKey="f_ParentId"
              labelKey="f_FullName"
              :isTree="true"
              :loadData="() => getCompanyList"
              :type="12"
              @change="handleChange"
            />
          </a-tab-pane>
          <a-tab-pane key="ref2" :tab="$t('部门')"
            ><department-dimension
              ref="ref2"
              :type="2"
              :departments="departments"
              @change="handleChange"
          /></a-tab-pane>
          <a-tab-pane key="ref13" :tab="`${$t('部门')}(${$t('包含子部门')})`"
            ><department-dimension
              ref="ref13"
              :type="13"
              :departments="departments"
              @change="handleChange"
          /></a-tab-pane>
          <a-tab-pane key="ref4" :tab="$t('行政级别')"
            ><options-dimension
              ref="ref4"
              :columns="levelColumns"
              :loadData="
                () => {
                  return loadDataItem('LevelManage');
                }
              "
              :type="4"
              @change="handleChange"
          /></a-tab-pane>
          <a-tab-pane key="ref5" :tab="$t('行政职务')"
            ><options-dimension
              ref="ref5"
              :columns="jobColumns"
              :loadData="
                () => {
                  return loadDataItem('JobManage');
                }
              "
              :type="5"
              @change="handleChange"
          /></a-tab-pane>
          <a-tab-pane key="ref6" :tab="$t('技术职务')"
            ><options-dimension
              ref="ref6"
              :columns="roleColumns"
              :loadData="
                () => {
                  return loadDataItem('RoleManage');
                }
              "
              :type="6"
              @change="handleChange"
          /></a-tab-pane>
          <a-tab-pane key="ref7" :tab="$t('职称等级')"
            ><options-dimension
              ref="ref7"
              :columns="titleColumns"
              :loadData="
                () => {
                  return loadDataItem('TitleManage');
                }
              "
              :type="7"
              @change="handleChange"
          /></a-tab-pane>
          <a-tab-pane key="ref8" :tab="$t('管理职务')"
            ><options-dimension
              ref="ref8"
              :columns="postColumns"
              :loadData="
                () => {
                  return loadDataItem('PostManage');
                }
              "
              :type="8"
              @change="handleChange"
          /></a-tab-pane>
          <a-tab-pane key="ref10" :tab="$t('限定部门')"
            ><department-dimension
              ref="ref10"
              :type="10"
              :departments="departments"
              @change="handleChange"
          /></a-tab-pane>
          <a-tab-pane key="ref11" :tab="$t('排除部门')"
            ><department-dimension
              ref="ref11"
              :type="11"
              :departments="departments"
              @change="handleChange"
          /></a-tab-pane>
        </a-tabs>
      </div>
      <template #right>
        <div class="lr-block lr-user-d-select-right">
          <div class="panel-title">{{ $t('已选择') }}</div>
          <lr-table-panel
            style="padding-top: 40px"
            immediate
            ref="tableRef"
            mode="client"
            :notResetBtn="true"
            :columns="columns"
            :loadData="tableSearchLoadData"
            :buttons="buttons"
            :tableButtons="tableButtons"
          />
        </div>
      </template>
    </lr-layout>
  </div>
</template>
<script lang="ts" setup>
  import { ref, h, computed, nextTick } from 'vue';
  import { useDataItem } from '/@/core/hooks/data/useDataItem';
  import userDimension from './userDimension.vue';
  import departmentDimension from './departmentDimension.vue';
  import optionsDimension from './optionsDimension.vue';
  import { useOrganization } from '/@/core/hooks/data/useOrganization';
  import { api as departmentApi } from '@/core/modules/organization/api/department';

  const { loadCompanyList, getCompanyList } = useOrganization();
  const { getDataItem, loadDataItemList } = useDataItem();

  const activeName = ref('ref1');
  const ref1 = ref();
  const ref2 = ref();
  const ref3 = ref();
  const ref4 = ref();
  const ref5 = ref();
  const ref6 = ref();
  const ref7 = ref();
  const ref8 = ref();
  const ref9 = ref();
  const ref10 = ref();
  const ref11 = ref();
  const ref12 = ref();
  const ref13 = ref();
  const tableRef = ref();
  const refsList = computed(() => {
    return {
      ref1,
      ref2,
      ref3,
      ref4,
      ref5,
      ref6,
      ref7,
      ref8,
      ref9,
      ref10,
      ref11,
      ref12,
      ref13,
    };
  });
  const levelColumns = [{ label: '行政级别', prop: 'f_ItemName', minWidth: 150, isKeyword: true }];
  const jobColumns = [{ label: '行政职务', prop: 'f_ItemName', minWidth: 150, isKeyword: true }];
  const roleColumns = [{ label: '技术职务', prop: 'f_ItemName', minWidth: 150, isKeyword: true }];
  const titleColumns = [{ label: '职称等级', prop: 'f_ItemName', minWidth: 150, isKeyword: true }];
  const postColumns = [{ label: '管理职务', prop: 'f_ItemName', minWidth: 150, isKeyword: true }];
  const companyColumns = [
    { label: '名称', prop: 'f_FullName', minWidth: 260, isKeyword: true },
    { label: '编码', prop: 'f_EnCode', minWidth: 150, isKeyword: true },
  ];
  const loadDataItem = async (code) => {
    await loadDataItemList(code, false);
    return getDataItem.value[code] || [];
  };

  const departments = ref<Record<string, any>[]>([]);
  const columns = [
    {
      label: '类型',
      prop: 'f_Type',
      width: 80,
      isKeyword: true,
      config: {
        formatter: ({ row }) => {
          const options = {
            value1: '用户',
            value2: '部门',
            value3: '密级',
            value4: '行政级别',
            value5: '行政职务',
            value6: '技术职务',
            value7: '职称等级',
            value8: '管理职务',
            value9: '集成角色',
            value10: '限定部门',
            value11: '排除部门',
            value12: '公司',
            value13: '部门(包含子部门)',
          };
          return h('div', {}, options[`value${row.f_Type}`]);
        },
      },
    },
    { label: '已选择项', prop: 'f_Name', minWidth: 110, isKeyword: true },
  ];
  const buttons = [
    {
      prop: 'clear',
      label: '清除',
      danger: true,
      classify: 'panel',
      icon: 'ant-design:delete-outlined',
      click: () => {
        selectArr.value = [];
        tableRef.value.refreshData();
        for (let i = 1; i < 14; i++) {
          refsList.value[`ref${i}`].value?.clearSelection();
        }
      },
    },
  ];
  const tableButtons = [
    {
      prop: 'delete',
      label: '删除',
      danger: true,
      click: async ({ f_Type, f_UserId }: Record<string, any>) => {
        selectArr.value = selectArr.value.filter(
          (t) => !(t.f_Type == f_Type && t.f_UserId == f_UserId),
        );
        tableRef.value.refreshData();
        refsList.value[`ref${f_Type}`].value?.handleDelete(f_UserId);
      },
    },
  ];

  const selectArr = ref<Record<string, any>>([]);
  const handleChange = ({ values, addList, type }: Record<string, any>) => {
    let list = selectArr.value.filter(
      (t) => t.f_Type != type || (t.f_Type == type && values.indexOf(t.f_UserId) > -1),
    );
    list.push(...addList);
    selectArr.value = list.sort((a, b) => {
      return a.f_Type - b.f_Type; //a-b为升序
    });
    tableRef.value.refreshData();
  };
  const tableSearchLoadData = () => {
    return selectArr.value;
  };
  const handleTabChange = (key) => {
    let index = key.replace(/ref/g, '');
    setTimeout(() => {
      const _list = selectArr.value.filter((t) => t.f_Type == Number(index)).map((t) => t.f_UserId);
      refsList.value[key]?.value?.setForm(_list);
    }, 50);
  };
  const setForm = async (list) => {
    departments.value = await departmentApi.getList('all');
    await loadCompanyList(false);

    selectArr.value = list.sort((a, b) => {
      return a.f_Type - b.f_Type; //a-b为升序
    });
    tableRef.value.refreshData();
    nextTick(() => {
      for (let i = 1; i < 14; i++) {
        const _list = list.filter((t) => t.f_Type == i).map((t) => t.f_UserId);
        refsList.value[`ref${i}`].value?.setForm(_list);
      }
    });
  };

  const getForm = () => {
    return selectArr.value;
  };
  const resetForm = () => {
    activeName.value = 'ref1';
    for (let i = 1; i < 14; i++) {
      refsList.value[`ref${i}`].value?.resetForm();
    }
  };

  // 暴露方法
  defineExpose({ setForm, getForm, resetForm });
</script>
<style lang="less">
  .lr-user-d-select-form {
    background-color: var(--color-bg-container);

    .lr-user-d-select-right {
      border-left: 1px solid var(--color-border);

      .panel-title {
        display: flex;
        position: absolute;
        top: 0;
        left: 0;
        align-items: center;
        width: 100%;
        height: 36px;
        padding-left: 8px;
        border-bottom: 1px solid var(--color-border);
        color: var(--color-text);
        font-size: 16px;
      }
    }
  }
</style>
