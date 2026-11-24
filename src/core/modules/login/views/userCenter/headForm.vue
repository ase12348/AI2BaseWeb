<template>
  <div class="lr-block">
    <div style="padding-top: 48px; padding-left: 64px">
      <a-avatar :size="100" :src="imageUrl || avatar">
        {{ getLoginInfo.account?.slice(0, 2) }}
      </a-avatar>
      <lr-upload
        ref="uploadRef"
        style="margin-top: 16px"
        accept=".jpeg,.jpg,.png"
        :showFileList="false"
        :autoUpload="false"
        isTip
        :maxSize="2"
        sizeType="MB"
        :limit="1000"
        :isSaveLast="true"
        @success="handleAvatarSuccess"
        @not-upload-change="handleNotUploadChange"
      />
      <lr-button type="primary" class="mt-16px" @click="handleUploadFiles" :loading="loading">{{
        $t('保存修改')
      }}</lr-button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';

  import { useUserStore } from '/@/core/store/organization/user';
  import { isNullOrEmpty, deepClone } from '@/core/utils/jcode';
  import { api } from '@/core/modules/organization/api/user';
  import { api as fileApi } from '@/core/modules/system/api/annexesFile';
  import { useMessage } from '@/core/hooks/useMessage';
  import { useGlobSetting } from '/@/core/hooks/setting';

  const { success } = useMessage();
  const { apiUrl } = useGlobSetting();
  const { getLoginInfo, getToken, setLoginInfo } = useUserStore();

  const imageUrl = ref('');
  const loading = ref(false);
  const uploadRef = ref();
  const avatar = computed(() => {
    return getLoginInfo.avatar
      ? `${apiUrl}/system/annexesfile/${getLoginInfo.avatar}?token=${getToken}`
      : ``;
  });

  const handleNotUploadChange = ({ value }) => {
    imageUrl.value = value;
  };
  const handleUploadFiles = () => {
    loading.value = true;
    uploadRef.value?.uploadFiles();
  };
  const handleAvatarSuccess = async ({ file }) => {
    let fileId = file.response.fileId;
    if (!isNullOrEmpty(getLoginInfo.avatar) && getLoginInfo.avatar != fileId) {
      await fileApi.remove(getLoginInfo.avatar || '');
    }
    const loginInfo = getLoginInfo;
    loginInfo.avatar = fileId;
    setLoginInfo(loginInfo);
    const userInfo = await api.getLoginInfo();
    userInfo.f_HeadIcon = fileId;
    await api.update(loginInfo.id, { user: deepClone(userInfo) });
    loading.value = false;
    success('修改成功');
  };
</script>
