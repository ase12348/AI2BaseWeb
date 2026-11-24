<template>
  <a-config-provider
    :theme="{
      components: {
        Button: btnThemeToken,
      },
    }"
    v-if="rostList.length > 1"
  >
    <a-dropdown>
      <lr-button class="jcode-header-btn" type="text"
        ><template #icon>
          <lr-icon :size="18" :color="btnColor" icon="user-switch-outlined" />
        </template>
      </lr-button>
      <template #overlay>
        <a-menu :selectedKeys="[getLoginInfo.postId]">
          <a-menu-item v-for="item in rostList" :key="item.value" @click="handleClick(item.value)">
            <span>{{ item.label }}</span>
          </a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>
  </a-config-provider>
</template>
<script lang="ts" setup>
  import { inject, computed } from 'vue';
  import { useOrganization } from '/@/core/hooks/data/useOrganization';

  const { getLoginInfo, getUserPosts, setCurrentPost } = useOrganization();
  const handleClick = (id: string) => {
    setCurrentPost(id);
  };

  const rostList = computed(() => {
    return getUserPosts(String(getLoginInfo.value.postIds || []));
  });

  // 主题设置
  const { themeToken } = inject('jcode_app_provide', {} as Record<string, any>);
  const btnThemeToken = computed(() => ({
    colorBgTextHover: themeToken.value.jcode_colorBgBtnHeader,
  }));

  const btnColor = computed(() => themeToken.value.jcode_colorTextBtnHeader);
</script>
