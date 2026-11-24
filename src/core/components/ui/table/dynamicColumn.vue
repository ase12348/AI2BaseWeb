<template>
  <vxe-colgroup
    :title="title"
    :show-overflow="showOverflow"
    :show-header-overflow="showHeaderOverflow"
    :fixed="fixed"
    :sortable="sortable || columnOption.sortable"
    :header-align="headerAlign"
  >
    <template v-for="(col, index) in columnOption.children || []">
      <vxe-column
        v-if="!col.isHidden && !col.children"
        :key="`${col.prop || ''}${index}`"
        :edit-render="col.inputType || col.getInputType ? { autoFocus: '.ant-input' } : undefined"
        v-bind="col"
        :title="col.label"
        :field="col.prop"
        :show-overflow="col.isNotAutoWrap == true ? 'tooltip' : false"
        :show-header-overflow="col.isNotHeaderAutoWrap == false ? false : 'tooltip'"
        :fixed="fixed"
        :sortable="sortable || col.sortable"
        :min-width="col.minWidth"
        :tree-node="isTree && index == 0 && colIndex == 0"
        :resizable="col.resizable === false ? false : true"
        :filters="col.isFilter ? filterOptions : undefined"
      >
        <template #header="{ column }">
          <span v-if="isRequired(column.property)" style="color: var(--color-error)">*</span
          ><span>{{ column.title }}</span>
        </template>
        <template v-if="col.isFilter" #filter="{ $panel, column }">
          <filter-panel
            v-model="filterTempValue2"
            :column="col"
            :filter-values="filterValues"
            :prop-map="propMap"
            @change="
              ({ value }) => {
                $panel.changeOption(value, value.length > 0, column.filters[0]);
              }
            "
          />
        </template>
        <template #edit="scope">
          <lr-c-input
            v-if="
              !col.isInputType ||
              col.isInputType(tableShowData[scope.$rowIndex], formState, scope.row)
            "
            @change="
              hanldInputChange($event, {
                index: scope.$rowIndex,
                column: col,
                row: scope.row,
              })
            "
            :type="
              col.getInputType ? col.getInputType(tableShowData[scope.$rowIndex]) : col.inputType
            "
            :config="getInputConfig(col.config, scope.$rowIndex)"
            :table-index="scope.$rowIndex"
            :id="`${id}.${scope.$rowIndex}.${scope.column.property}`"
            v-model="scope.row[col.config?.valueIdKey || scope.column.property]"
          />
        </template>
        <template #default="scope">
          <component
            v-if="col.config?.formatter"
            :is="
              col.config?.formatter({
                row: scope.row,
                column: col,
                cellValue: scope.row[scope.column.property],
                index: scope.$rowIndex,
              })
            "
          />
          <lr-c-input
            v-else-if="
              !isEditTable &&
              (col.inputType || col.getInputType) &&
              (!col.isInputType ||
                col.isInputType(tableShowData[scope.$rowIndex], formState, scope.row))
            "
            @change="
              hanldInputChange($event, {
                index: scope.$rowIndex,
                column: col,
                row: scope.row,
              })
            "
            :type="getInputType(col, tableShowData[scope.$rowIndex])"
            :config="getInputConfig(col.config, scope.$rowIndex, scope.row, col)"
            :table-index="scope.$rowIndex"
            :id="`${id}.${scope.$rowIndex}.${scope.column.property}`"
            v-model="scope.row[col.config?.valueIdKey || scope.column.property]"
            @keydown.enter.prevent.stop
          />

          <span
            v-else-if="
              (col.inputType || col.getInputType) &&
              getInputType(col, tableShowData[scope.$rowIndex]) == 'switch'
            "
            >{{
              $t(
                getColumnLabel(
                  scope.row[col.config?.valueIdKey || scope.column.property],
                  scope.row,
                  col.config,
                  true,
                ),
              )
            }}</span
          >

          <lr-upload
            v-else-if="col.config?.dataType == 'file'"
            only-name
            :value="scope.row[scope.column.property]"
          />
          <lr-upload
            v-else-if="col.config?.dataType == 'layerfile'"
            :value="scope.row[scope.column.property]"
            :is-layer="true"
            :btn-look-text="$t('查看')"
            btn-size="small"
            :readonly="true"
            :is-upload-img="col.config?.isUploadImg"
          />
          <lr-rate
            v-else-if="col.config?.dataType == 'rate'"
            :value="scope.row[scope.column.property]"
            :count="col.config?.count || 5"
            :show-score="col.config?.showScore"
            :show-text="col.config?.showText"
            :texts="col.config?.texts || []"
            allow-half
            disabled
          />
          <span v-else-if="!col.notShowColLabel">{{
            getColumnLabel(
              scope.row[col.config?.valueIdKey || scope.column.property],
              scope.row,
              col.config,
            )
          }}</span>
        </template>
      </vxe-column>
      <dynamic-column
        v-else-if="!col.isHidden"
        :key="index"
        :column-option="col"
        :is-required="isRequired"
        :title="col.label"
        :show-overflow="col.isNotAutoWrap == false ? false : 'tooltip'"
        :show-header-overflow="col.isNotHeaderAutoWrap == false ? false : 'tooltip'"
        :fixed="fixed"
        :sortable="sortable"
        :col-index="colIndex"
        :get-column-label="getColumnLabel"
        :get-input-type="getInputType"
        :hanld-input-change="hanldInputChange"
        :get-input-config="getInputConfig"
        :table-show-data="tableShowData"
      />
    </template>
  </vxe-colgroup>
</template>

<script lang="ts" setup>
  import { computed, PropType, inject } from 'vue';
  import FilterPanel from './filterPanel.vue';

  defineOptions({ name: 'DynamicColumn' });

  const props = defineProps({
    id: String,
    columnOption: {
      type: Object,
      required: true,
    },
    isRequired: {
      type: Function,
      required: true,
    },
    hanldInputChange: {
      type: Function,
      required: true,
    },
    getColumnLabel: {
      type: Function,
      required: true,
    },
    getInputType: {
      type: Function,
      required: true,
    },
    getInputConfig: {
      type: Function,
      required: true,
    },
    fixed: String,
    sortable: Boolean,
    showOverflow: [Boolean, String],
    showHeaderOverflow: [Boolean, String],
    title: String,
    headerAlign: String,
    colIndex: Number,
    isTree: Boolean,

    tableShowData: {
      type: Array as PropType<Record<string, any>[]>,
      default: () => [],
    },

    filterTempValue: String,
    filterValues: Object,
    propMap: Object,
    isEditTable: Boolean,
  });

  const emit = defineEmits(['update:filterTempValue']);

  const filterOptions = [{ data: '' }];
  const filterTempValue2 = computed({
    get() {
      return props.filterTempValue;
    },
    set(value) {
      emit('update:filterTempValue', value);
    },
  });
  const { formState } = inject('jcode_form_provide', {} as Record<string, any>);
</script>
