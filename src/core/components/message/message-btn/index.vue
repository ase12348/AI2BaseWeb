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
      <a-badge :dot="hasMsg" :offset="[-8, 8]">
        <a-tooltip placement="top" :title="$t('消息')">
          <lr-button class="jcode-header-btn" type="text" @click="showDrawer">
            <template #icon>
              <lr-icon
                :size="18"
                :color="themeToken.jcode_colorTextBtnHeader"
                icon="ant-design:notification-outlined"
              />
            </template>
          </lr-button>
        </a-tooltip>
      </a-badge>
    </a-config-provider>
    <message-list ref="messageListRef" />
  </div>
</template>
<script lang="ts" setup>
  import { computed, inject, onMounted, ref } from 'vue';
  import { useIm } from '@/core/hooks/useIm';
  import messageList from './messageList.vue';
  import { onEvent } from '@/core/utils/eventBus';

  // 主题设置
  const { themeToken } = inject('jcode_app_provide', {} as Record<string, any>);

  const { getSystemMsgNum, refreshSystemMsgNum } = useIm();
  const messageListRef = ref();
  const hasMsg = computed(() => {
    return getSystemMsgNum.value > 0;
  });

  onMounted(() => {
    init();
  });
  const init = () => {
    onEvent('jcode-im-system-message', () => {
      setTimeout(() => {
        messageListRef.value && messageListRef.value.refresh();
        refreshSystemMsgNum();
      }, 100);
    });
    refreshSystemMsgNum();
  };
  const showDrawer = () => {
    messageListRef.value.open();
  };
</script>
