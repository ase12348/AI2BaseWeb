<template>
  <lr-c-schema-index ref="indexRef" />
</template>
<script lang="ts" setup>
  import { useIndex } from '/@/core/hooks/useIndex';
  import { useAuth } from '/@/core/hooks/useAuth';
  import pageInfo from './page';
  import { api as logApi } from '../../api/log';
  import type { ColConfig } from '/#/page';
  import { ref, h } from 'vue';
  import { Tag } from 'ant-design-vue';

  import dayjs from 'dayjs';
  import { t } from '@/core/locales/setupI18n';

  const { getColumns } = useAuth(pageInfo);

  const rangePresets = [
    { label: t('最近一周'), value: [dayjs().add(-7, 'd'), dayjs()] },
    { label: t('最近一个月'), value: [dayjs().add(-30, 'd'), dayjs()] },
    { label: t('最近三个月'), value: [dayjs().add(-90, 'd'), dayjs()] },
  ];

  const columnsConfig: Record<string, ColConfig> = {
    f_ExecuteResult: {
      formatter: ({ row }) => {
        return h(
          Tag,
          {
            // bordered: false,
            color: row.f_ExecuteResult == 1 ? 'success' : 'red',
          },
          () => (row.f_ExecuteResult == 1 ? t('成功') : t('失败')),
        );
      },
    },
  };

  const indexRef = ref();
  useIndex(indexRef, [
    {
      id: 'mainTable',
      type: 'lr-table-panel',
      config: {
        columns: getColumns(columnsConfig),
        rowKey: 'f_LogId',
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
                { label: t('文件下载'), value: '5' },
                { label: t('文件预览'), value: '6' },
                { label: t('任务'), value: '10' },
                { label: t('异常'), value: '4' },
              ],
              immediate: true,
              width: 540,
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
              width: 200,
            },
          },
        ],
        isPage: true,
        immediate: true,
        loadData: async (param) => {
          if (param.operateTime) {
            const operateTimes = param.operateTime.split(',');
            param.startTime = operateTimes[0] + ' 00:00:00';
            param.endTime = operateTimes[1] + ' 23:59:59';
          } else {
            param.startTime = undefined;
            param.endTime = undefined;
          }

          param.sidx = 'F_OperateTime DESC';
          const res = await logApi.getPage(param);
          return res;
        },
      },
    },
  ]);
</script>
