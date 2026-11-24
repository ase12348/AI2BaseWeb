<template>
  <a-config-provider
    :theme="{
      components: {
        Button: btnThemeToken,
      },
    }"
  >
    <a-dropdown>
      <lr-button class="jcode-header-btn" type="text"
        ><template #icon>
          <lr-icon :size="18" :color="btnColor" icon="menu-translation-m" />
        </template>
      </lr-button>
      <template #overlay>
        <a-menu :selectedKeys="[getCurrentType]">
          <a-menu-item
            v-for="item in getTypeList"
            :key="item.f_Code"
            @click="handleClick(item.f_Code)"
          >
            <span>{{ item.f_Name }}</span>
          </a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>
  </a-config-provider>
</template>
<script lang="ts" setup>
  import { inject, computed } from 'vue';
  import { useLanguage } from '/@/core/hooks/setting/useLanguage';

  const props = defineProps({
    inHeader: Boolean,
  });

  const { getCurrentType, getTypeList, setCurrentType } = useLanguage();

  const handleClick = (code: string) => {
    setCurrentType(code);
  };

  // 主题设置
  const { themeToken } = inject('jcode_app_provide', {} as Record<string, any>);
  const btnThemeToken = computed(() => ({
    colorBgTextHover: props.inHeader
      ? themeToken.value.jcode_colorBgBtnHeader
      : themeToken.value.colorFillSecondary,
  }));

  const btnColor = computed(() =>
    props.inHeader
      ? themeToken.value.jcode_colorTextBtnHeader
      : themeToken.value.colorTextSecondary,
  );
</script>
