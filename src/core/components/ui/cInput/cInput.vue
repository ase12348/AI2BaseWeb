<template>
  <a-switch
    v-if="type === 'switch'"
    v-bind="inputCofig"
    @change="hanldChange"
    v-model:checked="value"
  >
    <template #checkedChildren>
      <lr-icon
        v-if="inputCofig.activeIconClass"
        :icon="inputCofig.activeIconClass"
        :is-div="false"
      />
      <span v-if="inputCofig.checkedChildren">{{ inputCofig.checkedChildren }}</span>
    </template>
    <template #unCheckedChildren>
      <lr-icon
        v-if="inputCofig.inactiveIconClass"
        :icon="inputCofig.inactiveIconClass"
        :is-div="false"
      />
      <span v-if="inputCofig.unCheckedChildren">{{ inputCofig.unCheckedChildren }}</span>
    </template>
  </a-switch>
  <lr-barcode
    v-else-if="type === 'qrcode'"
    :style="{ height: `${inputCofig.size}px` }"
    v-bind="inputCofig"
    format="qr"
    :value="value"
  />
  <lr-barcode
    v-else-if="type === 'barcode'"
    :style="{ height: `${inputCofig.height}px` }"
    v-bind="inputCofig"
    :value="value"
  />
  <lr-button v-else-if="type === 'lr-button'" v-bind="inputCofig" @click="handleClick" />
  <component
    v-else-if="type.indexOf('lr-input') > -1"
    :is="type"
    v-bind="inputCofig"
    :placeholder="
      placeholder
        ? isArray(placeholder)
          ? [$t(placeholder[0] || ''), $t(placeholder[1] || '')]
          : $t(placeholder)
        : undefined
    "
    :is-edit-state="isEditState"
    v-model="value"
    @change="hanldChange"
  />
  <component
    v-else
    style="width: 100%"
    :is="inputName"
    v-model:value="value"
    v-bind="inputCofig"
    :options="type == 'treeSelect' ? undefined : options"
    :tree-data="type == 'treeSelect' ? options : undefined"
    :placeholder="
      placeholder
        ? isArray(placeholder)
          ? [$t(placeholder[0] || ''), $t(placeholder[1] || '')]
          : $t(placeholder)
        : undefined
    "
    :table-index="tableIndex"
    :is-edit-state="isEditState"
    ref="componentRef"
    @change="hanldChange"
  >
    <template v-if="preIcon.name" #prefix>
      <lr-icon v-bind="preIcon" :icon="preIcon.name" />
    </template>
    <template v-if="sufIcon.name" #suffix>
      <lr-icon v-bind="sufIcon" :icon="sufIcon.name" />
    </template>
    <template v-if="hasSlotAddonAfter" #addonAfter>
      <slot name="addonAfter"></slot>
    </template>
  </component>
</template>

<script lang="ts" setup>
  import { PropType, computed, ref, unref, nextTick, inject, useSlots } from 'vue';
  import { createNamespace } from '../utils/components';
  import { isArray, isNullOrEmpty, isNumber, isString } from '../utils/is';
  import { deepClone, paginationEx } from '../utils/method';
  import { useFramework } from '../utils/useFramework';

  defineOptions({ name: createNamespace('cInput').name });

  const props = defineProps({
    /**
     * @zh id 组件id
     */
    id: String,
    /**
     * @zh 输入值
     * @vModel
     */
    modelValue: {
      type: [String, Number, Boolean, Array, Object] as PropType<
        string | number | boolean | any[] | Record<string, any>
      >,
      default: undefined,
    },
    /**
     * @zh 输入类型,或者lr-input开头的组件名称
     */
    type: {
      type: String as PropType<
        | 'input'
        | 'autoComplete'
        | 'password'
        | 'textarea'
        | 'select'
        | 'selectMultiple'
        | 'treeSelect'
        | 'radio'
        | 'checkbox'
        | 'switch'
        | 'date'
        | 'dateRange'
        | 'time'
        | 'timeRange'
        | 'slider'
        | 'sliderCaptcha'
        | 'rate'
        | 'number'
        | 'segmented'
        | 'cascader'
        | 'count'
        | 'codeMirror'
        | 'inputColor'
        | 'inputCount'
        | 'inputLayer'
        | 'inputMap'
        | 'upload'
        | 'uploadimg'
        | 'guid'
        | 'createTime'
        | 'modifyTime'
        | 'qrcode'
        | 'barcode'
        | 'inputCode'
        | 'inputTag'
        | 'cascaderSelect'
        | 'buttonLayer'
        | 'lr-button'
        | string
      >,
      default: 'input',
    },
    /**
     * @zh 配置,可以查看对应组件的配置antd。
     */
    config: {
      type: Object as PropType<Record<string, any>>,
    },
    /**
     * @zh 子表的行下标
     */
    tableIndex: {
      type: Number,
    },
    /**
     * @zh 是否编辑状态（相对于新建）
     */
    isEditState: Boolean,
  });

  const emit = defineEmits({
    'update:modelValue': (
      value: string | number | boolean | any[] | Record<string, any> | undefined,
    ) => true,
    /**
     * @zh 数据改变是触发
     */
    change: (event: {
      value: string | number | boolean | any[] | Record<string, any> | undefined;
      data?: any;
    }) => true,
    /**
     * @zh 按钮点击事件
     */
    click: () => true,
  });

  const slots = useSlots();

  const {
    getCompanyTree,
    getCompanyList,

    getDataItemOptions,
    getDataItemList,
    loadDataItemList,
    loadClassifyList,
    getClassifysOptions,

    getDbSourceList,
    loadDbSourceList,
    getDbSourceOptions,
    getDbSourceKey,

    fetchDbSourceList, // 加载数据源，无缓存
    fetchDbSourcePages, // 加载数据源分页数据

    loadDepartmentList,
    getDepartmentList,
    getDepartmentTree,

    getLabel,
  } = useFramework({});

  const { isPreview, useDataRes, formState, components } = inject(
    'jcode_form_provide',
    {} as Record<string, any>,
  );

  const getParentRowParamValue = (id: string, data: Record<string, any>) => {
    if (Object.prototype.hasOwnProperty.call(data, id)) {
      return data[id];
    }

    if (data.parentRow) {
      return getParentRowParamValue(id, data.parentRow);
    }

    const component = components[id];
    if (component && component.config?.field) {
      return getParentRowParamValue(component.config?.field, data);
    }

    return undefined;
  };
  const getParamValue = (id: string) => {
    if (!id) {
      return undefined;
    }
    if (formState && Object.prototype.hasOwnProperty.call(formState, id)) {
      return formState[id];
    }
    return getParentRowParamValue(id, props.config?.row || {});
  };

  const hasSlotAddonAfter = computed(() => slots.addonAfter);

  const optionsRef = props.config?.loadOptions ? props.config?.loadOptions() : ref([]);

  const isNeedLoadDataItem = [
    'select',
    'selectMultiple',
    'radio',
    'treeSelect',
    'checkbox',
    'autoComplete',
    'inputTag',
    'cascaderSelect',
  ];
  const isMultiple = computed(() => {
    if (['select', 'selectMultiple', 'treeSelect', 'checkbox'].includes(props.type)) {
      const config = { ...(props.config || {}) };
      if (
        (props.type === 'select' && config.mode !== 'multiple') ||
        (props.type === 'treeSelect' && !config.multiple)
      ) {
        return false;
      }
      return true;
    }
    return false;
  });
  const isNotStringValue = computed(
    () =>
      [
        'switch',
        'slider',
        'sliderCaptcha',
        'lr-input-search-config',
        'lr-input-wf-title',
        'dateRange',
        'rate',
        'secretLevel',
      ].includes(props.type) || props.config?.isNotString,
  );

  const value = computed({
    get() {
      if (props.type === 'timeRange') {
        // @ts-ignore
        return props.modelValue ? props.modelValue.split(' - ') : ['', ''];
      }
      if (props.type === 'dateRange') {
        // @ts-ignore
        return props.modelValue ? props.modelValue.split(',') : ['', ''];
      }

      if (isMultiple.value) {
        const myOptions = options.value; // props.config?.options
        if (myOptions && myOptions.length > 0 && isNumber(myOptions[0].value)) {
          // @ts-ignore
          return props.modelValue ? props.modelValue.split(',').map(Number) : [];
        }
        // @ts-ignore
        return props.modelValue ? props.modelValue.split(',') : [];
      }

      if (props.type === 'switch') {
        if (isString(props.modelValue)) {
          return Number(props.modelValue);
        }
      }

      if (isNullOrEmpty(props.modelValue) || props.config?.isNumber || isNotStringValue.value) {
        return props.modelValue;
      }

      const myOptions = options.value; // props.config?.options
      if (myOptions && myOptions.length > 0 && isNumber(myOptions[0].value)) {
        return !isNaN(Number(props.modelValue)) ? Number(props.modelValue) : props.modelValue;
      }

      return props.modelValue + '';
    },
    set(value: any) {
      if (props.type === 'timeRange' && value) {
        value = `${value[0]} - ${value[1]}`;
      }
      if (props.type === 'dateRange' && value) {
        value = `${value[0]},${value[1]}`;
      }

      if (value && isMultiple.value) {
        // @ts-ignore
        value = String(value || []);
      }

      if (!isNullOrEmpty(value) && props.config?.isNumber) {
        value = Number(value);
      }

      emit('update:modelValue', value);
    },
  });

  const preIcon = computed(() => ({ ...(props.config?.preIcon || {}) }));
  const sufIcon = computed(() => ({ ...(props.config?.sufIcon || {}) }));
  const inputDic: Record<string, string> = {
    input: 'a-input',
    inputSearch: 'a-input-search',
    autoComplete: 'a-auto-complete',
    password: 'a-input-password',
    textarea: 'a-textarea',
    select: 'a-select',
    selectMultiple: 'a-select',
    treeSelect: 'a-tree-select',
    radio: 'a-radio-group',
    checkbox: 'a-checkbox-group',
    date: 'a-date-picker',
    dateRange: 'a-range-picker',
    time: 'a-time-picker',
    timeRange: 'a-time-range-picker',
    slider: 'lr-slider',
    sliderCaptcha: 'lr-slider-captcha',
    rate: 'lr-rate',
    number: 'a-input-number',
    segmented: 'a-segmented',
    cascader: 'a-cascader',
    codeMirror: 'lr-code-mirror',
    inputCode: 'lr-input-code',
    inputColor: 'lr-input-color',
    textEditor: 'lr-text-editor',
    count: 'lr-count',
    inputCount: 'lr-input-count',
    inputLayer: 'lr-input-layer',
    inputMap: 'lr-input-map',
    upload: 'lr-upload',
    uploadimg: 'lr-upload',
    guid: 'lr-guid',
    createTime: 'lr-now-time',
    modifyTime: 'lr-now-time',
    inputTag: 'lr-input-tag',
    cascaderSelect: 'lr-cascader-select',
    buttonLayer: 'lr-button-layer',
  };

  const inputName = computed(() => inputDic[props.type] || 'a-input');

  const loadData = async (req: Record<string, any>) => {
    let res = null;
    const code = props.config?.dataCode;
    const type = props.config?.dataType;
    if (!code) {
      return;
    }
    const params: Record<string, any> = deepClone(props.config?.params) || {};

    if (type === 'dataItem') {
      res = await loadDataItemList(code, false);
      if (req.ids) {
        res = res.filter((t: any) => req.ids.split(',').includes(t[inputCofig.value.valueKey]));
      }
    } else if (props.config?.upCtrl) {
      const upValues = getParamValue(props.config?.upCtrl);
      params[props.config?.upKey || 'param'] = upValues;
    }
    if (type === 'dataSource') {
      // 查询条件
      if (props.config?.layerSearchInputList?.length > 0) {
        props.config?.layerSearchInputList.forEach((item: Record<string, any>) => {
          if (!isNullOrEmpty(req[item.id])) {
            params[item.id] = req[item.id];
          }
        });
      }

      if (props.config?.paramList?.length > 0) {
        props.config?.paramList.forEach((item: Record<string, any>) => {
          if (!isNullOrEmpty(item.upId) && !isNullOrEmpty(item.upKey)) {
            params[item.upKey] = getParamValue(item.upId); // formState[item.upId]
          }
        });
      }
    } else if (type === 'dataItem') {
      if (props.config?.isKeyword) {
        if (req.layerKeyword) {
          res = res.filter((t: any) => {
            if (
              t.f_ItemValue.toLowerCase().includes(req.layerKeyword.toLowerCase()) ||
              t.f_ItemName.toLowerCase().includes(req.layerKeyword.toLowerCase())
            ) {
              return true;
            }
            return false;
          });
        }
      }
    }
    req.param = JSON.stringify(params);
    // 是否分页
    if (props.config?.isPage) {
      if (type === 'dataItem') {
        res = paginationEx(req, res);
      } else {
        res = await fetchDbSourcePages(code, req);
      }
    } else if (type === 'dataSource') {
      res = await fetchDbSourceList(code, params);
    }

    return res;
  };

  const getText = (value: any) => getLabel(value, props.config || {});

  const dateFormat = {
    year: 'YYYY',
    month: 'YYYY-MM',
    date: 'YYYY-MM-DD',
    week: 'YYYY-w',
    quarter: 'YYYY-Q',
    dateTime: 'YYYY-MM-DD HH:mm:ss',
  } as Record<string, string>;

  const inputCofig = computed(() => {
    const config = { ...(props.config || {}) };

    if (['select', 'selectMultiple', 'treeSelect'].includes(props.type)) {
      if (config.allowClear !== false) {
        config.allowClear = true;
      }

      if (config.collapseTags) {
        config.maxTagCount = 1;
      }

      if (['select', 'selectMultiple'].includes(props.type)) {
        if (config.dropdownMatchSelectWidth === undefined) {
          config.dropdownMatchSelectWidth = false;
        }
      }

      if (config.showSearch !== false || config.showSearch === true) {
        config.showSearch = true;
        if (['select', 'selectMultiple'].includes(props.type)) {
          config.filterOption = (input: string, option: any) =>
            option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
        }

        if (props.type === 'treeSelect') {
          config.treeNodeFilterProp = 'label';
        }
      }

      if (props.type === 'selectMultiple') {
        config.mode = 'multiple';
      }
    }

    if (props.type === 'switch') {
      if (config.checkedValue === undefined) {
        config.checkedValue = 1;
      } else if (config.checkedValue === 'true') {
        config.checkedValue = true;
      } else if (config.checkedValue === 'false') {
        config.checkedValue = false;
      } else if (Number(config.checkedValue + '').toString() !== 'NaN') {
        config.checkedValue = Number(config.checkedValue);
      }

      // console.log(config.checkedValue,'switch2');

      if (config.unCheckedValue === undefined) {
        config.unCheckedValue = 0;
      } else if (config.unCheckedValue === 'true') {
        config.unCheckedValue = true;
      } else if (config.unCheckedValue === 'false') {
        config.unCheckedValue = false;
      } else if (Number(config.unCheckedValue + '').toString() !== 'NaN') {
        config.unCheckedValue = Number(config.unCheckedValue);
      }
    }

    if (['dateRange', 'date'].includes(props.type)) {
      config.showTime = false;
      config.valueFormat = config.format || dateFormat[config.picker as string] || 'YYYY-MM-DD';
      if (config.picker === 'dateTime') {
        config.picker = 'date';
        config.showTime = true;
      }

      config.format = config.valueFormat;
    }

    if (['timeRange', 'time'].includes(props.type)) {
      config.format = config.format || 'HH:mm:ss';
      config.valueFormat = config.format;
    }

    if (isNeedLoadDataItem.includes(props.type)) {
      if (config.dataType === 'dataItem') {
        loadDataItemList && loadDataItemList(config.dataCode, true);
      } else if (config.dataType === 'dataClassify') {
        loadClassifyList && loadClassifyList();
      }
    }

    if (['buttonLayer', 'inputLayer'].includes(props.type)) {
      // 如果是弹窗需要加加载数据方法
      config.loadLayerData = loadData;
      config.getText = getText;

      if (['inputLayer'].includes(props.type)) {
        config.layerOpenSelectShow = true;
      }

      /*
        if (config.isSaveSelectData !== false) {
          config.isSaveSelectData = true
        }
        */

      // 处理数据源的查询
      if (config.dataType === 'dataSource' && config.layerSearchInputList?.length) {
        const res = config.layerSearchInputList.map((item: Record<string, any>) => {
          const t: Record<string, any> = {
            id: item.id,
            type: item.type,
            config: {
              label: item.label,
              isQuickSearch: item.moreConfig.isQuickSearch,
            },
          };
          if (item.type === 'select') {
            if (item.moreConfig.dataType === 'options') {
              t.config.options = item.moreConfig.options;
            } else if (item.moreConfig.dataType === 'dataItem' && item.moreConfig.dataCode) {
              loadDataItemList && loadDataItemList(item.moreConfig.dataCode, true);
              const options = getDataItemList(item.moreConfig.dataCode) || [];
              t.config.options = options.map((v: Record<string, any>) => ({
                label: v[item.moreConfig.labelKey],
                value: v[item.moreConfig.valueKey],
              }));
            } else if (item.moreConfig.dataType === 'dataSource' && item.moreConfig.dataCode) {
              loadDbSourceList(item.moreConfig.dataCode, {});
              t.config.options = getDbSourceOptions(
                getDbSourceList.value[getDbSourceKey(item.moreConfig.dataCode, {})],
                item.moreConfig.valueKey,
                item.moreConfig.labelKey,
              );
            }
          } else if (item.type === 'date') {
            t.config.picker = item.moreConfig.picker;
            t.config.format = item.moreConfig.format;
          }
          return t;
        });
        config.searchInputList = res;
      } else if (config.dataType === 'dataItem' && config.isKeyword) {
        config.searchInputList = [
          {
            id: 'layerKeyword',
            type: 'input',
            config: {
              placeholder: '请输入关键字',
              isQuickSearch: true,
            },
          },
        ];
      }
    }

    if (props.type === 'uploadimg') {
      config.isUploadImg = true;
    }

    if (props.type === 'modifyTime') {
      config.mode = 'modify';
    }

    if ((props.type === 'upload' || props.type === 'uploadimg') && isPreview) {
      config.isNotApi = true;
    }

    if (props.type !== 'lr-button') {
      delete config.label;
    }
    delete config.defaultValue;
    delete config.row;

    return config;
  });

  const placeholder = computed(() => {
    if (props.config?.placeholder === undefined) {
      if (['input', 'password', 'textarea', 'number'].includes(props.type)) {
        return '请输入';
      }
      if (['select', 'selectMultiple', 'treeSelect'].includes(props.type)) {
        return '请选择';
      }
    }

    if (
      ['timeRange', 'dateRange'].includes(props.type) &&
      !isArray(props.config?.placeholder) &&
      props.config?.startPlaceholder &&
      props.config?.endPlaceholder
    ) {
      return [props.config?.startPlaceholder, props.config?.endPlaceholder];
    }

    return props.config?.placeholder;
  });

  const options = computed(() => {
    if (['buttonLayer', 'inputLayer'].includes(props.type)) {
      return [];
    }

    const config = unref(inputCofig);

    switch (config.dataType) {
      case 'dataItem':
        return getDataItemOptions(
          getDataItemList(config.dataCode),
          config.valueKey,
          config.labelKey,
          '',
          config.filterIds,
        );
      case 'dataClassify':
        return getClassifysOptions(config.valueKey, '', config.filterIds);
      case 'dataSource': {
        const params: Record<string, any> = config.params || {};
        if (config.upCtrl) {
          const upValues = getParamValue(config.upCtrl);
          if (!upValues) {
            return [];
          }
          params[config.upKey || 'param'] = upValues;
        }
        if (config.paramList?.length > 0) {
          config.paramList.forEach((item: Record<string, any>) => {
            if (
              (!isNullOrEmpty(item.upId) || !isNullOrEmpty(item.upValue)) &&
              !isNullOrEmpty(item.upKey)
            ) {
              params[item.upKey] = item.upValue || getParamValue(item.upId); // formState[item.upId]
            }
          });
        }
        loadDbSourceList(config.dataCode, params);

        return getDbSourceOptions(
          getDbSourceList.value[getDbSourceKey(config.dataCode, params)],
          config.valueKey,
          config.labelKey,
          '',
          config.idKey,
          config.pidKey,
        );
      }
      case 'company':
        return getCompanyTree(getCompanyList.value, '', config.dataFilterIds);
      case 'department': {
        const upValues = getParamValue(config.upCtrl);
        if (upValues) {
          loadDepartmentList(upValues);
        }
        return getDepartmentTree(getDepartmentList.value[upValues || ''], '', config.dataFilterIds);
      }
      default:
        if (config.dataType && config.dataType !== 'options' && useDataRes) {
          return useDataRes.getData(config.dataType, config.dataCode, {
            filterIds: config.dataFilterIds,
            valueKey: config.valueKey,
            labelKey: config.labelKey,
            keyword: config.keyword,
            isTree: config.isTree,
            idKey: config.idKey,
            pidKey: config.pidKey,

            notLoad: config.notLoad,
          });
        }
    }

    return unref(config.options || optionsRef || []);
  });

  const hanldChange = (data: any, option: any) => {
    nextTick(() => {
      if (inputName.value.indexOf('lr-') !== -1 || props.type.indexOf('lr-input') !== -1) {
        // 极简搭封装组件
        emit('change', data);
      } else {
        if (['a-radio-group'].includes(inputName.value) && props.modelValue) {
          option = options.value.find((t: any) => t.value === props.modelValue);
        }
        emit('change', { value: props.modelValue, data: option });
      }
    });
  };
  const handleClick = () => {
    emit('click');
  };

  const componentRef = ref();
</script>

<style lang="less">
  @import './cInput';
</style>
