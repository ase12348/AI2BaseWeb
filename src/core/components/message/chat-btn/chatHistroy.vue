<template>
  <lr-layout
    class="l-chat-history-body"
    :top="36"
    :topMove="false"
    :bottom="34"
    :bottomMove="false"
  >
    <template #top>
      <a-input-search
        v-model:value="searchWord"
        :placeholder="`${$t('搜索')}: ${$t('请输入关键词')}`"
        class="search-input"
        clearable
        @search="hanleSearch"
      />
    </template>
    <template #bottom>
      <div
        style="
          display: flex;
          align-items: center;
          justify-content: end;
          padding: 2px;
          border-top: 1px solid var(--color-border-secondary);
        "
        class="lr-block"
      >
        <a-pagination
          v-model:current="page"
          simple
          :total="total"
          :pageSize="pageSize"
          @change="pageChange"
        />
      </div>
    </template>
    <div class="lr-block l-chat-box" style="overflow: auto" ref="msgHistoryRef">
      <div
        :class="['l-chat-box-msg-item', { me: isMe(item) }]"
        v-for="(item, index) in msgHistoryList"
        :key="index"
      >
        <a-avatar :size="36" class="l-chat-box-avatar">
          {{ avatar(item.f_SendUserId) }}
        </a-avatar>
        <div
          class="l-chat-box-msg-title"
          :style="{ color: themeToken.colorTextTertiary }"
          v-if="!isMe(item)"
          >{{ getName(item.f_SendUserId)
          }}<span class="time">{{ getTime(item.f_CreateDate) }}</span></div
        >
        <div class="l-chat-box-msg-title" :style="{ color: themeToken.colorTextTertiary }" v-else
          ><span class="time">{{ getTime(item.f_CreateDate) }}</span
          >{{ getName(item.f_SendUserId) }}</div
        >
        <div class="l-chat-box-msg-content">
          <div class="arrow"></div>
          {{ item.f_Content }}
        </div>
      </div>
    </div>
  </lr-layout>
</template>

<script setup lang="ts">
  import { ref, nextTick, inject } from 'vue';
  import { formatToDate } from '@/core/utils/jcode';
  import { useOrganization } from '/@/core/hooks/data/useOrganization';
  import { api } from '@/core/modules/message/api/msg';
  import { t } from '@/core/locales/setupI18n';

  const { getLoginInfo, getUser, loadDepartment, getDepartment } = useOrganization();

  const { themeToken } = inject('jcode_app_provide', {} as Record<string, any>);

  const props = defineProps({
    otherId: String,
  });
  const searchWord = ref('');
  const total = ref(0);
  const page = ref(1);
  const pageSize = ref(30);
  const msgHistoryList = ref<any>([]);
  const loading = ref(false);
  const msgHistoryRef = ref();

  const init = () => {
    loadMsg();
  };
  const hanleSearch = () => {
    loadMsg();
  };
  const loadMsg = async (isNotFirst) => {
    loading.value = true;
    if (!isNotFirst) {
      page.value = 1;
    }
    const queryData = {
      rows: pageSize.value,
      page: page.value,
      sidx: 'F_CreateDate DESC',
      toId: props.otherId,
      sendId: getLoginInfo.value.id,
      keyword: searchWord.value,
    };
    // 获取聊天记录
    const data = (await api.getPage(queryData)) || {};
    total.value = data.records || 0;
    msgHistoryList.value = (data.rows || []).sort((a, b) => {
      return Date.parse(a.f_CreateDate) - Date.parse(b.f_CreateDate);
    });

    nextTick(() => {
      msgHistoryRef.value.scrollTop = msgHistoryRef.value.scrollHeight;
    });
    loading.value = false;
  };
  const pageChange = () => {
    loadMsg(true);
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
    let user: any = null;
    if (id == getLoginInfo.value.id) {
      user = getLoginInfo.value;
    } else {
      user = getUser.value[id];
    }

    if (user) {
      const account = user.f_Account || user.account || '';
      return account.length > 2 ? account.slice(0, 2) : account;
    }
  };
  const reset = () => {
    searchWord.value = '';
    total.value = 0;
    page.value = 1;
    msgHistoryList.value = [];
  };
  defineExpose({ reset, init });
</script>

<style scoped lang="less"></style>
