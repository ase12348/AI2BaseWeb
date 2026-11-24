<template>
  <lr-drawer v-model:open="openVisible" :title="$t('站内消息')" placement="right" :hasBtns="false">
    <lr-layout class="l-message-list" :top="36" :topMove="false" :bottom="44" :bottomMove="false">
      <template #top>
        <a-input-search
          v-model:value="keyword"
          :placeholder="`${t('搜索')}：${t('请输入关键词')}`"
          class="search-input"
          @search="hanleSearch"
        />
      </template>
      <div class="lr-block" style="overflow: auto">
        <div class="l-message-list-wraper" v-for="item in messageList" :key="item.f_MsgId">
          <div
            :title="item.f_Content"
            :class="['l-message-list-item', { 'l-message-list-item-read': item.f_IsRead == 1 }]"
            @click="handleOpenMsg(item)"
          >
            <a-avatar :size="36" style="background: #79bbff" class="l-message-list-avatar">
              <template #icon>
                <lr-icon :icon="getIcon(item.f_SendUserId)" :size="20" :is-div="false" /> </template
            ></a-avatar>
            <div class="l-message-list-text">
              <p class="title">{{ item.f_Content }}</p>
              <p class="msg" :style="{ color: themeToken.colorTextTertiary }">
                {{ getName(item.f_SendUserId) }}
              </p>
            </div>
            <div class="l-message-list-time" :style="{ color: themeToken.colorTextTertiary }">{{
              getTime(item.f_CreateDate)
            }}</div>
          </div>
        </div>
      </div>
      <div v-if="messageList.length == 0" class="no-data">
        <a-empty />
      </div>
      <template #bottom>
        <div class="lr-block l-message-list-bottom">
          <a-button-group>
            <a-button @click="handleClearMsg">{{ $t('清空消息') }}</a-button>
            <a-button @click="handleMore">{{ $t('查看更多') }}</a-button>
          </a-button-group>
        </div>
      </template>
      <lr-dynamic-layer ref="layerRef" />
    </lr-layout>
  </lr-drawer>
</template>

<script setup lang="ts">
  import { ref, onMounted, inject } from 'vue';
  import { formatToDate } from '@/core/utils/jcode';
  import { useIm } from '@/core/hooks/useIm';
  import { useMessage } from '@/core/hooks/useMessage';
  import { useMenu } from '/@/core/hooks/useMenu';
  import { useGo } from '/@/core/hooks/usePage';
  import { api } from '@/core/modules/message/api/msgsys';
  import { api as apiUser } from '@/core/modules/message/api/user';
  import { api as apiMsg } from '@/core/modules/message/api/msg';
  import { t } from '@/core/locales/setupI18n';

  const go = useGo();
  const { refreshSystemMsgNum } = useIm();
  const { createConfirm, success, loading, info, error } = useMessage();
  const { getAllMenuList, getAllModuleDic } = useMenu();

  const { themeToken } = inject('jcode_app_provide', {} as Record<string, any>);

  const openVisible = ref<boolean>(false);
  const open = () => {
    openVisible.value = true;
    refresh();
  };

  const keyword = ref('');
  const messageList = ref([]);
  const sysUserList = ref([]);
  const sysMessageComponent = ref('');

  onMounted(() => {
    loadSysUsers();
  });
  const refresh = async () => {
    const queryData = {
      rows: 100,
      page: 1,
      sidx: 'F_IsRead,F_CreateDate DESC',
      keyword: keyword.value,
      isDelete: 0,
    };

    const data = await api.getPage(queryData);
    messageList.value = data.rows;
  };
  const loadSysUsers = async () => {
    sysUserList.value = await apiUser.getList();
  };
  const hanleSearch = async () => {
    const loadingHide = loading('加载中');
    await refresh();
    loadingHide();
  };
  const getIcon = (code) => {
    const sysUser = sysUserList.value.find((t) => t.f_Code == code);
    if (sysUser) {
      return sysUser.f_Icon;
    }
    return '';
  };
  const getName = (code) => {
    const sysUser = sysUserList.value.find((t) => t.f_Code == code);
    if (sysUser) {
      return sysUser.f_Name;
    }
    return '';
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
  const handleOpenMsg = async (item) => {
    const sysuser = sysUserList.value.find((t) => t.f_Code == item.f_SendUserId);
    if (sysuser && sysuser.f_Url) {
      sysMessageComponent.value = sysuser.f_Url;
      openMessageBox(item);
    }
    item.f_IsRead = 1;
    await apiMsg.read(item.f_MsgId);
    refreshSystemMsgNum();
  };
  // 弹窗
  const layerRef = ref();
  const openMessageBox = (item) => {
    if (sysMessageComponent.value === 'workflow_task_form') {
      let type;
      if (item.f_Content.indexOf('【审批】') != -1) {
        type = 'audit';
      } else if (item.f_Content.indexOf('【查阅】') != -1) {
        type = 'look';
      } else if (item.f_Content.indexOf('【重新提交】') != -1) {
        type = 'create';
      } else {
        type = 'lookmy';
      }
      layerRef.value.open({
        title: t('查看消息'),
        name: sysMessageComponent.value,
        type: 'full',
        param: { token: item.f_ContentId, look: type === 'lookmy' ? 'startNode' : '' },
        hasSaveBtn: false,
      });
    } else {
      layerRef.value.open({
        title: t('查看消息'),
        name: sysMessageComponent.value,
        type: 'full',
        param: { token: item.f_ContentId, item: item },
        hasBtns: false,
      });
    }
  };
  const handleClearMsg = () => {
    createConfirm({
      title: t('提示'),
      iconType: 'warning',
      content: `${t('是否清空消息列表')}?`,
      onOk: async () => {
        messageList.value = [];
        const res = await apiMsg.clear();
        if (res) {
          refreshSystemMsgNum();
          success('清空成功');
        }
      },
      onCancel: () => {
        info('已取消清空');
      },
    });
  };
  const handleMore = () => {
    const item = getAllMenuList.value.find((t) => t.code === 'jcodemsg');
    if (item) {
      const module = getAllModuleDic.value[item.value];
      openVisible.value = false;
      go({ path: module.f_UrlAddress, query: { menuId: module.f_EnCode } });
    } else {
      error(`${t('找不到页面')}，${t('请查看菜单配置')}!`);
    }
  };
  defineExpose({ open, refresh });
</script>

<style scoped lang="less">
  .l-message-list {
    .no-data {
      position: absolute;
      top: 50%;
      box-sizing: border-box;
      width: 100%;
      margin-top: -160px;
      text-align: center;
    }

    &-bottom {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 8px;
    }

    &-wraper {
      border-bottom: 1px solid var(--vxe-table-border-color);
    }

    &-item {
      position: relative;
      height: 56px;
      padding: 7px 0 0 60px;
      transition: all 0.3s;
      cursor: pointer;

      &-read {
        opacity: 0.4;
      }

      &:hover {
        background-color: var(--color-primary-bg-hover);
      }
    }

    &-avatar {
      position: absolute;
      top: 10px;
      left: 16px;
    }

    &-text {
      flex: 1;
      margin-left: 8px;
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
        padding-left: 8px;
        overflow: hidden;
        font-size: 12px;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    &-time {
      position: absolute;
      top: 32px;
      right: 8px;
      font-size: 12px;
    }
  }
</style>
