<template>
  <lr-layout :right="histroyVisible ? 394 : 0" style="background-color: var(--color-bg-layout)">
    <lr-panel>
      <lr-layout class="l-chat-box" :bottom="200">
        <div class="lr-block" style="overflow: auto" ref="msgListRef">
          <div
            :class="['l-chat-box-msg-item', { me: isMe(item) }]"
            v-for="(item, index) in msgListCurrent"
            :key="index"
          >
            <a-avatar :size="36" class="l-chat-box-avatar">
              {{ avatar(item.f_SendUserId) }}
            </a-avatar>
            <div
              class="l-chat-box-msg-title"
              :style="{ color: themeToken.colorTextTertiary }"
              v-if="!isMe(item)"
            >
              {{ getName(item.f_SendUserId)
              }}<span class="time">{{ getTime(item.f_CreateDate) }}</span>
            </div>
            <div
              class="l-chat-box-msg-title"
              :style="{ color: themeToken.colorTextTertiary }"
              v-else
            >
              <span class="time">{{ getTime(item.f_CreateDate) }}</span
              >{{ getName(item.f_SendUserId) }}
            </div>
            <div class="l-chat-box-msg-content">
              <div class="arrow"></div>
              {{ item.f_Content }}
            </div>
          </div>
        </div>
        <template #bottom>
          <lr-layout :top="30" :topMove="false">
            <template #top>
              <div class="lr-block l-chat-box-bar">
                <lr-button
                  iconName="ant-design:field-time-outlined"
                  :label="$t('聊天记录')"
                  @click="openHistroy"
                  :type="histroyVisible ? 'link' : 'text'"
                />
              </div>
            </template>
            <a-textarea
              v-model:value="message"
              class="l-chat-box-textarea"
              :placeholder="$t('请输入消息')"
              @keyup.enter="sendChat"
            />
          </lr-layout>
        </template>
      </lr-layout>
    </lr-panel>

    <template #right>
      <lr-panel>
        <ChatHistroy :otherId="otherId" ref="chatHistoryRef" />
      </lr-panel>
    </template>
  </lr-layout>
</template>

<script setup lang="ts">
  import { computed, ref, watch, nextTick, inject } from 'vue';
  import { formatToDate } from '@/core/utils/jcode';
  import { emitEvent } from '@/core/utils/eventBus';
  import { useIm } from '@/core/hooks/useIm';
  import { useOrganization } from '/@/core/hooks/data/useOrganization';
  import ChatHistroy from './chatHistroy.vue';
  import { t } from '@/core/locales/setupI18n';

  const { getUser, getLoginInfo, loadDepartment, getDepartment } = useOrganization();

  const { getMessageList, sendMsg, setChatUserId } = useIm();

  const { themeToken } = inject('jcode_app_provide', {} as Record<string, any>);

  const props = defineProps({
    otherId: String,
    updateList: Function,
  });

  const chatHistoryRef = ref();
  const msgListRef = ref();
  const message = ref('');
  const histroyVisible = ref(false);

  const msgListCurrent = computed(() => getMessageList.value[props.otherId]);
  watch(
    msgListCurrent,
    () => {
      setTimeout(() => {
        if (msgListRef.value) {
          msgListRef.value.scrollTop = msgListRef.value.scrollHeight;
        }
      }, 100);
    },
    { deep: true },
  );

  const openHistroy = () => {
    histroyVisible.value = !histroyVisible.value;
    if (!histroyVisible.value) {
      chatHistoryRef.value.reset();
    } else {
      chatHistoryRef.value.init();
    }
  };
  const sendChat = async () => {
    const msg = message.value.trim().replace('\n', '');
    message.value = '';
    if (!msg) {
      return;
    }
    const postData = {
      f_SendUserId: getLoginInfo.value.id,
      f_RecvUserId: props.otherId,
      f_Content: msg,
      f_CreateDate: formatToDate(new Date(), 'YYYY-MM-DD HH:mm:ss'),
    };
    const id = await sendMsg(postData);
    emitEvent('jcode-im-send', {
      recvUserId: props.otherId,
      sendUserId: getLoginInfo.value.id,
      msg: postData.f_Content,
      id,
    });

    nextTick(() => {
      msgListRef.value.scrollTop = msgListRef.value.scrollHeight;
    });
  };
  const isMe = (item) => {
    if (item.f_SendUserId != getLoginInfo.value.id) {
      return false;
    }
    return true;
  };
  const getName = (id) => {
    if (id == getLoginInfo.value.id) {
      return t('我');
    }
    const user = getUser.value[id];
    if (user) {
      let res = user.f_RealName;
      if (user.f_DepartmentId) {
        loadDepartment(user.f_DepartmentId);
        const department = getDepartment.value[user.f_DepartmentId];
        if (department) {
          res += `/${department.f_FullName}`;
        }
      }
      return res;
    } else {
      return ' ';
    }
  };
  const getTime = (time) => {
    const nowDate = formatToDate(new Date(), 'YYYY-MM-DD');
    const myDate = formatToDate(time, 'YYYY-MM-DD');
    if (nowDate != myDate) {
      return myDate;
    } else {
      return formatToDate(time, 'HH:mm:ss');
    }
  };
  const avatar = (id) => {
    let user = null;
    if (id == getLoginInfo.value.id) {
      user = getLoginInfo.value;
    } else {
      user = getUser.value[id];
    }

    if (user) {
      // return user.f_HeadIcon
      //   ? `${apiUrl}organization/user/img/${user.f_HeadIcon}?token=${userStore.getToken}`
      //   : `${urlPrefix}img/admin/head.png`;
      const account = user.f_Account || user.account || '';
      return account.length > 2 ? account.slice(0, 2) : account;
    }
  };
  const reset = () => {
    setChatUserId('');
    histroyVisible.value = false;
    chatHistoryRef.value.reset();
  };
  defineExpose({ reset });
</script>

<style lang="less">
  .l-chat-box {
    &-bar {
      background-color: var(--color-border-secondary);
      text-align: right;

      .ant-btn {
        padding: 6px;
        border: 0;
      }
    }

    &-textarea {
      box-sizing: border-box;
      width: 100%;
      height: 100% !important;
      padding: 4px;
      border: 0;
      outline: 0;
      resize: none;
    }

    &-msg-item {
      position: relative;
      min-height: 64px;
      margin-bottom: 8px;
      padding-top: 14px;
      padding-right: 8px;
      padding-left: 64px;
      font-size: 0;
      text-align: left;
    }

    &-avatar {
      position: absolute;
      top: 14px;
      left: 14px;
    }

    &-msg-title {
      margin-bottom: 4px;
      font-size: 12px;
      white-space: nowrap;

      .time {
        margin-left: 4px;
      }
    }

    &-msg-content {
      display: inline-block;
      position: relative;
      padding: 8px;
      border-radius: 4px;
      background: var(--color-border-secondary);
      font-size: 14px;
      word-break: break-all;

      .arrow {
        position: absolute;
        z-index: 1;
        top: 50%;
        left: -4px;
        width: 8px;
        height: 8px;
        margin-top: -7px;
        clip: rect(0, 8px, 8px, 0);
        transform: rotate(-45deg);
        border: 1px solid var(--color-border-secondary);
        border-top: 0;
        border-left: 0;
        background: var(--color-border-secondary);
      }
    }

    &-msg-item.me {
      padding-right: 64px;
      padding-left: 8px;
      text-align: right;
    }

    .me &-msg-content {
      background: var(--color-info-bg);
      color: var(--vxe-font-color);

      .arrow {
        right: -4px;
        left: auto;
        border: 1px solid var(--color-info-bg);
        background: var(--color-info-bg);
      }
    }

    .me &-avatar {
      right: 14px;
      left: auto;
    }

    .me &-msg-title {
      text-align: right;

      .time {
        margin-right: 4px;
      }
    }
  }
</style>
