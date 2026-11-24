<template>
  <div @click.stop="handleFocusContainer" id="jcode-bi-design-container" :style="containerStyle">
    <template v-for="(item, index) in layout" :key="item.id">
      <lr-draggable
        :id="item.id"
        :left="item.config.x"
        :top="item.config.y"
        :width="item.config.w"
        :height="item.config.h"
        :scale="1 / scale"
        :step="1 / scale"
        :active-flag="item.id == activedComponent.id"
        :readonly="item.lock"
        :data-id="item.id"
        v-if="item.display"
        @focus="handleFocus(item)"
        @blur="handleBlur"
        :z-index="layout.length - index"
        :is-active-bg-transparent="true"
      >
        <component
          :style="{ width: getPx(item.config.w), height: getPx(item.config.h) }"
          :is="item.componentName"
          v-bind="item.config"
          :is-design="true"
          :ref="(el: any) => setItemRef(el, item.id)"
        />
      </lr-draggable>
    </template>
  </div>
</template>

<script lang="ts" setup>
  import { PropType, computed, provide } from 'vue';
  import { getPx } from '../utils/number';
  import { Layout, BiDesignComponent } from './interface';
  import { createNamespace } from '../utils/components';
  import { useFramework } from '../utils/useFramework';
  import { getFunction, fullScreenLoading, deepMerge } from '../utils/method';
  import { formatToDateTime } from '../utils/date';

  defineOptions({ name: createNamespace('biDesignContainer').name });
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
    /**
     * @zh 选中的组件
     */
    activedComponent: {
      type: Object as PropType<BiDesignComponent>,
      default: () => ({}),
    },
    /**
     * @zh 缩放比例
     */
    scale: {
      type: Number,
      default: 1,
    },
  });
  const emit = defineEmits(['select', 'move']);
  const {
    apiUrl,
    token,
    useMessage,
    getLoginInfo,
    useHttp,
    loadDbSourceList,
    getDbSourceList,
    getDbSourceKey,
  } = useFramework({});

  const { httpGet, httpPost, httpPut, httpDelete } = useHttp();

  const containerStyle = computed(() => {
    const style: Record<string, any> = {
      transform: `scale(${props.scale}, ${props.scale})`,
      transformOrigin: 'left top',
      position: 'relative',
      width: getPx(props.indexPage.config.w || 1920),
      height: getPx(props.indexPage.config.h || 1080),
      backgroundColor: props.indexPage.config.backgroundColor || 'var(--color-bg-container)',
    };

    if (props.indexPage.config.backgroundImage) {
      style.background = `url(${apiUrl}/system/annexesfile/${props.indexPage.config.backgroundImage}?token=${
        token?.value
      }) 0% 0% / 100% 100% ${props.indexPage.config.backgroundColor || 'var(--color-bg-container)'}`;
    }

    return style;
  });

  const handleFocus = (item: BiDesignComponent) => {
    emit('select', item);
  };

  const handleBlur = (data: Record<string, any>) => {
    emit('move', data);
  };

  const handleFocusContainer = (e: any) => {
    if (e?.target?.getAttribute('id') === 'jcode-bi-design-container') {
      emit('select', props.indexPage);
    }
  };

  // 脚本设置

  const itemRefs: Record<string, any> = {};
  const setItemRef = (el: any, id: string) => {
    if (el) {
      itemRefs[id] = el;
    }
  };

  const components = computed(() =>
    props.layout.map((item) => ({
      ...item,
      $refs: itemRefs[item.id],
    })),
  );
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
  provide('jcode_bi_design_container', { executeEvent });
</script>

<style lang="less">
  @import './biDesign';
</style>
