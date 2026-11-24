<template>
  <div
    :style="{ height: tableWraperHeight }"
    :class="[
      'lr-table',
      { 'lr-table-child': isChild },
      { 'lr-table-row-child': isRowChild },
      isPage || ((isEditAddBtn || isImportExcel || isExportExcel) && !isEditRead)
        ? 'lr-table--haspagination'
        : '',
      isSetTable ? 'lr-table--toolbar' : '',
    ]"
  >
    <div v-if="isShowTable && isSetTable" style="position: absolute; top: 0; right: 0">
      <vxe-toolbar size="mini" ref="toolbarRef" custom />
    </div>
    <div class="lr-block">
      <vxe-table
        v-if="isShowTable"
        :custom-config="{ storage: false, placement: colCustomPlacement }"
        ref="tableRef"
        size="mini"
        :loading-config="{
          text: $t('加载中...'),
        }"
        :loading="loading"
        :style="{ width: '100%' }"
        :border="border"
        :height="tableHeight"
        :max-height="maxHeight"
        :min-height="minHeight"
        :row-class-name="rowClassName"
        :cell-class-name="cellClassName"
        :header-row-class-name="headerRowClassName"
        :header-cell-class-name="headerCellClassName"
        :cell-style="cellStyle"
        :row-style="rowStyle"
        :header-cell-style="headerCellStyle"
        :default-sort="defaultSort"
        :filter-config="{ remote: true }"
        @checkbox-all="handleSelectAll"
        @checkbox-change="handleSelectionChange"
        @radio-change="handleRadioChange"
        @cell-click="handleCellClick"
        @cell-mouseenter="handleCellMouseEnter"
        @cell-mouseleave="handleCellMouseLeave"
        @cell-dblclick="handleCellDblclick"
        @cell-menu="handleCellMenu"
        @header-cell-click="handleHeaderClick"
        @header-cell-menu="handleHeaderContextmenu"
        @resizable-change="handleHeaderDagend"
        @filter-visible="handleFilterVisible"
        @filter-change="handleFilterChange"
        @current-change="handleCurrentRowChange"
        @toggle-row-expand="handleExpandChange"
        @sort-change="handleSortChangeEvent"
        :stripe="stripe && !isTree && !isEditTable"
        :round="isEditTable && !isRowChild"
        :row-config="{
          isHover: isRowHover,
          isCurrent: highlightCurrentRow,
          keyField: rowKey,
        }"
        :column-config="{
          resizable: isColumnResizable,
          isCurrent: isColumnCurrent,
          isHover: isColumnHover,
        }"
        :checkbox-config="{
          checkField: multiSelectKey,
          reserve: false,
          checkStrictly: checkStrictly && isTree,
        }"
        :radio-config="{ trigger: 'row' }"
        :seq-config="{ seqMethod: indexMethod }"
        :tooltip-config="{ theme: tooltipEffect }"
        :sort-config="{ remote: isPage }"
        :show-header="showHeader"
        :show-footer="showSummary || showSumTotal"
        :footer-method="getSummaries"
        :footer-span-method="myScrollX.enabled ? undefined : footerRowspanMethod"
        :show-header-overflow="myScrollX.enabled"
        :span-method="spanMethod"
        :data="tableShowData"
        :show-overflow="showOverflow"
        :menu-config="menuConfig"
        :expand-config="expandConfig"
        :tree-config="treeConfig"
        :scroll-y="myScrollY"
        :scroll-x="myScrollX"
        :merge-cells="mergeCells"
        :empty-text="$t(emptyDes)"
        :edit-config="{
          mode: 'row',
          trigger: 'click',
          showIcon: false,
          autoClear: false,
          enabled: isEditTable,
        }"
      >
        <!-- 拖动排序  -->
        <vxe-column align="center" :resizable="false" width="45" v-if="isSortable && !isTree">
          <template #header>
            <lr-icon icon="ant-design:drag-outlined" />
          </template>
          <div class="jcode-table__drag-handler">
            <lr-icon icon="ant-design:drag-outlined" />
          </div>
        </vxe-column>

        <vxe-column
          v-if="isExpand"
          :fixed="isFixed ? 'left' : ''"
          type="expand"
          width="36"
          :resizable="false"
        >
          <template #content="scope">
            <slot v-bind="scope" name="table_expand"></slot>
          </template>
        </vxe-column>

        <vxe-column
          v-if="isRadio"
          type="radio"
          :fixed="isFixed ? 'left' : ''"
          align="center"
          width="40"
          :resizable="false"
        />

        <vxe-column
          v-if="isMultiSelect && !isRadio"
          :fixed="isFixed ? 'left' : ''"
          align="center"
          type="checkbox"
          width="40"
          :resizable="false"
        />
        <vxe-column
          v-if="isShowNumCol && !isTree"
          :fixed="isFixed ? 'left' : ''"
          align="center"
          type="seq"
          :title="showNumLabel"
          :width="seqWidth"
          :show-overflow="showOverflow"
          :show-header-overflow="true"
          :resizable="false"
        >
          <template #header>
            <div v-if="isEditTable">
              <div class="lr-table-header-num-operate">
                <button class="lr-table-btn" @click.stop="handleFull(false)" v-if="isTableLayer">
                  <lr-icon icon="ant-design:fullscreen-exit-outlined" />
                </button>
                <button type="button" class="lr-table-btn" @click.stop="handleFull(true)" v-else>
                  <lr-icon icon="ant-design:fullscreen-outlined" />
                </button>
                <!-- <button class="lr-table-btn dangerous" @click.stop="handleBatchDelete">
                  <lr-icon icon="ant-design:delete-outlined" />
                </button> -->
              </div>
              <span class="lr-table-header-num">{{ showNumLabel }}</span>
            </div>
            <span v-else>{{ showNumLabel }}</span>
          </template>
          <template #default="{ row, rowIndex, $rowIndex }">
            <div
              v-if="isEditRemoveBtn && !isEditRead && hasDeleteBtn(row)"
              :class="['lr-table-delete-btn', { 'lr-table-delete-btn-show': !isEditShowNum }]"
            >
              <button class="lr-table-btn" @click.stop="handleDrawer(true, row, $rowIndex)">
                <lr-icon icon="ant-design:arrows-alt-outlined" />
              </button>
              <button class="lr-table-btn dangerous" @click.stop="handleDelete(row, rowIndex)">
                <lr-icon icon="ant-design:delete-outlined" />
              </button>
            </div>
            <span
              v-if="isEditShowNum"
              :class="[
                'cell-num',
                { 'cell-num-hover': isEditRemoveBtn && !isEditRead && hasDeleteBtn(row) },
              ]"
              >{{ rowIndex + 1 }}</span
            >
          </template>
        </vxe-column>
        <vxe-column
          v-if="!isShowNumCol && (showSummary || showSumTotal)"
          :fixed="isFixed ? 'left' : ''"
          align="center"
          field="sum"
          key="sum"
          title=""
          :width="seqWidth"
          :show-overflow="showOverflow"
          :show-header-overflow="true"
          :resizable="false"
        />

        <template v-for="(item, index) in tableColumns">
          <vxe-column
            v-if="!item.isHidden && !item.children"
            :edit-render="
              item.inputType || item.getInputType ? { autoFocus: '.ant-input' } : undefined
            "
            :key="`${item.prop || ''}${index}`"
            v-bind="item"
            :title="item.label"
            :field="item.prop"
            :show-overflow="item.isNotAutoWrap == false ? false : 'tooltip'"
            :show-header-overflow="item.isNotHeaderAutoWrap == false ? false : 'tooltip'"
            :fixed="isSortable && !isTree ? '' : item.fixed"
            :sortable="sortable || item.sortable"
            :min-width="item.minWidth"
            :tree-node="isTree && index == 0"
            :resizable="item.resizable === false || isColumnResizable === false ? false : true"
            :filters="item.isFilter ? filterOptions : undefined"
          >
            <template #header="{ column }">
              <span v-if="isRequired(column.property)" style="color: var(--color-error)">*</span>
              <component
                v-if="item.config?.titleFormatter"
                :is="item.config?.titleFormatter({ title: column.title })"
              />
              <span v-else>{{ column.title }}</span>
            </template>
            <template v-if="item.isFilter" #filter="{ $panel, column }">
              <filter-panel
                v-model="filterTempValue"
                :column="item"
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
                  !item.isInputType ||
                  item.isInputType(tableShowData[scope.$rowIndex], formState, scope.row)
                "
                @change="
                  handleInputChange($event, {
                    index: scope.$rowIndex,
                    column: item,
                    row: scope.row,
                  })
                "
                :type="getInputType(item, tableShowData[scope.$rowIndex])"
                :config="getInputConfig(item.config, scope.$rowIndex, scope.row, item)"
                :table-index="scope.$rowIndex"
                :id="`${id}.${scope.$rowIndex}.${scope.column.property}`"
                v-model="scope.row[item.config?.valueIdKey || scope.column.property]"
                @click="handleComponentClick(item)"
                @keydown.enter.prevent.stop
              />
              <span v-else-if="!item.notShowColLabel">{{
                getColumnLabel(
                  scope.row[item.config?.valueIdKey || scope.column.property],
                  scope.row,
                  item.config,
                )
              }}</span>
            </template>
            <template #default="scope">
              <component
                v-if="item.config?.formatter"
                :is="
                  item.config?.formatter({
                    row: scope.row,
                    column: item,
                    cellValue: scope.row[scope.column.property],
                    index: scope.$rowIndex,
                  })
                "
                :key="
                  item.config?.formatterKey
                    ? item.config?.formatterKey({
                        row: scope.row,
                        column: item,
                        cellValue: scope.row[scope.column.property],
                        index: scope.$rowIndex,
                      })
                    : undefined
                "
              />

              <lr-c-input
                v-else-if="
                  (!isEditTable ||
                    ['upload', 'uploadimg', 'count'].includes(
                      getInputType(item, tableShowData[scope.$rowIndex]),
                    )) &&
                  (item.inputType || item.getInputType) &&
                  (!item.isInputType ||
                    item.isInputType(tableShowData[scope.$rowIndex], formState, scope.row))
                "
                @change="
                  handleInputChange($event, {
                    index: scope.$rowIndex,
                    column: item,
                    row: scope.row,
                  })
                "
                :type="getInputType(item, tableShowData[scope.$rowIndex])"
                :config="getInputConfig(item.config, scope.$rowIndex, scope.row, item)"
                :readonly="
                  ['upload', 'uploadimg'].includes(
                    getInputType(item, tableShowData[scope.$rowIndex]),
                  ) || item.config?.readonly
                "
                :table-index="scope.$rowIndex"
                :id="`${id}.${scope.$rowIndex}.${scope.column.property}`"
                v-model="scope.row[item.config?.valueIdKey || scope.column.property]"
                @click="handleComponentClick(item)"
                @keydown.enter.prevent.stop
              />

              <lr-upload
                v-else-if="item.config?.dataType == 'file'"
                only-name
                :value="scope.row[scope.column.property]"
              />
              <lr-upload
                v-else-if="item.config?.dataType == 'layerfile'"
                :value="scope.row[scope.column.property]"
                :is-layer="true"
                :btn-look-text="$t('查看')"
                btn-size="small"
                :readonly="true"
                :is-upload-img="item.config?.isUploadImg"
              />
              <lr-rate
                v-else-if="item.config?.dataType == 'rate'"
                :value="scope.row[scope.column.property]"
                :count="item.config?.count || 5"
                :show-score="item.config?.showScore"
                :show-text="item.config?.showText"
                :texts="item.config?.texts || []"
                allow-half
                disabled
              />

              <span
                v-else-if="
                  (item.inputType || item.getInputType) &&
                  getInputType(item, tableShowData[scope.$rowIndex]) == 'switch'
                "
                >{{
                  $t(
                    getColumnLabel(
                      scope.row[item.config?.valueIdKey || scope.column.property],
                      scope.row,
                      item.config,
                      true,
                    ),
                  )
                }}</span
              >

              <span v-else-if="!item.notShowColLabel">{{
                getColumnLabel(
                  scope.row[item.config?.valueIdKey || scope.column.property],
                  scope.row,
                  {
                    ...item.config,
                    inputType: getInputType(item, tableShowData[scope.$rowIndex]),
                  },
                )
              }}</span>
            </template>
          </vxe-column>
          <vxe-column
            v-else-if="!item.isHidden && item.inputType == 'gridtable'"
            :key="`table${index}`"
            :show-overflow="false"
            :title="item.label"
            :field="item.prop"
            :width="item.width"
            class-name="lr-edit-table-cell"
          >
            <template #default="scope">
              <lr-table
                height="notset"
                :min-height="0"
                :is-edit-table="true"
                :is-row-child="true"
                :columns="item.children"
                :edit-config="getInputConfig(item.config, scope.$rowIndex, scope.row, item)"
                :data-source="scope.row[scope.column.property]"
                @change="
                  handleEditChange($event, { col: item, index: scope.$rowIndex, row: scope.row })
                "
                @row-change="
                  handleEditRowChange($event, { col: item, index: scope.$rowIndex, row: scope.row })
                "
                @row-click="handleEditRowClick($event, item)"
                @row-mouse-enter="handleEditRowMouseEnter($event, item)"
                @row-mouse-leave="handleEditRowMouseLeave($event, item)"
                :table-drawer-title="item.label || ''"
              />
            </template>
          </vxe-column>
          <dynamic-column
            v-else-if="!item.isHidden"
            :column-option="item"
            :is-required="isRequired"
            :key="index"
            :title="item.label"
            :header-align="item.headerAlign"
            :show-overflow="item.isNotAutoWrap == false ? false : 'tooltip'"
            :show-header-overflow="item.isNotHeaderAutoWrap == false ? false : 'tooltip'"
            :fixed="isSortable && !isTree ? '' : item.fixed"
            :sortable="sortable"
            :col-index="index"
            :is-tree="isTree"
            :get-column-label="getColumnLabel"
            :get-input-type="getInputType"
            v-model:filter-temp-value="filterTempValue"
            :prop-map="propMap"
            :filter-values="filterValues"
            :hanld-input-change="handleInputChange"
            :table-show-data="tableShowData"
            :get-input-config="getInputConfig"
            :id="id"
            :is-edit-table="isEditTable"
          />
        </template>
        <slot></slot>
      </vxe-table>
    </div>
    <div
      v-if="isPage || ((isEditAddBtn || isImportExcel || isExportExcel) && !isEditRead)"
      class="lr-table--pagination"
      @click.stop="() => {}"
    >
      <div
        v-if="(isEditAddBtn || isImportExcel || isExportExcel) && !isEditRead"
        class="lr-table--addbtns"
      >
        <lr-button
          v-if="isEditAddBtn"
          type="link"
          size="small"
          :label="$t('添加')"
          @click.stop="handleAdd"
        >
          <template #icon>
            <lr-icon :is-div="false" class="lr-button-icon" icon="ant-design:plus-outlined" />
          </template>
        </lr-button>

        <template v-if="isEditAddBtn">
          <template v-for="(item, index) in layerAddColumns" :key="index">
            <lr-c-input
              type="inputLayer"
              :config="{
                ...item.config,
                'only-button': true,
                icon: 'ant-design:plus-outlined',
                buttonLabel: item.label + '添加',
                buttonType: 'link',
                isMultiSelect: true,
              }"
              @keydown.enter.prevent.stop
              @change="handleAddByInputLayer($event, item)"
            />
          </template>
        </template>

        <lr-button
          v-if="isImportExcel"
          type="link"
          size="small"
          :label="$t('导入')"
          @click.stop="handleImportClick"
        />
        <lr-button
          v-if="isExportExcel"
          type="link"
          size="small"
          :label="$t('导出')"
          @click.stop="handleExportClick"
        />
      </div>
      <a-pagination
        v-if="isPage"
        v-model:current="currentPage"
        v-model:page-size="currentPageSize"
        :page-size-options="pageSizes || ['50', '100', '200', '500']"
        :total="pageTotal"
        :show-size-changer="!pageLayoutSimple"
        :show-quick-jumper="!pageLayoutSimple"
        :simple="pageLayoutSimple"
        :show-total="showPageTotal"
        @change="handleCurrentPageChange"
      />
    </div>

    <lr-layer
      v-if="editConfig?.addLayerName"
      ref="tableAddLayerRef"
      :width="editConfig?.addLayerWidth"
      :height="editConfig?.addLayerHeight"
      btn-text="确认"
      @ok="tableAddLayerOk"
      @closed="tableAddLayerClosed"
    >
      <component
        ref="tableAddLayerComponentRef"
        :is="editConfig?.addLayerName"
        v-bind="editConfig?.addLayerConfig || {}"
      />
    </lr-layer>
    <lr-layer ref="tableFullLayerRef" :has-btns="false" v-if="!isTableLayer">
      <lr-table
        v-bind="$props"
        height="100%"
        :is-table-layer="true"
        @fullscreen="handleFull"
        @row-click="handleFullEmit('rowClick', $event)"
        @row-change="handleFullEmit('rowChange', $event)"
        @cell-click="handleFullEmit('cellClick', $event)"
        @row-mouse-enter="handleFullEmit('rowMouseEnter', $event)"
        @row-mouse-leave="handleFullEmit('rowMouseLeave', $event)"
        @current-change="handleFullEmit('currentChange', $event)"
        @header-dagend="handleFullEmit('headerDagend', $event)"
        @expand-change="handleFullEmit('expandChange', $event)"
      />
    </lr-layer>
    <lr-layer ref="tableDrawerRef" :width="460">
      <a-form
        class="lr-block lr-c-schema-form"
        style="padding: 8px 8px 0; overflow: auto; overflow-x: hidden"
        ref="refForm"
        layout="vertical"
        :model="tableRowData"
      >
        <a-row :gutter="16">
          <template v-for="item of drawerColumns" :key="item.id">
            <a-col
              :span="24"
              v-if="item.inputType || (item.isInputType && item.isInputType(tableRowData))"
            >
              <template v-if="!item.isHidden && item.inputType == 'gridtable'">
                <a-typography-title :level="5" v-if="item.config.label && !item.config.notLabel"
                  ><span v-if="item.required" style="margin-left: 4px; color: var(--color-error)"
                    >*</span
                  >{{ $t(item.config.label || '') }}</a-typography-title
                >
                <lr-table
                  height="notset"
                  :min-height="0"
                  :is-edit-table="true"
                  :is-row-child="true"
                  :columns="item.children"
                  :edit-config="getInputConfig(item.config, prowIndex, tableRowData, item)"
                  :data-source="tableRowData[item.prop]"
                  @change="
                    handleEditChange($event, { col: item, index: prowIndex, row: tableRowData })
                  "
                  @row-change="
                    handleEditRowChange($event, { col: item, index: prowIndex, row: tableRowData })
                  "
                  @row-click="handleEditRowClick($event, item)"
                  @row-mouse-enter="handleEditRowMouseEnter($event, item)"
                  @row-mouse-leave="handleEditRowMouseLeave($event, item)"
                />
              </template>
              <a-form-item
                :label="$t(item.label || '')"
                v-else-if="!item.isHidden && (!item.isInputType || item.isInputType(tableRowData))"
              >
                <lr-c-input
                  @change="
                    handleInputChange($event, {
                      index: prowIndex,
                      column: item,
                      row: tableRowData,
                    })
                  "
                  :type="getInputType(item, tableRowData)"
                  :config="getInputConfig(item.config, prowIndex, tableRowData, item)"
                  :table-index="prowIndex"
                  :id="`${id}.${prowIndex}.${item.prop}`"
                  v-model="tableRowData[item.config?.valueIdKey || item.prop]"
                  @click="handleComponentClick(item)"
                  @keydown.enter.prevent.stop
                />
              </a-form-item>
            </a-col>
          </template>
        </a-row>
      </a-form>
      <template #btns>
        <a-space :size="8">
          <lr-button style="margin-right: 8px" @click="handleDrawerAdd">{{ $t('新增') }}</lr-button>
          <lr-button style="margin-right: 8px" @click="handleDrawerCopy">{{
            $t('复制')
          }}</lr-button>
        </a-space>
      </template>
    </lr-layer>

    <lr-modal
      v-if="isExportExcel"
      v-model:visible="exportExcelVisible"
      :title="$t(exportExcelTitle)"
      :width="600"
      :height="400"
      @ok="handleExport"
      :btn-text="$t('导出')"
    >
      <div class="lr-block" style="padding: 8px 0; overflow: auto; overflow-x: hidden">
        <a-tree
          :tree-data="exportColumns"
          :field-names="{
            title: 'label',
            key: 'value',
          }"
          :checkable="true"
          v-model:checked-keys="exportCheckColumns"
        />
      </div>
    </lr-modal>
    <lr-modal
      v-if="isImportExcel"
      v-model:visible="importExcelVisible"
      :title="$t(importExcelTitle)"
      :width="600"
      :height="400"
      @ok="handleDownImportTemplate"
      :btn-text="$t('下载导出模版')"
    >
      <div class="lr-block" style="padding-top: 160px">
        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 160px; padding: 8px">
          <a-upload-dragger
            :show-upload-list="false"
            accept=".xls,.xlsx"
            multiple
            :custom-request="handleExcelUploadRequest"
          >
            <div
              class="lr-block"
              style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
              "
            >
              <p class="ant-upload-drag-icon">
                <lr-icon icon="ant-design:upload-outlined" :size="24" />
              </p>
              <p class="ant-upload-text">{{ $t('将文件拖到此处，或点击上传') }}</p>
            </div>
          </a-upload-dragger>
        </div>
        <div class="lr-block" style="padding-bottom: 8px; overflow: auto; overflow-x: hidden">
          <div class="import-file-item" v-for="(item, index) in importExcelFileList" :key="index">
            <lr-icon icon="ant-design:file-text-outlined" />
            {{ item.name }}
            <div class="import-file-item-btn" v-if="item.response">
              <span class="snum">{{ item.response.success }}</span>
            </div>
            <div
              style="
                position: absolute;
                z-index: 0;
                bottom: -6px;
                left: 0;
                width: 100%;
                padding: 0 8px;
              "
            >
              <a-progress
                style="margin: 0 !important"
                v-if="item.status === 'uploading'"
                :size="4"
                :percent="item.percent"
                :show-info="false"
              />
            </div>
          </div>
        </div>
      </div>
    </lr-modal>
  </div>
</template>

<script lang="ts" setup>
  // `columns` 仅为类型导入（编译后被擦除），与同名 prop 无运行期冲突
  // eslint-disable-next-line vue/no-dupe-keys
  import type { columns } from './columns';
  import {
    PropType,
    computed,
    ref,
    unref,
    onMounted,
    nextTick,
    inject,
    reactive,
    watch,
  } from 'vue';
  import Sortable from 'sortablejs';
  import { createNamespace } from '../utils/components';
  import {
    buildUUID,
    buildShortUUID,
    deepClone,
    clearData,
    fullScreenLoading,
  } from '../utils/method';
  import { isNullOrEmpty } from '../utils/is';
  import { toTree, toArray, toSimpleTree } from '../utils/tree';
  import { formatToDateTime, formatToDate } from '../utils/date';
  import { useFramework } from '../utils/useFramework';
  import { getFileIcon } from '../utils/file';
  // 原组件走全局属性 $t（即 setupI18n 的 t）；本文件内 t 已被 useFramework 解构占用，
  // 故此处另起别名，翻译函数与全局属性 $t 完全相同
  import { t as $t } from '@/core/locales/setupI18n';

  import dynamicColumn from './dynamicColumn.vue';
  import FilterPanel from './filterPanel.vue';

  type rowFunObj = {
    row: object;
    rowIndex: number;
    $rowIndex: number;
  };
  type cellFunObj = {
    row: object;
    rowIndex: number;
    $rowIndex: number;
    column: object;
    columnIndex: number;
    $columnIndex: number;
  };
  type headerCellFunObj = {
    $rowIndex: number;
    column: object;
    columnIndex: number;
    $columnIndex: number;
  };

  // defineOptions 会被提升到 setup 之外，不能引用本地变量，故直接内联取值；
  // 与原 `const { name } = createNamespace('table')` 同名（LrTable）
  defineOptions({ name: createNamespace('table').name });

  const props = defineProps({
    /**
     * @zh 组件Id
     */
    id: String,
    /**
     * @zh 配置表格的列描述， [columns](#columns)。
     * @defaultValue -
     */
    columns: { type: Array<columns>, default: () => [] },
    /**
     * @zh 列的数据结构是树形结构。
     * @defaultValue 'tree'
     */
    columnsType: {
      type: String,
      default: 'tree',
    },
    /**
     * @zh 配置表格的数据
     * @defaultValue -
     */
    dataSource: {
      type: Array,
      default: () => [],
    },
    /**
     * @zh 表格是否处于加载中
     * @defaultValue false
     */
    loading: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh Table 的高度，默认为自动高度。如果 height 为 number 类型，单位 px；如果 height 为 string 类型，则这个高度会设置为 Table 的 style.height 的值，Table 的高度会受控于外部样式。
     * @defaultValue 100%
     */
    height: {
      type: [String, Number],
      default: '100%',
    },
    /**
     * @zh Table 的最大高度。合法的值为数字或者单位为 px 的高度。
     * @defaultValue -
     */
    maxHeight: {
      type: [String, Number],
    },
    /**
     * @zh Table 的最小高度。合法的值为数字或者单位为 px 的高度
     * @defaultValue -
     */
    minHeight: {
      type: [String, Number],
    },

    /**
     * @zh 给行附加 className
     * @defaultValue -
     */
    rowClassName: [Function, String] as PropType<
      (({ row, rowIndex, $rowIndex }: rowFunObj) => any) | string
    >,
    /**
     * @zh 给单元格附加 className
     * @defaultValue -
     */
    cellClassName: [Function, String] as PropType<
      | (({ row, rowIndex, $rowIndex, column, columnIndex, $columnIndex }: cellFunObj) => any)
      | string
    >,
    /**
     * @zh 给表头的行附加 className
     * @defaultValue -
     */
    headerRowClassName: [Function, String] as PropType<
      (({ $rowIndex }: { $rowIndex: number }) => any) | string
    >,
    /**
     * @zh 给表头的单元格附加 className。
     */
    headerCellClassName: [Function, String] as PropType<
      (({ $rowIndex, column, columnIndex, $columnIndex }: headerCellFunObj) => any) | string
    >,
    /**
     * @zh 给行附加样式，也可以是函数（不推荐）。
     */
    rowStyle: [Function, Object] as PropType<
      (({ row, rowIndex, $rowIndex }: rowFunObj) => any) | object
    >,
    /**
     * @zh 给单元格附加样式（不推荐）。
     */
    cellStyle: [Function, String, Object] as PropType<
      | (({ row, rowIndex, $rowIndex, column, columnIndex, $columnIndex }: cellFunObj) => any)
      | string
      | object
    >,
    /**
     * @zh 给表头的单元格附加样式。
     */
    headerCellStyle: [Function, String] as PropType<
      (({ $rowIndex, column, columnIndex, $columnIndex }: headerCellFunObj) => any) | string
    >,

    /**
     * @zh 是否显示表头
     * @defaultValue true
     */
    showHeader: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 是否要高亮当前行
     * @defaultValue false
     */
    highlightCurrentRow: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 是否为斑马纹 table
     * @defaultValue true
     */
    stripe: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 是否在表尾显示合计行。
     * @defaultValue false
     */
    showSummary: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 合计行第一列的文本
     * @defaultValue 合计
     */
    sumText: {
      type: String,
      default: '合计',
    },
    /**
     * @zh 是否在表尾显示总合计行。
     * @defaultValue false
     */
    showSumTotal: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 总合计行第一列的文本
     * @defaultValue 合计
     */
    sumTotalText: {
      type: String,
      default: '总合计',
    },
    /**
     * @zh 自定义的合计计算方法,返回一个二维数组
     * @defaultValue -
     */
    summaryMethod: Function as PropType<(param: object) => any[][]>,
    /**
     * @zh 是否显示序号。
     * @defaultValue true
     */
    isShowNum: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 序号列文字
     * @defaultValue '#'
     */
    // eslint-disable-next-line vue/prop-name-casing
    showNumLabel: {
      type: String,
      default: '#',
    },
    /**
     * @zh 是否允许单选
     */
    isRadio: Boolean,
    /**
     * @zh 是否多选
     * @defaultValue false
     */
    isMultiSelect: Boolean,
    /**
     * @zh 多选时的key。
     * @defaultValue -
     */
    multiSelectKey: String,
    /**
     * @zh 绑定选中属性。
     * @defaultValue -
     */
    rowKey: String,
    /**
     * @zh 是否显示展开列（用来显示子表）。
     * @defaultValue false
     */
    isExpand: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 张开行加载方法
     */
    expandLoadMethod: Function as PropType<
      (data: { row: Record<string, any>; rowIndex?: number; $rowIndex?: number }) => Promise<any>
    >,
    // 树形
    /**
     * @zh 是否显示树形数据
     * @defaultValue false
     */
    isTree: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh id 值字段。
     */
    idKey: {
      type: String,
    },
    /**
     * @zh 显示树形数据的时候父级字段名
     */
    pidKey: {
      type: String,
      default: 'f_ParentId',
    },
    /**
     * @zh 展示树形数据时，树节点的缩进
     * @defaultValue 16
     */
    indent: {
      type: Number,
      default: 16,
    },
    /**
     * @zh tooltip effect 属性；
     * @defaultValue -
     */
    tooltipEffect: String as PropType<'dark' | 'light'>,
    /**
     * @zh 是否懒加载子节点数据或者展开行
     * @defaultValue -
     */
    lazy: Boolean,
    /**
     * @zh 该方法用于异步加载子节点（必须返回 Promise<any[]> 对象）
     * @defaultValue -
     */
    load: Function as PropType<({ row }: Record<string, any>) => Promise<any[]>>,
    /**
     * @zh 是否默认展开所有行，当 Table 包含展开行存在或者为树形表格时有效
     * @defaultValue false
     */
    defaultExpandAll: Boolean,
    /**
     * @zh 是否严格的遵循父子不互相关联的做法
     * @defaultValue false
     */
    checkStrictly: Boolean,
    /**
     * @zh 可以通过该属性设置 Table 目前的展开行，需要设置 row-key 属性才能使用，该属性为展开行的 keys 数组。
     * @defaultValue -
     */
    expandRowKeys: {
      type: Array,
    },
    /**
     * @zh 是否开启表格排序功能
     * @defaultValue false
     */
    sortable: {
      type: Boolean,
      default: false,
    },
    defaultSort: Object,
    /**
     * @zh 是否允许调整行的顺序（动态拖动）
     * @defaultValue false
     */
    isSortable: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 自定义合并函数，返回计算后的值 (不能用于虚拟滚动、展开行，不建议用于固定列、树形结构)
     * @defaultValue { rowspan: 1, colspan: 1}
     */
    spanMethod: Function,

    // 分页配置
    /**
     * @zh 是否分页
     * @defaultValue false
     */
    isPage: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 每页显示个数选择器的选项设置
     * @defaultValue [50,100, 200, 500]
     */
    pageSizes: Array,
    /**
     * @zh 总的数据条数
     * @defaultValue 0
     */
    pageTotal: {
      type: Number,
      default: 0,
    },
    /**
     * @zh 当前页面
     * @defaultValue 1
     */
    tablePage: {
      type: Number,
      default: 1,
    },
    /**
     * @zh 当前显示页数
     * @defaultValue 50
     */
    pageSize: {
      type: Number,
      default: 50,
    },
    /**
     * @zh 分页样式是否是简洁模式
     */
    pageLayoutSimple: {
      type: Boolean,
      default: false,
    },

    // 扩展属性
    /**
     * @zh 是否是子表
     * @defaultValue false
     */
    isChild: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 用来处理子表需要设置高度的情况
     * @defaultValue false
     */
    isNeedHeight: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 同一路径下多个表格设置列时，需要有唯一标识。
     * @defaultValue -
     */
    lrTableName: {
      type: String,
      default: () => (window.location.pathname === '/' ? window.location.href : ''),
    },
    /**
     * @zh 只对 lazy 启用后有效，标识是否存在子节点，从而控制是否允许被点击
     * @defaultValue 'hasChildren'
     */
    hasChildren: {
      type: String,
      default: 'hasChildren',
    },
    /**
     * @zh 是否不开启虚拟滚动（用于isInputType的情况）
     * @defaultValue false
     */
    isNotScroll: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 超过多少行，开启虚拟滚动
     * @defaultValue 40
     */
    scrollYGt: {
      type: Number,
      default: 40,
    },
    /**
     * @zh 超过多少列，开启虚拟滚动
     * @defaultValue -1 表示关闭
     */
    scrollXGt: {
      type: Number,
      default: -1,
    },
    /**
     * @zh 边框类型
     * @defaultValue 继承 setup.table.border
     */
    borderType: {
      type: String as PropType<'default' | 'full' | 'outer' | 'inner' | 'none'>,
    },
    /**
     * @zh 当鼠标移到行时，是否要高亮当前行
     * @defaultValue true
     */
    isRowHover: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 设置所有内容过长时显示为省略号（如果是固定列建议设置该值，提升渲染速度）
     * @defaultValue true
     */
    showOverflow: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 当鼠标点击列头时，是否要高亮当前列
     * @defaultValue false
     */
    isColumnCurrent: Boolean,
    /**
     * @zh 当鼠标移到列头时，是否要高亮当前头
     * @defaultValue false
     */
    isColumnHover: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 每一列是否启用列宽调整
     * @defaultValue true
     */
    isColumnResizable: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 是否不设置最小宽度
     * @defaultValue -
     */
    isNotMinWidth: Boolean,
    /**
     * @zh 临时合并指定的单元格 (不能用于展开行，不建议用于固定列、树形结构)
     * @defaultValue -
     */
    mergeCells: Array<{ row: number; col: number; rowspan: number; colspan: number }>,

    // 编辑表格

    /**
     * @zh 是否设置表格列
     */
    isSetTable: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 过滤删除按钮函数
     */
    filterDeleteBtn: Function,

    /**
     * @zh 表格列自定义面板位置
     */
    colCustomPlacement: {
      type: String as PropType<'left' | 'right'>,
      default: 'right',
    },
    /**
     * @zh 空状态数据描述
     */
    emptyDes: {
      type: String,
      default: '暂无数据',
    },
    /**
     * @zh 子表字段值重复校验[{value: 列字段prop}]
     */
    vRepeatList: Array,
    /**
     * @zh 是否开启点击编辑
     */
    isEditTable: Boolean,

    /**
     * @zh 编辑参数
     */
    editConfig: {
      type: Object as PropType<Record<string, any>>,
    },
    /**
     * @zh 是否是行加载子表,用来做编辑表格嵌套
     */
    isRowChild: {
      type: Boolean,
      default: false,
    },

    /**
     * @zh 是否只读
     */
    isRead: {
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
     * @zh 是否有添加按钮。
     */
    isAddBtn: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 是否有移除按钮。
     */
    isRemoveBtn: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 是否是全屏表格，编辑表格内部使用。
     */
    isTableLayer: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 表格名称，编辑表格打开抽屉使用。
     */
    tableDrawerTitle: {
      type: String,
      default: '',
    },
  });

  const emit = defineEmits({
    /**
     * @zh 当某一行被点击时会触发该事件
     * @property {row: object, column: object, $event: MouseEvent}
     */
    rowClick: ({ row, column, $event }: Record<string, any>) => true,
    /**
     * @zh 当某个单元格被点击时会触发该事件
     * @property { row, rowIndex, $rowIndex, column, columnIndex, $columnIndex, triggerRadio, triggerCheckbox, triggerTreeNode, triggerExpandNode, $event }
     */
    cellClick: ({
      row,
      rowIndex,
      $rowIndex,
      column,
      columnIndex,
      $columnIndex,
      triggerRadio,
      triggerCheckbox,
      triggerTreeNode,
      triggerExpandNode,
      $event,
    }: Record<string, any>) => true,
    /**
     * @zh 当某一行被双击时会触发该事件
     * @property { row, column, $event }
     */
    rowDblclick: ({ row, column, $event }: Record<string, any>) => true,
    /**
     * @zh 当某个单元格被双击击时会触发该事件
     * @property {row,rowIndex,$rowIndex,column,columnIndex,$columnIndex,$event}
     */
    cellDblclick: ({
      row,
      rowIndex,
      $rowIndex,
      column,
      columnIndex,
      $columnIndex,
      $event,
    }: Record<string, any>) => true,
    /**
     * @zh 当某一行被鼠标右键点击时会触发该事件
     * @property { row, column, $event }
     */
    rowContextmenu: ({ row, column, $event }: Record<string, any>) => true,
    /**
     * @zh 当单元格 hover 进入时会触发该事件
     * @property {row,rowIndex,$rowIndex,column,columnIndex,$columnIndex,$event}
     */
    cellMouseEnter: ({
      row,
      rowIndex,
      $rowIndex,
      column,
      columnIndex,
      $columnIndex,
      $event,
    }: Record<string, any>) => true,
    /**
     * @zh 当单元格 hover 退出时会触发该事件
     * @property {row,rowIndex,$rowIndex,column,columnIndex,$columnIndex,$event}
     */
    cellMouseLeave: ({
      row,
      rowIndex,
      $rowIndex,
      column,
      columnIndex,
      $columnIndex,
      $event,
    }: Record<string, any>) => true,
    /**
     * @zh 当行 hover 进入时会触发该事件
     * @property {row,rowIndex,$rowIndex,column,columnIndex,$columnIndex,$event}
     */
    rowMouseEnter: ({ row, rowIndex, $rowIndex, $event }: Record<string, any>) => true,
    /**
     * @zh 当行 hover 退出时会触发该事件
     * @property {row,rowIndex,$rowIndex,column,columnIndex,$columnIndex,$event}
     */
    rowMouseLeave: ({ row, rowIndex, $rowIndex, $event }: Record<string, any>) => true,
    /**
     * @zh 当某一列的表头被点击时会触发该事件
     * @property {$rowIndex,column,columnIndex,$columnIndex,triggerResizable,triggerSort,triggerFilter,$event}
     */
    headerClick: ({
      $rowIndex,
      column,
      columnIndex,
      $columnIndex,
      triggerResizable,
      triggerSort,
      triggerFilter,
      $event,
    }: Record<string, any>) => true,
    /**
     * @zh 当某一列的表头被鼠标右键点击时触发该事件
     * @property { type, column, columnIndex, $event }
     */
    headerContextmenu: ({ type, column, columnIndex, $event }: Record<string, any>) => true,
    /**
     * @zh 当表格的当前行发生变化的时候会触发该事件，如果要高亮当前行，请打开表格的 highlight-current-row 属性
     * @property {newValue,oldValue,row,rowIndex,$rowIndex,column,columnIndex,$columnIndex,$event}
     */
    currentChange: ({
      newValue,
      oldValue,
      row,
      rowIndex,
      $rowIndex,
      column,
      columnIndex,
      $columnIndex,
      $event,
    }: Record<string, any>) => true,
    /**
     * @zh 当列宽拖动发生变化时会触发该事件
     * @property {$rowIndex,column,columnIndex,$columnIndex,$event}
     */
    headerDagend: ({ $rowIndex, column, columnIndex, $columnIndex, $event }: Record<string, any>) =>
      true,
    /**
     * @zh 当行展开或收起时会触发该事件
     * @property {expanded,row,rowIndex,$rowIndex,column,columnIndex,$columnIndex,$event}
     */
    expandChange: ({
      expanded,
      row,
      rowIndex,
      $rowIndex,
      column,
      columnIndex,
      $columnIndex,
      $event,
    }: Record<string, any>) => true,
    /**
     * @zh 全部选中
     */
    selectAll: ({ checked, $event }: Record<string, any>) => true,
    /**
     * @zh 选中一行
     */
    select: ({
      checked,
      row,
      rowIndex,
      $rowIndex,
      column,
      columnIndex,
      $columnIndex,
      $event,
    }: Record<string, any>) => true,
    /**
     * @zh 加载分页数据
     */
    loadPageData: ({ rows, currentPage, sidx }: Record<string, any>) => true,

    sortChange: ({ sidx }: { sidx: string }) => true,
    /**
     * @zh 过滤变动
     */
    filterChange: ({ param, rows, currentPage, sidx }: Record<string, any>) => true,
    'update:pageSize': (_value: number) => true,
    'update:tablePage': (_value: number) => true,

    /**
     * @zh 行数据改变
     */
    rowChange: (data: {
      value: any;
      data: Record<string, any> | Record<string, any>[];
      col: Record<string, any>;
      index: number;
      row: any;
      tableData: Record<string, any>[];
      type: string;
    }) => true,

    /**
     * @zh 数据改变时触发
     */
    change: (data: {
      value: any;
      data?: any;
      index?: number;
      tableData?: Record<string, any>[];
      col?: Record<string, any>;
      type?: string;
    }) => true,

    /**
     * @zh 组件点击事件
     */
    componentClick: (item: Record<string, any>) => true,
    fullscreen: (value: boolean) => true,
    drawerscreen: (value: boolean) => true,
  });

  const dataId = buildShortUUID();
  const tableRef = ref();
  const toolbarRef = ref();
  const isShowTable = ref(true);

  // 大数据
  const bigDataLength = ref(-1);
  const isReloading = ref(false);

  // 表格高度
  const tableHeight = computed(() => {
    if (props.height === 'notset' || (props.isChild && !props.isNeedHeight)) {
      return;
    }
    return '100%';
  });
  const tableWraperHeight = computed(() => {
    if (props.height === 'notset' || (props.isChild && !props.isNeedHeight)) {
      return;
    }
    return props.height;
  });

  // 边框属性
  const border = computed(() => {
    if (tableColumns.value.findIndex((t) => t.children && t.children.length > 0) !== -1) {
      return 'full';
    }
    return props.borderType || false;
  });

  // 是否有固定列
  const isFixed = computed(() => {
    const item = arrayColumns.value.find(
      (item: any) => item.fixed === 'left' || item.fixed === 'right',
    );
    return item !== undefined && !props.isSortable;
  });

  // 序号列宽度
  const seqWidth = computed(() => {
    const max = indexMethod({ rowIndex: dataSourceLength.value }) + '';
    let res = max.length * 10 + 20;
    let defaultW = 45;
    if (props.isEditTable) {
      defaultW = 60;
    }
    if (res < defaultW) {
      res = defaultW;
    }
    return res;
  });
  const dataSourceLength = computed(() => {
    if (bigDataLength.value !== -1) {
      return bigDataLength.value;
    }
    return props.dataSource.length;
  });

  const isShowNumCol = computed(
    () =>
      isEditShowNum.value ||
      (!isEditRead.value && isEditAddBtn.value) ||
      (!isEditRead.value && isEditRemoveBtn.value),
  );

  // 虚拟行列设置
  const myScrollY = computed(() => {
    const hasAutoWrapColumn =
      arrayColumns.value.findIndex((item: any) => item.isNotAutoWrap === false) !== -1;
    const hasNotScrollColumn =
      arrayColumns.value.findIndex((item: any) => item.config?.dataType === 'layerfile') !== -1;
    if (
      (Number(dataSourceLength.value) < 1001 && hasAutoWrapColumn) ||
      props.isExpand ||
      props.isSortable ||
      props.height === 'notset' ||
      props.isChild ||
      props.isNotScroll ||
      hasNotScrollColumn
    ) {
      return { enabled: false };
    }
    if (props.lazy) {
      return { enabled: true };
    }
    return { gt: props.scrollYGt, enabled: true };
  });
  const myScrollX = computed(() => {
    if (
      props.scrollXGt === -1 ||
      props.isExpand ||
      arrayColumns.value.find((t) => t.isNotHeaderAutoWrap === false)
    ) {
      return { enabled: false };
    }
    return { enabled: true, gt: props.scrollXGt };
  });

  // 表格底部
  const footerColNum = computed(() => {
    let i = 0;
    if (props.isSortable && !props.isTree) {
      i++;
    }

    if (props.isExpand) {
      i++;
    }
    if (isShowNumCol.value) {
      i++;
    }
    if (!isShowNumCol.value && (props.showSummary || props.showSumTotal)) {
      i++;
    }
    if (props.isMultiSelect) {
      i++;
    }
    if (props.isRadio) {
      i++;
    }
    return i;
  });
  const footerRowspanMethod = (params: Record<string, any>) => {
    const { _rowIndex, _columnIndex } = params;
    if (_rowIndex === 0) {
      if (_columnIndex === 0) {
        return { rowspan: 1, colspan: footerColNum.value };
      }
      if (_columnIndex < footerColNum.value) {
        return { rowspan: 0, colspan: 0 };
      }
    }
  };

  // 树形设置
  const treeConfig = computed(() => {
    if (props.isTree) {
      return {
        transform: props.lazy,
        rowField: props.idKey || props.rowKey,
        parentField: props.pidKey,
        expandAll: props.defaultExpandAll,
        indent: props.indent,
        lazy: props.lazy,
        loadMethod: props.load,
        hasChildField: props.hasChildren,
        hasChild: props.hasChildren,
        expandRowKeys: props.expandRowKeys,
        reserve: !props.lazy,
      };
    }
    return null;
  });

  // 展开行设置
  const expandConfig = computed(() => {
    if (props.isExpand) {
      return {
        lazy: props.lazy,
        loadMethod: props.expandLoadMethod,
        expandRowKeys: props.expandRowKeys,
      };
    }
    return null;
  });

  // 列设置
  const columnsChecks: any = ref(null);
  const arrayColumns = computed(() => {
    let _columns: columns[] = []; // 属性转化适应新的表格插件
    // 列的数据结构是树形结构，方便处理需要转成数组结构
    const { columns } = props;
    if (props.columnsType === 'tree') {
      _columns = toArray(props.columns);
    } else {
      _columns = columns;
    }

    for (let i = 0; i < _columns.length; i++) {
      const col = _columns[i];
      if (col.fixed === true) {
        col.fixed = 'left';
      }
      if (col.fixed === false) {
        col.fixed = undefined;
      }

      if (col.width && col.minWidth) {
        delete col.width;
      }
    }

    return _columns;
  });
  const defaultCheckedKeys = computed(() =>
    arrayColumns.value.filter((t) => t.isNotShow !== true).map((t) => t._id),
  );
  const checkColumns = computed(() => {
    const unrefArrayColumns = unref(arrayColumns);
    const unrefColumnsChecks = unref(columnsChecks);

    let res;
    if (unrefColumnsChecks != null) {
      res = unrefArrayColumns.filter((t) => unrefColumnsChecks.indexOf(t._id) !== -1);
    } else {
      res = unrefArrayColumns.filter((t) => defaultCheckedKeys.value.indexOf(t._id) !== -1);
    }
    if (res.length === 0) {
      return [{ label: '', prop: 'jcode_null', minWidth: '1', resizable: false }];
    }

    if (
      !props.isNotMinWidth &&
      res.findIndex((t) => t.minWidth) === -1 &&
      res.findIndex((t: any) => !t.width) === -1
    ) {
      // 如果没有自适应列，将第一列设置成自适应列
      res[0].minWidth = res[0].width || '1';
      delete res[0].width;
    }

    res.forEach((col) => {
      col.label = t(col.label || '');
    });

    return res;
  });
  const tableColumns = computed(() => toTree(checkColumns.value));
  const layerAddColumns = computed(() =>
    arrayColumns.value.filter(
      (t) => t.inputType === 'inputLayer' && t.config?.isMultiSelectToAddRow,
    ),
  );
  const propMap = computed(() => {
    const res: Record<string, string> = {};
    checkColumns.value.forEach((t: any) => {
      res[t.prop] = t.config?.filteProp || t.prop;
    });
    return res;
  });

  const upMap = computed(() => {
    const res: Record<string, string[]> = {};
    checkColumns.value.forEach((t: any) => {
      const upId = t.config?.upId;
      if (t.config?.upId) {
        res[upId] = res[upId] || [];
        res[upId].push(t.prop);
      }
    });
    return res;
  });

  // 分页设置
  const pageSidx = ref('');

  const myPageSize = ref(0);
  const currentPageSize = computed({
    get() {
      if (myPageSize.value !== 0) {
        return myPageSize.value;
      }
      return props.pageSize;
    },
    set(val) {
      myPageSize.value = val;
      emit('update:pageSize', val);
    },
  });

  const currentPage = computed({
    get() {
      return props.tablePage;
    },
    set(val) {
      emit('update:tablePage', val);
    },
  });

  // 表格数据
  const tableShowData = computed(() => {
    let res = props.dataSource?.filter((item: any) => item.jcode_table_flag !== 'delete') || [];
    if (props.isTree && !props.lazy) {
      if (isReloading.value) {
        return [];
      }
      res = toTree(res, props.idKey || props.rowKey, props.pidKey, props.rowKey, props.rowKey);
    }
    return res as Record<string, any>[];
  });

  // 右键菜单
  const menuConfig = computed(() => {
    const obj = {
      enabled: true,
    };
    return obj;
  });

  // 事件
  const handleSelectAll = ({ checked, $event }: Record<string, any>) => {
    emit('selectAll', { checked, $event });
  };
  const handleSelectionChange = ({
    checked,
    row,
    rowIndex,
    $rowIndex,
    column,
    columnIndex,
    $columnIndex,
    $event,
  }: Record<string, any>) => {
    emit('select', {
      checked,
      row,
      rowIndex,
      $rowIndex,
      column,
      columnIndex,
      $columnIndex,
      $event,
    });
  };
  const handleCellClick = ({
    row,
    rowIndex,
    $rowIndex,
    column,
    columnIndex,
    $columnIndex,
    triggerRadio,
    triggerCheckbox,
    triggerTreeNode,
    triggerExpandNode,
    $event,
  }: Record<string, any>) => {
    if (props.isEditTable) {
      if (column?.renderCell?.name !== 'renderRowEdit' && !tableRef.value.isEditByRow(row)) {
        tableRef.value.setEditRow(row);
      }

      // item.inputType || item.getInputType
    }

    emit('rowClick', { row, column, $event });
    emit('cellClick', {
      row,
      rowIndex,
      $rowIndex,
      column,
      columnIndex,
      $columnIndex,
      triggerRadio,
      triggerCheckbox,
      triggerTreeNode,
      triggerExpandNode,
      $event,
    });
  };
  const handleCellDblclick = ({
    row,
    rowIndex,
    $rowIndex,
    column,
    columnIndex,
    $columnIndex,
    $event,
  }: Record<string, any>) => {
    emit('rowDblclick', { row, column, $event });
    emit('cellDblclick', {
      row,
      rowIndex,
      $rowIndex,
      column,
      columnIndex,
      $columnIndex,
      $event,
    });
  };
  const handleCellMenu = ({ row, column, $event }: Record<string, any>) => {
    emit('rowContextmenu', { row, column, $event });
  };
  const currentHoverRowIndex = ref(-1);
  const handleCellMouseEnter = ({
    row,
    rowIndex,
    $rowIndex,
    column,
    columnIndex,
    $columnIndex,
    $event,
  }: Record<string, any>) => {
    // 当单元格 hover 进入时会触发该事件
    emit('cellMouseEnter', {
      row,
      rowIndex,
      $rowIndex,
      column,
      columnIndex,
      $columnIndex,
      $event,
    });
    if ($rowIndex !== currentHoverRowIndex.value) {
      currentHoverRowIndex.value = $rowIndex;
      emit('rowMouseEnter', {
        row,
        rowIndex,
        $rowIndex,
        $event,
      });
    }
  };
  const handleCellMouseLeave = ({
    row,
    rowIndex,
    $rowIndex,
    column,
    columnIndex,
    $columnIndex,
    $event,
  }: Record<string, any>) => {
    // 当单元格 hover 退出时会触发该事件
    emit('cellMouseLeave', {
      row,
      rowIndex,
      $rowIndex,
      column,
      columnIndex,
      $columnIndex,
      $event,
    });
    if ($rowIndex === currentHoverRowIndex.value) {
      // 检查下一个鼠标所在位置是否不在当前行
      if (getHoverRowVary($event)) {
        emit('rowMouseLeave', {
          row,
          rowIndex,
          $rowIndex,
          $event,
        });
      }
    }
  };
  // 辅助函数：对比当前行索引与下一个鼠标所在的行索引是否不一致
  const getHoverRowVary = ($event: any) => {
    const target = $event.relatedTarget;
    const fromEle = $event.fromElement;
    if (!target) return true;
    if (!fromEle) return true;
    const targetRowElement = target.closest('.vxe-body--row');
    if (!targetRowElement) return true;
    const targetRowIndexAttr = targetRowElement.getAttribute('rowid');

    const fromEleRowElement = fromEle.closest('.vxe-body--row');
    if (!fromEleRowElement) return true;
    const fromEleRowIndexAttr = fromEleRowElement.getAttribute('rowid');
    return fromEleRowIndexAttr !== targetRowIndexAttr;
  };
  const handleHeaderClick = ({
    $rowIndex,
    column,
    columnIndex,
    $columnIndex,
    triggerResizable,
    triggerSort,
    triggerFilter,
    $event,
  }: Record<string, any>) => {
    emit('headerClick', {
      $rowIndex,
      column,
      columnIndex,
      $columnIndex,
      triggerResizable,
      triggerSort,
      triggerFilter,
      $event,
    });
  };
  const handleHeaderContextmenu = ({ type, column, columnIndex, $event }: Record<string, any>) => {
    emit('headerContextmenu', { type, column, columnIndex, $event });
  };

  const handleCurrentRowChange = ({
    newValue,
    oldValue,
    row,
    rowIndex,
    $rowIndex,
    column,
    columnIndex,
    $columnIndex,
    $event,
  }: Record<string, any>) => {
    // 当表格的当前行发生变化的时候会触发该事件，如果要高亮当前行，请打开表格的 highlight-current-row 属性
    emit('currentChange', {
      newValue,
      oldValue,
      row,
      rowIndex,
      $rowIndex,
      column,
      columnIndex,
      $columnIndex,
      $event,
    });
  };
  const handleHeaderDagend = ({
    $rowIndex,
    column,
    columnIndex,
    $columnIndex,
    $event,
  }: Record<string, any>) => {
    // 当拖动表头改变了列的宽度的时候会触发该事件
    emit('headerDagend', {
      $rowIndex,
      column,
      columnIndex,
      $columnIndex,
      $event,
    });
  };
  const handleExpandChange = ({
    expanded,
    row,
    rowIndex,
    $rowIndex,
    column,
    columnIndex,
    $columnIndex,
    $event,
  }: Record<string, any>) => {
    emit('expandChange', {
      expanded,
      row,
      rowIndex,
      $rowIndex,
      column,
      columnIndex,
      $columnIndex,
      $event,
    });
  };
  const handleSortChangeEvent = ({ sortList }: Record<string, any>) => {
    const _pageSidx: string = sortList
      .map((item: Record<string, any>) => `${item.property} ${item.order}`)
      .join(', ');
    if (props.isPage) {
      pageSidx.value = _pageSidx;
      emit('loadPageData', {
        rows: currentPageSize.value,
        page: currentPage.value,
        sidx: pageSidx.value,
      });
    }
    emit('sortChange', { sidx: _pageSidx });
  };
  const handleCurrentPageChange = (page: number, pageSize: number) => {
    emit('loadPageData', {
      rows: pageSize,
      page,
      sidx: pageSidx.value,
    });
  };

  // 方法
  const pSetAllTreeExpand = (expand = true) => {
    tableRef.value && tableRef.value.setAllTreeExpand(expand);
  };
  const pReloadData = (data: any[]) => {
    setDataSource(data);
    return tableRef.value.reloadData(data);
  };
  const pReset = () => {
    pClearSelection();
  };
  const pClearSelection = () => {
    if (tableRef.value) {
      if (props.isRadio) {
        tableRef.value.clearRadioRow();
      } else if (props.isMultiSelect) {
        tableRef.value.clearCheckboxRow();
      }
    }
  };
  const pToggleRowSelection = (rows: any[], selected: boolean) => {
    tableRef.value && tableRef.value.setCheckboxRow(rows, selected);
  };

  const pGetSelections = () => {
    if (!tableRef.value) return [];
    if (props.isRadio) {
      const currRow = tableRef.value.getRadioRecord() || deepClone(radioRow.value);
      radioRow.value = {};
      if (currRow) {
        return [deepClone(currRow)];
      }
      return [];
    }
    if (props.isMultiSelect) {
      let res = tableRef.value.getCheckboxRecords();
      if (props.isTree) {
        res = deepClone(res);
        res.forEach((row: any) => {
          delete row.children;
        });
      }
      return res;
    }
  };

  const pDoLayout = () => {
    isShowTable.value = false;
    nextTick(() => {
      isShowTable.value = true;
    });
  };

  const pClearCurrentColumn = () => tableRef.value.clearCurrentColumn();

  const pClearFilter = (prop?: string) => {
    if (prop) {
      const cFilteProp = propMap.value[prop];
      filterValues[cFilteProp] = '';
      tableRef.value.clearFilter(tableRef.value.getColumnByField(prop));
    } else {
      clearData(filterValues);
      tableRef.value.clearFilter();
    }
  };

  const pReLoadData = () => {
    isReloading.value = true;
    nextTick(() => {
      isReloading.value = false;
    });
  };

  const pGetColumnByField = (prop: string) => tableRef.value.getColumnByField(prop);
  const pGetColumnById = (id: string) => tableRef.value.getColumnById(id);

  // 内部方法
  (window as any).jcode_table_data = (window as any).jcode_table_data || {};
  const getDataSource = () => {
    const data = (window as any).jcode_table_data[dataId];
    if (data) {
      return data;
    }
    return props.dataSource;
  };
  const setDataSource = (data: any[]) => {
    bigDataLength.value = data.length;
    (window as any).jcode_table_data[dataId] = data;
  };

  const indexMethod = ({ rowIndex }: { rowIndex: number }) => {
    if (props.isPage) {
      return (currentPage.value - 1) * currentPageSize.value + rowIndex + 1;
    }
    return rowIndex + 1;
  };

  // 表尾部 统计:
  const getSummaries = (param: Record<string, any>) => {
    if (props.summaryMethod) {
      return props.summaryMethod(param);
    }
    const { columns, data } = param;
    const sums: any[] = [];
    const sumsTotal: any[] = [];
    columns.forEach((column: Record<string, any>, index: number) => {
      if (index === 0) {
        sums[index] = props.sumText;
        sumsTotal[index] = props.sumTotalText;
        return;
      }

      const myColumn = arrayColumns.value.find((t) => t.prop === column.property);

      if (props.showSummary) {
        if (myColumn && myColumn.isSummary) {
          const values = data.map((item: Record<string, any>) => Number(item[column.property]));
          const precision = 5;
          const multiplier = 10 ** precision;
          if (!values.every((value: any) => isNaN(value))) {
            sums[index] =
              values.reduce((prev: any, curr: any) => {
                const value = Number(curr);
                if (!isNaN(value)) {
                  return prev + curr * multiplier;
                }
                return prev;
              }, 0) / multiplier;
          } else {
            sums[index] = '';
          }
        } else {
          sums[index] = '';
        }
      }
      if (props.showSumTotal) {
        if (myColumn && myColumn.isSumTotal) {
          if (myColumn.sumDataCode && myColumn.sumValueKey) {
            // 根据数据源获取数据
            loadDbSourceList(myColumn.sumDataCode, undefined, false);
          }
          sumsTotal[index] =
            getDbSourceList.value[myColumn.sumDataCode]?.[0]?.[myColumn.sumValueKey] || '';
        } else {
          sumsTotal[index] = '';
        }
      }
    });
    const res = [];
    if (props.showSummary) {
      res.push(sums);
    }
    if (props.showSumTotal) {
      res.push(sumsTotal);
    }
    return res;
  };

  // 过滤筛选
  const filterValues = reactive<Record<string, string>>({});
  const filterOptions = [{ data: '' }];
  const filterTempValue = ref('');
  const handleFilterChange = ({ values, property }: Record<string, any>) => {
    const filteProp = propMap.value[property];
    const old = filterValues[filteProp] || '';

    if (values.length > 0) {
      filterValues[filteProp] = filterTempValue.value;
    } else {
      filterValues[filteProp] = '';
    }

    // 清除下级筛选条件
    if (old !== filterValues[filteProp]) {
      const list = upMap.value[property] || [];
      const len = list.length;
      for (let index = 0; index < len; index++) {
        pClearFilter(list[index]);
      }
    }

    emit('filterChange', {
      param: deepClone(filterValues),
      rows: currentPageSize.value,
      page: currentPage.value,
      sidx: pageSidx.value,
    });
  };
  const handleFilterVisible = ({ property, visible }: Record<string, any>) => {
    if (visible) {
      filterTempValue.value = filterValues[propMap.value[property]] || '';
    }
  };

  // 数据转化
  const hasCompany = arrayColumns.value.findIndex((t) => t.config?.dataType === 'company') > -1;
  const {
    getLabel,
    t,
    getDbSourceList,
    loadDbSourceList,
    getLoginInfo,
    excelExport,
    excelImportUploadData,
    useFile,
  } = useFramework({ hasCompany });
  const { fileChunkedUpload } = useFile();
  const getColumnLabel = (
    value: string | number | boolean,
    row: Record<string, any>,
    _conifg?: Record<string, any>,
    _isSwitch?: boolean,
  ) => {
    if (_isSwitch) {
      let checkedValue: any = 1;
      let unCheckedValue: any = 0;
      if (_conifg?.checkedValue === undefined) {
        checkedValue = 1;
      } else if (_conifg?.checkedValue === 'true' || _conifg?.checkedValue === true) {
        checkedValue = true;
      } else if (_conifg?.checkedValue === 'false' || _conifg?.checkedValue === false) {
        checkedValue = false;
      }
      // eslint-disable-next-line no-unsafe-optional-chaining
      else if (Number(_conifg?.checkedValue + '').toString() !== 'NaN') {
        checkedValue = Number(_conifg?.checkedValue);
      }

      if (_conifg?.unCheckedValue === undefined) {
        unCheckedValue = 0;
      } else if (_conifg?.unCheckedValue === 'true' || _conifg?.unCheckedValue === true) {
        unCheckedValue = true;
      } else if (_conifg?.unCheckedValue === 'false' || _conifg?.unCheckedValue === false) {
        unCheckedValue = false;
      }
      // eslint-disable-next-line no-unsafe-optional-chaining
      else if (Number(_conifg?.unCheckedValue + '').toString() !== 'NaN') {
        unCheckedValue = Number(_conifg?.unCheckedValue);
      }

      if (value === checkedValue) {
        return '是';
      }
      if (value === unCheckedValue) {
        return '否';
      }
    }

    if (_conifg && !isNullOrEmpty(value)) {
      if (_conifg.inputType === 'lr-input-user') {
        _conifg.dataType = 'user';
      } else if (_conifg.inputType === 'lr-input-company') {
        _conifg.dataType = 'company';
      } else if (_conifg.inputType === 'lr-input-department') {
        _conifg.dataType = 'department';
      }
      /*
        else if(_conifg.inputType === 'lr-input-area'){
          _conifg.dataType = 'department'
        }
        */

      return getLabel(value, _conifg, row);
    }
    return value;
  };

  // 编辑表格, 输入
  const { formState, isChildTableVirtualDel } = inject(
    'jcode_form_provide',
    {} as Record<string, any>,
  );

  const handleInputChange = (
    changeData: { value: any; data: any },
    data: { column: columns; index: number; row: any },
  ) => {
    const editData = getDataSource();
    emit('rowChange', {
      value: changeData.value,
      data: changeData.data,
      index: data.index,
      row: data.row,
      col: data.column,
      tableData: editData,
      type: 'update',
    });
  };
  const setParentData = (data: Record<string, any>, parentData: Record<string, any>) => {
    if (data.parentData) {
      setParentData(data.parentData, parentData);
    } else {
      data.parentData = parentData;
    }
  };
  const handleEditChange = (
    params: {
      value: any;
      data?: any;
      index?: number;
      row?: any;
      tableData?: Record<string, any>[];
      type?: string;
    },
    parentData: Record<string, any>,
  ) => {
    setParentData(params, parentData);
    emit('rowChange', params);
  };

  const handleEditRowChange = (data: Record<string, any>, parentData: Record<string, any>) => {
    setParentData(data, parentData);
    emit('rowChange', data);
  };

  const handleComponentClick = (item: Record<string, any>) => {
    emit('componentClick', item);
  };

  const handleEditRowClick = (even: any, item: Record<string, any>) => {
    emit('rowClick', { ...even, ...item });
  };

  const handleEditRowMouseEnter = (even: any, item: Record<string, any>) => {
    emit('rowMouseEnter', { ...even, ...item });
  };
  const handleEditRowMouseLeave = (even: any, item: Record<string, any>) => {
    emit('rowMouseLeave', { ...even, ...item });
  };

  const getInputConfig = (
    config: Record<string, any>,
    index: number,
    row?: Record<string, any>,
    item?: Record<string, any>,
  ) => {
    const myConfig = { ...config };
    const myRow = row || tableShowData.value[index];
    if (props.editConfig?.row) {
      myRow.parentRow = props.editConfig.row;
    }
    if (item?.inputType === 'lr-button') {
      myConfig.label = item.label;
    }
    if (myConfig.getUpConfig) {
      const _config = config.getUpConfig({
        formData: formState,
        index,
        row: myRow,
        tableData: tableShowData.value,
        config: myConfig,
      });
      if (_config) {
        Object.keys(_config).forEach((key) => {
          myConfig[key] = _config[key];
        });
      }
    }
    myConfig.row = myRow;

    return myConfig;
  };

  const isEditShowNum = computed(() => props.isShowNum || props.editConfig?.isShowNum);
  const isEditAddBtn = computed(
    () => props.isAddBtn || (props.editConfig?.isAddBtn && !props.editConfig?.isRowFixed),
  );
  const isEditRemoveBtn = computed(
    () => props.isRemoveBtn || (props.editConfig?.isRemoveBtn && !props.editConfig?.isRowFixed),
  );
  const isEditRead = computed(
    () =>
      props.isRead ||
      props.editConfig?.isRead ||
      props.editConfig?.readonly ||
      props.editConfig?.disabled,
  );
  const editRequired = computed(() => props.required || props.editConfig?.required);
  const editVRepeatList = computed(() => props.editConfig?.vRepeatList || props.vRepeatList);
  const hasDeleteBtn = (row: Record<string, any>) => {
    if (props.filterDeleteBtn) {
      return props.filterDeleteBtn(row);
    }
    if (props.editConfig?.filterDeleteBtn) {
      return props.editConfig?.filterDeleteBtn(row);
    }
    return true;
  };

  const isImportExcel = computed(() => props.editConfig?.isImportExcel);
  const isExportExcel = computed(() => props.editConfig?.isExportExcel);

  // 校验
  const isRequired = (property: any) => {
    const myColumn = arrayColumns.value.find((t) => t.prop === property);
    if (!myColumn) {
      return false;
    }

    return (myColumn.rule && myColumn.rule?.findIndex((t: any) => t.required) !== -1) || false;
  };

  const handleValidate = (editData: Record<string, any>[], unrefColumns: columns[]) => {
    const res = {
      isOk: true,
      info: '',
    };
    if (editRequired.value) {
      if (editData.length === 0) {
        res.isOk = false;
        res.info = '请添加表格数据';
        return res;
      }
    }
    const rowLen = editData.length;
    const colLen = unrefColumns.length;
    for (let rowIndex = 0; rowIndex < rowLen; rowIndex++) {
      const row = editData[rowIndex];
      for (let colIndex = 0; colIndex < colLen; colIndex++) {
        const col = unrefColumns[colIndex];

        if (col.inputType === 'gridtable') {
          const cRes = handleValidate(row[col.prop || ''] || [], col.children || []);
          if (cRes.isOk === false) {
            return cRes;
          }
        }

        if (getInputConfig(col.config || {}, rowIndex).display !== false) {
          if (col.rule && col.rule.length > 0) {
            const patternLen = col.rule.length;
            for (let i = 0; i < patternLen; i++) {
              const ruleItem = col.rule[i];
              ruleItem.pattern = ruleItem.pattern ? ruleItem.pattern + '' : '';
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
    }

    // 做数据重复校验
    if (res && editVRepeatList.value) {
      for (let i = 0; i < editVRepeatList.value.length; i++) {
        const repeatItem: Record<string, any> = editVRepeatList.value[i] || {};
        if (repeatItem.value) {
          const componentPropList = repeatItem.value.split(',');
          const map: Record<string, any> = {};
          for (let j = 0, jlen = editData.length; j < jlen; j++) {
            const row = editData[j];
            let values = '';
            let message = '';
            for (let i = 0, len = componentPropList.length; i < len; i++) {
              const value = row[componentPropList[i]];
              if (message !== '') {
                message += ',';
              }
              const col: Record<string, any> =
                unrefColumns.find((item: any) => item.prop === componentPropList[i]) || {};
              message += t(col.label);
              if (value) {
                values += `_${value}`;
              } else {
                values = '';
                break;
              }
            }
            if (values) {
              if (map[values]) {
                message = `【${message}】`;
                if (componentPropList.length > 1) {
                  message += t('组合');
                }
                message += `${t('值重复')}!`;
                res.info = message;
                res.isOk = false;
                return res;
              }
              map[values] = true;
            }
          }
        }
      }
    }

    return res;
  };
  const pValidate = () => {
    const dataSource = getDataSource();
    const unrefColumns = unref(arrayColumns);
    return handleValidate(dataSource, unrefColumns);
  };

  const isAddRow = ref(false);
  let addOpenParam: any;
  let loadAddLayerComponentNum = 0;
  const tableAddLayerRef = ref();
  const tableAddLayerComponentRef = ref();
  const loadAddLayerComponent = () => {
    if (tableAddLayerComponentRef.value) {
      loadAddLayerComponentNum = 0;
      tableAddLayerComponentRef.value.open &&
        tableAddLayerComponentRef.value.open(
          addOpenParam,
          tableAddLayerRef.value.showLoading,
          tableAddLayerRef.value.hideLoading,
        );
    } else {
      if (loadAddLayerComponentNum > 600) {
        console.warn('添加弹窗组件加载超时');
        return;
      }
      loadAddLayerComponentNum++;
      setTimeout(() => {
        loadAddLayerComponent();
      }, 100);
    }
  };
  const handleAdd = (param?: any) => {
    isAddRow.value = true;
    tableRef.value.clearEdit();
    addOpenParam = param;
    // 校验是否允许打开添加数据
    if (props.editConfig?.addOpenValidate) {
      if (!props.editConfig?.addOpenValidate(formState)) {
        return;
      }
    }
    // 调用设定的添加弹窗组件方法
    if (props.editConfig?.addLayerName) {
      tableAddLayerRef.value.open(
        props.editConfig?.title || props.editConfig?.label || '',
        props.editConfig?.addLayerType,
      );
      loadAddLayerComponent();
      return;
    }
    const editData = getDataSource();
    // 调用设定的addRow方法
    if (props.editConfig?.addRow) {
      props.editConfig?.addRow(editData);
      return;
    }
    // 默认添加行数据
    const row: any = {};
    arrayColumns.value.forEach((col: columns) => {
      if (col) {
        const colId = col.prop;
        if (
          ![
            'guid',
            'createtime',
            'modifytime',
            'company',
            'department',
            'createuser',
            'modifyuser',
          ].includes(col.type)
        ) {
          row[colId] = col.config?.defaultValue || undefined;
        } else {
          row[colId] = '';
        }

        if (!col.isHidden) {
          switch (col.inputType) {
            case 'encode':
              row[colId] = `jcode_code_${col.config?.code}|${buildUUID()}`;
              break;
            case 'guid':
              row[colId] = buildUUID();
              break;
            case 'company':
              row[colId] = getLoginInfo?.value?.f_CompanyId;
              break;
            case 'department':
              row[colId] = getLoginInfo?.value?.f_DepartmentId;
              break;
            case 'createuser':
              row[colId] = getLoginInfo?.value?.f_UserId;
              break;
            case 'modifyuser':
              row[colId] = getLoginInfo?.value?.f_UserId;
              break;
            case 'createtime':
              row[colId] = formatToDateTime();
              break;
            case 'modifytime':
              row[colId] = formatToDateTime();
              break;
          }
        }

        if (col.inputType === 'gridtable') {
          row[colId] = [];
        }
      }
    });
    const rowIndex = editData.length;
    editData.push(row);
    row.jcode_table_flag = 'add';

    emit('change', {
      value: row,
      data: row,
      index: rowIndex,
      tableData: editData,
      type: 'add',
    });
  };
  const handleAddByInputLayer = (param: Record<string, any>, myCol: Record<string, any>) => {
    if (param.data) {
      param.data.forEach((rowItem: Record<string, any>) => {
        // 默认添加行数据
        const row: any = {};
        let myValue = '';
        arrayColumns.value.forEach((col: columns) => {
          if (col) {
            const colId = col.prop;
            if (
              ![
                'guid',
                'createtime',
                'modifytime',
                'company',
                'department',
                'createuser',
                'modifyuser',
              ].includes(col.type)
            ) {
              row[colId] = col.config?.defaultValue || undefined;
            } else {
              row[colId] = '';
            }

            if (!col.isHidden) {
              switch (col.inputType) {
                case 'encode':
                  row[colId] = `jcode_code_${col.config?.code}|${buildUUID()}`;
                  break;
                case 'guid':
                  row[colId] = buildUUID();
                  break;
                case 'company':
                  row[colId] = getLoginInfo?.value?.f_CompanyId;
                  break;
                case 'department':
                  row[colId] = getLoginInfo?.value?.f_DepartmentId;
                  break;
                case 'createuser':
                  row[colId] = getLoginInfo?.value?.f_UserId;
                  break;
                case 'modifyuser':
                  row[colId] = getLoginInfo?.value?.f_UserId;
                  break;
                case 'createtime':
                  row[colId] = formatToDateTime();
                  break;
                case 'modifytime':
                  row[colId] = formatToDateTime();
                  break;
              }
            }

            if (col.inputType === 'gridtable') {
              row[colId] = [];
            }

            if (colId === myCol.prop) {
              row[colId] = rowItem[myCol.config?.valueKey];
              myValue = row[colId];
            }
          }
        });
        const editData = getDataSource();
        const rowIndex = editData.length;
        editData.push(row);
        row.jcode_table_flag = 'add';
        emit('change', {
          value: row,
          data: row,
          index: rowIndex,
          tableData: editData,
          type: 'add',
        });
        handleInputChange(
          { value: myValue, data: rowItem },
          {
            index: rowIndex,
            column: myCol as any,
            row,
          },
        );
      });
    }
  };

  const tableAddLayerOk = async (showLoading: any, hideLoading: any) => {
    showLoading('数据获取中...');
    const editData = getDataSource();
    // 校验弹窗表单
    if (tableAddLayerComponentRef.value?.validate) {
      if ((await tableAddLayerComponentRef.value?.validate(editData)) === false) {
        hideLoading();
        return;
      }
    }

    if (tableAddLayerComponentRef.value?.ok) {
      // 获取勾选的数据
      const res = await tableAddLayerComponentRef.value.ok();
      let addList = [];
      if (props.editConfig?.addDataFilter) {
        addList = await props.editConfig?.addDataFilter(res, editData);
      } else if (res && res.length > 0) {
        // 数据进行过滤
        addList = res.filter((item: any) => {
          const index = editData.findIndex(
            (row: any) =>
              row[props.editConfig?.key || 'id'] === item[props.editConfig?.key || 'id'],
          );
          if (index !== -1) {
            editData[index] = item;
            return false;
          }
          return true;
        });
      }
      const rowIndex = editData.length;
      addList.forEach((item: any) => {
        item.jcode_table_flag = 'add';
      });
      editData.push(...addList);
      emit('change', {
        value: addList,
        data: addList,
        index: rowIndex,
        tableData: editData,
        type: 'addList',
      });
    }
    tableAddLayerRef.value.close();
    hideLoading();
  };
  const tableAddLayerClosed = () => {
    if (tableAddLayerComponentRef.value?.closed) {
      tableAddLayerComponentRef.value.closed();
    }
  };

  const handleDelete = (row: Record<string, any>, rIndex: number) => {
    const editData = getDataSource();
    let newIndex = rIndex;
    if (isChildTableVirtualDel) {
      let delFlagIndx = 0;
      for (let i = 0; i < editData.length; i++) {
        if (editData[i].jcode_table_flag === 'delete') {
          delFlagIndx += 1;
        }
        if (i - delFlagIndx === rIndex) {
          newIndex = i;
          break;
        }
      }
    }

    if (props.editConfig?.beforeDelete) {
      if (!props.editConfig?.beforeDelete({ row })) {
        return;
      }
    }

    if (!isChildTableVirtualDel || row.jcode_table_flag === 'add') {
      editData.splice(newIndex, 1);
    }
    row.jcode_table_flag = 'delete';

    if (props.editConfig?.afterDelete) {
      props.editConfig?.afterDelete({ tableData: editData, row });
    }
    emit('change', {
      value: row,
      data: row,
      index: newIndex,
      tableData: editData,
      type: 'delete',
    });
  };

  // 行排序(暂时不支持树形结构)
  const setSort = () => {
    const callback = () => {
      const el = tableRef.value.$el.querySelectorAll('.vxe-table--body-wrapper > table > tbody')[0];
      Sortable.create(el, {
        ghostClass: 'jcode-table__sortable',
        handle: '.jcode-table__drag-handler',
        onEnd: (evt: any) => {
          const oldindex = evt.oldIndex;
          const newindex = evt.newIndex;
          const dataSource = getDataSource();
          const targetRow = dataSource.splice(oldindex, 1)[0];
          dataSource.splice(newindex, 0, targetRow);

          // 调用设定的sortableChange方法
          if (props.editConfig?.sortableChange) {
            props.editConfig?.sortableChange(oldindex, newindex, targetRow, dataSource);
            return;
          }

          emit('change', {
            value: targetRow,
            data: targetRow,
            index: newindex,
            tableData: dataSource,
            type: 'sort',
          });

          pDoLayout();
          nextTick(() => {
            setSort();
          });
        },
      });
    };
    if (props.isSortable && !props.isTree) {
      nextTick(() => {
        callback();
      });
    }
  };
  onMounted(() => {
    setSort();
  });

  const getInputType = (col: Record<string, any>, row: Record<string, any>) =>
    col.getInputType ? col.getInputType(row) : col.inputType;

  // 监听表格数据数量变化
  const radioRow = ref();
  const handleRadioChange = ({ row }: Record<string, any>) => {
    radioRow.value = row;
  };

  // 监听表格数据数量变化,做滚动处理
  let scrollTime: any = null;
  watch(
    () => dataSourceLength.value,
    () => {
      if (isAddRow.value) {
        isAddRow.value = false;
        if (scrollTime === null) {
          scrollTime = setTimeout(() => {
            scrollTime = null;
            const row = tableRef.value.getData(dataSourceLength.value - 1);
            tableRef.value.scrollToRow(row);
          });
        }
      }
    },
  );

  const pClearRowExpand = () => {
    tableRef.value.clearRowExpand();
  };

  const pClearRowExpandLoadedAll = (loadRecords: Record<string, any>[] = []) => {
    loadRecords.forEach((row: any) => {
      tableRef.value.clearRowExpandLoaded(row);
    });
  };

  const pUpdateFooter = () => {
    tableRef.value.updateFooter();
  };

  if (props.isSetTable) {
    nextTick(() => {
      // 将表格和工具栏进行关联
      const $table = tableRef.value;
      const $toolbar = toolbarRef.value;
      if ($table && $toolbar) {
        $table.connect($toolbar);
      }
    });
  }

  const tableFullLayerRef = ref();
  const handleFull = (isOpen: boolean) => {
    if (isOpen) {
      tableFullLayerRef.value.open('', 'full');
    } else {
      tableFullLayerRef.value && tableFullLayerRef.value.close();
      emit('fullscreen', false);
    }
  };
  const handleFullEmit = (type: any, even: any) => {
    emit(type, even);
  };

  const tableDrawerRef = ref();
  const tableRowData: Record<string, any> = ref();
  const prowIndex = ref(-1);
  const drawerColumns: Record<string, any> = computed(() =>
    toTree(checkColumns.value.filter((item: any) => !(item._hasChildren === true && item.props))),
  );
  const handleDrawer = (isOpen: boolean, row: Record<string, any>, $rowIndex: number) => {
    if (isOpen) {
      tableDrawerRef.value.open(props.tableDrawerTitle || '', 'drawer');
      tableRowData.value = row;
      prowIndex.value = $rowIndex;
    } else {
      tableFullLayerRef.value && tableFullLayerRef.value.close();
      emit('drawerscreen', false);
    }
  };

  const handleDrawerAdd = () => {
    handleAdd();
    prowIndex.value = tableShowData.value.length - 1;
    tableRowData.value = tableShowData.value[prowIndex.value];
  };

  const clearRowPkValues = (cols: Record<string, any>[], row: Record<string, any>) => {
    const pCols = cols.filter((item: any) => item.config?.isPkey || item.inputType === 'gridtable');

    pCols.forEach((pCol: any) => {
      if (pCol.inputType === 'gridtable') {
        const rows = row[pCol.prop];
        rows.forEach((cRow: Record<string, any>) => {
          clearRowPkValues(pCol.children, cRow);
        });
      } else if (row[pCol.prop]) {
        row[pCol.prop] = undefined;
      }
    });
    row.jcode_table_flag = 'add';
  };

  const handleDrawerCopy = () => {
    const editData = getDataSource();
    // 调用设定的addRow方法
    if (props.editConfig?.addRow) {
      props.editConfig?.addRow(editData);
      return;
    }
    const row = JSON.parse(
      JSON.stringify(tableRowData.value, (key, value) => {
        if (key === 'parentRow') return undefined;
        return value;
      }),
    );
    delete row._X_ROW_KEY;
    isAddRow.value = true;
    tableRef.value.clearEdit();
    const rowIndex = editData.length;

    // 获取主键值并置空
    clearRowPkValues(arrayColumns.value, row);

    editData.push(row);

    emit('change', {
      value: row,
      data: row,
      index: rowIndex,
      tableData: editData,
      type: 'add',
    });
    prowIndex.value = tableShowData.value.length - 1;
    tableRowData.value = tableShowData.value[prowIndex.value];
  };

  // 导出
  const exportExcelTitle = ref('导出');
  const exportExcelVisible = ref(false);
  const exportCheckColumns = ref<string[]>([]);
  const exportColumns = computed(() =>
    toSimpleTree(
      props.columns?.filter((t) => t.inputType !== 'gridtable' && !t.isHidden),
      'prop',
      'label',
    ),
  );

  const getExportParentColumns = (
    childCol: Record<string, any>,
    res: Record<string, any>[],
    index: number,
    deep: number,
    col: Record<string, any>,
  ) => {
    if (childCol.parentId) {
      col.hasParent = true;
      const parentCol = tableRef.value.getColumnById(childCol.parentId);
      let oldCol = res.find((t) => t.prop === parentCol.id);
      if (oldCol) {
        oldCol.colSpan += 1;
      } else {
        oldCol = {
          prop: parentCol.id,
          label: parentCol.title,
          align: parentCol.align,
          x: index,
          y: parentCol.level - 1,
          colSpan: 1,
          deep,
        };
        res.push(oldCol);
      }
      getExportParentColumns(parentCol, res, index, deep + 1, oldCol);
    }
  };
  const getExportColumns = (columns: Record<string, any>[]) => {
    const res: Record<string, any>[] = [];
    let index = 0;
    let maxLevel = 0;

    columns.forEach((col) => {
      col.x = index;
      col.colSpan = 1;
      res.push(col);
      const tableCol = tableRef.value.getColumnByField(col.prop);
      if (tableCol) {
        col.y = tableCol.level - 1;
        col.deep = 0;
        if (tableCol.level > maxLevel) {
          maxLevel = tableCol.level;
        }

        getExportParentColumns(tableCol, res, index, 1, col);
        index++;
      }
    });

    res.forEach((col) => {
      if (col.hasParent) {
        col.rowSpan = 1;
      } else {
        col.rowSpan = maxLevel - col.deep;
      }
    });

    return res;
  };

  let exportData: Record<string, any>[] = [];

  const handleExportClick = async () => {
    exportExcelTitle.value = '导出Excel';
    exportCheckColumns.value = toArray(exportColumns.value).map((t) => t.value);

    exportData = JSON.parse(JSON.stringify(tableShowData.value));
    if (exportData.length === 0) {
      return;
    }
    // 处理列的小数点问题
    if (exportData.length > 0) {
      Object.keys(exportData[0]).forEach((key) => {
        if (exportData[0][key] === undefined || exportData[0][key] === null) {
          exportData[0][key] = '';
        } else {
          // eslint-disable-next-line operator-assignment
          exportData[0][key] = exportData[0][key] + '';
        }
      });
    }

    exportExcelVisible.value = true;
  };
  const handleExport = async () => {
    fullScreenLoading(true);
    const columns = arrayColumns.value.filter(
      (t) => exportCheckColumns.value.includes(t.prop) && !t._hasChildren,
    );

    const params = {
      fileName: exportExcelTitle.value,
      columns,
      tableHeader: getExportColumns(columns),
      isPage: false,
      dataUrl: '',
      dataList: exportData,
    };

    const res = await excelExport(params);
    fullScreenLoading(false);
    if (res) {
      exportData = []; // 清空数据
      exportExcelVisible.value = false;
    }
  };

  // 导入
  // excel导入
  const importExcelTitle = ref('导入');
  const importExcelVisible = ref(false);

  const handleImportClick = async () => {
    importExcelTitle.value = '导入';
    importExcelVisible.value = true;
  };

  const handleDownImportTemplate = async () => {
    fullScreenLoading(true);
    // 获取导入列
    // @ts-ignore
    const importColumns = (props.editConfig?.importColumns || []).sort((a, b) => a.label - b.label);
    const columns: Record<string, any>[] = [];
    importColumns.forEach((t: any) => {
      const col = arrayColumns.value.find((c) => c.prop === t.prop);
      if (col) {
        columns.push(col);
      }
    });

    const params = {
      fileName: '导入模版',
      columns,
      tableHeader: getExportColumns(columns),
      isPage: false,
      dataUrl: '',
      dataList: [],
    };

    await excelExport(params);
    fullScreenLoading(false);
  };

  // excel导入文件上传
  const importExcelFileList = ref<any[]>([]);
  const handleExcelUploadRequest = (data: any) => {
    setFile(data.file);
    chunkedUpload(data.file);
  };

  const setFile = (file: any) => {
    file.status = 'uploading';
    file.uploadSize = 0;
    file.icon = getFileIcon(file.name, file.type);

    file.id = file.uid;
    file.date = formatToDate();
  };

  const chunkedUpload = (file: any) => {
    importExcelFileList.value.push(file);

    if (file.status === 'unUpload') {
      return;
    }

    if (fileChunkedUpload) {
      fileChunkedUpload(file, {
        onStart: () => {},
        onProgress: onUpLoadProgress,
        onSuccess: onUpLoadSuccess,
        onError,
        uploadCallback: (data: any) => excelImportUploadData(data),
      });
    } else {
      file.response = {
        success: 1,
        fail: 0,
        data: [],
      };
      onUpLoadSuccess(file);
    }
  };

  const updateFilelist = () => {
    importExcelFileList.value = [...importExcelFileList.value];
  };
  const onUpLoadProgress = (file: any, fileSize: number, percent: number) => {
    file.percent = percent;
    file.uploadSize = fileSize;
    updateFilelist();
  };

  const onUpLoadSuccess = (file: any) => {
    file.status = 'done';

    // 将导入的数据添加到子表中
    if (
      file.response?.data &&
      file.response.data.length >= (props.editConfig?.importBeginRow || 1)
    ) {
      const importData = file.response?.data;
      const keys = Object.keys(importData[0]);

      file.response?.data.forEach((row: Record<string, any>, index: number) => {
        if (index >= (props.editConfig?.importBeginRow || 1) - 1) {
          const resRow: Record<string, any> = {};
          props.editConfig?.importColumns.forEach((col: any) => {
            if (col.label < keys.length && col.label && col.prop) {
              const key = keys[col.label - 1];
              resRow[col.prop] = row[key];
            }
          });
          const editData = getDataSource();
          const rowIndex = editData.length;
          resRow.jcode_table_flag = 'add';

          editData.push(resRow);
          emit('change', {
            value: resRow,
            data: resRow,
            index: rowIndex,
            tableData: editData,
            type: 'add',
          });
        }
      });
    }

    updateFilelist();
    importExcelVisible.value = false;
  };

  const onError = (file: any, error: any) => {
    console.error(error, 'jcode 极简搭:文件上传错误！');
    file.status = 'error';
    updateFilelist();
  };

  function showPageTotal(total: any) {
    return `${$t('共')} ${total} ${$t('条')}`;
  }
  /**
   * @zh 表格展开/收起全部树形结构
   * @public
   * @param {boolean} expand,默认值true
   */
  function setAllTreeExpand(expand = true) {
    pSetAllTreeExpand(expand);
  }
  /**
   * @zh 表格数据重载,适用于大数据
   * @public
   * @param {Record<string, any>[]} data
   */
  function reloadData(data: Record<string, any>[]) {
    pReloadData(data);
  }
  /**
   * @zh 表格重置,清空多选项
   * @public
   */
  function reset() {
    pReset();
  }
  /**
   * @zh 表格重新刷新
   * @public
   */
  function doLayout() {
    pDoLayout();
  }
  /**
   * @zh 重新加载数据
   * @public
   */
  function reLoadData() {
    pReLoadData();
  }
  /**
   * @zh 清空多选项
   * @public
   */
  function clearSelection() {
    pClearSelection();
  }
  /**
   * @zh 切换行选中状态
   * @public
   * @param {Record<string, any>[]} rows
   * @param {boolean} selected
   */
  function toggleRowSelection(rows: Record<string, any>[], selected: boolean) {
    pToggleRowSelection(rows, selected);
  }
  /**
   * @zh 获取选中行
   * @public
   */
  function getSelections() {
    return pGetSelections();
  }
  /**
   * @zh 清空当前行
   * @public
   */
  function clearCurrentColumn() {
    pClearCurrentColumn();
  }
  /**
   * @zh 表格校验
   * @public
   */
  function validate() {
    return pValidate();
  }
  /**
   * @zh 清空筛选条件
   * @public
   */
  function clearFilter(prop?: string) {
    return pClearFilter(prop);
  }
  /**
   * @zh 添加行数据
   * @public
   */
  function addRow(param?: any) {
    handleAdd(param);
  }
  /**
   * @zh 清除展开行
   * @public
   */
  function clearRowExpand() {
    pClearRowExpand();
  }
  /**
   * @zh 清除loadRecords中的行懒加载展开行的状态,数据会恢复成未展开的状态，当再次展开时会重新加载
   * @public
   */
  function clearRowExpandLoadedAll(loadRecords: Record<string, any>[] = []) {
    pClearRowExpandLoadedAll(loadRecords);
  }
  /**
   * @zh 获取列信息
   * @public
   */
  function getColumnByField(prop: string) {
    return pGetColumnByField(prop);
  }
  /**
   * @zh 获取列信息
   * @public
   */
  function getColumnById(id: string) {
    return pGetColumnById(id);
  }
  /**
   * @zh 更新表尾
   * @public
   */
  function updateFooter() {
    pUpdateFooter();
  }

  defineExpose({
    showPageTotal,
    setAllTreeExpand,
    reloadData,
    reset,
    doLayout,
    reLoadData,
    clearSelection,
    toggleRowSelection,
    getSelections,
    clearCurrentColumn,
    validate,
    clearFilter,
    addRow,
    clearRowExpand,
    clearRowExpandLoadedAll,
    getColumnByField,
    getColumnById,
    updateFooter,
  });
</script>

<style lang="less">
  @import './table';
</style>
