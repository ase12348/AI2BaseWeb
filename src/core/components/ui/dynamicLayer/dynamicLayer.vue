<template>
  <lr-layer
    ref="layerRef"
    :width="layerWidth"
    :height="layerHeight"
    :before-close="beforeClose"
    :validate-steps="validateSteps"
    :is-step="isStep"
    :steps="layerSteps"
    :has-btns="layerHasBtns"
    :buttons="layerButtons"
    :btn-text="layerBtnText"
    :destroy-on-close="layerdestroyOnClose"
    :has-save-btn="layerhasSaveBtn"
    :has-close-btn="layerhasCloseBtn"
    :has-header="layerhasHeader"
    :hidden="layerHidden"
    @ok="handleOk"
    @closed="handleClosed"
    @cancel="handleCancel"
  >
    <component ref="componentRef" :is="componentName" v-bind="componentConfig" />
  </lr-layer>
</template>

<script lang="ts" setup>
  import type { FormLayerParamType } from '../cSchemaIndex/interface';

  import { ref, nextTick, provide, inject } from 'vue';
  import { createNamespace } from '../utils/components';
  import { fullScreenLoading } from '../utils/method';

  defineOptions({ name: createNamespace('dynamicLayer').name });

  defineProps({});

  const layerRef = ref();
  const layerWidth = ref(600);
  const layerHeight = ref(400);
  const layerHasBtns = ref(true);
  const layerhasSaveBtn = ref(true);
  const layerhasCloseBtn = ref(true);
  const layerhasHeader = ref(true);

  const layerBtnText = ref('');
  const layerButtons = ref<Record<string, any>[]>([]);
  const layerdestroyOnClose = ref(true);
  const layerHidden = ref(false);
  const componentRef = ref();
  const componentName = ref();
  const componentConfig = ref<Record<string, any>>();

  const { getPageName } = inject('jcode_auth_page_provide', {
    getPageName: () => '',
  });

  const getJcodeAuthName = () => {
    const pageName = getPageName();
    if (pageName) {
      return pageName;
    }

    if (typeof componentName.value === 'string') {
      return componentName.value;
    }
    return '';
  };

  const isStep = ref(false);
  const layerSteps = ref<string[]>([]);
  const validateSteps = async (stepActive: number) => {
    if (componentRef.value?.validateSteps) {
      fullScreenLoading(true);
      const res = componentRef.value.validateSteps(stepActive);
      fullScreenLoading(false);
      return res;
    }
    return true;
  };

  const beforeClose = () => {
    if (componentRef.value?.beforeClose) {
      return componentRef.value.beforeClose();
    }
    return true;
  };

  let afterOk: any;
  let afterClose: any;
  let afterCancel: any;
  let loadComponentNum = 0;
  const loadComponent = async (param: Record<string, any>) => {
    if (componentRef.value) {
      loadComponentNum = 0;
      if (componentRef.value.getConfig) {
        const config = componentRef.value.getConfig();
        layerButtons.value = config.buttons || [];
        isStep.value = config.isStep;
        layerSteps.value = config.steps || [];
      } else {
        layerButtons.value = [];
        isStep.value = false;
        layerSteps.value = [];
      }

      if (componentRef.value.open) {
        try {
          const { buttons } =
            (await componentRef.value.open(param, layerRef.value, (param?: any) => {
              afterOk && afterOk(param);
            })) || {};

          if (buttons && buttons.length > 0) {
            const myButtons = [];
            myButtons.push(...layerButtons.value);
            myButtons.push(...buttons);
            layerButtons.value = myButtons;
          }
        } catch (e) {
          layerRef.value.close();
          console.error(e);
        }
      }

      layerRef.value.hideLoading();
    } else {
      if (loadComponentNum > 600) {
        console.warn('表单组件加载超时');
        layerRef.value.hideLoading();
        return;
      }
      loadComponentNum++;
      setTimeout(async () => {
        await loadComponent(param);
      }, 100);
    }
  };

  const pOpen = (data: FormLayerParamType) => {
    componentName.value = data?.name;
    layerWidth.value = data?.width || 600;
    layerHeight.value = data?.height || 400;
    layerHasBtns.value = data?.hasBtns !== false;
    layerhasSaveBtn.value = data?.hasSaveBtn !== false;
    layerhasCloseBtn.value = data?.hasCloseBtn !== false;
    layerhasHeader.value = data?.hasHeader !== false;
    if (data?.destroyOnClose !== false) {
      layerdestroyOnClose.value = true;
    }
    layerHidden.value = data?.hidden || false;

    componentConfig.value = data?.config || {};
    layerBtnText.value = data?.btnText || '保存';

    afterOk = data?.afterOk || null;
    afterClose = data?.afterClose || null;
    afterCancel = data?.afterCancel || null;

    layerRef.value.open(data.title, data.type, data.subtitle);

    nextTick(async () => {
      layerRef.value.showLoading('加载中');
      await loadComponent(data.param || {});
    });
  };
  const pSetTitle = (title: string) => {
    layerRef.value && layerRef.value.setTitle(title);
  };
  const pSetSubTitle = (title: any) => {
    layerRef.value && layerRef.value.setSubTitle(title);
  };

  const handleOk = async () => {
    if (componentRef.value?.ok) {
      fullScreenLoading(true);
      const res = await componentRef.value.ok();
      if (res) {
        layerRef.value.close();
        if (afterOk) {
          await afterOk(res);
        }
      }
      fullScreenLoading(false);
    }
  };
  const handleClosed = () => {
    if (componentRef.value?.closed) {
      componentRef.value.closed();
    }
    afterClose && afterClose();
  };
  const handleCancel = () => {
    afterCancel && afterCancel();
  };

  // 注入方法
  provide('jcode_auth_page_provide', {
    getPageName: getJcodeAuthName,
  });

  /**
   * @zh 打开弹窗
   * @public
   * @param data
   */
  function open(data: FormLayerParamType) {
    pOpen(data);
  }
  /**
   * @zh 设置弹窗标题
   * @public
   */
  function setTitle(title: string) {
    pSetTitle(title);
  }
  /**
   * @zh 设置弹窗副标题
   * @public
   */
  function setSubTitle(subTitle: any) {
    pSetSubTitle(subTitle);
  }

  defineExpose({ open, setTitle, setSubTitle });
</script>

<style lang="less">
  @import './dynamicLayer';
</style>
