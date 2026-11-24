<template>
  <lr-layout
    :top="36"
    :topMove="false"
    :bottom="44"
    :bottomMove="false"
    class="jcode-chat-user-list"
  >
    <template #top>
      <a-input-search
        v-model:value="keyword"
        :placeholder="`${t('搜索')}：${t('请输入关键词')}`"
        class="search-input"
        clearable
      />
    </template>
    <div v-if="showUserList.length > 0" class="lr-block lr-overflow-y">
      <div
        v-for="(item, index) in showUserList"
        :key="index"
        class="jcode-chat-user-list-item"
        @click="handleOpenMsg(item)"
      >
        <div class="jcode-chat-user-list-close" @click.stop="handleClose(item, index)">
          <lr-icon icon="ant-design:close-outlined" />
        </div>
        <a-avatar :size="36" class="jcode-chat-user-list-avatar">
          {{ avatar(item) }}
        </a-avatar>
        <div class="jcode-chat-user-list-text">
          <p class="title">{{ getTitle(item) }}&nbsp;</p>
          <p class="msg" :style="{ color: themeToken.colorTextTertiary }">
            <span>{{ item.f_Content }}</span>
          </p>
        </div>
        <div class="jcode-chat-user-list-time" :style="{ color: themeToken.colorTextTertiary }">{{
          getTime(item.f_Time)
        }}</div>
        <a-badge
          v-if="item.f_NoReadNum"
          :count="item.f_NoReadNum"
          class="jcode-chat-user-list-badge"
        />
      </div>
    </div>
    <div v-else class="no-data">
      <p class="no-data-text">{{ $t('暂无联系人') }}</p>
      <lr-button type="primary" @click="handleAddUser">{{ $t('添加') }}</lr-button>
    </div>
    <template #bottom>
      <div class="lr-block jcode-chat-user-list-bottom" v-if="showUserList.length > 0">
        <lr-button
          @click="handleAddUser"
          class="lr-block"
          style="display: flex; align-items: center; justify-content: center"
          >{{ $t('添加联系人') }}</lr-button
        >
      </div>
    </template>
  </lr-layout>
  <lr-modal
    v-model:visible="userVisible"
    :title="$t('添加联系人')"
    :width="800"
    :height="648"
    @ok="handleUserSelectOk"
    ><lr-user-panel ref="userSelectRef" :isMultiSelect="true"
  /></lr-modal>
  <lr-modal
    v-model:visible="chatVisible"
    :title="getName(otherId)"
    :width="800"
    :height="648"
    :hasBtns="false"
    @closed="handleChatClosed"
    ><ChartBox :otherId="otherId" ref="chatBoxRef"
  /></lr-modal>
</template>

<script setup lang="ts">
  import { computed, ref, inject } from 'vue';

  import { formatToDate } from '@/core/utils/jcode';
  import { useOrganization } from '/@/core/hooks/data/useOrganization';
  import { useIm } from '@/core/hooks/useIm';
  import ChartBox from './chatBox.vue';
  import { t } from '@/core/locales/setupI18n';

  const { loadUser, getUser, getLoginInfo, loadDepartment, getDepartment } = useOrganization();
  const { getChatList, refreshChat, removeChat, setChatUserId, refreshMessage, addChat } = useIm();

  const { themeToken } = inject('jcode_app_provide', {} as Record<string, any>);

  const userSelectRef = ref();
  const keyword = ref('');
  const userVisible = ref(false);
  const chatVisible = ref(false);
  const otherId = ref('');
  const chatList = computed(() => {
    return getChatList.value;
  });
  const showUserList = computed(() => {
    if (keyword.value) {
      return chatList.value.filter((t) => getTitle(t).indexOf(keyword.value) > -1);
    } else {
      return chatList.value;
    }
  });
  const refresh = () => {
    refreshChat();
  };
  const handleClose = async (item) => {
    removeChat(item);
  };
  const handleOpenMsg = (item) => {
    otherId.value = item.f_OtherUserId;
    setChatUserId(item.f_OtherUserId);
    refreshMessage({
      recvUserId: getLoginInfo.value.id,
      sendUserId: otherId.value,
    });
    chatVisible.value = true;
  };
  const handleAddUser = () => {
    userVisible.value = true;
  };
  const handleUserSelectOk = async () => {
    let select = await userSelectRef.value.ok();
    const selectData = select.map((t) => {
      return {
        f_MyUserId: getLoginInfo.value.id,
        f_OtherUserId: t.f_UserId,
      };
    });
    userSelectRef.value.closed();
    userVisible.value = false;
    addChat(selectData);
  };
  const avatar = (item) => {
    loadUser(item.f_OtherUserId);
    const user = getUser.value[item.f_OtherUserId];
    if (user) {
      // return user.f_HeadIcon
      //   ? `${apiUrl}organization/user/img/${user.f_HeadIcon}?token=${userStore.getToken}`
      //   : `${urlPrefix}img/admin/head.png`;
      const account = user.f_Account || '';
      return account.length > 2 ? account.slice(0, 2) : account;
    }
  };
  const getTitle = (item) => {
    loadUser(item.f_OtherUserId);
    const user = getUser.value[item.f_OtherUserId];
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
  const getName = (id) => {
    //
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
  const chatBoxRef = ref();
  const handleChatClosed = () => {
    chatBoxRef.value.reset();
  };
  defineExpose({ refresh });
</script>

<style lang="less">
  .lr-overflow-y {
    overflow: auto;
    overflow: scroll;
  }

  .jcode-chat-user-list {
    .no-data {
      position: absolute;
      top: 50%;
      box-sizing: border-box;
      width: 100%;
      margin-top: -100px;
      text-align: center;

      &-text {
        padding-top: 20px;
        color: var(--vxe-font-color);
        font-size: 14px;
        line-height: 20px;
        text-align: center;
      }
    }

    &-bottom {
      padding: 0 8px;

      .ant-btn {
        width: 100%;
      }
    }

    &-item {
      position: relative;
      height: 64px;
      padding: 11px 64px 0 60px;
      transition: all 0.3s;
      border-bottom: 1px solid var(--vxe-table-border-color);
      cursor: pointer;

      &:hover {
        background-color: var(--color-primary-bg-hover);
      }
    }

    &-close {
      display: none;
      position: absolute;
      top: 24px;
      left: 4px;

      &:hover {
        color: var(--vxe-font-color);
      }
    }

    &-item:hover &-close {
      display: block;
      color: var(--vxe-font-color);
    }

    &-avatar {
      position: absolute;
      top: 14px;
      left: 24px;
    }

    &-text {
      flex: 1;
      margin-left: 14px;
      padding-top: 1px;
      overflow: hidden;

      .title {
        margin: 0;
        margin-bottom: 4px;
        overflow: hidden;
        color: var(--vxe-font-color);
        font-size: 14px;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .msg {
        margin: 0;
        overflow: hidden;
        font-size: 12px;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    &-time {
      position: absolute;
      top: 14px;
      right: 8px;
      font-size: 12px;
    }

    &-badge {
      display: block;
      position: absolute;
      top: 40px;
      right: 8px;
    }
  }
</style>
