<template>
  <div>
    <a-config-provider
      :theme="{
        components: {
          Button: {
            colorBgTextHover: themeToken.jcode_colorBgBtnHeader,
          },
        },
      }"
    >
      <a-badge :dot="hasNoRead" :offset="[-8, 8]">
        <a-tooltip placement="top" :title="$t('联系')">
          <lr-button class="jcode-header-btn" type="text" @click="showDrawer">
            <template #icon>
              <lr-icon
                :size="18"
                :color="themeToken.jcode_colorTextBtnHeader"
                icon="ant-design:message-outlined"
              />
            </template>
          </lr-button>
        </a-tooltip>
      </a-badge>
    </a-config-provider>
    <lr-drawer
      v-model:open="open"
      title="联系"
      placement="right"
      :hasFooter="false"
      :hasBtns="false"
      @after-open-change="afterOpenChange"
    >
      <chart-list ref="chartListRef" />
    </lr-drawer>
  </div>
</template>
<script lang="ts" setup>
  import { computed, inject, onMounted, ref } from 'vue';
  import { onEvent } from '@/core/utils/eventBus';
  import { useIm } from '@/core/hooks/useIm';
  import { useOrganization } from '/@/core/hooks/data/useOrganization';
  import chartList from './chartList.vue';

  // 主题设置
  const { themeToken } = inject('jcode_app_provide', {} as Record<string, any>);

  const { revChatMsg, refreshChat, getHasNoReadChat } = useIm();
  const { getLoginInfo } = useOrganization();

  const open = ref<boolean>(false);
  const chartListRef = ref();

  const hasNoRead = computed(() => getHasNoReadChat.value);

  const afterOpenChange = () => {
    chartListRef.value?.refresh();
  };

  const showDrawer = () => {
    open.value = true;
  };
  onMounted(() => {
    init();
  });
  const init = async () => {
    onEvent('jcode-im-chat-message', (data) => {
      data.myUserId = getLoginInfo.value.id;
      revChatMsg(data);
    });
    refreshChat;
  };
</script>
