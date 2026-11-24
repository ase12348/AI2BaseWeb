<template>
  <a-space :style="{ display: readonly || disabled ? 'none' : '' }">
    <a-space-compact v-for="(buttons, key) of buttonGroup" :key="key">
      <template v-for="(btn, index) of buttons" :key="index">
        <a-dropdown v-if="btn.children?.length && btn.children?.length > 0">
          <lr-button
            :label="btn.label"
            :type="isLink ? 'link' : btn.type"
            :danger="btn.danger"
            :size="size"
            @click.stop="handleClick(btn)"
          >
            <template #iconAfter v-if="btn.icon">
              <lr-icon
                :icon="btn.icon"
                :is-div="!btn.label"
                :class="{ 'lr-button-icon': btn.label }"
              />
            </template>
          </lr-button>
          <template #overlay>
            <a-space-compact direction="vertical">
              <lr-button
                v-for="childBtn of btn.children || []"
                :key="childBtn.prop"
                :label="childBtn.label"
                type="text"
                :danger="childBtn.danger"
                :size="size"
                :disabled="childBtn.disabled"
                @click.stop="handleClick(childBtn)"
              >
                <template #icon v-if="childBtn.icon">
                  <lr-icon
                    :icon="childBtn.icon"
                    :is-div="!btn.label"
                    :class="{ 'lr-button-icon': btn.label }"
                  />
                </template>
              </lr-button>
            </a-space-compact>
          </template>
        </a-dropdown>
        <lr-upload
          v-else-if="btn.action === 'upload'"
          :placeholder="btn.label"
          :btn-type="isLink ? 'link' : btn.type"
          :btn-size="size"
          :is-secret-level="false"
          :show-file-list="false"
          :accept="btn.uploadAccept"
          :upload-callback="btn.uploadCallback"
          :limit="100000"
          @success="btn.uploadSuccess"
        />
        <lr-button
          v-else
          :label="btn.label"
          :type="isLink ? 'link' : btn.type"
          :danger="btn.danger"
          :size="size"
          @click.stop="handleClick(btn)"
          :compact="true"
          :last-compact-item="index === buttons.length - 1"
          :first-compact-item="index === 0"
        >
          <template #icon v-if="btn.icon">
            <lr-icon
              :icon="btn.icon"
              :is-div="!btn.label"
              :class="{ 'lr-button-icon': btn.label }"
            />
          </template>
        </lr-button>
      </template>
    </a-space-compact>

    <lr-dynamic-layer ref="layerRef" />
  </a-space>
</template>

<script lang="ts" setup>
  import type { buttonItem } from './interface';
  import { PropType, computed, ref } from 'vue';
  import { createNamespace } from '../utils/components';
  import { buildShortUUID, deepClone } from '../utils/method';
  import { useButtons } from './useButtons';

  defineOptions({ name: createNamespace('buttons').name });

  const props = defineProps({
    /**
     * @zh 按钮数据
     */
    list: {
      type: Array as PropType<buttonItem[]>,
      default: () => [],
    },
    /**
     *
     * @zh 按钮组
     */
    group: {
      type: Object as PropType<Record<string, buttonItem[]>>,
      default: () => ({}),
    },
    /**
     * @zh 是否是链接按钮
     */
    isLink: Boolean,
    /**
     * @zh 选框尺寸
     */
    size: {
      type: String as PropType<'small' | 'large' | 'middle'>,
    },
    readonly: Boolean,
    disabled: Boolean,
  });

  // 计算属性
  const buttonGroup = computed(() => {
    if (Object.keys(props.group).length > 0) {
      return props.group;
    }

    const res: Record<string, buttonItem[]> = {};
    const btns = deepClone(props.list);
    const len = btns.length;

    for (let i = 0; i < len; i++) {
      const item = btns[i];
      item.groupId = item.groupId || buildShortUUID();
      // item._loading = false
      res[item.groupId] = res[item.groupId] || [];
      res[item.groupId].push(item);
    }

    return res;
  });

  // 弹窗处理
  const layerRef = ref();
  const { handleClick } = useButtons(layerRef);
</script>

<style lang="less">
  @import './buttons.less';
</style>
