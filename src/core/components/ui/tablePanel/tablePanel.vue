<template>
  <div class="lr-block" :style="{ padding: noPadding ? undefined : '4px', 'min-height': '100px' }">
    <div class="lr-table-panel" :style="{ 'border-radius': noPadding ? '0px' : '4px' }">
      <div
        class="top-panel"
        v-if="isShowSearchInput || mySearchInputList.length > 0 || panelButtons.length > 0"
      >
        <a-form v-if="queryType === 'high'" class="top-panel-left">
          <a-popover trigger="click" placement="bottom" v-if="viewList?.length > 0">
            <template #content>
              <div class="high-view">
                <a-input v-model:value="searchViewkey" :placeholder="$t('请输入视图名称')">
                  <template #prefix>
                    <lr-icon :is-div="false" icon="ant-design:search-outlined" />
                  </template>
                </a-input>
                <a-menu v-model:selected-keys="viewSelectedKeys">
                  <a-menu-item
                    v-for="item in viewShowList"
                    :key="item.key"
                    @click="handleChangeView(item.key)"
                  >
                    <div style="display: flex; justify-content: space-between" v-if="!item.rName">
                      <span class="high-item">{{ item.label }}</span>
                      <a-dropdown>
                        <lr-icon :is-div="false" icon="ant-design:ellipsis-outlined" @click.stop />
                        <template #overlay>
                          <a-menu mode="vertical">
                            <a-menu-item @click="handleRenameView(item)">
                              <lr-icon :is-div="false" icon="ant-design:edit-outlined" />
                              {{ $t('重命名') }}
                            </a-menu-item>
                            <a-menu-item>
                              <a-dropdown placement="right">
                                <span>
                                  <lr-icon
                                    :is-div="false"
                                    icon="ant-design:eye-invisible-outlined"
                                  />
                                  {{ $t('保护视图') }}
                                  <lr-icon
                                    :is-div="false"
                                    :size="12"
                                    icon="ant-design:right-outlined"
                                  />
                                </span>
                                <template #overlay>
                                  <a-menu>
                                    <a-menu-item @click="handleProtectView(item, 0)">
                                      <lr-icon :is-div="false" icon="ant-design:user-outlined" />
                                      {{ $t('个人视图') }}
                                      <lr-icon
                                        v-if="item.isPublic === 0"
                                        :is-div="false"
                                        icon="ant-design:check-outlined"
                                        color="var(--color-primary)"
                                      />
                                    </a-menu-item>
                                    <a-menu-item @click="handleProtectView(item, 1)">
                                      <lr-icon :is-div="false" icon="ant-design:team-outlined" />
                                      {{ $t('公共视图') }}
                                      <lr-icon
                                        v-if="item.isPublic === 1"
                                        :is-div="false"
                                        icon="ant-design:check-outlined"
                                        color="var(--color-primary)"
                                      />
                                    </a-menu-item>
                                  </a-menu>
                                </template>
                              </a-dropdown>
                            </a-menu-item>
                            <a-menu-item @click="handleDeleteView(item)">
                              <span style="color: var(--color-error)">
                                <lr-icon :is-div="false" icon="ant-design:delete-outlined" />
                                {{ $t('删除视图') }}
                              </span>
                            </a-menu-item>
                          </a-menu>
                        </template>
                      </a-dropdown>
                    </div>
                    <a-input-group
                      style="display: flex; width: 100%; margin-top: 3px"
                      compact
                      v-else
                    >
                      <a-input
                        v-model:value="item._label"
                        :placeholder="$t('请输入')"
                        class="print-layer__input"
                        @click.stop
                      />
                      <lr-button @click.stop="handleSaveViewName(item)">
                        <template #icon>
                          <lr-icon icon="ant-design:check-outlined" />
                        </template>
                      </lr-button>
                    </a-input-group>
                  </a-menu-item>
                </a-menu>
              </div>
            </template>
            <span class="high-viewname high-mr0">
              <lr-button type="text" size="small">
                <span>{{ $t(activedView?.label || '') }}</span>
                <lr-icon :is-div="false" :size="14" icon="ant-design:down-outlined" />
              </lr-button>
            </span>
          </a-popover>
          <a-popover
            trigger="click"
            placement="bottom"
            v-model:open="filterPopVisible"
            v-if="!filterIsFixed"
          >
            <template #content>
              <div class="high-filter">
                <div class="high-filter-top">
                  <a-tooltip>
                    <template #title>{{ $t('固定显示') }}</template>
                    <div class="high-filter-top-fixed" @click="handleChangeFixed">
                      <lr-icon
                        class="high-filter-top-fixed-icon"
                        :is-div="false"
                        :size="16"
                        color="var(--color-primary)"
                        icon="ant-design:pushpin-outlined"
                      />
                    </div>
                  </a-tooltip>
                  <div>{{ $t('设置筛选条件') }}</div>
                  <div style="margin-left: auto">
                    <span>
                      {{ $t('符合以下') }}
                      <a-dropdown>
                        <span class="high-filter-condition"
                          ><span>
                            <span>{{ $t(conditionLabel) }}</span>
                            <lr-icon
                              :is-div="false"
                              :size="10"
                              icon="ant-design:caret-down-outlined"
                            /> </span
                        ></span>
                        <template #overlay>
                          <a-menu :selected-keys="[activedConditionType]">
                            <a-menu-item
                              v-for="item in conditionOptions"
                              :key="item.value"
                              @click="handleChangeCondition(item.value)"
                            >
                              <span>{{ item.label }}</span>
                            </a-menu-item>
                          </a-menu>
                        </template>
                      </a-dropdown>
                      {{ $t('条件') }}
                    </span>
                  </div>
                </div>
                <div class="high-filter-content">
                  <lr-input-rows
                    :columns="filterColumns"
                    v-model:value="activedQueryList"
                    :add-btn-text="$t('添加条件')"
                    @row-change="handleChangeFilter"
                  />
                </div>
                <div class="high-filter-footer">
                  <lr-button type="link" @click="handleSaveNewView">{{
                    $t('另存为新视图')
                  }}</lr-button>
                  <div>
                    <lr-button type="link" @click="handleClearViewModify">{{
                      $t('清除修改')
                    }}</lr-button>
                    <lr-button type="link" @click="handleSaveViewModify">{{
                      $t('保存')
                    }}</lr-button>
                  </div>
                </div>
              </div>
            </template>
            <span class="high-viewname high-mr0">
              <a-tooltip placement="bottom">
                <template #title>{{ $t('筛选') }}</template>
                <lr-button type="text" size="small">
                  <span class="high-viewname high-mr0">
                    <lr-icon :is-div="false" :size="16" icon="ant-design:filter-outlined" />
                    <span>{{ $t(`${activedQueryList?.length || ''}`) }}</span>
                  </span>
                </lr-button>
              </a-tooltip>
            </span>
          </a-popover>
          <span class="high-viewname high-mr0" v-if="isSetTable && model === 'table'">
            <a-tooltip placement="bottom">
              <template #title>{{ $t('表格列设置') }}</template>
              <lr-button
                type="text"
                class="high-viewname high-mr0"
                size="small"
                @click="handleOpenColCustom"
              >
                <lr-icon custom :is-div="false" :size="16" icon="ant-design:setting-outlined" />
              </lr-button>
            </a-tooltip>
          </span>
          <span class="high-viewname high-mr0">
            <a-tooltip placement="bottom">
              <template #title>{{ $t('刷新') }}</template>
              <lr-button
                type="text"
                class="high-viewname high-mr0"
                size="small"
                @click="pResetData({}, true)"
              >
                <lr-icon
                  :is-div="false"
                  :size="16"
                  icon="ant-design:reload-outlined"
                  style="cursor: pointer"
                />
              </lr-button>
            </a-tooltip>
          </span>
          <a-form-item>
            <a-input
              v-model:value.trim="searchWord"
              :placeholder="$t(placeholder)"
              style="width: 160px; margin-left: 8px"
              @change="handleChangeKeyword"
            />
          </a-form-item>
        </a-form>
        <a-form v-else class="top-panel-left">
          <template v-for="searchInputItem of mySearchInputList" :key="searchInputItem.id">
            <a-form-item
              v-if="isOpenMoreSearch || searchInputItem.config?.isQuickSearch"
              :label="$t(searchInputItem.config?.label || '')"
              style="margin-left: 8px"
            >
              <div
                :style="{
                  width: `${searchInputItem.config?.width || 160}px`,
                  display: 'inline-block',
                }"
              >
                <lr-c-input
                  v-model="searchForm[searchInputItem.id]"
                  :type="
                    searchInputItem.config?.getInputType
                      ? searchInputItem.config?.getInputType(searchForm)
                      : searchInputItem.type
                  "
                  :style="{ width: `${searchInputItem.config?.width || 160}px` }"
                  :config="getInputConfig(searchInputItem.config)"
                  @change="hanleSearch(searchInputItem.config?.immediate)"
                />
              </div>
            </a-form-item>
          </template>
          <a-form-item v-if="isShowSearchInput">
            <a-input
              v-model:value.trim="searchWord"
              :placeholder="$t(placeholder)"
              style="width: 160px; margin-left: 8px"
            />
          </a-form-item>
          <a-space
            v-if="
              (mySearchInputList.length > 0 || isShowSearchInput) &&
              (!notSearchBtn || isNeedMoreSearch)
            "
            align="start"
            style="margin: 0; margin-top: 9px; margin-left: 8px"
          >
            <lr-button
              v-if="!notSearchBtn"
              :loading="tableLoading"
              type="primary"
              @click="hanleSearch(true)"
              >{{ $t('查询') }}</lr-button
            >
            <lr-button v-if="!notSearchBtn" @click="hanleResetSearch()">{{ $t('重置') }}</lr-button>
            <lr-button v-if="isNeedMoreSearch" type="link" @click="handleToggleMoreSearch()">{{
              $t(isOpenMoreSearch ? '收起' : '展开')
            }}</lr-button>
          </a-space>
        </a-form>
        <div class="top-panel-right" v-if="panelButtons.length > 0">
          <lr-buttons :list="panelButtons" v-if="panelButtons.length > 0" />
        </div>
      </div>
      <div
        v-if="isMultiSelect && selectionsValue.length > 0 && !notShowSelect"
        style="padding: 8px"
      >
        <a-alert :message="`已选择 ${selectionsValue.length} 项`" type="info">
          <template #action>
            <a-space>
              <template #split>
                <a-divider type="vertical" />
              </template>
              <lr-button size="small" type="link" @click="handleSearchSelections">{{
                showOnlySelections ? $t('查看全部') : $t('查看已选')
              }}</lr-button>
              <lr-button size="small" danger @click="handleClearSelect">{{
                $t('清空选择')
              }}</lr-button>
            </a-space>
          </template>
        </a-alert>
      </div>

      <div class="lr-table-panel-main">
        <lr-layout :left-move="false" :left="filterIsFixed ? 250 : 0" v-if="model == 'table'">
          <template #left>
            <div class="lr-block high-filter-fixed" v-if="filterIsFixed">
              <lr-panel :title="$t('筛选条件')" :body-style="{ padding: 0 }">
                <template #title>
                  <div class="high-filter-fixed-top">
                    <lr-icon
                      :is-div="false"
                      :size="15"
                      icon="ant-design:filter-outlined"
                      style="margin-right: 4px"
                    />
                    <span>{{ $t(`筛选条件`) }}</span>
                  </div>
                  <a-tooltip>
                    <template #title>{{ $t('取消固定') }}</template>
                    <div
                      class="high-filter-top-fixed high-filter-fixed-icon"
                      @click="handleChangeFixed"
                    >
                      <lr-icon
                        class="high-filter-top-fixed-icon"
                        :is-div="false"
                        :size="16"
                        color="var(--color-primary)"
                        icon="ant-design:pushpin-filled"
                      />
                    </div>
                  </a-tooltip>
                </template>
                <div class="high-filter-fixed-content">
                  <lr-layout :top-move="false" :top="30" :bottom="20">
                    <template #top>
                      <div class="high-filter-fixed-content-top">
                        <div>{{ $t('设置筛选条件') }}</div>
                        <div style="margin-left: auto">
                          <span>
                            {{ $t('符合以下') }}
                            <a-dropdown>
                              <span class="high-filter-condition"
                                ><span>
                                  <span>{{ $t(conditionLabel) }}</span>
                                  <lr-icon
                                    :is-div="false"
                                    :size="10"
                                    icon="ant-design:caret-down-outlined"
                                  /> </span
                              ></span>
                              <template #overlay>
                                <a-menu :selected-keys="[activedConditionType]">
                                  <a-menu-item
                                    v-for="item in conditionOptions"
                                    :key="item.value"
                                    @click="handleChangeCondition(item.value)"
                                  >
                                    <span>{{ item.label }}</span>
                                  </a-menu-item>
                                </a-menu>
                              </template>
                            </a-dropdown>
                            {{ $t('条件') }}
                          </span>
                        </div>
                      </div>
                    </template>
                    <div class="high-filter-fixed-content-wrapper">
                      <lr-input-cards
                        :columns="filterColumns"
                        v-model:value="activedQueryList"
                        :add-btn-text="$t('添加条件')"
                        @row-change="handleChangeFilter"
                      />
                    </div>
                    <template #bottom>
                      <div class="high-filter-fixed-content-footer high-filter-footer">
                        <lr-button type="link" @click="handleSaveNewView">{{
                          $t('另存为新视图')
                        }}</lr-button>
                        <div>
                          <lr-button type="link" @click="handleClearViewModify">{{
                            $t('清除修改')
                          }}</lr-button>
                          <lr-button type="link" @click="handleSaveViewModify">{{
                            $t('保存')
                          }}</lr-button>
                        </div>
                      </div>
                    </template>
                  </lr-layout>
                </div>
              </lr-panel>
            </div>
          </template>
          <lr-table
            ref="tableRef"
            :col-custom-placement="queryType === 'high' ? 'left' : 'right'"
            :loading="tableLoading"
            :columns="columns"
            :columns-type="columnsType"
            :data-source="tableDisplayData"
            :row-key="rowKey"
            :pid-key="pidKey"
            :id-key="idKey"
            :is-tree="isTree"
            :check-strictly="checkStrictly"
            :is-expand="isExpand"
            :is-page="isPage"
            :page-sizes="pageSizes"
            :page-size="pageSize"
            :page-total="tableTotal"
            :is-radio="isRadio"
            :is-multi-select="isMultiSelect"
            :load="loadChildren"
            :lazy="lazy || isExpand"
            multi-select-key="checkKey"
            :default-expand-all="defaultExpandAll"
            :show-summary="showSummary"
            :show-sum-total="showSumTotal"
            :is-show-num="isShowNum"
            :row-class-name="rowClassName"
            :cell-class-name="cellClassName"
            :header-row-class-name="headerRowClassName"
            :header-cell-class-name="headerCellClassName"
            :cell-style="cellStyle"
            :row-style="rowStyle"
            :header-cell-style="headerCellStyle"
            v-model:table-page="tableCurrentPage"
            :expand-load-method="handleExpandChange"
            :show-num-label="showNumLabel"
            :is-sortable="isSortable"
            @load-page-data="turnTablePage"
            @filter-change="handleFilterChange"
            @select="handleSelect"
            @select-all="handleSelect"
            @row-click="handleTableClick"
            @cell-click="handCellClick"
            @change="handleTableChange"
          >
            <template v-if="isExpand" #table_expand="scope">
              <lr-table
                :is-child="true"
                :columns="childColumns"
                :data-source="scope.row.childrenTableData"
                :height="childHeight"
                :is-need-height="!!childHeight && childHeight !== 'notset'"
                :show-summary="childShowSummary"
              >
                <lr-table-buttons :list="childTableButtons" />
              </lr-table>
            </template>
            <lr-table-buttons
              :list="tableButtons"
              :set-button="setButton"
              :max-btns="maxTableButtons"
              :fixed="tableButtonsFixed"
            />
          </lr-table>
        </lr-layout>

        <lr-card-list
          ref="tableRef"
          v-else-if="model == 'card'"
          :is-radio="isRadio"
          :is-multi-select="isMultiSelect"
          :loading="tableLoading"
          :data-source="tableDisplayData"
          :label-key="labelKey"
          :buttons="tableButtons"
          :set-button="setButton"
          :is-page="isPage"
          :page-sizes="pageSizes"
          :page-size="pageSize"
          :page-total="tableTotal"
          :show-big-edit-button="showBigEditButton"
          v-model:table-page="tableCurrentPage"
          @load-page-data="turnTablePage"
          :load-src="loadSrc"
          :fallback="fallback"
          :item-render="itemRender"
          :background-color="backgroundColor"
        />
      </div>
    </div>
    <lr-modal
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
              <span class="snum">{{ item.response.success }}</span
              >/<span class="fnum">{{ item.response.fail }}</span>
              <span
                v-if="item.response.fail > 0"
                @click="handleErrorClick(item.response.data)"
                class="fnum-btn"
                >{{ $t('查看错误') }}</span
              >
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
    <lr-modal
      :title="$t('错误信息')"
      v-model:visible="importErrorVisible"
      :width="1000"
      :height="600"
      :has-btns="false"
    >
      <lr-table :columns="importErrorColumns" :data-source="importErrorData" />
    </lr-modal>
    <lr-modal
      :title="$t('新增视图')"
      v-model:visible="addViewVisible"
      :width="500"
      :height="150"
      @ok="handleAddView"
    >
      <div style="padding: 16px">
        <a-form ref="addViewFormRef">
          <a-form-item
            :label="$t('视图名称')"
            :rules="[{ required: true, message: '请输入视图名称' }]"
            :label-col="{ span: 4 }"
          >
            <a-input v-model:value.trim="newFilterView.name" :placeholder="$t('请输入视图名称')" />
          </a-form-item>
        </a-form>
      </div>
    </lr-modal>
  </div>
</template>

<script lang="ts" setup>
  /**
   * 【选中态标准答案 / 改进建议 3.4】
   * - 底层表格是 vxe-table（不是 antd table）；a-form / a-input 等只用于顶部搜索区，别按 antd 表格找行。
   *   DOM：数据行是 tr.vxe-body--row，单选单元格是 .vxe-cell--radio，多选是 type="checkbox" 列。
   * - 单击行是否自动选中：单选（isRadio）时 <lr-table> 配了 :radio-config="{ trigger: 'row' }"，
   *   点击行任意位置即选中该行；多选（isMultiSelect）时 checkbox-config 未设 trigger:'row'，
   *   只有点复选框单元格才勾选，单击行不会自动勾选（row-click 仅转发 props.rowClick）。
   * - 单选 / 多选怎么切：由 props isRadio / isMultiSelect 决定并透传给 <lr-table>；
   *   <lr-table> 里 type="checkbox" 列带 v-if="isMultiSelect && !isRadio"，即 isRadio 优先。
   * - 取选中行一律用组件暴露的 getSelectedRow() / getSelectedRows()（内部复用 <lr-table> 的
   *   getSelections()，其底层就是 vxe 的 getRadioRecord / getCheckboxRecords），
   *   不要自己写 querySelector('.vxe-body--row')，否则会重现「新建时误报请先勾选」这类取态不准的 bug。
   */
  // 类型导入不产生运行期绑定，不会遮挡同名 prop（编译后模板取 $props.columns）
  // eslint-disable-next-line vue/no-dupe-keys
  import type { columns } from '../table/columns';
  import type { buttonItem } from '../buttons/interface';

  import { ref, reactive, computed, unref, PropType, nextTick, onMounted, watch } from 'vue';
  import { createNamespace } from '../utils/components';
  import { toArray, toSimpleTree, toTree } from '../utils/tree';
  import {
    pagination,
    deepClone,
    clearData,
    fullScreenLoading,
    buildShortUUID,
    debounce,
  } from '../utils/method';
  import { useFramework } from '../utils/useFramework';
  import { getFileIcon } from '../utils/file';
  import { formatToDate } from '../utils/date';
  import { isNullOrEmpty } from '../utils/is';

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

  defineOptions({ name: createNamespace('tablePanel').name });

  const props = defineProps({
    // 表格属性
    /**
     * @zh 配置表格的列描述， [columns](#columns)。
     */
    columns: { type: Array<columns>, default: () => [] },
    /**
     * @zh 配置子表格的列描述
     */
    childColumns: { type: Array<columns>, default: () => [] },
    /**
     * @zh 配置子表格的高度
     * @defaultValue notset
     */
    childHeight: {
      type: [String, Number],
      default: 'notset',
    },
    /**
     * @zh 配置子表格的合计行
     * @defaultValue false
     */
    childShowSummary: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 列的数据结构是树形结构。
     * @defaultValue 'tree'
     */
    columnsType: {
      type: String,
      default: 'tree',
    },
    /**
     * @zh 绑定选中属性。
     * @defaultValue -
     */
    rowKey: String,

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
     * @zh 是否显示树形数据
     */
    isTree: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 是否显示展开列（用来显示子表）。
     */
    isExpand: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 是否严格的遵循父子不互相关联的做法
     * @defaultValue false
     */
    checkStrictly: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 是否懒加载子节点数据
     * @defaultValue -
     */
    lazy: Boolean,
    /**
     * @zh 该方法用于异步加载子节点（必须返回 Promise<any[]> 对象）
     * @defaultValue -
     */
    loadChildren: Function as PropType<({ row }: Record<string, any>) => Promise<any[]>>,
    /**
     * @zh 显示树形数据的时候父级字段名
     * @defaultValue -
     */
    pidKey: {
      type: String,
    },
    /**
     * @zh id 值字段。
     * @defaultValue -
     */
    idKey: {
      type: String,
    },
    /**
     * @zh labelKey label字段(mode为card时有效)。
     * @defaultValue -
     */
    labelKey: {
      type: String,
    },
    /**
     * @zh 是否默认展开所有行，当 Table 包含展开行存在或者为树形表格时有效
     * @defaultValue false
     */
    defaultExpandAll: Boolean,

    // 分页
    /**
     * @zh 是否分页
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
     * @zh 当前显示页数
     * @defaultValue 50
     */
    pageSize: {
      type: Number,
      default: 50,
    },
    /**
     * @zh 排序字段
     */
    sidx: String,

    // 查询参数
    /**
     * @zh 数据加载方式
     */
    mode: {
      type: String,
      default: 'serve',
    },

    // 按钮方法
    /**
     * @zh 按钮数据
     */
    buttons: {
      type: Array as PropType<buttonItem[]>,
      default: () => [],
    },

    /**
     * @zh 表格按钮
     */
    tableButtons: {
      type: Array as PropType<buttonItem[]>,
      default: () => [],
    },
    /**
     * @zh 配置子表格的表格按钮
     */
    childTableButtons: {
      type: Array as PropType<buttonItem[]>,
      default: () => [],
    },

    /**
     * @zh 展示按钮个数
     */
    maxTableButtons: {
      type: Number as PropType<number>,
      default: 4,
    },

    // 方法
    /**
     * @zh 加载数据方法
     */
    loadData: Function,

    /**
     * @zh 是否立即执行加载数据
     */
    immediate: Boolean,

    /**
     * @zh 特定场合下使用
     */
    isSaveSelectData: Boolean,

    /**
     * @zh 列展开方法
     */
    expandChange: Function,

    /**
     * @zh 处理按钮
     */
    setButton: Function,
    /**
     * @zh 表格模式或是卡片模式
     * @defaultValue table
     */
    model: {
      type: String as PropType<'table' | 'card'>,
      default: 'table',
    },
    /**
     * @zh 加载src(model为card时使用)
     */
    loadSrc: Function,
    /**
     * @zh 加载失败容错地址(model为card时使用)
     * @defaultValue -
     */
    fallback: {
      type: String,
      default: '',
    },

    /**
     * @zh 查询框
     */
    searchInputList: {
      type: Array as PropType<Record<string, any>[]>,
      default: () => [],
    },

    /**
     * @zh 表格行点击事件
     */
    rowClick: Function,

    /**
     * @zh 表格单元格点击事件
     */
    cellClick: Function,

    /**
     * @zh 卡片渲染方法
     */
    itemRender: Function,
    /**
     * @zh 背景颜色
     */
    backgroundColor: String,
    /**
     * @zh 不要边距
     */
    noPadding: Boolean,
    /**
     * @zh 是否在表尾显示合计行。
     */
    showSummary: Boolean,
    /**
     * @zh 是否在表尾显示总合计行。
     */
    showSumTotal: Boolean,
    /**
     * @zh 是否显示大的编辑按钮(卡片列表有效)
     */
    showBigEditButton: Boolean,
    /**
     * @zh 搜索框的默认文字
     */
    placeholder: {
      type: String,
      default: '请输入关键字',
    },
    /**
     * @zh 没有刷新按钮
     */
    notResetBtn: Boolean,
    /**
     * @zh 不显示查询/重置按钮（查询条件变更即生效时使用）
     */
    notSearchBtn: Boolean,
    /**
     * @zh 不显示多选时的头部已选
     */
    notShowSelect: Boolean,
    /**
     * @zh 是否设置表格列(model为table时有效)
     */
    isSetTable: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 固定列位置
     * @defaultValue right
     */
    tableButtonsFixed: {
      type: String as PropType<'left' | 'right'>,
      default: 'right',
    },
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
     * @zh 查询类型。
     * @defaultValue easy
     */
    queryType: {
      type: String as PropType<'easy' | 'high'>,
      default: 'easy',
    },
    /**
     * @zh excel导出接口地址。
     */
    excelExportApiUrl: String,

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
     * @zh 是否允许调整行的顺序（动态拖动）
     * @defaultValue false
     */
    isSortable: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 数据改变时触发
     */
    change: Function,
    /**
     * @zh 多选框选中改变时触发
     */
    selectChange: Function,
  });

  const emit = defineEmits({
    /**
     * @zh 点击按钮时触发
     * @property {string} id
     */
    btnsClick: (id: string) => true,
    select: ({ selects }: Record<string, any>) => true,
  });

  const { useMessage, excelExport, excelImportDownTemplate, excelImportUpload, useFile } =
    useFramework({});
  const { fileChunkedUpload } = useFile();
  const { warning, error } = useMessage();

  // 参数定义
  const tableLoading = ref(false);
  const tableData = ref<any[]>([]);
  const tableDisplayData = ref<any[]>([]);
  const searchWord = ref('');
  const searchForm = reactive<Record<string, any>>({});
  const tableRef = ref();

  // 分页参数
  const tableTotal = ref(0);
  const tableCurrentPage = ref(1);
  let tablePageSize = props.pageSize || 50;
  let tableSidx = '';

  let tableParams: Record<string, any> = {};

  // 选择处理
  const selectionsValue = ref<string[]>([]);
  const showOnlySelections = ref<boolean>(false);
  let selectionsData: any[] = [];
  const selectionsValueMap = computed(() => {
    const res: Record<string, boolean> = {};
    selectionsValue.value.forEach((t) => {
      res[t] = true;
    });
    return res;
  });

  // 计算属性
  const arrayColumns = computed(() => {
    let _columns: columns[] = [];
    const { columns } = props;
    if (props.columnsType === 'tree') {
      _columns = toArray(props.columns);
    } else {
      _columns = columns;
    }
    return _columns;
  });
  const isShowSearchInput = computed(() => {
    if (props.model === 'table') {
      return arrayColumns.value.findIndex((item) => item.isKeyword) > -1;
    }

    return true;
  });
  const isServeMode = computed(() => props.mode === 'serve');

  const panelButtons = computed(() => {
    const buttons: buttonItem[] = [];
    // 添加表格列设置按钮
    if (props.isSetTable && props.model === 'table' && props.queryType !== 'high') {
      buttons.push({
        prop: 'jcode_setCol',
        groupId: 'jcode_self',
        click: () => {
          handleOpenColCustom();
        },
        icon: 'ant-design:setting-outlined',
      });
    }
    // 添加刷新按钮
    if (!props.notResetBtn && props.queryType !== 'high') {
      buttons.push({
        prop: 'jcode_refresh',
        groupId: 'jcode_self',
        click: async () => {
          await pResetData({}, true);
        },
        icon: 'ant-design:reload-outlined',
      });
    }
    // 添加导出按钮
    const exportBtns = props.buttons.filter((t) => t.action === 'exportExcel');
    if (exportBtns.length > 0) {
      exportBtns.forEach((t) => {
        t.click = async () => {
          await handleExportClick(t.layerTitle || 'Excel导出', t.exportUrl, t.isExportCheck);
        };
      });
    }
    // 添加导入按钮
    const importBtns = props.buttons.filter((t) => t.action === 'importExcel');
    if (importBtns.length > 0) {
      importBtns.forEach((t) => {
        t.click = async () => {
          await handleImportClick(t.layerTitle || 'Excel导入', t.importCode);
        };
      });
    }

    buttons.push(...props.buttons);
    return buttons;
  });

  const getInputConfig = (config: Record<string, any>) => {
    const myConfig = { ...config };
    if (myConfig.getUpConfig) {
      const _config = config.getUpConfig({
        formData: searchForm,
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

  // 方法
  const pResetData = async (param: Record<string, any> = {}, isRefreshBtn = false) => {
    pClearSelection();
    searchWord.value = '';
    setDefaultSearchForm();
    tableCurrentPage.value = 1;
    tableSidx = '';
    tableRef.value.clearFilter();

    await loadTableData(param, true, isRefreshBtn);
  };
  const pRefreshData = async (param?: Record<string, any>) => {
    await loadTableData(param, true);
  };
  const pGetSelections = async (isAll = true) => {
    const valueKey = props.rowKey || '';
    // 获取当前列表选中项。
    if (isAll && props.isMultiSelect) {
      if (props.isSaveSelectData) {
        return deepClone(selectionsData);
      }

      if (isServeMode.value && props.isPage && props.loadData) {
        if (selectionsValue.value.length > 0) {
          const queryData = {
            rows: 20000,
            page: 1,
            ids: String(selectionsValue.value),
            field: props.rowKey,
          };
          const res = (await props.loadData(queryData)) || {};
          return res.rows || [];
        }
        if (props.model === 'card') {
          return tableRef.value.getSelections();
        }
        return [];
      }

      const valueMap = selectionsValueMap.value;
      return tableData.value.filter((t) => valueMap[t[valueKey]]);
    }

    return tableRef.value.getSelections();
  };
  const pClearSelection = () => {
    tableRef.value?.clearSelection && tableRef.value?.clearSelection();
    if (!props.isMultiSelect) {
      return;
    }
    showOnlySelections.value = false;
    selectionsValue.value = [];
    if (props.isSaveSelectData) {
      selectionsData = [];
    }
  };

  const pSetSelection = (rows: Record<string, any>[]) => {
    if (!props.isMultiSelect) {
      return;
    }

    const valueMap = selectionsValueMap.value;
    const valueKey = props.rowKey || '';
    // eslint-disable-next-line no-restricted-syntax
    for (const row of rows) {
      let checkKey = false;
      if (valueMap[row[valueKey]]) {
        checkKey = true;
      }
      row.checkKey = checkKey;
    }

    if (props.isTree) {
      tableRef.value.reLoadData();
    } else if (tableData.value.findIndex((t) => valueMap[t[valueKey]]) === -1) {
      tableRef.value?.clearSelection && tableRef.value?.clearSelection();
    }
  };

  // 切换行选中
  const pToggleRowSelection = async (ids: string[], selected = false) => {
    if (!props.isMultiSelect) {
      return;
    }

    let values = selectionsValue.value;
    if (selected) {
      values.push(...ids.filter((t) => values.indexOf(t) === -1));
    } else {
      values = values.filter((t) => ids.indexOf(t) === -1);

      if (props.isSaveSelectData) {
        const valueKey = props.rowKey || '';
        selectionsData = selectionsData.filter((t) => ids.indexOf(t[valueKey]) === -1);
      }
    }
    selectionsValue.value = values;

    emit('select', { selects: selectionsValue.value });
    pSetSelection(tableDisplayData.value);
  };

  const pClearRowExpandLoadedAll = (loadRecords: Record<string, any>[] = []) => {
    tableRef.value.clearRowExpandLoadedAll(loadRecords);
  };

  // 关键字查询
  const filterKey = (row: Record<string, any>, keyword: string, cols: Array<columns>): boolean => {
    const len = cols.length;
    for (let i = 0; i < len; i++) {
      const value = (row[cols[i].prop] || '') + '';
      if (value.indexOf(keyword) > -1) {
        return true;
      }
    }
    return false;
  };

  const loadTableData = async (
    param?: Record<string, any>,
    isRefreshData = false,
    isRefreshBtn = false,
  ) => {
    tableLoading.value = true;

    if (props.isExpand) {
      tableRef.value.clearRowExpand();
      tableRef.value.clearRowExpandLoadedAll(expandRows.value);
      expandRows.value = [];
    }

    tableParams.ids = '';
    tableParams = param || tableParams;
    tableParams.keyword = searchWord.value;

    Object.keys(searchForm).forEach((key) => {
      if (!isNullOrEmpty(String(searchForm[key])?.trim())) {
        tableParams[key] = searchForm[key];
      } else {
        delete tableParams[key];
      }
    });

    const unrefIsServeMode = unref(isServeMode);

    // 从接口获取数据
    if (
      (unrefIsServeMode || isRefreshData) &&
      !(showOnlySelections.value && props.isSaveSelectData)
    ) {
      if (props.loadData) {
        if (props.isPage && unrefIsServeMode) {
          tableParams.rows = tablePageSize;
          tableParams.page = tableCurrentPage.value;
          tableParams.sidx = tableSidx || props.sidx || props.rowKey;
          if (showOnlySelections.value) {
            tableParams.ids = String(selectionsValue.value);
            tableParams.field = props.rowKey;
          }
          const res = (await props.loadData(tableParams, isRefreshBtn)) || {};
          tableData.value = res.rows || [];
          tableTotal.value = res.records || 0;
        } else {
          tableData.value = (await props.loadData(tableParams, isRefreshBtn)) || [];
        }
      }
    }

    let unrefTableData = unref(tableData);

    // 获取本地选择数据
    if (showOnlySelections.value) {
      if (props.isSaveSelectData) {
        unrefTableData = selectionsData;
      } else if (!unrefIsServeMode || !props.isPage) {
        const valueKey = props.rowKey || '';
        const valueMap = selectionsValueMap.value;
        unrefTableData = unrefTableData.filter((t) => valueMap[t[valueKey]]);
      }
      // unrefTableData = tableRef.value.getSelections()
    }

    // 是否需要本地查询
    if (!unrefIsServeMode) {
      let list = unrefTableData;
      let arrayList = toArray(unrefTableData);
      if (tableParams.keyword) {
        const unrefArrayColumns = unref(arrayColumns).filter((t) => t.isKeyword);
        arrayList = arrayList.filter((row) =>
          filterKey(row, tableParams.keyword, unrefArrayColumns),
        );
      }
      // 对查询框字段进行过滤
      Object.keys(searchForm).forEach((key) => {
        if (!isNullOrEmpty(searchForm[key])) {
          arrayList = arrayList.filter((row) => {
            if (row[key].indexOf(searchForm[key]) > -1) {
              return true;
            }
            return false;
          });
        }
      });
      list = toTree(arrayList, props.rowKey, props.pidKey);

      if (props.isPage) {
        tableTotal.value = list.length;
        tableDisplayData.value = pagination(tableCurrentPage.value, tablePageSize, list);
      } else {
        tableDisplayData.value = list;
      }
    } else {
      tableDisplayData.value = unrefTableData;
    }

    pSetSelection(tableDisplayData.value);

    if (props.isTree && props.defaultExpandAll) {
      nextTick(() => {
        tableRef.value && tableRef.value.setAllTreeExpand();
      });
    }

    if (props.lazy && props.isTree) {
      tableRef.value.doLayout();
    }

    tableLoading.value = false;
  };

  const hanleSearch = async (isSearch: boolean) => {
    if (isSearch) {
      tableCurrentPage.value = 1;
      await loadTableData();
    }
  };

  // 重置
  const hanleResetSearch = async () => {
    searchWord.value = '';
    setDefaultSearchForm();
    tableCurrentPage.value = 1;
    await loadTableData();
  };

  // 高级查询
  const mySearchInputList = computed(() =>
    props.searchInputList.filter((t: any) => t.config?.isHidden !== true),
  );

  const isNeedMoreSearch = computed(() => {
    if (
      mySearchInputList.value.length > 0 &&
      mySearchInputList.value.findIndex((t: any) => t.config?.isQuickSearch !== true) > -1
    ) {
      return true;
    }
    return false;
  });
  const isOpenMoreSearch = ref(false);
  const handleToggleMoreSearch = () => {
    isOpenMoreSearch.value = !isOpenMoreSearch.value;
  };

  // 查询值
  const setDefaultSearchForm = () => {
    clearData(searchForm);
    props.searchInputList.forEach((t: any) => {
      searchForm[t.id] = t.config?.defaultValue;
    });
  };
  // 修改查询值
  const pSetSearchFormData = (id: string, value: any) => {
    searchForm[id] = value;
  };
  // 获取查询值
  const pGetSearchFormData = (id: string) => searchForm[id];

  watch(
    () => props.searchInputList,
    () => {
      setDefaultSearchForm();
    },
    {
      immediate: true,
    },
  );

  // 分页方法
  const turnTablePage = ({ rows, page, sidx }: Record<string, any>) => {
    tableSidx = sidx;
    tablePageSize = rows;
    tableCurrentPage.value = page;

    loadTableData();
  };

  // 过滤方法
  const handleFilterChange = ({ param, rows, page, sidx }: Record<string, any>) => {
    tableSidx = sidx;
    tablePageSize = rows;
    tableCurrentPage.value = page;
    loadTableData(param, true);
  };

  onMounted(async () => {
    // 是否立即执行加载数据
    if (props.immediate) {
      // setDefaultSearchForm()
      await pRefreshData();
    }
  });

  // 选择处理方法
  const handleSelect = (data: any) => {
    if (props.selectChange) {
      props.selectChange(data);
    }
    const valueKey = props.rowKey || '';

    const selectData = tableRef.value.getSelections();
    let selectValue = selectData.map((t: any) => t[valueKey]); // 赋值
    const showData = tableDisplayData.value;
    if (props.isPage) {
      const notLoadedValue = selectionsValue.value.filter(
        (t: string) => showData.findIndex((t2) => t === t2[valueKey]) === -1,
      );

      selectValue.push(...notLoadedValue);
    }

    if (props.isSaveSelectData) {
      let _selectionsData = selectionsData;
      _selectionsData = _selectionsData.filter(
        (t: { [x: string]: any }) =>
          showData.findIndex((t2: { [x: string]: any }) => t2[valueKey] === t[valueKey]) === -1,
      );
      const addList = selectData.filter(
        (t: { [x: string]: any }) =>
          _selectionsData.findIndex((t2: { [x: string]: any }) => t2[valueKey] === t[valueKey]) ===
          -1,
      );
      _selectionsData.push(...addList);
      selectionsData = _selectionsData;
      selectValue = selectionsData.map((t: any) => t[valueKey]);
    }
    selectionsValue.value = selectValue;

    if (selectionsValue.value.length === 0 && showOnlySelections.value) {
      handleClearSelect();
    }
    emit('select', { selects: selectionsValue.value });
  };

  const handleClearSelect = () => {
    pResetData();
    emit('select', { selects: selectionsValue.value });
  };

  const handleSearchSelections = async () => {
    searchWord.value = '';
    setDefaultSearchForm();
    tableCurrentPage.value = 1;
    tableSidx = '';
    tableRef.value.clearFilter();
    showOnlySelections.value = !showOnlySelections.value;
    await loadTableData();
  };

  const expandRows = ref<Record<string, any>[]>([]);
  //
  const handleExpandChange = async (data: any) => {
    const { row } = data;
    if (props.expandChange) {
      expandRows.value.push(row);
      row.childrenTableData = (await props.expandChange(data)) || [];
    } else {
      row.childrenTableData = [];
    }
  };

  const handleTableClick = (data: any) => {
    props.rowClick && props.rowClick(data);
  };
  const handCellClick = (data: any) => {
    props.cellClick && props.cellClick(data);
  };

  const handleTableChange = (data: any) => {
    props.change && props.change(data);
  };

  // excel导出
  const exportExcelTitle = ref('导出');
  const exportExcelVisible = ref(false);
  const exportCheckColumns = ref<string[]>([]);
  const exportColumns = computed(() => toSimpleTree(props.columns, 'prop', 'label'));
  let exportCallback: any = null;

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
  let myExportUrl = '';

  const handleExportClick = async (
    title: string,
    exportUrl?: string,
    isExportCheck?: boolean,
    callback?: any,
  ) => {
    exportExcelTitle.value = title;
    exportCheckColumns.value = arrayColumns.value.map((t) => t.prop);
    exportCallback = callback;
    myExportUrl = exportUrl || props.excelExportApiUrl || '';

    if (props.isMultiSelect && isExportCheck) {
      const selectList = await pGetSelections(true);
      if (selectList.length === 0) {
        exportData = [];
        warning('请选择数据!');
        return;
      }
      exportData = JSON.parse(JSON.stringify(selectList));
    } else if (myExportUrl) {
      exportData = [];
    } else {
      exportData = JSON.parse(JSON.stringify(tableDisplayData.value));
      if (exportData.length === 0) {
        return;
      }
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
      isPage: props.isPage,
      dataUrl: myExportUrl,
      dataList: exportData,
    };

    const res = await excelExport(params);
    fullScreenLoading(false);
    if (res) {
      exportData = []; // 清空数据
      exportExcelVisible.value = false;
      exportCallback && exportCallback();
    }
  };

  // excel导入
  const importExcelTitle = ref('导入');
  const importExcelVisible = ref(false);

  const importErrorVisible = ref(false);
  const importErrorData = ref<any[]>([]);

  let myImportCode = '';

  const handleImportClick = async (title: string, importCode?: string) => {
    importExcelTitle.value = title;
    myImportCode = importCode || '';

    importExcelVisible.value = true;
  };

  const handleDownImportTemplate = () => {
    excelImportDownTemplate(myImportCode);
  };

  const handleErrorClick = (data: any[]) => {
    importErrorData.value = data;
    importErrorVisible.value = true;
  };

  const importErrorColumns = computed(() => {
    const res: Record<string, any>[] = [];
    if (importErrorData.value?.length > 0) {
      Object.keys(importErrorData.value[0]).forEach((key) => {
        if (key !== '_X_ROW_KEY') {
          if (key === '导入错误') {
            res.push({ label: key, prop: key, minWidth: 300 });
          } else {
            res.push({ label: key, prop: key, minWidth: 160 });
          }
        }
      });
    }

    return res;
  });

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
        uploadCallback: (data: any) => excelImportUpload(myImportCode, data),
      });
    } else {
      file.response = {
        success: 1,
        fail: 1,
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
    updateFilelist();
  };

  const onError = (file: any, error: any) => {
    console.error(error, 'jcode 极简搭:文件上传错误！');
    file.status = 'error';
    updateFilelist();
  };

  const colDataTypeDic = computed(() => {
    const colDic: Record<string, any> = {};
    arrayColumns.value.forEach((item: any) => {
      const res: Record<string, any> = { config: {} };
      const dataType = item.config?.dataType || 'input';
      switch (dataType) {
        case 'radio':
        case 'checkbox':
        case 'options':
        case 'select':
          res.dataType = 'select';
          res.config.mode = 'multiple';
          res.config.options = item.config?.options || [];
          break;
        case 'date':
          res.dataType = 'dateRange';
          res.config.picker = 'date';
          res.config.format = item.config?.format || 'YYYY-MM-DD';
          break;
        case 'dateTime':
          res.dataType = 'dateRange';
          res.config.format = item.config?.format || 'YYYY-MM-DD HH:mm:ss';
          break;
        case 'company':
          res.dataType = 'lr-input-company';
          break;
        case 'department':
          res.dataType = 'lr-input-department';
          break;
        case 'role':
          res.dataType = 'lr-input-role';
          break;
        case 'user':
          res.dataType = 'lr-input-user';
          break;
        default:
          res.dataType = 'input';
      }
      colDic[item.prop] = res;
    });
    return colDic;
  });
  const filterColumns = computed(() => {
    const cols: Record<string, any> = [];
    arrayColumns.value.forEach((item: any) => {
      cols.push({ label: item.label, value: item.prop });
    });
    const columns = [
      {
        inputType: 'select',
        prop: 'field',
        width: 130,
        config: {
          span: 14,
          getUpConfig: ({ tableData, row }: Record<string, any>) => {
            const options: { label: string; value: string }[] = [];
            const filterIds: string[] = [];
            tableData.forEach((rowItem: Record<string, any>) => {
              if (rowItem.i !== row.i && rowItem.field) {
                filterIds.push(...rowItem.field.split(','));
              }
            });
            cols.forEach((item: any) => {
              if (!filterIds.includes(item.value)) {
                options.push(item);
              }
            });
            return { options };
          },
        },
      },
      {
        inputType: 'select',
        prop: 'symbol',
        width: 70,
        config: {
          span: 10,
          options: [
            { label: '等于', value: '1' },
            { label: '不等于', value: '2' },
            { label: '包含', value: '3' },
            { label: '不包含', value: '4' },
            { label: '为空', value: '5' },
            { label: '不为空', value: '6' },
          ],
          defaultValue: '1',
        },
      },
      {
        inputType: 'input',
        prop: 'value',
        width: 220,
        getInputType: (row: any) => colDataTypeDic.value[row.field]?.dataType || 'input',
        config: {
          getUpConfig: ({ row }: any) => ({
            ...(colDataTypeDic.value[row.field]?.config || {}),
            display: !!(row.symbol !== '5' && row.symbol !== '6'),
          }),
        },
      },
    ];
    return columns;
  });

  // 测试使用，提交时删除这两个属性的数据
  const viewList = ref<Record<string, any>[]>([]);
  const activedView = ref<Record<string, any>>({});
  const activedQueryList = ref<Record<string, any>[]>([]);
  const searchViewkey = ref('');
  const viewSelectedKeys = ref<string[]>([]);
  const viewShowList = computed(() => {
    if (!isNullOrEmpty(searchViewkey.value)) {
      return viewList.value.filter((item) => item.label.indexOf(searchViewkey.value) > -1);
    }
    return viewList.value;
  });
  const handleChangeView = (val: any) => {
    viewList.value.forEach((item) => {
      if (item.key === val) {
        activedView.value = deepClone(item);
        activedQueryList.value = deepClone(item.queryList || []);
        activedConditionType.value = item.conditionType || 'all';
      }
    });
  };

  const activedConditionType = ref('all');
  const conditionOptions: any[] = [
    { label: '所有', value: 'all' },
    { label: '任一', value: 'any' },
  ];
  const conditionLabel = computed(
    () => conditionOptions.find((item) => item.value === activedConditionType.value).label,
  );

  const handleChangeCondition = (val: any) => {
    activedConditionType.value = val;
  };
  const handleChangeFilter = ({
    col,
    index,
  }: {
    value: any;
    data: Record<string, any> | Record<string, any>[];
    col: Record<string, any>;
    index: number;
  }) => {
    if (col.prop === 'field') {
      activedQueryList.value[index].value = undefined;
    } else if (col.prop === 'symbol') {
      activedQueryList.value[index].value = undefined;
    }
    // 加载查询数据
  };

  const filterPopVisible = ref(false);
  const addViewVisible = ref(false);
  const newFilterView = ref<Record<string, any>>({});
  const handleSaveNewView = () => {
    filterPopVisible.value = false;
    addViewVisible.value = true;
  };
  const handleClearViewModify = () => {
    activedQueryList.value = deepClone(activedView.value?.queryList) || [];
    activedConditionType.value = deepClone(activedView.value?.conditionType) || 'all';
  };
  // 修改视图接口
  const handleSaveView = () => {};
  const handleSaveViewModify = () => {
    if (isNullOrEmpty(activedView.value?.label)) {
      // 无当前视图，则新增
      handleSaveNewView();
    } else {
      // 修改当前视图的查询条件
      const index = viewList.value.findIndex((item) => item.key === activedView.value?.key);
      if (index > -1) {
        viewList.value[index].queryList = deepClone(activedQueryList.value);
        viewList.value[index].conditionType = deepClone(activedConditionType.value);
        activedView.value = viewList.value[index];
      }
      handleSaveView();
    }
  };

  const addViewFormRef = ref();
  const handleAddView = () => {
    if (isNullOrEmpty(newFilterView.value.name)) {
      error && error('请输入视图名称');
    } else {
      // 保存视图
      const view = {
        label: newFilterView.value.name,
        isPublic: 0, // 默认个人
        conditionType: deepClone(activedConditionType.value),
        queryList: deepClone(activedQueryList.value),
        key: buildShortUUID(),
      };
      viewList.value.push(view);
      activedView.value = view;
      viewSelectedKeys.value = [view.key];
      addViewVisible.value = false;
      newFilterView.value = {};
      handleSaveView();
    }
  };

  const filterIsFixed = ref(false);
  const handleChangeFixed = () => {
    filterIsFixed.value = !filterIsFixed.value;
    filterPopVisible.value = false;
  };

  const handleRenameView = (item: Record<string, any>) => {
    item._label = item.label;
    item.rName = true;
  };
  const handleSaveViewName = (item: Record<string, any>) => {
    item.label = item._label;
    item.rName = false;
    handleSaveView();
  };
  const handleProtectView = (item: Record<string, any>, type: number) => {
    item.isPublic = type;
    handleSaveView();
  };
  const handleDeleteView = (item: Record<string, any>) => {
    if (item.key === activedView.value.key) {
      const index = viewList.value.findIndex((v) => v.key === item.key);
      if (index > 0) {
        activedView.value = viewList.value[index - 1];
        viewSelectedKeys.value = [activedView.value.key];
      } else if (viewList.value.length > 1) {
        activedView.value = viewList.value[index + 1];
        viewSelectedKeys.value = [activedView.value.key];
      } else {
        activedView.value = {};
        viewSelectedKeys.value = [];
      }
    }
    viewList.value = viewList.value.filter((v) => v.key !== item.key);
    handleSaveView();
  };

  const handleChangeKeyword = debounce(async () => {
    await hanleSearch(true);
  }, 300);
  const handleOpenColCustom = () => {
    const $table = tableRef.value?.$refs.tableRef;
    if ($table) {
      $table.openCustom();
    }
  };

  /**
   * @zh 刷新数据
   * @public
   * @param { Record<string, any> } param
   */
  async function refreshData(param: Record<string, any>) {
    await pRefreshData(param);
  }
  /**
   * @zh 重置数据
   * @public
   * @param {} param
   */
  async function resetData(param: Record<string, any>) {
    await pResetData(param);
  }
  /**
   * @zh 获取选中行
   * @public
   * @param {boolean} isAll
   */
  function getSelections(isAll?: boolean) {
    return pGetSelections(isAll);
  }
  /**
   * @zh 获取选中行
   * @public
   * @param {Record<string, any>[]} rows
   */
  function setSelection(rows: Record<string, any>[]) {
    pSetSelection(rows);
  }
  /**
   * @zh 设置选中行
   * @public
   * @param { string[]} ids
   * @param { boolean} selected
   */
  function toggleRowSelection(ids: string[], selected = true) {
    pToggleRowSelection(ids, selected);
  }

  /**
   * @zh 清空多选项
   * @public
   */
  function clearSelection() {
    pClearSelection();
  }

  /**
   * @zh 获取选中行数组（改进建议 3.4：语义明确的选中态标准 API）
   * @public
   * @description 复用 <lr-table> 暴露的同步 getSelections()（底层即 vxe-table 的
   *              getRadioRecord / getCheckboxRecords），不做任何 DOM 查询。
   *              单选模式返回 0/1 长度数组，多选返回全部勾选项，无选中返回 []（不抛异常、不弹消息）。
   *              说明：本组件已暴露的 getSelections() 是 async（可能触发服务端加载、返回 Promise），
   *              直接用作「当前选中行」易被误用（Promise 恒为真），故这里复用其底层同步实现。
   */
  function getSelectedRows(): Record<string, any>[] {
    const rows = tableRef.value?.getSelections?.();
    return Array.isArray(rows) ? rows : [];
  }

  /**
   * @zh 获取当前选中行（改进建议 3.4：语义明确的选中态标准 API）
   * @public
   * @description 单选模式返回当前选中行；多选模式若有选中返回第一行；没有选中返回 null。
   *              无选中不抛异常、不弹任何消息。
   */
  function getSelectedRow(): Record<string, any> | null {
    const rows = getSelectedRows();
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * @zh 修改查询值
   * @public
   */
  function setSearchFormData(id: string, value: any) {
    pSetSearchFormData(id, value);
  }

  /**
   * @zh 获取查询值
   * @public
   */
  function getSearchFormData(id: string) {
    return pGetSearchFormData(id);
  }

  /**
   * @zh 导出数据
   * @public
   * @param { string} title
   * @param { boolean} isExportCheck
   */
  function exportExcel(title?: string, isExportCheck?: boolean, callback?: any) {
    handleExportClick(title || 'EXCEL导出', '', isExportCheck, callback);
  }
  /**
   * @zh 清除loadRecords中的行懒加载展开行的状态,数据会恢复成未展开的状态，当再次展开时会重新加载
   * @public
   */
  function clearRowExpandLoadedAll(loadRecords: Record<string, any>[] = []) {
    pClearRowExpandLoadedAll(loadRecords);
  }

  defineExpose({
    refreshData,
    resetData,
    getSelections,
    getSelectedRow,
    getSelectedRows,
    setSelection,
    toggleRowSelection,
    clearSelection,
    setSearchFormData,
    getSearchFormData,
    exportExcel,
    clearRowExpandLoadedAll,
  });
</script>

<style lang="less">
  @import './tablePanel.less';
</style>
