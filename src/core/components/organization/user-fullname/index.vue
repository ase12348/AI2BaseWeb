<template>
  <span class="jcode-user-fullname"
    ><lr-icon
      class="jcode-user-fullname-btn"
      :icon="isFull ? 'minus-square-outlined' : 'plus-square-outlined'"
      :isDiv="false"
      :size="16"
      v-if="!loading && value?.toLowerCase() != 'system' && value?.toLowerCase() != 'system|'"
      @click="handleClick"
    /><a-spin v-if="loading" size="small" />{{ getName }}</span
  >
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue';
  import { useOrganization } from '/@/core/hooks/data/useOrganization';

  const { getUserFullName, loadUserDepartmentFullName } = useOrganization();

  const props = defineProps({
    value: String,
  });

  const isFull = ref(false);
  const loading = ref(false);

  const handleClick = async () => {
    if (loading.value) {
      return;
    }
    if (!isFull.value) {
      loading.value = true;
      await loadUserDepartmentFullName(props.value || '');
      isFull.value = true;
      loading.value = false;
    } else {
      isFull.value = false;
    }
  };

  const getName = computed(() => {
    if (!props.value) {
      return;
    }
    return getUserFullName(props.value, isFull.value);
  });
</script>

<style lang="less" scoped>
  .jcode-user-fullname {
    padding-right: 4px;
    color: var(--color-primary);
    line-height: 12px;

    &-btn {
      display: inline-block;
      color: var(--color-primary);
      line-height: 12px;
      vertical-align: middle;
      cursor: pointer;
    }
  }
</style>
