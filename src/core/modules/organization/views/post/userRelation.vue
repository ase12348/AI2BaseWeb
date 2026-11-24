<template>
  <lr-user-panel ref="userSelectRef" :isMultiSelect="true" />
</template>

<script setup lang="ts">
  import { ref, nextTick } from 'vue';
  import { api } from '@/core/modules/organization/api/userRelation';
  import { useMessage } from '@/core/hooks/useMessage';
  import { t } from '@/core/locales/setupI18n';

  const { success } = useMessage();

  let postId = '';
  const userSelectRef = ref();
  const open = async (param) => {
    postId = param.postId;
    let data = await api.getList(postId);
    let selectIds = data.map((t) => t.f_UserId);
    nextTick(() => {
      userSelectRef.value?.setSelections(selectIds);
    });
  };
  // 表单点击确定按钮
  const ok = async () => {
    let userselect = await userSelectRef.value.ok();
    userselect.map((item) => {
      item.isBlack = true;
    });
    let selectUser = userselect.map((t) => {
      return t.f_UserId;
    });

    const res = await api.save(postId, 2, { userIds: selectUser.join(',') });
    if (res) {
      success(t('添加成功'));
      return true;
    }
  };
  // 表单关闭前
  const beforeClose = () => {};
  // 表单关闭后
  const closed = () => {
    userSelectRef.value?.closed();
  };

  // 暴露方法
  defineExpose({ open, beforeClose, ok, closed });
</script>

<style scoped></style>
