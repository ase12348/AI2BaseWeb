<template>
  <div class="lr-bi-design">
    <div
      v-if="contextmenuFlag"
      class="lr-bi-design-contentmenu"
      :style="{ left: contentmenuX + 'px', top: contentmenuY + 'px' }"
    >
      <div class="item lr-bi-design-contentmenu__btn" @click="copyComponent(contextmenuObj)">
        {{ $t('复制') }}
      </div>
      <div class="item lr-bi-design-contentmenu__btn" @click="handleHideAndDisplay(contextmenuObj)">
        {{ contextmenuObj && contextmenuObj.display ? '隐藏' : '显示' }}
      </div>
      <div class="item lr-bi-design-contentmenu__btn" @click="handleLock(contextmenuObj)">
        {{ contextmenuObj && contextmenuObj.lock ? '解锁' : '锁定' }}
      </div>
      <div class="item lr-bi-design-contentmenu__btn" @click="handleCommon('top', contextmenuObj)">
        {{ $t('置顶图层') }}
      </div>
      <div
        class="item lr-bi-design-contentmenu__btn"
        @click="handleCommon('bottom', contextmenuObj)"
      >
        {{ $t('置底图层') }}
      </div>
      <div class="item lr-bi-design-contentmenu__btn" @click="handleCommon('up', contextmenuObj)">
        {{ $t('上移一层') }}
      </div>
      <div class="item lr-bi-design-contentmenu__btn" @click="handleCommon('down', contextmenuObj)">
        {{ $t('下移一层') }}
      </div>
      <a-divider style="margin: 4px 0" />
      <div
        class="item lr-bi-design-contentmenu__btn"
        style="color: var(--color-error)"
        @click="removeComponent(contextmenuObj?.id)"
      >
        {{ $t('删除') }}
      </div>
    </div>

    <div class="lr-bi-design-left">
      <div
        @click.stop="activedComponentIndex = -1"
        :class="['component-item', { active: activedComponentIndex == -1 }]"
      >
        <lr-icon :size="24" icon="ant-design:switcher-outlined" />
        <span>{{ $t('图层') }}</span>
      </div>
      <div style="padding: 0 4px">
        <a-divider />
      </div>
      <template v-for="(componentItem, index) in components" :key="index">
        <div
          @click.stop="activedComponentIndex = index"
          :class="['component-item', { active: activedComponentIndex == index }]"
        >
          <lr-icon :size="24" :icon="componentItem.icon" />
          <span>{{ $t(componentItem.name) }}</span>
        </div>
      </template>
    </div>
    <div class="lr-bi-design-left2">
      <div v-if="activedComponentIndex == -1" class="lr-block" style="padding-top: 28px">
        <div class="search-input-wraper">
          <a-input-search
            v-model:value="layerSearchWord"
            :placeholder="$t('搜索图层')"
            class="search-input"
          />
        </div>
        <div
          class="lr-block"
          style="padding-top: 8px; overflow: auto"
          @contextmenu.prevent="handleContextmenu"
        >
          <div v-for="(item, index) in layerShowList" :key="index">
            <div
              :class="['lr-bi-design-layer-item', { active: activedComponent.id == item.id }]"
              @click.stop="clickComponent(item)"
              :data-id="item.id"
            >
              <div class="lr-bi-design-layer-item-img">
                <img style="height: 100%" :src="`${imgUrlPrefix}${componentMaps[item.type].img}`" />
              </div>
              <a-typography-text ellipsis :content="$t(item.config.label)" />
              <div class="lr-bi-design-layer-item-btns">
                <a-space :size="2">
                  <div
                    :class="['lr-bi-design-layer-item-btn', { active: !item.display }]"
                    @click.stop="handleHideAndDisplay(item)"
                  >
                    <lr-icon icon="ant-design:eye-invisible-outlined" />
                  </div>
                  <div
                    :class="['lr-bi-design-layer-item-btn', { active: item.lock }]"
                    @click.stop="handleLock(item)"
                  >
                    <lr-icon icon="ant-design:lock-filled" />
                  </div>
                </a-space>
              </div>
            </div>
          </div>
        </div>
      </div>
      <template v-else-if="components[activedComponentIndex]">
        <template
          v-for="(componentItem, index) in components[activedComponentIndex].children"
          :key="index"
        >
          <div @click="addComponent(componentItem, 0, 0)">
            <div class="component-item2" @dragend="dragend($event, componentItem)" draggable="true">
              <div class="component-item2-text">
                <a-typography-text ellipsis :content="$t(componentItem.name)" />
              </div>
              <img class="component-item2-img" :src="`${imgUrlPrefix}${componentItem.img}`" />
            </div>
          </div>
        </template>
      </template>
    </div>
    <div class="lr-bi-design-mid" ref="contentRef">
      <sketch-rule
        :key="midScale"
        :thick="thick"
        :scale="midScale"
        :width="width"
        :height="height"
        :start-x="startX"
        :start-y="startY"
        :palette="palette"
        :shadow="shadow"
        :hor-line-arr="lines.h"
        :ver-line-arr="lines.v"
      />
      <div
        ref="screensRef"
        class="lr-bi-design-main"
        :style="{ cursor: dragSlide ? 'pointer' : '' }"
        @mousedown.stop="dragMousedown"
        @wheel="handleWheel"
        @scroll="handleScroll"
      >
        <div
          class="screen-container"
          :style="{
            height: screenContainerH + 'px',
            width: screenContainerW + 'px',
          }"
          @click.stop="clickComponent(indexPage)"
        >
          <div ref="canvasRef" class="canvas" @contextmenu.prevent="handleContextmenu">
            <lr-bi-design-container
              :layout="layout"
              :index-page="indexPage"
              :actived-component="activedComponent"
              :scale="midScale"
              @select="clickComponent"
              @move="moveComponent"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="lr-bi-design-right">
      <div class="lr-bi-design-title">
        <a-typography-text
          ellipsis
          style="margin: 0; font-size: 14px"
          :content="`${$t('属性配置')}${activedName}`"
        />
      </div>
      <div class="lr-bi-design-panel">
        <lr-c-schema-form
          :form-config="{
            labelWidth: '80px',
            labelAlign: 'left',
          }"
          style="padding: 0"
          ref="configRef"
          @change="handleChange"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import type { SchemaConfig } from '../cSchemaForm/interface';
  import { PropType, computed, ref, onMounted, nextTick } from 'vue';
  import { SketchRule } from 'vue3-sketch-ruler';
  import 'vue3-sketch-ruler/lib/style.css';
  import html2canvas from 'html2canvas';

  import { buildShortUUID, deepClone } from '../utils/method';
  import { Layout, BiDesignComponent } from './interface';

  defineOptions({ name: 'LrBiDesign' });

  const props = defineProps({
    /**
     * @zh 组件列表
     */
    components: {
      type: Array as PropType<Record<string, any>[]>,
      default: () => [],
    },
    /**
     * @zh 组件配置
     */
    componentConfigs: {
      type: Object as PropType<Record<string, SchemaConfig[]>>,
      default: () => ({}),
    },
    /**
     * @zh 组件初始化方法
     */
    componentInit: Function,
    /**
     * @zh 组件配置初始化方法
     */
    componentConfigInit: Function,
    /**
     * @zh 配置值变更方法
     */
    componentConfigChange: Function,
    /**
     * @zh 图片路由前缀
     */
    imgUrlPrefix: {
      type: String as PropType<string>,
      default: '/',
    },
    /**
     * @zh 缩放比例
     */
    scale: {
      type: Number,
      default: -1,
    },
  });

  const emit = defineEmits({
    'update:scale': (value: number) => true,
  });
  const indexPage = ref<BiDesignComponent>({
    name: '页面',
    id: 'indexPage',
    type: 'indexPage',
    layerId: '0',
    config: {},
    display: true,
    lock: false,
    componentName: '',
  });
  if (props.componentInit) {
    indexPage.value.config = props.componentInit('indexPage') || {};
    indexPage.value.config.id = 'indexPage';
  }

  // 组件列表
  const componentMaps = computed(() => {
    const res: Record<string, any> = {};
    props.components.forEach((t) => {
      t.children.forEach((item: any) => {
        res[item.type] = item;
      });
    });
    return res;
  });
  const activedComponentIndex = ref(0);
  const activedComponent = ref();
  // activedComponent.value = indexPage.value
  const layout = ref<Layout>([]);

  // 右键菜单
  const contextmenuFlag = ref<boolean>(false);
  const contentmenuX = ref(0);
  const contentmenuY = ref(0);
  const contextmenuId = ref('');
  const contextmenuObj = computed(() => {
    if (contextmenuId.value === '') {
      return {} as Record<string, any>;
    }
    return layout.value.find((t) => t.id === contextmenuId.value);
  });
  const closeContextmenu = () => {
    contextmenuFlag.value = false;
    contextmenuId.value = '';
  };
  const watchContextmenu = (event: any) => {
    if (event.target.className.indexOf('lr-bi-design-contentmenu__btn') === -1) {
      closeContextmenu();
    }
    window.removeEventListener('mousedown', watchContextmenu);
  };
  const handleContextmenu = (event: any) => {
    let { target } = event;
    let flag = false;
    if (target.className.indexOf && target.className.indexOf('l-draggable__mask') > -1) {
      target = target.parentNode.parentNode;
      flag = true;
    } else if (
      target.className.indexOf &&
      target.className.indexOf('lr-bi-design-layer-item') > -1
    ) {
      flag = true;
    } else if (
      target.parentNode.className.indexOf &&
      target.parentNode.className.indexOf('lr-bi-design-layer-item') > -1
    ) {
      target = target.parentNode;
      flag = true;
    } else if (target.parentNode.parentNode.className.indexOf('lr-bi-design-layer-item') > -1) {
      target = target.parentNode.parentNode;
      flag = true;
    }
    if (flag) {
      event.preventDefault();
      event.stopPropagation();
      contentmenuX.value = event.clientX;
      contentmenuY.value = event.clientY - 8;
      if (contentmenuY.value + 260 > document.body.clientHeight) {
        contentmenuY.value = document.body.clientHeight - 260;
      }

      contextmenuId.value = target.getAttribute('data-id');
      contextmenuFlag.value = true;

      window.addEventListener('mousedown', watchContextmenu);
    }
  };

  // 图层
  const layerSearchWord = ref<string>('');
  const layerShowList = computed(() => {
    if (layerSearchWord.value) {
      return layout.value.filter(
        (item: any) => item.config.label.indexOf(layerSearchWord.value) > -1,
      );
    }
    return layout.value;
  });

  // 右键操作
  const handleHideAndDisplay = (obj: any) => {
    obj.display = !obj.display;
    closeContextmenu();
  };
  const handleLock = (obj: any) => {
    obj.lock = !obj.lock;
    closeContextmenu();
    if (obj.lock && obj.id === activedComponent.value?.id) {
      clickComponent(indexPage.value);
    }
  };

  const handleCommon = (type: string, obj: any) => {
    if (!obj || layout.value.length < 1) {
      closeContextmenu();
      return;
    }
    const index = layout.value.findIndex((item) => item.id === obj.id);
    switch (type) {
      case 'up': {
        if (index === -1 || index === 0) break;
        layout.value = swapItems(layout.value, index, index - 1);

        break;
      }
      case 'down': {
        if (index === -1 || index === layout.value.length - 1) break;
        layout.value = swapItems(layout.value, index, index + 1);
        break;
      }
      case 'top': {
        if (index !== -1) {
          const [item] = layout.value.splice(index, 1);
          layout.value.unshift(item);
        }
        break;
      }
      case 'bottom': {
        if (index !== -1) {
          const [item] = layout.value.splice(index, 1);
          layout.value.push(item);
        }
        break;
      }
    }
    closeContextmenu();
  };
  const swapItems = (arr: any[], index1: number, index2: number) => {
    const temp = arr[index1];
    arr[index1] = arr[index2];
    arr[index2] = temp;
    return arr;
  };

  // 标尺
  const contentRef = ref();
  const thick = ref(20);
  const width = ref(document.body.clientWidth);
  const height = ref(document.body.clientHeight);

  const startX = ref(0);
  const startY = ref(0);
  const palette = ref({
    bgColor: 'rgba(225,225,225, 0)',
    longfgColor: 'rgba(0, 0, 0, 0.45)',
    shortfgColor: 'rgba(0, 0, 0, 0.45)',
    fontColor: 'rgba(0, 0, 0, 0.65)',

    shadowColor: 'rgba(225,225,225, 0)',
    lineColor: 'var(--color-primary)',
    borderColor: '#d9d9d9',
    cornerActiveColor: 'var(--color-primary)',
  });
  const shadow = computed(() => ({
    x: 0,
    y: 0,
    width: width.value,
    height: height.value,
  }));
  const lines = ref({
    h: [],
    v: [],
  });

  // 设计窗口
  const screensRef = ref();
  const canvasRef = ref();
  const dragSlide = ref(false);
  const keys = ref<Record<string, any>>({});
  const myScale = ref(100);
  const midScale = computed<number>({
    set(val) {
      myScale.value = val;
      emit('update:scale', val);
    },
    get() {
      let { scale } = props;
      if (scale === -1) {
        scale = myScale.value;
      }
      return scale / 100;
    },
  });
  const screenContainerH = computed(() => (indexPage.value.config.h || 1080) * 2);
  const screenContainerW = computed(() => (indexPage.value.config.w || 1920) * 2);
  const resize = () => {
    if (contentRef.value) {
      width.value = contentRef.value.offsetWidth - thick.value;
      height.value = contentRef.value.offsetHeight - thick.value;
      screensRef.value.scrollLeft = screenContainerW.value / 2 - thick.value;
      screensRef.value.scrollTop = screenContainerH.value / 2 - thick.value;
      resizeScale();
    }
  };

  const resizeScale = () => {
    const panelWitdh = indexPage.value.config.w || 1920;
    if (width.value < panelWitdh) {
      midScale.value = (width.value * 100) / panelWitdh;
    }
  };

  // 监听键盘的按键
  const listenKey = () => {
    document.onkeydown = (e) => {
      // @ts-ignore
      if (e.target?.nodeName === 'TEXTAREA' || e.target?.nodeName === 'INPUT') {
        return;
      }
      const keyCode = e.keyCode || e.which;
      // 按下空格键
      if (keyCode === 32) {
        e.preventDefault();
        keys.value.space = true;
      }
      if (keyCode === 17) {
        e.preventDefault();
        keys.value.ctrl = true;
      }
    };
    document.onkeyup = () => {
      keys.value = {};
    };
  };
  const dragMousedown = (e: any) => {
    // 如果按下了空格键,且按下鼠标左键,那么鼠标变抓手,开启滚动条随鼠标拖动的操作
    if (keys.value.space) {
      dragSlide.value = true;
      // @ts-ignore
      window.stardragEvent = e;
      // @ts-ignore
      window.startSlideX = screensRef.value.scrollLeft;
      // @ts-ignore
      window.startSlideY = screensRef.value.scrollTop;

      document.onmousemove = (e) => {
        if (dragSlide.value) {
          // @ts-ignore
          const x = e.clientX - window.stardragEvent.clientX;
          // @ts-ignore
          const y = e.clientY - window.stardragEvent.clientY;
          // @ts-ignore
          screensRef.value.scrollLeft = window.startSlideX - x;
          // @ts-ignore
          screensRef.value.scrollTop = window.startSlideY - y;
        }
      };
      document.onmouseup = () => {
        document.onmousemove = null;
        document.onmouseup = null;
        dragSlide.value = false;
      };
    }
  };

  // 滚轮触发
  const handleScroll = () => {
    const screensRect = screensRef.value.getBoundingClientRect();
    const canvasRect = canvasRef.value.getBoundingClientRect();
    const scale = midScale.value;
    // 标尺开始的刻度
    const myStartX = (screensRect.left + thick.value - canvasRect.left) / scale;
    const myStartY = (screensRect.top + thick.value - canvasRect.top) / scale;

    startX.value = myStartX >> 0;
    startY.value = myStartY >> 0;
  };

  // 控制缩放值
  const handleWheel = (e: any) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      const scale = midScale.value;
      const nextScale = parseFloat(Math.max(0.2, scale - e.deltaY / 500).toFixed(2));

      midScale.value = nextScale * 100;

      if (scale !== midScale.value) {
        nextTick(() => {
          handleScroll();
        });
      }
    }
  };

  // 配置
  const configRef = ref();
  const activedName = computed(() =>
    activedComponent.value ? `【${activedComponent.value.name}】` : '',
  );
  const myComponentConfigs: Record<string, SchemaConfig[]> = {};
  Object.keys(props.componentConfigs).forEach((key) => {
    const baseConfig: SchemaConfig[] = [
      {
        id: 'id',
        type: 'input',
        slot: 'c1',
        config: {
          label: 'ID',
          readonly: true,
        },
      },
      {
        id: 'label',
        type: 'input',
        slot: 'c1',
        config: {
          label: '名称',
        },
      },
    ];

    const xyConfig: SchemaConfig[] = [
      {
        id: 'w',
        type: 'number',
        slot: 'xy',
        config: {
          label: '宽度',
          min: 0,
        },
      },
      {
        id: 'h',
        type: 'number',
        slot: 'xy',
        config: {
          label: '高度',
          min: 0,
        },
      },
      {
        id: 'x',
        type: 'number',
        slot: 'xy',
        config: {
          label: 'x轴',
          min: 0,
        },
      },
      {
        id: 'y',
        type: 'number',
        slot: 'xy',
        config: {
          label: 'y轴',
          min: 0,
        },
      },
    ];

    const collapseItem: SchemaConfig = {
      type: 'collapse',
      config: {
        groups: [],
        defaultValue: [],
      },
      children: [],
    };

    if (key !== 'indexPage') {
      collapseItem.config?.groups.push({ i: 'c1', label: '基础配置' });
      collapseItem.config?.defaultValue.push('c1');
      collapseItem.children?.push(...baseConfig);
    }

    props.componentConfigs[key].forEach((group, index) => {
      if (group.config?.label === '基础配置' && key !== 'indexPage') {
        group.children?.forEach((item) => {
          item.slot = 'c1';
          collapseItem.children?.push(item);
        });
      } else {
        const i = `m${index}`;

        if (collapseItem.config?.groups.length === 1) {
          collapseItem.config?.defaultValue.push(i);
        }
        collapseItem.config?.groups.push({ i, label: group.config?.label });
        group.children?.forEach((item) => {
          item.slot = i;
          collapseItem.children?.push(item);
        });
      }
    });
    if (key !== 'indexPage') {
      collapseItem.config?.groups.push({ i: 'xy', label: '大小定位' });
      collapseItem.children?.push(...xyConfig);
    } else if (collapseItem.config?.groups.length > 0) {
      collapseItem.config?.defaultValue.push(collapseItem.config?.groups[0].i);
    }

    myComponentConfigs[key] = [collapseItem];
  });
  const setConfigForm = () => {
    // 设置配置表单
    if (activedComponent.value) {
      const configFormSchema = myComponentConfigs[activedComponent.value.type];
      if (configFormSchema) {
        configRef.value.setInit(configFormSchema, activedComponent.value.config);
      } else {
        configRef.value.setInit([]);
      }

      if (props.componentConfigInit) {
        props.componentConfigInit(activedComponent.value.type, {
          configRef,
          components: layout.value,
          configData: activedComponent.value.config,
        });
      }
    } else {
      configRef.value.setInit([]);
    }
  };
  const handleChange = (
    component: Record<string, any>,
    params: {
      value: any;
      data?: any;
      index?: number;
      tableData?: Record<string, any>[];
      type?: string;
    },
  ) => {
    if (activedComponent.value && props.componentConfigChange) {
      if (activedComponent.value.id === 'indexPage') {
        if (component.id === 'w' || component.id === 'h') {
          nextTick(() => {
            resize();
          });
        }
      }
      props.componentConfigChange(activedComponent.value.type, {
        configRef,
        component,
        configData: activedComponent.value.config,
        ...params,
      });
    }
  };

  // 组件
  const myComponentInit = (type: string) => {
    if (props.componentInit) {
      return props.componentInit(type) || {};
    }
    return {};
  };

  const addComponent = (item: Record<string, any>, x: number, y: number) => {
    const component: BiDesignComponent = {
      name: item.name,
      id: buildShortUUID(),
      type: item.type,
      layerId: '0',
      config: myComponentInit(item.type),
      display: true,
      lock: false,
      componentName: item.componentName,
    };

    component.config.id = component.id;
    component.config.label = item.name;
    component.config.h = item.h || 100;
    component.config.w = item.w || 100;
    component.config.x = x;
    component.config.y = y;

    layout.value.unshift(component);

    activedComponent.value = component;

    setConfigForm();
  };

  const dragend = (e: any, component: any) => {
    // @ts-ignore
    const parentRect = document
      .getElementById('jcode-bi-design-container')
      .getBoundingClientRect();
    // @ts-ignore
    const x = e.clientX - parentRect.left;
    // @ts-ignore
    const y = e.clientY - parentRect.top;

    addComponent(
      component,
      x / midScale.value - component.w / 2,
      y / midScale.value - component.h / 2,
    );

    // console.log('test dragend', x, y, component)
  };

  const removeComponent = (id: string) => {
    layout.value = layout.value.filter((item) => item.id !== id);
    if (activedComponent.value.id === id) {
      activedComponent.value = indexPage.value;
      setConfigForm();
    }
    closeContextmenu();
  };

  const copyComponent = (item: any) => {
    const cell = deepClone(item);
    const i = buildShortUUID();

    cell.id = i;
    cell.config.id = i;
    layout.value.push(cell);
    activedComponent.value = cell;

    setConfigForm();
    closeContextmenu();
  };

  const clickComponent = (item: BiDesignComponent) => {
    if (activedComponent.value?.id !== item.id) {
      activedComponent.value = item;
      setConfigForm();
    }
  };

  const moveComponent = ({ left, top, width, height }: Record<string, any>) => {
    if (activedComponent.value) {
      activedComponent.value.config.x = left;
      activedComponent.value.config.y = top;
      activedComponent.value.config.w = width;
      activedComponent.value.config.h = height;

      configRef.value.setFormData({ main: { x: left, y: top, w: width, h: height } });
    }
  };

  const resizeObserver = new ResizeObserver(resize);
  onMounted(() => {
    resizeObserver.observe(contentRef.value);
    listenKey();
    clickComponent(indexPage.value);
  });

  const pGetData = () => {
    const res = deepClone(layout.value);
    return {
      ver: '1.0.0',
      components: res,
      page: indexPage.value,
    };
  };

  const pSetData = (data: Record<string, any>) => {
    data.components?.forEach((item: any) => {
      item.componentName = componentMaps.value[item.type].componentName;
    });
    layout.value = data.components || [];
    indexPage.value = data.page || indexPage.value;
    clickComponent(indexPage.value);
  };

  const pClear = () => {
    layout.value = [];
    clickComponent(indexPage.value);
  };

  const pGetImg = () =>
    new Promise((resolve) => {
      html2canvas(canvasRef.value, {
        useCORS: true,
        backgroundColor: null,
        allowTaint: true,
      }).then((canvas) => {
        // 判断画布不为空
        if (canvas.width !== 0 && canvas.height !== 0) {
          const img = canvas.toDataURL('image/png');
          resolve(img);
          return;
        }
        resolve('');
      });
    });

  /**
   * @zh 清空数据
   * @public
   */
  function clearData() {
    pClear();
  }
  /**
   * @zh 设置数据
   * @public
   */
  function setData(data: Record<string, any>[]) {
    pSetData(data);
  }
  /**
   * @zh 获取数据
   * @public
   */
  function getData() {
    return pGetData();
  }
  /**
   * @zh 获取数据
   * @public
   */
  function getImg() {
    return pGetImg();
  }

  defineExpose({ clearData, setData, getData, getImg });
</script>

<style lang="less">
  @import './biDesign';
</style>
