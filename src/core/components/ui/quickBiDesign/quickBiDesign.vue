<template>
  <div class="lr-quick-bi-design">
    <div class="lr-quick-bi-design-left">
      <div
        class="component-item"
        @click.stop="
          () => {
            previewVisible = true;
          }
        "
      >
        <lr-icon :size="24" icon="ant-design:play-circle-twotone" />
      </div>
      <template v-for="(myComponent, index) in components" :key="index">
        <div style="padding: 0 4px">
          <a-divider />
        </div>
        <template v-for="item in myComponent.children" :key="item.type">
          <a-tooltip :title="$t(item.name)" placement="right">
            <div class="component-item" @click.stop="addComponent(item)">
              <img
                class="component-item-img"
                style="height: 24px"
                :src="`${imgUrlPrefix}${item.img}`"
              />
            </div>
          </a-tooltip>
        </template>
      </template>
    </div>
    <div class="lr-quick-bi-design-mid">
      <div
        class="lr-quick-bi-design-canvas"
        :class="{ 'lr-quick-bi-design_app-content': isApp }"
        ref="canvasRef"
      >
        <grid-layout
          :col-num="120"
          :row-height="1"
          :is-draggable="true"
          :is-resizable="true"
          :is-mirrored="false"
          :vertical-compact="true"
          :use-css-transforms="true"
          v-model:layout="layout"
        >
          <grid-item
            v-for="item in layout"
            :x="item.x"
            :y="item.y"
            :w="item.w"
            :h="item.h"
            :i="item.i"
            :key="item.i"
            :max-h="item.maxH"
            :min-h="item.minH"
            :max-w="item.maxW"
            :min-w="item.minW"
            :class="{ 'active-item': activedComponent && item.i === activedComponent.i }"
            @click.stop="clickComponent(item)"
          >
            <component :is="item.componentName" v-bind="item.config" />
            <div class="mask"></div>
            <lr-button
              :title="$t('复制')"
              @click.stop="copyComponent(item)"
              class="action-clone"
              shape="circle"
              size="small"
              type="primary"
            >
              <template #icon><lr-icon :size="12" icon="ant-design:copy-outlined" /></template>
            </lr-button>
            <lr-button
              :title="$t('删除')"
              class="action-delete"
              shape="circle"
              type="primary"
              size="small"
              danger
              @click.stop="removeComponent(item.i)"
            >
              <template #icon><lr-icon :size="12" icon="ant-design:delete-outlined" /></template>
            </lr-button>
          </grid-item>
        </grid-layout>
      </div>
    </div>
    <div class="lr-quick-bi-design-right" v-show="activedComponent">
      <div class="lr-quick-bi-design-title">
        <a-typography-text
          ellipsis
          style="margin: 0; font-size: 14px"
          :content="`${$t('属性配置')}${activedName}`"
        />
      </div>
      <div class="lr-quick-bi-design-panel">
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

    <lr-modal-full v-model:visible="previewVisible" :has-btns="false" title="预览">
      <lr-quick-bi-viewer :layout="layout" :is-preview="true" :is-app="isApp" />
    </lr-modal-full>
  </div>
</template>

<script lang="ts" setup>
  import type { SchemaConfig } from '../cSchemaForm/interface';
  import { PropType, computed, ref, unref } from 'vue';
  import html2canvas from 'html2canvas';

  import { buildShortUUID, deepClone } from '../utils/method';
  import { Layout, LayoutItem } from './interface';

  defineOptions({ name: 'LrQuickBiDesign' });

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
     * @zh 是否是移动桌面
     */
    isApp: {
      type: Boolean,
      default: false,
    },
  });
  const configRef = ref();
  const canvasRef = ref();
  const layout = ref<Layout>([]);
  const activedComponent = ref();

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
        id: 'title',
        type: 'input',
        slot: 'c1',
        config: {
          label: '标题',
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

    collapseItem.config?.groups.push({ i: 'c1', label: '基础配置' });
    collapseItem.config?.defaultValue.push('c1');
    collapseItem.children?.push(...baseConfig);

    props.componentConfigs[key].forEach((group, index) => {
      if (group.config?.label === '基础配置') {
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
    collapseItem.config?.groups.push({ i: 'xy', label: '大小定位' });
    collapseItem.children?.push(...xyConfig);

    myComponentConfigs[key] = [collapseItem];
  });

  const myComponentInit = (type: string) => {
    if (props.componentInit) {
      return props.componentInit(type) || {};
    }
    return {};
  };

  const setConfigForm = () => {
    // 设置配置表单
    if (activedComponent.value) {
      const configFormSchema = myComponentConfigs[activedComponent.value.type];
      if (configFormSchema) {
        const { x, y, h, w } = activedComponent.value;
        activedComponent.value.config.x = x;
        activedComponent.value.config.y = y;
        activedComponent.value.config.h = h;
        activedComponent.value.config.w = w;
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

  const addComponent = (item: LayoutItem) => {
    const unrefLayout = unref(layout);
    const clone = deepClone(item);
    // 删除不必要的属性
    delete clone.img;

    let x = 0;
    let y = 0;
    const i = buildShortUUID();
    if (unrefLayout.length > 0) {
      const lastItem = unrefLayout[unrefLayout.length - 1];
      if (lastItem.x + lastItem.w + clone.w <= 120) {
        x = lastItem.x + lastItem.w;
        y = lastItem.y + 0;
      } else {
        y = lastItem.y + lastItem.h;
      }
    }

    const config = myComponentInit(clone.type);
    config.id = i;

    const cell = { ...clone, i, x, y, config };

    layout.value.push(cell);

    activedComponent.value = cell;

    setConfigForm();
  };

  const copyComponent = (item: LayoutItem) => {
    const unrefLayout = unref(layout);
    const clone = deepClone(item);

    let x = 0;
    let y = 0;
    const i = buildShortUUID();
    if (unrefLayout.length > 0) {
      const lastItem = unrefLayout[unrefLayout.length - 1];
      if (lastItem.x + lastItem.w + clone.w <= 120) {
        x = lastItem.x + lastItem.w;
        y = lastItem.y + 0;
      } else {
        y = lastItem.y + lastItem.h;
      }
    }

    const cell = clone;
    cell.i = i;
    cell.x = x;
    cell.y = y;

    layout.value.push(cell);

    activedComponent.value = cell;

    setConfigForm();
  };

  const clickComponent = (item: LayoutItem) => {
    if (activedComponent.value?.i === item.i) {
      const { x, y, h, w } = activedComponent.value;
      configRef.value.setFormData({ main: { x, y, h, w } });
      return;
    }
    activedComponent.value = item;

    setConfigForm();
  };

  const removeComponent = (i: string) => {
    layout.value = layout.value.filter((item) => item.i !== i);
    activedComponent.value = null;

    setConfigForm();
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
    if (['x', 'y', 'h', 'w'].includes(component.id)) {
      activedComponent.value[component.id] = activedComponent.value.config[component.id];
    }

    if (activedComponent.value && props.componentConfigChange) {
      props.componentConfigChange(activedComponent.value.type, {
        configRef,
        component,
        configData: activedComponent.value.config,
        ...params,
      });
    }
  };

  // 预览
  const previewVisible = ref(false);

  const pGetData = () => {
    const res = deepClone(layout.value);
    res.forEach((item: any) => {
      delete item.moved;
      delete item.maxH;
      delete item.maxW;
      delete item.minH;
      delete item.minW;
      delete item.name;
    });
    return res;
  };

  const componentMap = computed(() => {
    const map: Record<string, any> = {};
    props.components.forEach((item) => {
      item.children.forEach((t: any) => {
        map[t.type] = t;
      });
    });
    return map;
  });

  const pSetData = (data: Record<string, any>[]) => {
    data.forEach((item) => {
      const componentItem = componentMap.value[item.type];
      // console.log(props.components, componentItem, item, 'pSetData')
      if (componentItem) {
        item.maxH = componentItem.maxH;
        item.maxW = componentItem.maxW;
        item.minH = componentItem.minH;
        item.minW = componentItem.minW;
        item.name = componentItem.name;
      }
    });
    layout.value = data as Layout;
    activedComponent.value = null;
  };

  const pGetImg = () =>
    new Promise((resolve) => {
      console.log(canvasRef.value, 'canvasRef.value');
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
    pSetData([]);
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
  @import './quickBiDesign';
</style>
