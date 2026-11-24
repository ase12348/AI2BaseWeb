<template>
  <div ref="inputRowsRef" class="lr-input-rows" v-bind="$attrs">
    <template v-if="isCompact">
      <div
        v-for="(row, index) in list"
        :key="row.i"
        style="display: flex; align-items: center; margin-bottom: 8px; gap: 8px"
      >
        <lr-icon
          v-if="drag"
          class="lr-input-rows-drag"
          icon="ant-design:drag-outlined"
          style="cursor: move"
        />
        <a-tag v-if="showNum">{{ index + 1 }}</a-tag>
        <a-tag v-if="showChar">{{ numIndex[index % 26] }}</a-tag>
        <a-space-compact style="flex: 2; width: 0">
          <template v-for="col in columns" :key="col.prop">
            <lr-c-input
              v-if="
                (col.getInputType ? col.getInputType(row, formState, parentRow) : col.inputType) !==
                'layerForm'
              "
              :style="{ width: col.width ? `${col.width}%` : undefined }"
              :type="col.getInputType ? col.getInputType(row, formState, parentRow) : col.inputType"
              :config="getConfig(col.config, index)"
              :table-index="index"
              :id="`${id}.${index}.${col.prop}`"
              v-model="row[col.config.valueIdKey || col.prop]"
              @change="
                hanldChange($event, {
                  index: index,
                  column: col,
                })
              "
            />
          </template>
        </a-space-compact>
        <template v-for="col in columns" :key="col.prop">
          <lr-input-row-layer-form
            v-if="
              (col.getInputType ? col.getInputType(row, formState, parentRow) : col.inputType) ==
              'layerForm'
            "
            v-bind="getConfig(col.config, index)"
            :hanld-change="hanldChange"
            :id="`${id}.${index}.${col.prop}`"
            :index="index"
            :table-data="list"
            :data="row[col.config?.valueIdKey || col.prop]"
            :schema-list="col.children"
            :parent-row="parentRow"
          />
        </template>
        <div v-if="isRemoveBtn && (!mustHas || list.length > 1) && !readonly">
          <lr-button danger type="text" @click="handleRemove(index)">
            <template #icon>
              <lr-icon icon="ant-design:minus-circle-outlined" />
            </template>
          </lr-button>
        </div>
      </div>
    </template>
    <template v-else>
      <a-space v-for="(row, index) in list" :key="row.i + index" style="margin-bottom: 8px">
        <lr-icon
          v-if="drag"
          class="lr-input-rows-drag"
          icon="ant-design:drag-outlined"
          style="cursor: move"
        />
        <a-tag v-if="showNum">{{ index + 1 }}</a-tag>
        <a-tag v-if="showChar">{{ numIndex[index % 26] }}</a-tag>
        <template v-for="col in columns" :key="col.prop">
          <lr-c-input
            v-if="
              (col.getInputType ? col.getInputType(row, formState, parentRow) : col.inputType) !==
                'layerForm' && getConfig(col.config, index).display !== false
            "
            :style="{ width: col.width ? `${col.width}px` : undefined }"
            :type="col.getInputType ? col.getInputType(row, formState, parentRow) : col.inputType"
            :config="getConfig(col.config, index)"
            :table-index="index"
            :id="`${id}.${index}.${col.prop}`"
            v-model="row[col.config?.valueIdKey || col.prop]"
            @change="
              hanldChange($event, {
                index: index,
                column: col,
              })
            "
          />
        </template>
        <template v-for="col in columns" :key="col.prop">
          <lr-input-row-layer-form
            v-if="
              (col.getInputType ? col.getInputType(row, formState, parentRow) : col.inputType) ==
              'layerForm'
            "
            v-bind="getConfig(col.config, index)"
            :hanld-change="hanldChange"
            :id="`${id}.${index}.${col.prop}`"
            :index="index"
            :table-data="list"
            :data="row[col.config?.valueIdKey || col.prop]"
            :schema-list="col.children"
            :parent-row="parentRow"
          />
        </template>
        <lr-button
          v-if="isRemoveBtn && (!mustHas || list.length > 1) && !readonly"
          danger
          type="text"
          @click="handleRemove(index)"
        >
          <template #icon>
            <lr-icon icon="ant-design:minus-circle-outlined" />
          </template>
        </lr-button>
      </a-space>
    </template>
  </div>
  <div
    v-if="!readonly"
    :style="{ 'padding-left': drag ? '24px' : undefined, 'text-align': addBtnAlign }"
  >
    <lr-button
      v-if="isAddBtn"
      type="dashed"
      @click="handleAdd"
      style="display: inline-block; margin-right: 8px"
    >
      <template #icon>
        <lr-icon class="lr-buttons-icon" icon="ant-design:plus-outlined" :is-div="false" />
      </template>
      {{ $t(addBtnText) }}
    </lr-button>
    <lr-buttons
      v-if="getButtons && getButtons(formState).length > 0"
      :list="getButtons(formState)"
    />
  </div>
</template>

<script lang="ts" setup>
  import { PropType, onMounted, watch, ref, inject } from 'vue';
  import { createNamespace } from '../utils/components';
  import { buildUUID, deepClone } from '../utils/method';
  import { isNil, isNullOrEmpty } from '../utils/is';
  import { useFramework } from '../utils/useFramework';
  import { useSortable } from '@/core/hooks/useSortable';

  defineOptions({ name: createNamespace('inputRows').name });

  const props = defineProps({
    /**
     * @zh 组件Id
     */
    id: String,
    /**
     * @zh 输入值
     * @vModel
     */
    value: {
      type: Array as PropType<Record<string, any>[]>,
    },
    /**
     * @zh 列配置
     */
    columns: {
      type: Array as PropType<Record<string, any>[]>,
      default: () => [],
    },
    /**
     * @zh 是否有添加按钮。
     */
    isAddBtn: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 添加按钮的文本
     */
    addBtnText: {
      type: String,
      default: '添加',
    },
    /**
     * @zh 添加按钮对齐方式
     * @values left,center, right
     */
    addBtnAlign: {
      type: String as PropType<'left' | 'center' | 'right'>,
      default: 'left',
    },
    /**
     * @zh 自定义按钮
     */
    getButtons: Function,
    /**
     * @zh 是否有移除按钮。
     */
    isRemoveBtn: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 必须有值
     */
    mustHas: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 是否必填
     */
    required: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 是否只读
     */
    readonly: Boolean,
    /**
     * @zh 父级行数据
     */
    parentRow: Object as PropType<Record<string, any>>,
    /**
     * @zh 是否可拖拽
     */
    drag: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 是否紧凑模式
     */
    isCompact: Boolean,
    /**
     * @zh 是否显示序号
     */
    showNum: Boolean,
    /**
     * @zh 是否显示字母
     */
    showChar: Boolean,
  });

  const emit = defineEmits({
    'update:value': (value: Record<string, any>[]) => true,
    /**
     * @zh 数据改变时触发
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    change: (data: {
      value: any;
      data?: any;
      index?: number;
      tableData?: Record<string, any>[];
      col?: Record<string, any>;
      type?: string;
    }) => true,
    /**
     * @zh 行数据改变
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    rowChange: (data: {
      value: any;
      data: Record<string, any> | Record<string, any>[];
      row: Record<string, any>;
      index: number;
      tableData: Record<string, any>[];
      col: Record<string, any>;
      type: string;
    }) => true,
  });

  const { t } = useFramework({});

  const inputRowsRef = ref();

  const numIndex = [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
  ];

  const list = ref<Record<string, any>[]>([]);
  const hanldChange = (
    changeData: { value: any; data: any },
    data: { column: Record<string, any>; index: number },
  ) => {
    emit('rowChange', {
      value: changeData.value,
      data: changeData.data,
      row: list.value[data.index],
      index: data.index,
      tableData: list.value,
      col: data.column,
      type: 'update',
    });
  };

  const handleAdd = () => {
    const row: Record<string, any> = { i: buildUUID() };
    props.columns.forEach((col) => {
      row[col.prop] = deepClone(col.config?.defaultValue);
    });
    list.value.push(row);

    emit('change', {
      value: row,
      data: row,
      index: list.value.length - 1,
      tableData: list.value,
      type: 'add',
    });
  };

  const handleRemove = (index: number) => {
    const row = list.value[index];
    list.value.splice(index, 1);
    emit('change', { value: row, data: row, index, tableData: list.value, type: 'delete' });
  };

  const pValidate = () => {
    const res = {
      isOk: true,
      info: '',
    };
    if (props.required) {
      if (list.value.length === 0) {
        res.isOk = false;
        res.info = '请添加表格数据';
        return res;
      }
    }
    const rowLen = list.value.length;
    const unrefColumns = props.columns;
    const colLen = unrefColumns.length;

    for (let colIndex = 0; colIndex < colLen; colIndex++) {
      const col = unrefColumns[colIndex];
      if (col.rule && col.rule.length > 0) {
        for (let rowIndex = 0; rowIndex < rowLen; rowIndex++) {
          const row = list.value[rowIndex];
          const patternLen = col.rule.length;
          for (let i = 0; i < patternLen; i++) {
            const ruleItem = col.rule[i];
            if (
              ruleItem.pattern &&
              !isNullOrEmpty(row[col.prop || '']) &&
              !new RegExp(ruleItem.pattern.substring(1, ruleItem.pattern.length - 1)).test(
                row[col.prop || ''],
              )
            ) {
              res.info = `${t('第')}${rowIndex + 1}${t('行')}，${t('第')}${colIndex + 1}${t('列')}，${t(
                col.label,
              )}${t(ruleItem.message)}`;
              res.isOk = false;
              return res;
            }

            if (ruleItem.required && isNullOrEmpty(row[col.prop || ''])) {
              res.isOk = false;
              res.info = `${t('第')}${rowIndex + 1}${t('行')}，${t('第')}${colIndex + 1}${t('列')}，${t(
                col.label,
              )}${t('不能为空')}`;
              return res;
            }
          }
        }
      }
    }
    return res;
  };

  if (props.value) {
    list.value = props.value || [];
  } else {
    emit('update:value', list.value);
  }

  watch(
    () => props.value,
    (value) => {
      list.value = props.value || [];
      list.value = value || [];
      list.value.forEach((row) => {
        if (!row.i) {
          row.i = buildUUID();
        }
      });
    },
    { deep: true },
  );

  onMounted(() => {
    const el = inputRowsRef.value as HTMLElement;
    const { initSortable } = useSortable(el, {
      handle: '.lr-input-rows-drag',
      onEnd: (evt) => {
        const { oldIndex, newIndex } = evt;
        if (isNil(oldIndex) || isNil(newIndex) || oldIndex === newIndex) {
          return;
        }
        const targetRow = list.value.splice(oldIndex, 1)[0];

        list.value.splice(newIndex, 0, targetRow);

        emit('change', {
          value: targetRow,
          data: targetRow,
          index: newIndex,
          tableData: list.value,
          type: 'sort',
        });
      },
    });
    initSortable();
  });

  const { formState } = inject('jcode_form_provide', {} as Record<string, any>);
  const getConfig = (config: Record<string, any>, index: number) => {
    if (!config) {
      return {};
    }
    const myConfig = { ...config };
    if (myConfig.getUpConfig) {
      const _config = config.getUpConfig({
        formData: formState,
        index,
        row: list.value[index],
        tableData: list.value,
        parentRow: props.parentRow,
        config: myConfig,
      });
      if (_config) {
        Object.keys(_config).forEach((key) => {
          myConfig[key] = _config[key];
        });
      }
    }
    return myConfig;
  };

  /**
   * @zh 表格校验
   * @public
   */
  function validate() {
    return pValidate();
  }

  defineExpose({ validate });
</script>

<style lang="less">
  @import './inputRows';
</style>
