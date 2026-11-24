<template>
  <div>
    <lr-user-fullname
      v-for="(userId, i) of userIds"
      :key="i"
      :value="userId"
      v-bind="$attrs"
      @click="handleClick"
    />
  </div>
</template>

<script setup lang="ts">
  const emit = defineEmits(['click', 'change']);
  defineProps({
    userIds: {
      type: Array,
      default: () => [],
    },
  });
  const handleClick = (data) => {
    emit('click', data);
  };
</script>

<style scoped></style>
