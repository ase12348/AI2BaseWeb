<template>
  <div class="lr-c-schema-index" :style="{ padding: noPadding ? '0px' : '4px' }">
    <template v-if="schemaList.length > 0 && ready">
      <lr-c-schema-index-item
        :style="noPadding ? { padding: '0px' } : {}"
        v-for="item of schemaList"
        :key="item.id + ckey"
        v-bind="item"
      />
    </template>
    <lr-dynamic-layer ref="layerRef" />
    <lr-modal
      v-model:visible="importExcelVisible"
      :title="$t(importExcelTitle)"
      :width="600"
      :height="400"
      @ok="handleDownImportTemplate"
      :btn-text="$t('下载导出模版')"
    >
      <div class="lr-block" style="padding-top: 160px">
        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 160px; padding: 8px">
          <a-upload-dragger
            :show-upload-list="false"
            accept=".xls,.xlsx"
            multiple
            :custom-request="handleExcelUploadRequest"
          >
            <div
              class="lr-block"
              style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
              "
            >
              <p class="ant-upload-drag-icon">
                <lr-icon icon="ant-design:upload-outlined" :size="24" />
              </p>
              <p class="ant-upload-text">{{ $t('将文件拖到此处，或点击上传') }}</p>
            </div>
          </a-upload-dragger>
        </div>
        <div class="lr-block" style="padding-bottom: 8px; overflow: auto; overflow-x: hidden">
          <div class="import-file-item" v-for="(item, index) in importExcelFileList" :key="index">
            <lr-icon icon="ant-design:file-text-outlined" />
            {{ item.name }}
            <div class="import-file-item-btn" v-if="item.response">
              <span class="snum">{{ item.response.success }}</span
              >/<span class="fnum">{{ item.response.fail }}</span>
              <span
                v-if="item.response.fail > 0"
                @click="handleErrorClick(item.response.data)"
                class="fnum-btn"
                >{{ $t('查看错误') }}</span
              >
            </div>
            <div
              style="
                position: absolute;
                z-index: 0;
                bottom: -6px;
                left: 0;
                width: 100%;
                padding: 0 8px;
              "
            >
              <a-progress
                style="margin: 0 !important"
                v-if="item.status === 'uploading'"
                :size="4"
                :percent="item.percent"
                :show-info="false"
              />
            </div>
          </div>
        </div>
      </div>
    </lr-modal>
    <lr-modal
      :title="$t('错误信息')"
      v-model:visible="importErrorVisible"
      :width="1000"
      :height="600"
      :has-btns="false"
    >
      <lr-table :columns="importErrorColumns" :data-source="importErrorData" />
    </lr-modal>
  </div>
</template>

<script lang="ts" setup>
  import type { PageSchemaConfig, FormLayerParamType } from './interface';
  import type { SchemaRuntimeConfig } from '../cSchemaForm/interface';

  import { PropType, reactive, ref, provide, computed } from 'vue';
  import { createNamespace } from '../utils/components';
  import { buildShortUUID, deepMerge, clearData, fullScreenLoading } from '../utils/method';
  import { getFileIcon } from '../utils/file';
  import { formatToDate } from '../utils/date';

  import { useFlow } from './flow';
  import { useFramework } from '../utils/useFramework';

  defineOptions({ name: createNamespace('cSchemaIndex').name });

  const props = defineProps({
    /**
     * @zh 模版
     */
    schemas: Array as PropType<PageSchemaConfig[]>,
    /**
     * @zh 是否有边距
     */
    noPadding: {
      type: Boolean,
      deflaut: false,
    },
    /**
     * @zh 事件编排执行动作
     */
    actions: {
      type: Object as PropType<Record<string, any>>,
      default: () => ({}),
    },
  });

  defineEmits({
    /**
     * @zh 点击事件
     */
    click: (id: string) => true,
  });

  const { excelImportDownTemplateByConfig, excelImportUploadByConfig, useFile } = useFramework({});
  const ready = ref(false);
  const ckey = ref(1);
  const myParamData = ref<Record<string, any>>({});

  const schemaList = reactive<SchemaRuntimeConfig[]>([]);
  const components = reactive<Record<string, PageSchemaConfig>>({});

  // 设置方法
  const pInit = (schemas: PageSchemaConfig[], paramData?: any) => {
    ready.value = false;
    ckey.value++;
    myParamData.value = paramData || {};
    schemaList.splice(0, schemaList.length);
    clearData(components);
    forEachChild(schemas, schemaList);
    ready.value = true;
  };

  // 便利组件设置id值和默认值
  const forEachChild = (schemas: PageSchemaConfig[], res: SchemaRuntimeConfig[]) => {
    schemas.forEach((schemaItem) => {
      schemaItem.id = schemaItem.id || buildShortUUID('c');
      const runtimeConifg = { id: schemaItem.id, slot: schemaItem.slot, children: [] };
      const { children } = schemaItem;
      delete schemaItem.children;

      components[schemaItem.id] = schemaItem;
      if (
        schemaItem?.config?.defaultValue !== undefined &&
        myParamData.value[schemaItem.id] === undefined
      ) {
        myParamData.value[schemaItem.id] = schemaItem.config.defaultValue;
      }

      res.push(runtimeConifg);

      if (children && children.length > 0) {
        forEachChild(children, runtimeConifg.children);
      }
    });
  };

  const pGetComponent = (id: string) => components[id];

  const pGetRef = (id: string) => components[id]?.$ref;

  const pSetProps = (id: string, config: any) => {
    const component = pGetComponent(id);
    if (component) {
      component.config = deepMerge(component.config || {}, config);
    }
  };

  // 表单部分
  const layerRef = ref();
  const pOpenForm = (data: FormLayerParamType) => {
    layerRef.value.open(data);
  };

  if (props.schemas) {
    pInit(props.schemas);
  }

  // excel导入
  const importExcelTitle = ref('导入');
  const importExcelVisible = ref(false);

  const importErrorVisible = ref(false);
  const importErrorData = ref<any[]>([]);

  let importConfig: Record<string, any> = {};
  let importCallback: any = null;

  const pOpenImport = async (title: string, config: Record<string, any>, callback?: any) => {
    importExcelTitle.value = title;
    importConfig = config;
    importCallback = callback;
    importExcelVisible.value = true;
  };

  const handleDownImportTemplate = () => {
    excelImportDownTemplateByConfig(importConfig);
  };

  const handleErrorClick = (data: any[]) => {
    importErrorData.value = data;
    importErrorVisible.value = true;
  };

  const importErrorColumns = computed(() => {
    const res: Record<string, any>[] = [];
    if (importErrorData.value?.length > 0) {
      Object.keys(importErrorData.value[0]).forEach((key) => {
        if (key !== '_X_ROW_KEY') {
          if (key === '导入错误') {
            res.push({ label: key, prop: key, minWidth: 300 });
          } else {
            res.push({ label: key, prop: key, minWidth: 160 });
          }
        }
      });
    }

    return res;
  });
  // excel导入文件上传
  const { fileChunkedUpload } = useFile();
  const importExcelFileList = ref<any[]>([]);
  const handleExcelUploadRequest = (data: any) => {
    setFile(data.file);
    chunkedUpload(data.file);
  };

  const setFile = (file: any) => {
    file.status = 'uploading';
    file.uploadSize = 0;
    file.icon = getFileIcon(file.name, file.type);

    file.id = file.uid;
    file.date = formatToDate();
  };

  const chunkedUpload = (file: any) => {
    importExcelFileList.value.push(file);

    if (file.status === 'unUpload') {
      return;
    }

    if (fileChunkedUpload) {
      fileChunkedUpload(file, {
        onStart: () => {},
        onProgress: onUpLoadProgress,
        onSuccess: onUpLoadSuccess,
        onError,
        uploadCallback: (data: any) => excelImportUploadByConfig(importConfig, data),
      });
    } else {
      file.response = {
        success: 1,
        fail: 1,
        data: [],
      };
      onUpLoadSuccess(file);
    }
  };

  const updateFilelist = () => {
    importExcelFileList.value = [...importExcelFileList.value];
  };
  const onUpLoadProgress = (file: any, fileSize: number, percent: number) => {
    file.percent = percent;
    file.uploadSize = fileSize;
    updateFilelist();
  };

  const onUpLoadSuccess = (file: any) => {
    file.status = 'done';
    updateFilelist();
    importCallback && importCallback();
  };

  const onError = (file: any, error: any) => {
    console.error(error, 'jcode 极简搭:文件上传错误！');
    file.status = 'error';
    updateFilelist();
  };

  /* watch(
      () => props.schemas,
      (val: any) => {
        console.log(val, 'wo shi yi ge test')
        pInit(val || [])
      }
    ) */

  const notRunActions: Record<string, any> = {};
  // 编排处理
  const runFlow = async (data: Record<string, any>[], inputParams: Record<string, any>) => {
    const { run } = useFlow({
      data,
      actions: props.actions,
      // @ts-ignore
      utils: {
        // @ts-ignore
        getRef: (id: string) => components[id]?.$ref2,
        openForm: pOpenForm,
        openImport: pOpenImport,
        showLoading: fullScreenLoading,
      },
      inputParams,
      notRunActions,
    });
    await run();
  };

  const runFlowByNotRunActions = async (componentId: string) => {
    const actionData = notRunActions[componentId];
    if (actionData) {
      delete notRunActions[componentId];
      await runFlow(actionData.data, actionData.inputParams);
    }
  };

  // 注入方法
  provide('jcode_index_provide', {
    components,
    myParamData,
    runFlow,
    runFlowByNotRunActions,
  });

  /**
   * @zh 初始化页面
   */
  function setInit(schemas: PageSchemaConfig[], paramData?: any) {
    pInit(schemas, paramData);
  }
  /**
   * @zh 获取组件
   */
  function getComponent(id: string) {
    return pGetComponent(id);
  }
  /**
   * @zh 获取组件
   */
  function getRef(id: string) {
    return pGetRef(id);
  }
  /**
   * @zh 设置表单组件属性
   */
  function setProps(id: string, config: any) {
    pSetProps(id, config);
  }
  /**
   * @zh 打开表单
   */
  function openForm(data: FormLayerParamType) {
    pOpenForm(data);
  }
  /**
   * @zh 打开excel导入
   */
  function openImport(title: string, config: Record<string, any>) {
    pOpenImport(title, config);
  }

  defineExpose({
    setInit,
    getComponent,
    getRef,
    setProps,
    openForm,
    openImport,
  });
</script>

<style lang="less">
  @import './cSchemaIndex';
</style>
