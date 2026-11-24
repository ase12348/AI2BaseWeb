<template>
  <lr-c-schema-index ref="indexRef" />
</template>
<script lang="ts" setup>
  import type { ButtonType } from '/#/page';
  import { ref } from 'vue';
  import { useIndex } from '/@/core/hooks/useIndex';
  import { useAuth } from '/@/core/hooks/useAuth';
  import { useGlobSetting } from '/@/core/hooks/setting';
  import { useUserStoreWithOut } from '/@/core/store/organization/user';
  import { useMessage } from '@/core/hooks/useMessage';
  import { api as imgApi } from '../../api/img';
  import pageInfo from './page';
  import { t } from '@/core/locales/setupI18n';

  const { createConfirm, success } = useMessage();
  const { apiUrl } = useGlobSetting();
  const userStore = useUserStoreWithOut();

  let type = '';
  // 按钮点击事件
  const buttonClick = {
    set: (row) => {
      openForm({
        title: `${t('图片')}-${row.f_FileName}`,
        name: 'system_img_form',
        width: 600,
        height: 440,
        param: {
          ...row,
          src: `${apiUrl}/system/annexesfile/${row.f_Id}?token=${userStore.getToken}`,
        },
        afterOk: () => {
          refreshTable();
        },
      });
    },
    delete: (row) => {
      createConfirm({
        title: t('提示'),
        iconType: 'warning',
        content: `${t('您确定删除')}【${row.f_FileName}】${t('吗')}`,
        onOk: async () => {
          const res = await imgApi.remove(row.f_Id);
          if (res) {
            success(t('删除成功'));
            refreshTable();
          }
        },
      });
    },
    dataItem: () => {
      openForm({
        title: t('分类管理'),
        name: 'data_dataitem_index',
        height: 600,
        width: 1000,
        hasBtns: false,
        config: { code: 'ImgType' },
        afterClose: async () => {
          const tableRef = getRef('tree');
          await tableRef.refreshData();
        },
      });
    },
  };

  // 按钮配置
  const buttonConfig: Record<string, ButtonType> = {
    add: {
      action: 'upload',
      uploadAccept: 'image/*',
      uploadCallback: (data) => {
        return imgApi.upload(type || 'jcode_img', data);
      },
      uploadSuccess: () => {
        refreshTable();
      },
    },
    addpublic: {
      action: 'upload',
      uploadAccept: 'image/*',
      uploadCallback: (data) => {
        data.isPublic = 1;
        return imgApi.upload(type || 'jcode_img', data);
      },
      uploadSuccess: () => {
        refreshTable();
      },
    },
  };

  const { getButtons } = useAuth(pageInfo, { buttonClick, buttonConfig });
  const refreshTable = async () => {
    const tableRef = getRef('mainTable');
    await tableRef.refreshData();
  };
  const indexRef = ref();
  const { openForm, getRef } = useIndex(indexRef, [
    {
      type: 'lr-layout',
      children: [
        {
          type: 'lr-panel',
          slot: 'left',
          config: {
            title: '图片分类',
            toolBtns: getButtons('tool'),
          },
          children: [
            {
              id: 'tree',
              type: 'lr-tree',

              config: {
                dataType: 'dataItem',
                dataCode: 'ImgType',

                click: async (node) => {
                  type = node[0];
                  refreshTable();
                },
              },
            },
          ],
        },
        {
          id: 'mainTable',
          type: 'lr-table-panel',
          config: {
            labelKey: 'f_FileName',
            isPage: true,
            buttons: getButtons('panel'),
            tableButtons: getButtons(),
            immediate: true,
            model: 'card',
            loadData: async (param) => {
              param.sidx = 'f_CreateDate DESC';
              param.f_FileType = type;
              param.f_FileName = param.keyword;
              const res = await imgApi.getPage(param);
              return res;
            },
            loadSrc: (row) => {
              return `${apiUrl}/system/annexesfile/${row.f_Id}?token=${userStore.getToken}`;
            },
          },
        },
      ],
    },
  ]);
</script>
