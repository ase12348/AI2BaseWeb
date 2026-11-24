<template>
  <div class="lr-file-preview" :style="{ height }">
    <div class="lr-file-preview__fallback" v-if="showFallback">
      <lr-icon class="mb-16px" :size="64" :icon="iconName" />
      <p class="lr-file-preview__name">{{ displayName }}</p>
      <p class="lr-file-preview__tip">{{ fallbackTip }}</p>
      <lr-button v-if="canDownload" type="primary" @click="handleDownFile">{{
        $t('下载文件')
      }}</lr-button>
    </div>

    <div class="lr-file-preview__image" v-else-if="mode === 'image'">
      <img :src="imageSrc" :alt="displayName" @error="handleImageError" />
    </div>

    <iframe
      class="lr-file-preview__iframe"
      v-else-if="mode === 'iframe'"
      :src="srcUrl"
      frameborder="0"
    ></iframe>

    <div class="lr-file-preview__doc" ref="docRef" v-else></div>

    <!-- 遮罩独立于内容分支，否则渲染时容器会被卸载，docRef 变空 -->
    <div class="lr-file-preview__state" v-if="metaLoading || rendering">
      <a-spin />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
  import { useFramework } from '../utils/useFramework';
  import { EncryptionFactory } from '../utils/cipher';
  import { formatToDateTime } from '../utils/date';
  import { downFile, getFileIcon } from '../utils/file';

  defineOptions({ name: 'LrFilePreview' });

  const props = defineProps({
    /**
     * @zh 附件主键
     */
    fileId: {
      type: String,
      default: '',
    },
    /**
     * @zh 文件名称，用于图标与兜底提示
     */
    fileName: {
      type: String,
      default: '',
    },
    /**
     * @zh 直接展示的图片地址（本地选择、尚未上传的图片走这里）
     */
    directSrc: {
      type: String,
      default: '',
    },
    /**
     * @zh 是否有预览权限
     */
    previewable: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 是否显示下载按钮
     */
    canDownload: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 容器高度
     */
    height: {
      type: String,
      default: '100%',
    },
  });

  const emit = defineEmits(['loaded', 'error']);

  const { apiUrl, token, useHttp, t } = useFramework({});
  const { httpGet } = useHttp();

  const mode = ref('');
  const fileNameByServer = ref('');
  const reason = ref('');
  const renderError = ref('');
  const metaLoading = ref(false);
  const rendering = ref(false);
  const idToken = ref('');
  const docRef = ref<HTMLElement>();
  let pptxPreviewer: any = null;

  const displayName = computed(() => props.fileName || fileNameByServer.value);
  const iconName = computed(() => getFileIcon(displayName.value, ''));
  const srcUrl = computed(() =>
    idToken.value
      ? `${apiUrl}/system/annexesfile/preview/${idToken.value}?token=${token?.value}`
      : '',
  );
  const imageSrc = computed(() => props.directSrc || srcUrl.value);
  const downloadUrl = computed(() =>
    props.fileId ? `${apiUrl}/system/annexesfile/${props.fileId}?token=${token?.value}` : '',
  );
  const showFallback = computed(
    () =>
      !metaLoading.value &&
      !rendering.value &&
      (!!renderError.value || mode.value === 'download' || !mode.value),
  );
  const fallbackTip = computed(() => {
    if (!props.previewable) {
      return t('级别不够，无权限预览！');
    }
    return renderError.value || reason.value || t('该文件暂不支持在线预览，请下载后查看');
  });

  // 预览地址带 1 分钟有效期，打开时现算
  const createIdToken = (fileId: string) => {
    const idScheme = `${formatToDateTime(new Date())}|${fileId}`;
    return EncryptionFactory.createAesEncryption({ key: 'jcode' })
      .encrypt(idScheme)
      .replace(/\//g, '|')
      .replace(/\+/g, '-')
      .replace(/=/g, '_');
  };

  const reset = () => {
    mode.value = '';
    reason.value = '';
    renderError.value = '';
    fileNameByServer.value = '';
    idToken.value = '';
    if (pptxPreviewer) {
      try {
        pptxPreviewer.destroy();
      } catch (e) {
        // 忽略销毁异常
      }
      pptxPreviewer = null;
    }
    if (docRef.value) {
      docRef.value.innerHTML = '';
    }
  };

  const handleImageError = () => {
    renderError.value = t('图片加载失败，请下载后查看');
  };

  // 前端渲染 docx/pptx：取原始文件字节，交给对应库渲染
  const renderDocument = async (kind: string) => {
    rendering.value = true;
    try {
      await nextTick();
      const container = docRef.value;
      if (!container) {
        throw new Error('preview container is not ready');
      }
      container.innerHTML = '';
      const response = await fetch(srcUrl.value, {
        headers: { token: token?.value || '' },
      });
      if (!response.ok) {
        throw new Error(`download failed: ${response.status}`);
      }
      const buffer = await response.arrayBuffer();
      if (kind === 'docx') {
        const { renderAsync } = await import('docx-preview');
        await renderAsync(buffer, container, container, {
          inWrapper: false,
          breakPages: true,
          ignoreHeight: true,
          useBase64URL: true,
        });
      } else {
        const { init } = await import('pptx-preview');
        pptxPreviewer = init(container, {
          width: container.clientWidth || 960,
          height: container.clientHeight || 540,
          mode: 'list',
        });
        await pptxPreviewer.preview(buffer);
      }
      emit('loaded');
    } catch (e) {
      renderError.value = t('文件渲染失败，请下载后查看');
      emit('error', e);
    } finally {
      rendering.value = false;
    }
  };

  const load = async () => {
    reset();
    if (props.directSrc) {
      mode.value = 'image';
      return;
    }
    if (!props.fileId) {
      mode.value = 'download';
      return;
    }
    if (!props.previewable) {
      mode.value = 'download';
      return;
    }
    if (!apiUrl) {
      renderError.value = t('未配置接口地址，无法预览');
      return;
    }

    metaLoading.value = true;
    try {
      idToken.value = createIdToken(props.fileId);
      const meta: any = await httpGet({ url: `system/annexesfile/preview-meta/${idToken.value}` });
      if (!meta || !meta.mode) {
        mode.value = 'download';
        reason.value = t('获取预览信息失败，请下载后查看');
        return;
      }
      fileNameByServer.value = meta.fileName || '';
      reason.value = meta.reasonMessage || '';
      mode.value = meta.mode;
      if (meta.mode === 'docx' || meta.mode === 'pptx') {
        await renderDocument(meta.mode);
      } else {
        emit('loaded');
      }
    } catch (e) {
      mode.value = 'download';
      reason.value = t('获取预览信息失败，请下载后查看');
      emit('error', e);
    } finally {
      metaLoading.value = false;
    }
  };

  const handleDownFile = () => {
    if (!downloadUrl.value) {
      return;
    }
    downFile(downloadUrl.value);
  };

  watch(() => [props.fileId, props.directSrc, props.previewable], load, { immediate: true });

  onBeforeUnmount(() => {
    if (pptxPreviewer) {
      try {
        pptxPreviewer.destroy();
      } catch (e) {
        // 忽略销毁异常
      }
      pptxPreviewer = null;
    }
    if (docRef.value) {
      docRef.value.innerHTML = '';
    }
  });
</script>

<style lang="less" scoped>
  .lr-file-preview {
    position: relative;
    width: 100%;
    overflow: hidden;

    &__state {
      display: flex;
      position: absolute;
      z-index: 2;
      align-items: center;
      justify-content: center;
      background: rgb(255 255 255 / 60%);
      inset: 0;
    }

    &__fallback {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      padding: 24px;
      background: #fff;
      text-align: center;
    }

    &__name {
      margin: 0 0 4px;
      color: #1f2329;
      font-size: 14px;
      word-break: break-all;
    }

    &__tip {
      margin: 0 0 16px;
      color: #8f959e;
      font-size: 13px;
    }

    &__image {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      overflow: auto;
      background: #fff;

      img {
        max-width: 100%;
        max-height: 100%;
      }
    }

    &__iframe {
      display: block;
      width: 100%;
      height: 100%;
      border: 0;
      background: #fff;
    }

    &__doc {
      height: 100%;
      overflow: auto;
      background: #f5f6f7;
    }
  }
</style>
