<template>
  <template v-for="frame in getFramePages" :key="frame.id">
    <FramePage v-show="showIframe(frame)" :frameSrc="frame.frameSrc" />
  </template>
</template>
<script lang="ts">
  import { defineComponent, unref, computed } from 'vue';
  import FramePage from './framePage.vue';

  import { useFrameKeepAlive } from './useFrameKeepAlive';

  export default defineComponent({
    name: 'FrameLayout',
    components: { FramePage },
    setup() {
      const { getFramePages, showIframe } = useFrameKeepAlive();

      const showFrame = computed(() => unref(getFramePages).length > 0);

      return { getFramePages, showIframe, showFrame };
    },
  });
</script>
