<template>
  <div
    class="lr-block"
    :style="{
      'overflow-y':
        !indexPage.config?.screenFit || indexPage.config?.screenFit == '1' ? 'auto' : 'hidden',
      'overflow-x': indexPage.config?.screenFit == '2' ? 'auto' : 'hidden',
    }"
    ref="biViewer"
  >
    <div :style="containerWraperStyle">
      <div :style="containerStyle">
        <template v-for="(item, index) in components" :key="item.id">
          <component
            :ref="(el: any) => setItemRef(el, item.id)"
            v-show="item.display !== false"
            :style="{
              position: 'absolute',
              width: getPx(item.config.w),
              height: getPx(item.config.h),
              top: getPx(item.config.y),
              left: getPx(item.config.x),
              zIndex: layout.length - index,
            }"
            :is="item.componentName"
            v-bind="item.config"
            @click="(params: Record<string, any>) => componentClick(params, item.config.clickevent)"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { PropType, computed, ref, onMounted, provide } from 'vue';
  import { getPx } from '../utils/number';
  import { Layout, BiDesignComponent } from './interface';
  import { createNamespace } from '../utils/components';
  import { useFramework } from '../utils/useFramework';
  import { getFunction, fullScreenLoading, deepMerge } from '../utils/method';
  import { formatToDateTime } from '../utils/date';

  defineOptions({ name: createNamespace('biViewer').name });

  const props = defineProps({
    /**
     * @zh 组件配置
     */
    layout: {
      type: Array as PropType<Layout>,
      default: () => [],
    },
    /**
     * @zh 页面配置
     */
    indexPage: {
      type: Object as PropType<BiDesignComponent>,
      default: () => ({}),
    },
  });

  const {
    apiUrl,
    token,
    getLoginInfo,
    useMessage,
    useHttp,
    loadDbSourceList,
    getDbSourceList,
    getDbSourceKey,
  } = useFramework({});

  const { httpGet, httpPost, httpPut, httpDelete } = useHttp();

  const components = computed(() => props.layout);

  const biViewer = ref();

  const scaleY = ref(1);
  const scaleX = ref(1);

  const resize = () => {
    if (biViewer.value) {
      resizeScale(biViewer.value.offsetWidth, biViewer.value.offsetHeight);
    }
  };

  const resizeScale = (width: number, height: number) => {
    const panelWitdh = props.indexPage.config?.w || 1920;
    const panelHeight = props.indexPage.config?.h || 1080;
    const screenFit = props.indexPage.config?.screenFit || '1';

    if (screenFit === '1') {
      scaleX.value = width / panelWitdh;
      scaleY.value = scaleX.value;
    } else if (screenFit === '2') {
      scaleY.value = height / panelHeight;
      scaleX.value = scaleY.value;
    } else if (screenFit === '3') {
      scaleX.value = width / panelWitdh;
      scaleY.value = height / panelHeight;
    }
  };

  const containerStyle = computed(() => {
    const style: Record<string, any> = {
      transform: `scale(${scaleX.value}, ${scaleY.value})`,
      transformOrigin: 'left top',
      position: 'relative',
      overflow: 'hidden',
      width: getPx(props.indexPage.config?.w || 1920),
      height: getPx(props.indexPage.config?.h || 1080),
      backgroundColor: props.indexPage.config?.backgroundColor || 'var(--color-bg-container)',
    };

    if (props.indexPage.config?.backgroundImage) {
      style.background = `url(${apiUrl}/system/annexesfile/${props.indexPage.config?.backgroundImage}?token=${
        token?.value
      }) 0% 0% / 100% 100% ${props.indexPage.config?.backgroundColor || 'var(--color-bg-container)'}`;
    }

    return style;
  });

  const containerWraperStyle = computed(() => {
    const style: Record<string, any> = {
      width: getPx((props.indexPage.config?.w || 1920) * scaleX.value),
      height: getPx((props.indexPage.config?.h || 1080) * scaleY.value),
    };

    return style;
  });

  const itemRefs: Record<string, any> = {};
  const setItemRef = (el: any, id: string) => {
    if (el) {
      itemRefs[id] = el;
    }
  };

  const resizeObserver = new ResizeObserver(resize);
  onMounted(() => {
    components.value.forEach((item) => {
      item.$refs = itemRefs[item.id];
    });
    resizeObserver.observe(biViewer.value);
  });

  const componentClick = (params: Record<string, any>, clickevent: string) => {
    executeEvent(clickevent, { params });
  };

  const { error, success, info, warning } = useMessage();

  const errorMessage = (message: string) => {
    if (error) {
      error(message);
    }
  };

  const executeEvent = async (eventStr: string, param: Record<string, any>) => {
    if (eventStr && eventStr.trim()) {
      eventStr = `async (jcode) => {${eventStr}}`;
      const { res, msg, fn } = getFunction(eventStr);
      if (res) {
        return fn(eventParam(param));
      }
      errorMessage(msg as string);
    }
  };
  const pGetValue = (id: string) => itemRefs[id]?.getValue() || [];
  const pSetHide = (id: string, hide = true) => {
    const item = components.value.find(({ id: itemId }) => itemId === id);
    if (item) {
      item.display = !hide;
    }
  };
  const pSetProps = (id: string, props: Record<string, any>) => {
    const item = components.value.find(({ id: itemId }: BiDesignComponent) => itemId === id);
    if (item) {
      // eslint-disable-next-line prefer-destructuring
      item.config = deepMerge(item.config || {}, props);
    }
  };
  const pGetProps = (id: string) => {
    const item = components.value.find(({ id: itemId }) => itemId === id);
    return item?.config || {};
  };
  const pRefresh = (id: string) => {
    const item = components.value.find(({ id: itemId }) => itemId === id);
    item?.$refs?.updateData && item.$refs.updateData();
  };
  const eventParam = (param: Record<string, any>) => {
    param.loginUser = getLoginInfo.value;

    param.get = pGetValue;

    param.getSourceData = async (code: string, params: any) => {
      await loadDbSourceList(code, params, false);
      return getDbSourceList.value[getDbSourceKey(code, params)];
    };
    param.getDateNow = (format: string) =>
      formatToDateTime(new Date(), format || 'YYYY-MM-DD HH:mm:ss');

    param.httpGet = httpGet;
    param.httpPost = httpPost;
    param.httpPut = httpPut;
    param.httpDelete = httpDelete;

    // error, success, info, warning, loading
    param.loading = () => {
      fullScreenLoading(true);
    };
    param.hideLoading = () => {
      fullScreenLoading(false);
    };
    param.message = (text: string, type: string) => {
      switch (type) {
        case 'success':
          success && success(text);
          break;
        case 'warning':
          warning && warning(text);
          break;
        case 'error':
          error && error(text);
          break;
        case 'info':
          info && info(text);
          break;
        default:
          info && info(text);
          break;
      }
    };

    param.setHide = pSetHide;
    param.getProps = pGetProps;
    param.setProps = pSetProps;
    param.refresh = pRefresh;

    return param;
  };
  provide('jcode_bi_viewer', { executeEvent });
</script>

<style lang="less">
  @import './biDesign';
</style>
