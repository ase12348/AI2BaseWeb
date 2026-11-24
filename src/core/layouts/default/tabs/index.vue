<template>
  <div :class="prefixCls">
    <div :class="`${prefixCls}-container`">
      <div style="position: relative; flex: 2; width: 0; height: 100%">
        <a-tabs
          type="card"
          :animated="false"
          :hideAdd="true"
          :activeKey="activeKey"
          @change="handleChange"
        >
          <a-tab-pane v-for="(item, index) in getTabsState" :key="item.id">
            <template #tab>
              <a-dropdown :trigger="['contextmenu']">
                <div :class="`${prefixCls}-item`"
                  >{{ $t(getName(item)) }}
                  <lr-button
                    v-if="!item.isNotClosed && !isLastTab"
                    @click.stop="handleClosePage(index)"
                    type="text"
                  >
                    <template #icon
                      ><lr-icon :size="12" icon="ant-design:close-outlined"
                    /></template>
                  </lr-button>
                </div>
                <template #overlay>
                  <a-menu>
                    <a-menu-item
                      @click="handleClosePage(index)"
                      :disabled="item.isNotClosed || isLastTab"
                      >{{ $t('关闭页面') }}</a-menu-item
                    >
                    <a-menu-item @click="handleClickReload(item.id)">{{
                      $t('刷新页面')
                    }}</a-menu-item>
                    <a-menu-divider />
                    <a-menu-item
                      @click="handleCloseLeftPage(index)"
                      :disabled="
                        index == 0 ||
                        getTabsState.findIndex((t, myIndex) => !t.isNotClosed && myIndex < index) ==
                          -1
                      "
                      >{{ $t('关闭左侧页面') }}</a-menu-item
                    >
                    <a-menu-item
                      @click="handleCloseRightPage(index)"
                      :disabled="getTabsState.length - 1 == index"
                      >{{ $t('关闭右侧页面') }}</a-menu-item
                    >
                    <a-menu-divider />
                    <a-menu-item
                      @click="handleCloseOtherPage(index)"
                      :disabled="
                        getTabsState.findIndex(
                          (t, myIndex) => !t.isNotClosed && myIndex != index,
                        ) == -1
                      "
                      >{{ $t('关闭其它页面') }}</a-menu-item
                    >
                    <a-menu-item @click="handleCloseAllPage" :disabled="isCloseAllDisabled">{{
                      $t('关闭全部页面')
                    }}</a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </template>
          </a-tab-pane>
        </a-tabs>
      </div>
      <div style="display: flex; align-items: center; height: 100%; padding: 0 8px">
        <a-tooltip placement="bottom" :title="$t('刷新页面')">
          <lr-button type="text" @click="handleClickReload(activeKey)">
            <template #icon>
              <lr-icon icon="reload-outlined" />
            </template>
          </lr-button>
        </a-tooltip>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { computed, unref, onMounted, ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { isNil } from '/@/core/utils/is';
  import { useGlobSetting } from '/@/core/hooks/setting';
  import { listenerRouteChange } from '/@/core/logics/mitt/routeChange';
  import { useMultipleTabStore } from '/@/core/store/modules/multipleTab';
  import { useSortable } from '@/core/components/ui';
  import { useGo } from '/@/core/hooks/usePage';
  import { getRouteId } from '/@/core/utils';
  import { useMenu } from '/@/core/hooks/useMenu';

  // 默认设置
  const { options } = useGlobSetting();
  const prefixCls = `${options.prefixCls}-multiple-tabs`;
  const activeKey = ref('');

  const { getAllModuleDicByCode } = useMenu();

  const getName = (item) => {
    return getAllModuleDicByCode.value[item.id]?.f_FullName || item.title;
  };

  const tabStore = useMultipleTabStore();
  listenerRouteChange((route) => {
    const currentRoute = unref(route);
    tabStore.addTab(currentRoute);
    activeKey.value = getRouteId(currentRoute);
  });

  const getTabsState = computed(() => {
    return tabStore.getTabList;
  });

  // 只剩最后一个页签时不允许关闭
  const isLastTab = computed(() => getTabsState.value.length <= 1);

  // 关闭全部页面是否禁用
  const isCloseAllDisabled = computed(
    () => isLastTab.value || getTabsState.value.findIndex((t) => !t.isNotClosed) == -1,
  );

  const router = useRouter();

  // 设置排序功能
  onMounted(() => {
    const el = document.querySelectorAll(
      `.${prefixCls} .ant-tabs-nav-wrap > div`,
    )?.[0] as HTMLElement;
    const { initSortable } = useSortable(el, {
      filter: (_evt) => {
        return false;
      },
      onEnd: (evt) => {
        const { oldIndex, newIndex } = evt;
        if (isNil(oldIndex) || isNil(newIndex) || oldIndex === newIndex) {
          return;
        }
        tabStore.sortTabs(oldIndex, newIndex);
      },
    });
    initSortable();
  });

  // 事件
  const go = useGo();
  const handleChange = (activeKey: string) => {
    const item = getTabsState.value.find((t) => t.id === activeKey);
    if (item) {
      go(item.path);
    }
  };

  // 关闭页面
  const handleClosePage = (index: number) => {
    if (isLastTab.value) {
      return;
    }
    tabStore.closeTab(index, router);
  };

  // 关闭左侧页面
  const handleCloseLeftPage = (index: number) => {
    tabStore.closeLeftTabs(index, router);
  };

  // 关闭右侧页面
  const handleCloseRightPage = (index: number) => {
    tabStore.closeRightTabs(index, router);
  };

  // 关闭其它页面
  const handleCloseOtherPage = (index: number) => {
    tabStore.closeOtherTabs(index, router);
  };

  // 关闭其它页面
  const handleCloseAllPage = () => {
    tabStore.closeAllTabs(router);
  };

  // 刷新页面
  const handleClickReload = (id: string) => {
    tabStore.setReload(id);
  };
</script>
<style lang="less">
  @import url('./index.less');
</style>
