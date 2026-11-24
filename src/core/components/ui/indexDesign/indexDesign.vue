<template>
  <div class="lr-index-design lr-block">
    <div class="lr-index-design-left">
      <div class="lr-index-design-title">
        <a-typography-text ellipsis style="margin: 0; font-size: 14px" :content="$t('组件')" />
      </div>
      <div class="lr-index-design-panel">
        <a-collapse v-model:activeKey="collapseComponentActiveKey">
          <a-collapse-panel v-for="(item, index) of components" :key="index" :header="item.name">
            <lr-drag-tool v-for="(component, i) of item.children" :key="i" :config="component">
              <div
                class="lr-component-tool"
                :style="{
                  'border-bottom': hasBorderBottom(i, item.children.length) ? 0 : undefined,
                  'border-right': (i + 1) % 3 == 0 ? 0 : undefined,
                }"
              >
                <lr-icon class="lr-component-tool-icon" :icon="component.icon" :size="32" />
                <div class="lr-component-tool-name">{{ $t(component.name) }}</div>
              </div>
            </lr-drag-tool>
          </a-collapse-panel>
        </a-collapse>
      </div>
    </div>
    <div class="lr-index-design-mid">
      <div class="lr-index-design-tool">
        <div></div>
        <a-space>
          <a-tooltip :title="$t('清空')">
            <lr-button danger type="text" @click="handleClear">
              <template #icon>
                <lr-icon icon="ant-design:delete-outlined" />
              </template>
            </lr-button>
          </a-tooltip>
          <a-divider type="vertical" />
          <a-tooltip :title="$t('预览')">
            <lr-button type="text" @click="handleOpenPreview">
              <template #icon>
                <lr-icon icon="ant-design:play-circle-outlined" />
              </template>
            </lr-button>
          </a-tooltip>
        </a-space>
      </div>
      <div class="lr-index-design-body">
        <lr-drag-container
          ref="dragContainer"
          class="lr-index-design-canvas"
          :is-component-container="false"
          :component-data="indexPage"
        >
          <div
            v-if="!indexPage.children || indexPage.children?.length === 0"
            class="lr-block"
            style="display: flex; position: absolute; align-items: center; justify-content: center"
          >
            <a-empty :description="$t('请添加组件')" />
          </div>
          <lr-drag-index-list
            v-else
            :component-list="indexPage.children"
            :global-config="indexPage.config"
          />
        </lr-drag-container>
      </div>
    </div>
    <div
      class="lr-index-design-right"
      v-show="activedComponent && myComponentConfigs[activedComponent.type]"
    >
      <div class="lr-index-design-title">
        <a-typography-text
          ellipsis
          style="margin: 0; font-size: 14px"
          :content="`${$t('属性配置')}${activedName}`"
        />
      </div>
      <div class="lr-index-design-panel">
        <lr-c-schema-form
          :form-config="{
            layout: 'vertical',
          }"
          style="padding: 0"
          ref="configRef"
          @change="handleChange"
        />
      </div>
    </div>

    <lr-layer
      ref="previewLayerRef"
      :has-btns="false"
      @ok="handlePreviewOk"
      @closed="handlePreviewClosed"
    >
      <lr-c-schema-index ref="previewRef" />
      <!--<lr-layout>
       
        <template #right>
          <lr-panel :title="$t('调试信息')" >
            <lr-code-mirror is-scroll-to-bottom read-only v-model="logText" />
          </lr-panel>
        </template>
      </lr-layout>-->
    </lr-layer>
  </div>
</template>

<script lang="ts" setup>
  import type { DesignComponent } from '../drag/interface';
  import type { SchemaConfig } from '../cSchemaForm/interface';
  import type { IndexDesignComponents, IndexDesignComponent } from './interface';
  import { PropType, computed, ref, reactive, provide, nextTick } from 'vue';
  import { createNamespace } from '../utils/components';

  import { useDesign } from '../drag/hooks/useDesign';

  import { toIndexSaveSchema, toIndexSchema, toIndexDesignSchema } from './utils';

  defineOptions({ name: createNamespace('indexDesign').name });
  const props = defineProps({
    /**
     * @zh 组件列表
     */
    components: {
      type: Array as PropType<IndexDesignComponents[]>,
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
     * @zh 容器组件添加组件后调用
     */
    containerAddComponent: Function,
    /**
     * @zh 组件配置初始化方法
     */
    componentConfigInit: Function,
    /**
     * @zh 配置值变更方法
     */
    componentConfigChange: Function,

    /**
     * @zh 组件集合
     */
    flowComponents: {
      type: Array as PropType<Record<string, any>[]>,
      default: () => [],
    },
    /**
     * @zh 编排组件初始化方法
     */
    flowInit: Function,
    /**
     * @zh 组件配置初始化方法
     */
    flowComponentConfigInit: Function,
    /**
     * @zh 编排组件设置变更方法
     */
    flowComponentConfigChange: Function,
    /**
     * @zh 编排组件设置方法
     */
    flowComponentConfigs: {
      type: Object as PropType<Record<string, SchemaConfig[]>>,
      default: () => ({}),
    },
  });

  // 设置编排组件的配置
  const forEachFlowComponentConfigs = (list: SchemaConfig[]) => {
    list.forEach((item) => {
      if (item.type === 'inputFlow') {
        item.config = item.config || {};
        item.config.flowComponents = props.flowComponents;
        item.config.flowInit = props.flowInit;
        item.config.flowComponentConfigInit = (flowConfigData: any) => {
          if (props.flowComponentConfigInit) {
            flowConfigData.designComponents = designComponentList.value;
            flowConfigData.component = activedComponent.value;
            props.flowComponentConfigInit(flowConfigData);
          }
        };
        item.config.flowComponentConfigs = props.flowComponentConfigs;
        item.config.flowComponentConfigChange = props.flowComponentConfigChange;
      }
      if (item.children) {
        forEachFlowComponentConfigs(item.children);
      }
    });
  };

  //
  const indexPage = reactive<DesignComponent>({
    name: '页面',
    id: 'indexPage',
    type: 'indexPage',
    level: 0,
    children: [],
    dragType: 'container',
    componentName: '',
    containerId: '',
    isInput: false,
    config: {},
  });

  if (props.componentInit) {
    indexPage.config = props.componentInit('indexPage') || {};
  }

  // 可切换的组件类型
  const componentsMap: Record<string, IndexDesignComponent> = {};
  const componentList: { label: string; value: string }[] = [];
  props.components.forEach(({ children }) => {
    children.forEach((item) => {
      componentsMap[item.type] = item;
      item.dragType = item.dragType || 'component';
      componentList.push({
        label: item.name,
        value: item.type,
      });
    });
  });

  const myComponentConfigs: Record<string, SchemaConfig[]> = {};
  Object.keys(props.componentConfigs).forEach((key) => {
    // console.log(key,'myComponentConfigs key')

    const { hasBase } = componentsMap[key] || { hasBase: false };

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
    const collapseItem: SchemaConfig = {
      type: 'collapse',
      config: {
        groups: [],
        defaultValue: [],
      },
      children: [],
    };

    if (hasBase !== false) {
      collapseItem.config?.groups.push({ i: 'c1', label: '基础配置' });
      collapseItem.config?.defaultValue.push('c1');
      collapseItem.children?.push(...baseConfig);
    }
    // collapseItem.children?.push(...props.componentConfigs[key])

    props.componentConfigs[key].forEach((group, index) => {
      const i = `m${index}`;

      collapseItem.config?.defaultValue.push(i);
      collapseItem.config?.groups.push({ i, label: group.config?.label });
      group.children?.forEach((item) => {
        item.slot = i;
        collapseItem.children?.push(item);
      });

      forEachFlowComponentConfigs(collapseItem.children || []);
    });

    myComponentConfigs[key] = [collapseItem];
  });

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
      props.componentConfigChange(activedComponent.value.type, {
        configRef,
        component,
        configData: activedComponent.value.config,
        ...params,
      });
    }
  };

  /* const handleClick = (id: string, even: any, component: Record<string, any>) => {
      console.log(id, even, component,'handleClick')
    } */

  const myComponentConfigInit = (
    type: string,
    data: { components: Record<string, any>[]; configData: Record<string, any> },
  ) => {
    if (props.componentConfigInit) {
      props.componentConfigInit(type, { configRef, ...data });
    }
  };

  const dragContainer = ref();
  const configRef = ref();
  const { activedComponent, clearComponents, schemaComponentDic, designComponentList } = useDesign(
    dragContainer,
    configRef,
    indexPage,
    props.componentInit,
    myComponentConfigInit,
    myComponentConfigs,
    componentsMap,
    props.containerAddComponent,
  );

  const activedName = computed(() =>
    activedComponent.value ? `【${activedComponent.value.name}】` : '',
  );

  // 左侧组件
  const collapseComponentActiveKey = ref<number[]>([]);
  const len = props.components.length;
  for (let i = 0; i < len; i++) {
    collapseComponentActiveKey.value.push(i);
  }

  const hasBorderBottom = (i: number, len: number) => {
    if (len % 3 === 0) {
      return i >= len - 3;
    }
    return i >= Math.floor(len / 3) * 3;
  };

  provide('jcode-design-provide', {
    designItemName: 'lr-index-design-item',
  });

  const handleClear = () => {
    clearComponents();
  };

  // 方法
  const pReset = () => {
    if (props.componentInit) {
      indexPage.config = props.componentInit('indexPage') || {};
    }
    clearComponents();
  };

  const pValidate = () => {
    console.log('pValidate');
    return true;
  };

  const pGetSchema = () => {
    const schema = toIndexSaveSchema(indexPage.config, indexPage.children || []);
    return schema;
  };

  const pSetSchema = (schema: Record<string, any>) => {
    const res = toIndexDesignSchema(schema, componentsMap);

    // console.log(res, 'pSetSchema')

    indexPage.config = res.pageConfig;
    indexPage.children?.push(...res.componentList);

    Object.keys(res.componentDic).forEach((key) => {
      schemaComponentDic[key] = res.componentDic[key];
    });
  };

  // 页面预览
  const previewLayerRef = ref();
  const previewRef = ref();

  let loadPreviewComponentNum = 0;
  const loadPreviewComponent = (schema: Record<string, any>) => {
    if (previewRef.value) {
      loadPreviewComponentNum = 0;

      previewRef.value.setInit(schema);
    } else {
      if (loadPreviewComponentNum > 600) {
        console.warn('组件加载超时');
        return;
      }
      loadPreviewComponentNum++;
      setTimeout(() => {
        loadPreviewComponent(schema);
      }, 100);
    }
  };

  const handlePreviewOk = () => {};

  const handlePreviewClosed = () => {};

  const handleOpenPreview = () => {
    const schema = toIndexSaveSchema(indexPage.config, indexPage.children || []);

    const { componentList } = toIndexSchema(schema);

    // console.log(schema, componentList, 'handleOpenPreview')

    previewLayerRef.value.open('页面预览', 'full');

    nextTick(() => {
      loadPreviewComponent(componentList);
    });
  };

  /**
   * @zh 重置
   * @public
   */
  function reset() {
    return pReset();
  }
  /**
   * @zh 校验设计数据
   * @public
   */
  function validate() {
    return pValidate();
  }
  /**
   * @zh 获取设计数据
   * @public
   */
  function getSchema() {
    return pGetSchema();
  }
  /**
   * @zh 设置设计数据
   * @public
   */
  function setSchema(data: Record<string, any>) {
    return pSetSchema(data);
  }

  defineExpose({ reset, validate, getSchema, setSchema });
</script>

<style lang="less">
  @import './indexDesign';
</style>
