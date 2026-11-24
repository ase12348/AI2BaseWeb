<template>
  <div class="jcode-input-img">
    <div class="jcode-input-img-item lr-svg-bg" :key="index" v-for="(url, index) in urlList">
      <div class="jcode-input-img-iteminner">
        <a-image :preview="{ visible: false }" :src="url" @click="handlePreview(index)" />
      </div>

      <lr-button
        class="lr-input-cards-delete"
        size="small"
        shape="circle"
        danger
        @click="handleDelete(index)"
      >
        <template #icon>
          <lr-icon icon="ant-design:close-outlined" />
        </template>
      </lr-button>
    </div>
    <div @click="handleClick" class="jcode-input-img-btn">
      <lr-icon icon="ant-design:plus-outlined" />
      <div style="margin-top: 8px">{{ $t('点击选择') }}</div>
    </div>

    <a-form-item-rest>
      <div style="display: none">
        <a-image-preview-group
          :preview="{
            visible: previewVisible,
            current: currentIndex,
            onVisibleChange: (vis: boolean) => (previewVisible = vis),
          }"
        >
          <a-image v-for="(url, index) in urlList" :key="index" :src="url" />
        </a-image-preview-group>
      </div>
      <lr-layer
        ref="layerRef"
        :width="width"
        :height="height"
        btn-text="确认"
        @ok="handleLayerOk"
        @closed="handleClosed"
      >
        <lr-c-schema-index :schemas="indexSchemas" ref="indexRef" />
      </lr-layer>
    </a-form-item-rest>
  </div>
</template>
<script lang="ts" setup>
  import { ref, computed } from 'vue';
  import { useGlobSetting } from '/@/core/hooks/setting';
  import { useUserStoreWithOut } from '/@/core/store/organization/user';
  import { useMessage } from '@/core/hooks/useMessage';
  import { useDataItem } from '@/core/hooks/data/useDataItem';
  import { api as imgApi } from '@/core/modules/system/api/img';
  import { t } from '@/core/locales/setupI18n';

  const { createConfirm, success } = useMessage();
  const { apiUrl } = useGlobSetting();
  const userStore = useUserStoreWithOut();
  const { loadDataItemList, getDataItem } = useDataItem();

  const props = defineProps({
    /**
     * 输入值
     */
    modelValue: {
      type: String,
      default: undefined,
    },
    /**
     * @zh 弹窗宽度
     */
    width: {
      type: Number as PropType<number>,
      default: 1100,
    },
    /**
     * @zh 弹窗高度
     */
    height: {
      type: Number as PropType<number>,
      default: 600,
    },
    /**
     * @zh 是否多选
     * @defaultValue false
     */
    isMultiSelect: Boolean,
  });

  const emit = defineEmits(['update:modelValue', 'change']);

  const valueList = computed({
    set(val) {
      emit('update:modelValue', String(val));
    },
    get() {
      if (!props.modelValue) {
        return [] as string[];
      }
      return props.modelValue.split(',');
    },
  });
  const urlList = computed(() =>
    //@ts-ignore
    valueList.value.map((t) => `${apiUrl}/system/annexesfile/${t}?token=${userStore.getToken}`),
  );

  // 弹窗
  const indexRef = ref();
  const layerRef = ref();
  const getRef = (id: string) => indexRef.value?.getRef(id);
  let type = '';

  const refreshTable = async () => {
    const tableRef = getRef('mainTable');
    await tableRef.refreshData();
  };
  const indexSchemas = computed(() => [
    {
      type: 'lr-layout',
      children: [
        {
          type: 'lr-panel',
          slot: 'left',
          config: {
            title: '图片分类',
          },
          children: [
            {
              id: 'tree',
              type: 'lr-tree',

              config: {
                valueKey: 'f_ItemValue',
                labelKey: 'f_ItemName',
                pidKey: 'f_ParentId',
                idKey: 'f_ItemValue',

                loadData: async () => {
                  await loadDataItemList('ImgType', false);
                  let data = [
                    {
                      f_Id: 'jcode_img',
                      f_ParentId: '0',
                      f_ItemValue: '',
                      f_ItemName: t('全部图片'),
                      f_EnabledMark: 1,
                    },
                  ];
                  data.push(...(getDataItem.value['ImgType'] || []));
                  return data;
                },

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
            buttons: [
              {
                prop: 'add',
                label: '添加私有图片',
                classify: 'panel',
                action: 'upload',
                uploadAccept: 'image/*',
                uploadCallback: (data) => {
                  return imgApi.upload(type || 'jcode_img', data);
                },
                uploadSuccess: () => {
                  refreshTable();
                },
              },
              {
                prop: 'addpublic',
                label: '添加公有图片',
                type: 'primary',
                classify: 'panel',
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
            ],
            tableButtons: [
              {
                prop: 'delete',
                label: '删除',
                icon: 'delete-outlined',
                danger: true,
                click: (row) => {
                  createConfirm({
                    title: t('提示'),
                    iconType: 'warning',
                    content: `${t('您确定删除')}【${row.f_FileName}】${t('吗')}`,
                    onOk: async () => {
                      const res = await imgApi.remove(row.f_Id);
                      if (res) {
                        success('删除成功');
                        refreshTable();
                      }
                    },
                  });
                },
              },
            ],
            isRadio: !props.isMultiSelect,
            isMultiSelect: props.isMultiSelect,
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

  const handleLayerOk = async () => {
    const rows = await getRef('mainTable').getSelections();
    if (props.isMultiSelect) {
      const values: any[] = [];
      rows.forEach((item: any) => {
        values.push(item.f_Id);
      });
      valueList.value = values;
      emit('change', { value: values.join(',') || '', data: rows });
    } else if (rows.length > 0) {
      const value = rows[0].f_Id;
      valueList.value = value;
      emit('change', { value, data: rows[0] });
    } else {
      valueList.value = [];
      emit('change', { value: undefined, data: undefined });
    }
    // console.log(rows)

    layerRef.value.close();
  };

  const handleClosed = () => {
    getRef('mainTable').clearSelection();
  };
  //

  const previewVisible = ref(false);
  const currentIndex = ref(0);
  const handlePreview = (index: number) => {
    currentIndex.value = index;
    previewVisible.value = true;
  };

  const handleClick = () => {
    layerRef.value.open(t('选择图片'));
  };
  const handleDelete = (index: number) => {
    // @ts-ignore
    const list = valueList.value.filter((t, i) => i !== index);
    valueList.value = list;
    if (list.length == 0) {
      emit('change', { value: undefined, data: undefined });
    } else {
      emit('change', { value: String(list) });
    }
  };
</script>
<style lang="less" scoped>
  .jcode-input-img {
    display: flex;
    flex-wrap: wrap;
    align-items: center;

    &-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 80px;
      height: 80px;
      border: 1px dashed var(--color-border);
      border-radius: 8px;
      background-color: var(--color-fill-quaternary);
      color: var(--color-text);
      font-size: 12px;
      cursor: pointer;

      &:hover {
        border-color: var(--color-primary);
      }
    }

    &-item {
      display: flex;
      position: relative;
      align-items: center;
      justify-content: center;
      width: 80px;
      max-width: 100%;
      height: 80px;
      max-height: 100%;
      margin-right: 8px;
      transition: all 0.2s ease-in-out;
      border: 1px solid var(--color-border);
      border-radius: 8px;
      opacity: 1;
    }

    &-iteminner {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      overflow: hidden;
      border-radius: 8px;
    }
  }
</style>
