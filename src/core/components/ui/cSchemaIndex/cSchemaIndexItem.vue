<template>
  <a-tabs
    v-if="component.type == 'tabs' && component?.config?.display !== false"
    ref="componentRef"
    v-bind="component?.config"
    :class="{ isFixedNotPadding: isAutoWindow }"
    v-model:active-key="myParamData[id]"
  >
    <a-tab-pane v-for="item of component?.config?.groups" :key="item.i" :tab="$t(item.label)">
      <lr-c-schema-index-item
        v-for="tabPaneItem of childrenGroup[item.i] || []"
        :key="tabPaneItem.id"
        v-bind="tabPaneItem"
      />
    </a-tab-pane>
  </a-tabs>
  <a-collapse
    ref="componentRef"
    v-else-if="component.type == 'collapse' && component?.config?.display !== false"
    v-bind="component?.config"
    v-model:active-key="myParamData[id]"
  >
    <a-collapse-panel v-for="item of component?.config?.groups" :key="item.i" :header="item.label">
      <lr-c-schema-index-item
        v-for="tabPaneItem of childrenGroup[item.i] || []"
        :key="tabPaneItem.id"
        v-bind="tabPaneItem"
      />
    </a-collapse-panel>
  </a-collapse>
  <component
    v-else-if="component?.config?.display !== false"
    ref="componentRef"
    v-bind="component?.config"
    v-model:value="value"
    v-model="modelValue"
    :is="componentName"
    :run-flow="runFlow"
  >
    <template v-for="(list, key) of childrenGroup" #[key]="scope">
      <lr-c-schema-index-item
        v-for="item of list"
        :is-auto-window="
          ['lr-layout', 'lr-panel', 'lr-runtime-vlayout', 'lr-runtime-hlayout'].includes(
            component.type,
          ) && list.length == 1
        "
        :key="item.id"
        v-bind="item"
        :parent-params="scope"
      />
    </template>
  </component>
</template>

<script lang="ts" setup>
  import type { SchemaRuntimeConfig } from '../cSchemaForm/interface';

  import { PropType, computed, inject, useTemplateRef, onMounted, watch, unref } from 'vue';

  defineOptions({ name: 'LrCSchemaIndexItem' });

  const props = defineProps({
    /**
     * @zh id
     */
    id: {
      type: String as PropType<string>,
      required: true,
    },
    /**
     * @zh 子集
     */
    children: {
      type: Array as PropType<SchemaRuntimeConfig[]>,
      default: () => [],
    },
    parentParams: Object,
    /**
     * @zh 是否自适应大小
     */
    isAutoWindow: Boolean,
  });

  const componentRef = useTemplateRef('componentRef');

  // 获取注入的方法
  const { components, myParamData, runFlow, runFlowByNotRunActions } = inject(
    'jcode_index_provide',
    {} as Record<string, any>,
  );

  const { id, children } = props;
  const component = computed(() => components && components[id || '']);
  const componentName = computed(() => {
    const { type, config } = component.value || {};
    // console.log(id,component,type, config?.h, 'componentName config')
    return config?.h ? config?.h(props.parentParams) : type;
  });

  // 需要根据插槽做归类
  const childrenGroup = computed(() => {
    const res: Record<string, SchemaRuntimeConfig[]> = {};
    children?.forEach((item) => {
      if (components[item.id].display !== false) {
        if (item.slot) {
          res[item.slot] = res[item.slot] || [];
          res[item.slot].push(item);
        } else {
          res.default = res.default || [];
          res.default.push(item);
        }
      }
    });

    // console.log(res,components, 'childrenGroup')

    return res;
  });

  // 生命周期
  // 组件通过 defineAsyncComponent 异步注册，onMounted 时 componentRef 仍可能为 null，
  // 异步组件解析完成后模板引用才回填，因此用 watch 持续同步，避免 $ref 永久为 null。
  watch(
    componentRef,
    (value) => {
      const component = components[id || ''];
      if (!component || !value) {
        return;
      }
      component.$ref = value;
      component.$ref2 = componentRef;
    },
    { immediate: true, flush: 'post' },
  );

  onMounted(() => {
    if (components[id || '']) {
      runFlowByNotRunActions(id);
    }
  });

  const value = computed({
    get() {
      return unref(component.value?.config?.value);
    },
    set(val) {
      if (component.value?.config?.value !== undefined) {
        component.value.config.value = val;
      }
    },
  });

  const modelValue = computed({
    get() {
      return unref(component.value?.config?.modelValue);
    },
    set(val) {
      if (component.value?.config?.modelValue !== undefined) {
        component.value.config.modelValue = val;
      }
    },
  });
</script>
