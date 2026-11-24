<template>
  <vxe-column
    v-if="list.length > 0"
    :title="$t('操作')"
    :fixed="isFixed ? fixed : undefined"
    :width="colWidth"
    :resizable="false"
    :show-overflow="false"
  >
    <template #default="scope">
      <!-- <lr-buttons
        class="lr-table-btn"
        :group="buttonGroup(scope.row)"
        :row="scope.row"
        :row-index="scope.$rowIndex"
        is-link
      ></lr-buttons> -->
      <template v-for="(btn, index) of buttonGroup(scope.row)" :key="index + '-' + scope.$rowIndex">
        <a-dropdown v-if="btn.children?.length && btn.children?.length > 0">
          <button class="lr-table-btn">
            {{ $t('更多') }}
          </button>
          <template #overlay>
            <div class="lr-table-btns-panel">
              <button
                :key="childIndex"
                v-for="(childBtn, childIndex) of btn.children || []"
                :class="['lr-table-btn', { dangerous: childBtn.danger }]"
                style="display: block"
                :disabled="childBtn.disabled"
                @click.stop="handleClick(childBtn.prop, childBtn, scope.row, scope.$rowIndex)"
              >
                {{ $t(childBtn.label || '') }}
              </button>
            </div>
          </template>
        </a-dropdown>
        <button
          v-else
          :class="['lr-table-btn', { dangerous: btn.danger }]"
          :disabled="btn.disabled"
          @click.stop="handleClick(btn.prop, btn, scope.row, scope.$rowIndex)"
        >
          {{ $t(btn.label || '') }}
        </button>
      </template>
    </template>
  </vxe-column>
</template>

<script lang="ts" setup>
  import type { buttonItem } from '../buttons/interface';
  import { PropType, computed } from 'vue';
  import { createNamespace } from '../utils/components';
  import { buildShortUUID, deepClone, getTextWidth } from '../utils/method';
  import { useFramework } from '../utils/useFramework';

  defineOptions({ name: createNamespace('tableButtons').name });
  const props = defineProps({
    /**
     * @zh 按钮数据,buttonItem对象查看buttons页面
     */
    list: {
      type: Array as PropType<buttonItem[]>,
      default: () => [],
    },
    /**
     * @zh 是否固定列
     */
    isFixed: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 固定列位置
     * @defaultValue right
     */
    fixed: {
      type: String,
      default: 'right',
    },
    /**
     * @zh 展示按钮个数
     */
    maxBtns: {
      type: Number,
      default: 4,
    },
    /**
     * @zh 处理按钮
     */
    setButton: Function,
  });
  const emit = defineEmits({
    /**
     * @zh 点击按钮时触发
     * @property {string} prop
     */
    click: (prop: string) => true,
  });

  const { t } = useFramework({});
  // 计算属性
  const buttonGroup = (row?: Record<string, any>) => {
    const res: buttonItem[] = [];
    const btns = deepClone(props.list); // buttons.value

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

  const colWidth = computed(() => {
    let width = 21;
    let num = 0;
    const unRefButtonGroup = buttonGroup();
    unRefButtonGroup.forEach((item) => {
      width += item.width || getTextWidth(t(item.label || '')) || 26;
      num++;
    });

    return width + (num - 1) * 8;
  });

  //
  const handleClick = (
    prop: string,
    btn: buttonItem,
    row: Record<string, any>,
    rowIndex: number,
  ) => {
    if (btn.disabled) return;
    btn.click && btn.click(row, rowIndex);
    emit('click', prop);
  };
</script>

<style lang="less">
  @import './tableButtons.less';
</style>
