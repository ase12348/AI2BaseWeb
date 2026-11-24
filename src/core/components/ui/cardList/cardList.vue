<template>
  <div
    class="lr-block"
    :style="{
      'padding-bottom': isPage ? '48px' : undefined,
      'background-color': backgroundColor || 'var(--color-bg-layout)',
    }"
  >
    <a-spin :spinning="loading">
      <div class="lr-block lr-overflow-y">
        <template v-for="(item, index) in tableData" :key="index">
          <component
            v-if="itemRender"
            :is="
              itemRender({
                item,
                index,
              })
            "
          />
          <div v-else class="lr-card-item">
            <a-image
              :preview="{ visible: false }"
              :src="getSrc(item)"
              :fallback="fallback"
              @click="handlePreview(index)"
            />
            <div v-if="showBigEditButton" class="content__button">
              <button
                class="lr-btn lr-btn-primary"
                @click.stop="handleClick(item, index, editButton)"
              >
                {{ $t(editButton?.label || '编辑') }}
              </button>
            </div>
            <div class="content__main">
              <a-typography-text
                ellipsis
                style="margin: 0; font-size: 14px"
                :content="item[labelKey]"
              />
              <div class="content__menulist">
                <template v-for="(btn, index2) of buttonGroup(item)" :key="index2">
                  <a-dropdown v-if="btn.children?.length && btn.children?.length > 0">
                    <button class="lr-table-btn lr-table-card-btn">
                      <lr-icon :size="18" icon="ant-design:more-outlined" />
                    </button>
                    <template #overlay>
                      <div class="lr-table-btns-panel">
                        <button
                          :key="childIndex"
                          v-for="(childBtn, childIndex) of btn.children || []"
                          :class="['lr-table-btn', { dangerous: childBtn.danger }]"
                          style="display: block"
                          :disabled="childBtn.disabled"
                          @click.stop="handleClick(item, index, childBtn)"
                        >
                          {{ $t(childBtn.label || '') }}
                        </button>
                      </div>
                    </template>
                  </a-dropdown>
                  <a-tooltip v-else :title="$t(btn.label)">
                    <button
                      :class="['lr-table-btn', 'lr-table-card-btn', { dangerous: btn.danger }]"
                      :disabled="btn.disabled"
                      @click.stop="handleClick(item, index, btn)"
                    >
                      <lr-icon :size="18" :icon="btn.icon || 'ant-design:tool-outlined'" />
                    </button>
                  </a-tooltip>
                </template>
              </div>
            </div>
            <div v-if="isRadio" class="lr-card-item-radio">
              <a-radio
                :checked="selections[0] === item[rowKey || 'f_Id']"
                @change="pToggleRowSelection([item], true)"
              />
            </div>
            <div v-if="isMultiSelect" class="lr-card-item-checkbox">
              <a-checkbox
                :checked="selections.includes(item[rowKey || 'f_Id'])"
                @change="pToggleRowSelection([item], $event.target.checked)"
              />
            </div>
          </div>
        </template>
        <div style="display: none">
          <a-image-preview-group
            :preview="{
              visible,
              current: currentIndex,
              onVisibleChange: (vis: boolean) => (visible = vis),
            }"
          >
            <a-image v-for="(item, index) in tableData" :key="index" :src="getSrc(item)" />
          </a-image-preview-group>
        </div>
      </div>
    </a-spin>
    <div v-if="isPage" class="lr-table--pagination">
      <a-pagination
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
  </div>
</template>

<script lang="ts" setup>
  import type { buttonItem } from '../buttons/interface';
  import { PropType, computed, ref } from 'vue';
  import { createNamespace } from '../utils/components';
  import { buildShortUUID, deepClone } from '../utils/method';
  import { t } from '@/core/locales/setupI18n';

  defineOptions({ name: createNamespace('cardList').name });

  const props = defineProps({
    /**
     * @zh 加载src
     */
    loadSrc: Function,
    /**
     * @zh label字段。
     */
    labelKey: {
      type: String,
      default: 'f_Name',
    },
    /**
     * @zh 数据值
     */
    dataSource: {
      type: Array as PropType<Record<string, any>[]>,
      default: () => [],
    },
    /**
     * @zh 按钮
     */
    buttons: {
      type: Array as PropType<buttonItem[]>,
      default: () => [],
    },
    /**
     * @zh 加载失败容错地址
     */
    fallback: {
      type: String,
      default: '',
    },
    // 分页配置
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
     * @zh 总的数据条数
     */
    pageTotal: {
      type: Number,
      default: 0,
    },
    /**
     * @zh 当前页面
     */
    tablePage: {
      type: Number,
      default: 1,
    },
    /**
     * @zh 当前显示页数
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
    /**
     * @zh 处理按钮
     */
    setButton: Function,
    /**
     * @zh 最大按钮个数
     */
    maxBtns: {
      type: Number,
      default: 3,
    },
    /**
     * @zh 是否处于加载中
     * @defaultValue false
     */
    loading: {
      type: Boolean,
      default: false,
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
     * @zh 绑定选中属性。
     * @defaultValue -
     */
    rowKey: String,
    /**
     * @zh 卡片渲染方法
     */
    itemRender: Function,
    /**
     * @zh 背景颜色
     */
    backgroundColor: String,
    /**
     * @zh 是否显示大的编辑按钮
     */
    showBigEditButton: Boolean,
  });

  const emit = defineEmits({
    /**
     * @zh 点击按钮时触发
     * @property {string} prop
     */
    click: (prop: string) => true,
    /**
     * @zh 加载分页数据
     */
    loadPageData: ({ rows, currentPage, sidx }: Record<string, any>) => true,
    'update:pageSize': (_value: number) => true,
    'update:tablePage': (_value: number) => true,
  });

  const visible = ref(false);
  const currentIndex = ref(0);
  const handlePreview = (index: number) => {
    currentIndex.value = index;
    visible.value = true;
  };

  const tableData = computed(() => props.dataSource);
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
  const handleCurrentPageChange = (page: number, pageSize: number) => {
    emit('loadPageData', {
      rows: pageSize,
      page,
      sidx: pageSidx.value,
    });
  };

  // 按钮处理
  const editButton = computed(() => props.buttons.find((t) => t.prop === 'edit'));
  const buttonGroup = (row?: Record<string, any>) => {
    const res: buttonItem[] = [];
    let btns = deepClone(props.buttons); // buttons.value
    if (props.showBigEditButton) {
      btns = btns.filter((t: any) => t.prop !== 'edit');
    }

    // 处理按钮数据
    if (row && props.setButton) {
      props.setButton({ buttons: btns, row });
    }

    let len = btns.length;
    let isNeedClose = false;

    if (props.maxBtns && len > props.maxBtns) {
      len = props.maxBtns;
      isNeedClose = true;
    }

    const lastBtn: buttonItem = {
      prop: buildShortUUID(),
      width: 26,
      icon: 'ant-design:ellipsis-outlined',
      children: [],
    };
    for (let i = 0; i < len; i++) {
      let item: buttonItem = btns[i];
      if (isNeedClose && i === len - 1) {
        item = lastBtn;
      }
      res.push(item);
    }

    if (isNeedClose && props.maxBtns) {
      len = btns.length;
      lastBtn.children = lastBtn.children || [];
      for (let i = props.maxBtns - 1; i < len; i++) {
        const item = btns[i];
        lastBtn.children.push(item);
        if (item.children) {
          lastBtn.children.push(...item.children);
          delete item.children;
        }
      }
    }

    return res;
  };
  const handleClick = (item: Record<string, any>, index: number, btn?: buttonItem) => {
    if (!btn || btn.disabled) return;
    btn.click && btn.click(item, index);
  };

  // 图片链接
  const getSrc = (item: Record<string, any>) => {
    if (props.loadSrc) {
      return props.loadSrc(item);
    }
    return '';
  };

  const selections = ref<string[]>([]);
  const pToggleRowSelection = (rows: any[], selected: boolean) => {
    if (props.isRadio) {
      selections.value[0] = rows[0][props.rowKey || 'f_Id'];
      return;
    }

    if (selected) {
      rows.forEach((row) => {
        selections.value.push(row[props.rowKey || 'f_Id']);
      });
    } else {
      rows.forEach((row) => {
        selections.value = selections.value.filter((item) => item !== row[props.rowKey || 'f_Id']);
      });
    }
  };

  const pGetSelections = () =>
    tableData.value.filter((t: any) => selections.value.indexOf(t[props.rowKey || 'f_Id']) !== -1);

  const pClearSelection = () => {
    selections.value = [];
  };

  function showPageTotal(total: any) {
    return `${t('共')} ${total} ${t('条')}`;
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
  function clearFilter() {}

  defineExpose({ showPageTotal, clearSelection, toggleRowSelection, getSelections, clearFilter });
</script>

<style lang="less">
  @import './cardList';
</style>
