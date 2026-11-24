<template>
  <a-col
    :class="{ 'lr-block-nopadding': isAutoWindow }"
    :span="componentProp.span || span || 24"
    :offset="componentProp.offset"
    v-show="componentProp.display !== false"
    :style="{
      ...(componentProp.colStyle || {}),
    }"
    v-if="!notCol && component.type != 'layout'"
  >
    <a-form-item
      v-if="isFormItem(id)"
      :label-col="{
        span: componentProp.labelSpan || labelSpan,
        style: { width: myLabelWidth },
      }"
      :label="$t(componentProp.label || '')"
      :extra="componentProp.labelExtra"
      :tooltip="componentProp.labelTooltip"
      :required="isRequired"
      :validate-status="errorFields[id || ''] ? 'error' : undefined"
      :help="$t(errorHelp)"
    >
      <a-space-compact v-if="componentProp.buttonConfig" block>
        <lr-c-input
          @change="hanldChange"
          :type="
            component?.config?.getInputType
              ? component?.config?.getInputType(formState)
              : component?.type
          "
          :config="componentProp"
          v-model="formState[component?.config.valueIdKey || id || '']"
          :is-edit-state="isEditState"
          :id="id"
        >
          <template v-for="(list, key) of childrenGroup" #[key]>
            <lr-c-schema-item v-for="item of list" :key="item.id" v-bind="item" :not-col="true" />
          </template>
        </lr-c-input>
        <lr-button v-bind="componentProp.buttonConfig" />
      </a-space-compact>
      <component
        v-else-if="componentProp.h"
        :is="
          componentProp.h({
            config: componentProp,
            formData: formState,
            id,
          })
        "
      />
      <lr-c-input
        v-else
        @change="hanldChange"
        :type="
          component?.config?.getInputType
            ? component?.config?.getInputType(formState)
            : component?.type
        "
        :config="componentProp"
        v-model="formState[component?.config.valueIdKey || id || '']"
        :is-edit-state="isEditState"
        :id="id"
        ref="componentRef"
      >
        <template v-for="(list, key) of childrenGroup" #[key]>
          <lr-c-schema-item v-for="item of list" :key="item.id" v-bind="item" :not-col="true" />
        </template>
      </lr-c-input>
    </a-form-item>

    <a-card
      v-else-if="component.type == 'card'"
      :title="$t(componentProp.notLabel ? '' : componentProp.label || '')"
      :class="componentProp.myclass"
      style="margin-bottom: 8px"
    >
      <a-row :gutter="gutter">
        <lr-c-schema-item
          v-for="item of childrenGroup.default || []"
          :key="item.id"
          v-bind="item"
          :span="componentProp.span || span"
          :label-span="componentProp.labelSpan || labelSpan"
          :label-width="componentProp.labelWidth || labelWidth"
        />
      </a-row>
    </a-card>

    <a-tabs
      v-else-if="component.type == 'tabs'"
      v-bind="componentProp"
      :type="componentProp.type || 'card'"
      :class="{ isFixed: isAutoWindow }"
      v-model:active-key="formState[id || '']"
    >
      <template v-for="item of componentProp.groups" :key="item.i">
        <a-tab-pane
          :key="item.i"
          :tab="item.label"
          v-if="item.display !== false"
          :force-render="componentProp.forceRender"
        >
          <a-row :gutter="gutter">
            <lr-c-schema-item
              v-for="tabPaneItem of childrenGroup[item.i] || []"
              :key="tabPaneItem.id"
              v-bind="tabPaneItem"
              :span="item.span || componentProp.span || span"
              :label-span="item.labelSpan || componentProp.labelSpan || labelSpan"
              :label-width="item.labelWidth || componentProp.labelWidth || labelWidth"
            />
          </a-row>
        </a-tab-pane>
      </template>
    </a-tabs>

    <a-collapse
      v-else-if="component.type == 'collapse'"
      v-bind="componentProp"
      v-model:active-key="formState[id || '']"
    >
      <template v-for="item of componentProp.groups" :key="item.i">
        <a-collapse-panel :key="item.i" :header="item.label" v-if="item.display !== false">
          <a-row :gutter="gutter">
            <lr-c-schema-item
              v-for="tabPaneItem of childrenGroup[item.i] || []"
              :key="tabPaneItem.id"
              v-bind="tabPaneItem"
              :span="item.span || componentProp.span || span"
              :label-span="item.labelSpan || componentProp.labelSpan || labelSpan"
              :label-width="item.labelWidth || componentProp.labelWidth || labelWidth"
            />
          </a-row>
        </a-collapse-panel>
      </template>
    </a-collapse>

    <template v-else-if="component.type == 'gridtable'">
      <a-typography-title :level="5" v-if="componentProp.label && !componentProp.notLabel"
        ><span v-if="isRequired" style="margin-left: 4px; color: var(--color-error)">*</span
        >{{ $t(componentProp.label || '') }}</a-typography-title
      >
      <lr-table
        ref="tableRef"
        :id="id"
        :required="isRequired"
        :edit-config="componentProp"
        :columns="tableColumns"
        :data-source="formState[id || '']"
        :height="componentProp.height || 'notset'"
        :is-tree="componentProp.isTree"
        :pid-key="componentProp.pidKey"
        :id-key="componentProp.idKey"
        :merge-cells="tableMergeCells"
        :is-sortable="componentProp.isSortable"
        :is-multi-select="componentProp.isMultiSelect"
        :multi-select-key="componentProp.multiSelectKey"
        :row-style="componentProp.rowStyle"
        @change="hanldChange"
        @row-change="handleRowChange"
        @current-change="handleCurrentRowChange"
        @component-click="handleClick"
        @row-click="handleRowClick"
        @row-mouse-enter="handleRowMouseEnter"
        @row-mouse-leave="handleRowMouseLeave"
        :default-expand-all="true"
        :min-height="0"
        :is-edit-table="true"
        :table-drawer-title="
          componentProp.label && !componentProp.notLabel ? componentProp.label : ''
        "
        :show-summary="componentProp.showSummary"
        border-type="full"
        style="margin-bottom: 8px"
      >
        <lr-table-buttons
          :list="componentProp.tableButtons"
          :set-button="componentProp.setButton"
          :max-btns="componentProp.maxTableButtons"
        />
      </lr-table>
    </template>

    <template v-else-if="component.type == 'viewtable'">
      <a-typography-title :level="5" v-if="componentProp.label && !componentProp.notLabel">{{
        $t(componentProp.label || '')
      }}</a-typography-title>
      <lr-table
        :is-show-num="componentProp.isShowNum"
        :columns="tableColumns"
        :data-source="formState[id || '']"
        height="notset"
      />
    </template>

    <lr-hpanel v-else-if="component.type == 'hpanel'">
      <template v-for="(list, key) of childrenGroup" :key="key" #[key]>
        <a-row :gutter="gutter">
          <lr-c-schema-item
            v-for="item of list"
            :key="item.id"
            v-bind="item"
            :span="componentProp.span || span"
            :label-span="componentProp.labelSpan || labelSpan"
            :label-width="componentProp.labelWidth || labelWidth"
          />
        </a-row>
      </template>
    </lr-hpanel>

    <lr-input-cards
      v-else-if="component.type == 'inputCards'"
      v-model:value="formState[id || '']"
      :columns="tableColumns"
      :gutter="gutter"
      :span="componentProp.span || span"
      :label-span="componentProp.labelSpan || labelSpan"
      :label-width="componentProp.labelWidth || labelWidth"
      :is-add-btn="componentProp.isAddBtn"
      :is-remove-btn="componentProp.isRemoveBtn"
      :add-btn-text="componentProp.addBtnText"
      :must-has="componentProp.mustHas"
      :id="id"
      :readonly="componentProp.readonly || componentProp.disabled"
      @change="hanldChange"
      @row-change="handleRowChange"
      ref="tableRef"
    />

    <lr-input-rows
      v-else-if="component.type == 'inputRows'"
      v-model:value="formState[id || '']"
      :columns="tableColumns"
      :is-add-btn="componentProp.isAddBtn"
      :is-remove-btn="componentProp.isRemoveBtn"
      :add-btn-text="componentProp.addBtnText"
      :must-has="componentProp.mustHas"
      :show-num="componentProp.showNum"
      :show-char="componentProp.showChar"
      :id="id"
      :readonly="componentProp.readonly || componentProp.disabled"
      :drag="componentProp.drag === false ? false : true"
      :is-compact="componentProp.isCompact"
      :get-buttons="componentProp.getButtons"
      @change="hanldChange"
      @row-change="handleRowChange"
      ref="tableRef"
    />

    <lr-input-layer-rows
      v-else-if="component.type == 'inputLayerRows'"
      v-model:value="formState[id || '']"
      :columns="tableColumns"
      :is-add-btn="componentProp.isAddBtn"
      :is-remove-btn="componentProp.isRemoveBtn"
      :add-btn-text="componentProp.addBtnText"
      :must-has="componentProp.mustHas"
      :show-num="componentProp.showNum"
      :show-char="componentProp.showChar"
      :id="id"
      :readonly="componentProp.readonly || componentProp.disabled"
      :drag="componentProp.drag === false ? false : true"
      :type="componentProp.type"
      :btn-text="componentProp.btnText"
      :title="componentProp.title"
      :size="componentProp.size"
      :layer-type="componentProp.layerType"
      :width="componentProp.width"
      :height="componentProp.height"
      @change="hanldChange"
      @row-change="handleRowChange"
      ref="tableRef"
    />

    <a-form-item
      v-else-if="componentName != '' && componentProp.isNeedLabel"
      :label-col="{
        span: componentProp.labelSpan || labelSpan,
        style: { width: myLabelWidth },
      }"
      :label="$t(componentProp.label || '')"
      :extra="componentProp.labelExtra"
    >
      <component
        :is="componentName"
        v-bind="componentProp"
        :param-filed="formState[componentProp.paramFiled || '']"
        @click="handleClick"
        ref="componentRef"
      >
        <template v-for="(list, key) of childrenGroup" #[key]="scope">
          <template v-if="componentProp.notCol !== true">
            <a-row :key="key" :gutter="gutter">
              <lr-c-schema-item
                v-for="item of list"
                :key="item.id"
                v-bind="item"
                :span="scope?.span || componentProp.span || span"
                :label-span="scope?.labelSpan || componentProp.labelSpan || labelSpan"
                :label-width="scope?.labelWidth || componentProp.labelWidth || labelWidth"
              />
            </a-row>
          </template>
          <template v-else>
            <lr-c-schema-item v-for="item of list" :key="item.id" v-bind="item" :not-col="true" />
          </template>
        </template>
      </component>
    </a-form-item>
    <component
      v-else-if="componentName != ''"
      :is="componentName"
      v-bind="componentProp"
      :param-filed="formState[componentProp.paramFiled || '']"
      @click="handleClick"
      ref="componentRef"
    >
      <template v-for="(list, key) of childrenGroup" #[key]="scope">
        <template v-if="componentProp.notCol !== true">
          <a-row :key="key" :gutter="gutter">
            <lr-c-schema-item
              v-for="item of list"
              :key="item.id"
              v-bind="item"
              :span="scope?.span || componentProp.span || span"
              :label-span="scope?.labelSpan || componentProp.labelSpan || labelSpan"
              :label-width="scope?.labelWidth || componentProp.labelWidth || labelWidth"
            />
          </a-row>
        </template>
        <template v-else>
          <lr-c-schema-item v-for="item of list" :key="item.id" v-bind="item" :not-col="true" />
        </template>
      </template>
    </component>
  </a-col>
  <lr-c-input
    v-else-if="isFormItem(id)"
    @change="hanldChange"
    :type="component?.getInputType ? component?.getInputType(formState) : component?.type"
    :config="componentProp"
    v-model="formState[component?.config.valueIdKey || id || '']"
    :is-edit-state="isEditState"
    :id="id"
  />
  <div class="lr-block" v-else-if="component.type == 'gridtable'">
    <lr-table
      ref="tableRef"
      :id="id"
      :edit-config="componentProp"
      :columns="tableColumns"
      :data-source="formState[id || '']"
      :is-multi-select="componentProp.isMultiSelect"
      :multi-select-key="componentProp.multiSelectKey"
      border-type="full"
      :height="componentProp.height || 'notset'"
      :min-height="0"
      :is-edit-table="true"
      @change="hanldChange"
      @row-change="handleRowChange"
      @current-change="handleCurrentRowChange"
      @component-click="handleClick"
    />
  </div>
  <lr-layout v-else-if="component.type == 'layout'" v-bind="componentProp">
    <template v-for="(list, key) of childrenGroup" :key="key" #[key]>
      <template v-if="componentProp.autoSize && componentProp.autoSize.includes(key)">
        <lr-c-schema-item
          v-for="item of list"
          :key="item.id"
          v-bind="item"
          :span="componentProp.span || span"
          :label-span="componentProp.labelSpan || labelSpan"
          :label-width="componentProp.labelWidth || labelWidth"
          :not-col="true"
        />
      </template>
      <a-row v-else :gutter="gutter" style="margin: 0">
        <lr-c-schema-item
          v-for="item of list"
          :key="item.id"
          v-bind="item"
          :span="componentProp.span || span"
          :label-span="componentProp.labelSpan || labelSpan"
          :label-width="componentProp.labelWidth || labelWidth"
        />
      </a-row>
    </template>
  </lr-layout>
  <component
    v-else
    :is="componentName"
    v-bind="componentProp"
    :param-filed="formState[componentProp.paramFiled || '']"
    @click="handleClick"
  >
    <template v-for="(list, key) of childrenGroup" #[key]>
      <lr-c-schema-item v-for="item of list" :key="item.id" v-bind="item" :not-col="true" />
    </template>
  </component>
</template>

<script lang="ts" setup>
  import type { SchemaRuntimeConfig } from './interface';

  import { PropType, computed, inject, ref, onMounted } from 'vue';
  import { createNamespace } from '../utils/components';
  import { deepClone } from '../utils/method';
  import { toTree } from '../utils/tree';

  defineOptions({ name: createNamespace('cSchemaItem').name });

  const props = defineProps({
    /**
     * @zh id
     */
    id: String as PropType<string>,
    /**
     * @zh 子集
     */
    children: {
      type: Array as PropType<SchemaRuntimeConfig[]>,
      default: () => [],
    },
    /**
     * @zh 行所占比例
     */
    span: Number,
    /**
     * @zh 标签所占比例
     */
    labelSpan: Number,
    /**
     * @zh 标签所占宽度
     */
    labelWidth: [String, Number],
    /**
     * @zh 不需要col标签
     */
    notCol: Boolean,
  });

  // 获取注入的方法
  const {
    components,
    rules,
    errorFields,
    formState,
    isGridtable,
    isFormItem,
    isAutoWindow,
    componentClick,
    rowMouseEvent,
    gutter,
    isEditState,
    valueChange,
    lowerCtrlTab,
  } = inject('jcode_form_provide', {} as Record<string, any>);

  const errorHelp = computed(() => {
    const errorField = errorFields.value[props.id || ''];
    if (errorField) {
      return errorField.msg;
    }
    return '';
  });

  const { id, children } = props;

  const component = computed(() => components && components[id || '']);
  const getComponentProp = (_component: Record<string, any>) => {
    const config = { ..._component?.config };
    if (config.getUpConfig) {
      const _config = config.getUpConfig({
        formData: formState,
        config,
      });
      if (_config) {
        Object.keys(_config).forEach((key) => {
          config[key] = _config[key];
        });
      }
    }
    if (_component?.type === 'lr-input-coderule') {
      if (config.isCondition) {
        if (config.relationField) {
          config.relationValue = formState[config.relationField];
        }
      }
      if (config.codeIdKey) {
        config.codeKey = formState[config.codeIdKey || ''];
      }
    }
    // tab选项卡关联组件
    if (_component?.type === 'tabs') {
      if (config.tabKey) {
        if (config.options && config.options.length > 0) {
          const groups = deepClone(config.groups);
          config.options.forEach((item: any) => {
            const t2 = groups.find((t: any) => t.i === item.label);
            if (item.value === formState[config.tabKey]) {
              t2.display = !!item.display;
            } else {
              t2.display = !item.display;
            }
          });
          config.groups = groups;
        }
      }
    }
    return config;
  };
  const componentProp = computed(() => getComponentProp(component.value));

  const isRequired = computed(() => {
    const ruleList = rules[id || ''] || [];
    if (ruleList.findIndex((rule: any) => rule.required) > -1) {
      return true;
    }

    return false;
  });

  const myLabelWidth = computed(() => {
    if (componentProp.value.notLabel) {
      return '0px';
    }
    const labelWidth = componentProp.value.labelWidth || props.labelWidth;

    if (typeof labelWidth === 'string') {
      return labelWidth;
    }

    if (typeof labelWidth === 'number') {
      return labelWidth + 'px';
    }

    return labelWidth;
  });

  /**
   * 组件对照表
   */
  const componentName = computed(() => {
    let name = '';
    const { type } = component.value || {};
    if (['button', 'buttons'].includes(type)) {
      name = `lr-${type}`;
    } else if (type === 'layerLayout') {
      name = 'lr-layer-layout';
    } else {
      name = type;
    }
    return name;
  });

  // 需要根据插槽做归类
  const childrenGroup = computed(() => {
    const res: Record<string, SchemaRuntimeConfig[]> = {};
    children?.forEach((item) => {
      if (item.slot) {
        res[item.slot] = res[item.slot] || [];
        res[item.slot].push(item);
      } else if (component.value.type !== 'tabs') {
        res.default = res.default || [];
        res.default.push(item);
      }
    });
    return res;
  });

  const handleClick = (even: any) => {
    componentProp.value.click && componentProp.value.click(even);
    componentClick && componentClick(id, even);
  };

  const handleRowClick = (even: any) => {
    componentProp.value.rowClick && componentProp.value.rowClick(even);
    componentClick && componentClick(id, even);
  };

  const handleRowMouseEnter = (even: any) => {
    rowMouseEvent && rowMouseEvent(id, { ...even, isEnter: true });
  };
  const handleRowMouseLeave = (even: any) => {
    rowMouseEvent && rowMouseEvent(id, { ...even, isLeave: true });
  };

  const hanldChange = (params: {
    value: any;
    data?: any;
    row?: any;
    index?: number;
    tableData?: Record<string, any>[];
    col?: Record<string, any>;
    type?: string;
  }) => {
    if (component.value.type === 'inputLayer' || component.value.type === 'buttonLayer') {
      if (params.data) {
        componentProp.value.columns.forEach((col: any) => {
          if (col.valueKey && col.prop) {
            if (component.value.config?.isMultiSelect) {
              formState[col.valueKey] = params.data.map((item: any) => item[col.prop]).join(',');
            } else {
              formState[col.valueKey] = params.data[col.prop];
            }
          }
        });
      }
    } else if (component.value.type === 'select') {
      if (params.data && componentProp.value.assignment?.length) {
        componentProp.value.assignment.forEach((item: any) => {
          if (item.valueKey && item.prop) {
            formState[item.valueKey] = params.data[item.prop];
          }
        });
      }
    } else if (component.value.type === 'gridtable') {
      if (params.col?.inputType === 'inputLayer' && params.data) {
        params.col.config.columns.forEach((col: any) => {
          if (col.valueKey && col.prop && params.tableData) {
            const valueKey = col.valueKey.replace(`${component.value.config.table}.`, '');
            if (params.col?.config?.isMultiSelect) {
              params.tableData[params.index || 0][valueKey] = params.data
                .map((item: any) => item[col.prop])
                .join(',');
            } else {
              params.tableData[params.index || 0][valueKey] = params.data[col.prop];
            }
          }
        });
      } else if (params.col?.inputType === 'select') {
        if (params.col?.config?.assignment?.length && params.tableData) {
          params.col?.config?.assignment.forEach((item: any) => {
            if (item.valueKey && item.prop) {
              if (formState[item.valueKey]) {
                formState[item.valueKey] = params.data?.[item.prop] || undefined;
              } else {
                params.tableData[params.index || 0][item.valueKey] =
                  params.data?.[item.prop] || undefined;
              }
            }
          });
        }
      }
    }

    // 选项卡active处理
    if (props.id && lowerCtrlTab[props.id]) {
      setTabActive();
    }

    // 针对子表
    // list：   整个表数据
    // index:   行号
    // type:    add 添加 updete 更新 dēlete 删除
    if (componentProp.value.change) {
      componentProp.value.change(params);
    }

    if (errorFields.value[props.id || '']) {
      delete errorFields.value[props.id || ''];
    }

    valueChange(componentProp.value.valueIdKey || id, params);
  };

  const setTabActive = () => {
    const ids = lowerCtrlTab[props.id || ''];
    ids.forEach((id: any) => {
      const component = components[id];
      const active = formState[id];
      const { config } = component;
      if (config.options && config.options.length > 0) {
        const groups = deepClone(config.groups);
        config.options.forEach((item: any) => {
          const t2 = groups.find((t: any) => t.i === item.label);
          if (item.value === formState[config.tabKey]) {
            t2.display = !!item.display;
          } else {
            t2.display = !item.display;
          }
        });
        if (groups.find((t: any) => t.i === active)?.display === false) {
          for (let j = 0; j < groups.length; j++) {
            if (groups[j].display !== false) {
              formState[id] = groups[j].i;
              break;
            }
          }
        }
      }
    });
  };

  // 子表方法
  const tableRef = ref();

  const tableColumnProp = [
    'label',
    'width',
    'minWidth',
    'fixed',
    'resizable',
    'align',
    'headerAlign',
    'isNotAutoWrap',
    'sortable',
    'isSummary',
    'required',
    // 'isKeyword',
    'isFilter',
    'isInputType',
    'getInputType',
    'field',
    'notShowColLabel',
  ];
  const getTableColumns = (
    tableComponet: Record<string, any>,
    tableChildren: SchemaRuntimeConfig[],
  ) => {
    let columns = tableChildren?.map((t: any) => {
      const colComponent = components[t.id];
      const config: Record<string, any> = {};
      const ids = t.id.split('.');
      const res: Record<string, any> = {
        prop: ids.length > 1 ? ids[ids.length - 1] : t.id,
        inputType: colComponent.type,
        config,
        rule: rules[t.id || ''],
        isNotAutoWrap: false,
      };

      if (t.children && t.children.length > 0) {
        if (colComponent.type === 'gridtable') {
          res.children = getTableColumns(colComponent, t.children);
        } else {
          res.children = t.children;
        }
      }

      if (colComponent.config) {
        Object.keys(colComponent.config).forEach((key) => {
          if (tableColumnProp.includes(key)) {
            res[key] = colComponent.config[key];
          } else {
            res.config[key] = colComponent.config[key];
          }
        });

        if (tableComponet.type === 'gridtable') {
          const _componentProp = getComponentProp(tableComponet);
          if (_componentProp.hiddenCols) {
            if (_componentProp.hiddenCols.includes(res.id)) {
              res.isHidden = true;
            } else {
              res.isHidden = colComponent.config.display === false;
            }
          } else {
            res.isHidden = colComponent.config.display === false;
          }
        }
      }
      return res;
    });
    if (tableComponet.type === 'gridtable' && tableComponet.config?.mergeHeader) {
      const cols: any[] = [];
      tableComponet.config.mergeHeader.forEach((t: any) => {
        if (t.value) {
          cols.push({
            label: t.label,
            props: t.value.split(','),
            prop: t.prop,
            align: t.align,
            headerAlign: t.headerAlign,
          });
        }
      });
      cols.push(...columns);
      tableComponet.config.mergeHeader.forEach((t: any) => {
        if (t.value) {
          const values = t.value.split(',');
          values.forEach((v: any) => {
            const col = cols.find((t: any) => t.prop === v);
            if (col) {
              col.pid = t.prop;
            }
          });
        }
      });
      columns = toTree(cols, 'prop', 'pid');
    }
    return columns;
  };
  const tableColumns = computed(() => getTableColumns(component.value, children));

  const tableMergeCells = computed(() => {
    if (!(componentProp.value.isRowMerge && componentProp.value.isRowFixed)) return [];
    if (children) {
      const margecells: Record<string, any>[] = [];
      const mergeRows: Record<string, any>[] = componentProp.value.mergeRows || [];
      mergeRows.forEach((item: Record<string, any>) => {
        const col = children.findIndex((col) => col.id === item.col);
        if (col !== -1) {
          margecells.push({
            row: item.row1 - 1,
            col: col + 1,
            rowspan: item.row2 - item.row1 + 1,
            colspan: 1,
          });
        }
      });
      return margecells;
    }
    return [];
  });

  const handleRowChange = (data: {
    value: any;
    data: Record<string, any> | Record<string, any>[];
    index: number;
    row: any;
    col: Record<string, any>;
    tableData: Record<string, any>[];
    type: string;
  }) => {
    hanldChange(data);
    if (componentProp.value.rowChange) {
      componentProp.value.rowChange(data);
    }
  };

  const handleCurrentRowChange = (data: any) => {
    if (componentProp.value.currentRowChange) {
      componentProp.value.currentRowChange(data);
    }
  };

  const componentRef = ref();

  let attempts = 0;
  const maxAttempts = 5;
  onMounted(() => {
    if (isGridtable(id)) {
      component.value.$ref = tableRef.value;
    } else if (componentName.value !== '' && componentProp.value.hasRef) {
      attempts = 0;
      setComponentRef();
    }
  });
  const setComponentRef = () => {
    if (componentRef.value) {
      component.value.$ref = componentRef.value;
    } else if (attempts < maxAttempts) {
      attempts++;
      setTimeout(setComponentRef, 100);
    }
  };
</script>
<style lang="less">
  @import './cSchemaForm';
</style>
../utils/useFramework
