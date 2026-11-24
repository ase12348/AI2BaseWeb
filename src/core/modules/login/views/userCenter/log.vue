<template>
  <div class="lr-block lr-user-center-log">
    <lr-c-schema-index :noPadding="true" ref="indexRef" class="lr-user-center-log-table" />
  </div>
</template>
<script lang="ts" setup>
  import { ref, h } from 'vue';
  import { Tag } from 'ant-design-vue';
  import { useIndex } from '/@/core/hooks/useIndex';
  import { api } from '@/core/modules/system/api/log';
  import dayjs from 'dayjs';
  import { t } from '@/core/locales/setupI18n';

  const rangePresets = [
    { label: t('最近一周'), value: [dayjs().add(-7, 'd'), dayjs()] },
    { label: t('最近一个月'), value: [dayjs().add(-30, 'd'), dayjs()] },
    { label: t('最近三个月'), value: [dayjs().add(-90, 'd'), dayjs()] },
  ];

  const indexRef = ref();

  useIndex(indexRef, [
    {
      id: 'mainTable',
      type: 'lr-table-panel',
      config: {
        columns: [
          { label: '时间', prop: 'f_OperateTime', width: 160, config: { dataType: 'dateTime' } },
          { label: '用户', prop: 'f_OperateAccount', width: 80, align: 'center' },
          { label: 'IP', prop: 'f_IPAddress', width: 100, isKeyword: true },
          { label: '功能', prop: 'f_Module', width: 160, isKeyword: true },
          { label: '类型', prop: 'f_OperateType', width: 64, align: 'center', isKeyword: true },
          {
            label: '结果',
            prop: 'f_ExecuteResult',
            width: 64,
            align: 'center',
            config: {
              formatter: ({ row }) => {
                return h(
                  Tag,
                  {
                    bordered: false,
                    color: row.f_ExecuteResult == 1 ? 'success' : 'warning',
                  },
                  () => (row.f_ExecuteResult == 1 ? '成功' : '失败'),
                );
              },
            },
          },
          { label: '描述', prop: 'f_ExecuteResultJson', minWidth: 150 },
        ],
        rowKey: 'f_Id',
        buttons: [],
        tableButtons: [],
        immediate: true,
        isPage: true,
        sidx: 'F_OperateTime DESC',
        searchInputList: [
          {
            id: 'categoryId',
            type: 'radio',
            config: {
              isQuickSearch: true,
              label: '',
              defaultValue: '1',
              optionType: 'button',
              options: [
                { label: t('登录'), value: '1' },
                { label: t('访问'), value: '2' },
                { label: t('操作'), value: '3' },
              ],
              width: 120,
            },
          },
          {
            id: 'operateTime',
            type: 'dateRange',
            config: {
              label: '',
              picker: 'date',
              format: 'YYYY-MM-DD',
              presets: rangePresets,
              isQuickSearch: true,
            },
          },
        ],
        loadData: async (params) => {
          params.startTime = params.operateTime ? params.operateTime[0] : null;
          params.endTime = params.operateTime ? params.operateTime[1] : null;
          let res = await api.getMyPage(params);
          return res;
        },
      },
    },
  ]);
</script>
<style lang="less"></style>
