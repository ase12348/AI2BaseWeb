<template>
  <lr-user-d-select ref="main" />
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { api } from '@/core/modules/organization/api/userRelation';
  import { api as apiUser } from '@/core/modules/organization/api/user';
  import { useMessage } from '@/core/hooks/useMessage';

  const { success } = useMessage();

  const main = ref();
  let keyValue = '';

  const setForm = async (id) => {
    let selectList = (await api.getList(id)) || [];
    const userList: string[] = [];
    selectList.forEach((item) => {
      if (item.f_Type == undefined) {
        userList.push(item.f_UserId);
      }
    });
    if (userList.length > 0) {
      const userRes = (await apiUser.getUsers(String(userList))) || [];
      const userMap = {};
      userRes.forEach((user) => {
        userMap[user.f_UserId] = user.f_RealName;
      });
      selectList.forEach((item) => {
        if (item.f_Type == undefined) {
          item.f_Type = 1;
          item.f_Name = userMap[item.f_UserId];
        }
      });
    }
    setTimeout(async () => {
      await main.value?.setForm(selectList);
    }, 50);
  };

  // 表单打开
  const open = async (param) => {
    keyValue = param.keyValue;
    await setForm(keyValue);
  };
  // 表单关闭前
  const beforeClose = () => {};

  // 表单点击确定按钮
  const ok = async () => {
    const list = main.value.getForm();
    let res = await api.saveRoles(keyValue, list);
    if (res) {
      success('保存成功');
      return true;
    }
  };
  const resetForm = () => {
    main.value.resetForm();
  };

  // 表单关闭后
  const closed = () => {
    resetForm();
  };

  // 暴露方法
  defineExpose({ open, beforeClose, ok, closed });
</script>
