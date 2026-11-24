<template>
  <div class="lr-upload">
    <template v-if="onlyShowList">
      <upload-list
        :list="fileList"
        :preview-file="handlePreview"
        :delete-file="handleBeforeRemove"
        :is-upload-img="isUploadImg"
        :is-show-success-icon="isShowSuccessIcon"
        :list-icon-size="listIconSize"
        :only-show-list="onlyShowList"
        :readonly="readonly"
      />
    </template>
    <template v-else-if="onlyName">
      <a-typography-link
        v-for="(item, index) of fileList"
        :key="item.id"
        ellipsis
        :content="`${index > 0 ? ',' : ''}${$t(item.name)}`"
        @click.stop="handlePreview(item)"
      />
    </template>
    <template v-else-if="drag">
      <upload-list
        drag
        :list="fileList"
        :preview-file="handlePreview"
        :delete-file="handleBeforeRemove"
        :show-file-list="showFileList"
        :readonly="readonly"
      >
        <a-upload-dragger
          v-if="!readonly"
          :show-upload-list="false"
          :file-list="fileList"
          :accept="myAccept"
          :max-count="myLimit"
          :multiple="multiple"
          :before-upload="handleBeforeUpload"
          :custom-request="handleCustomRequest"
          @remove="handleBeforeRemove"
          @preview="handlePreview"
        >
          <p class="ant-upload-drag-icon">
            <lr-icon icon="ant-design:upload-outlined" :size="24" />
          </p>
          <p class="ant-upload-text">将文件拖到此处，或点击上传</p>
          <p v-if="isTip" class="ant-upload-hint">
            {{
              `${$t('只能上传不超过')}${maxSize}${sizeType}${$t('的')}${myAccept || ''}${$t('文件')},${myLimitText}`
            }}
          </p>
        </a-upload-dragger>
      </upload-list>
    </template>
    <template v-else>
      <a-upload
        :disabled="readonly"
        :show-upload-list="isUploadImg && !isLayer && showFileList"
        :list-type="isUploadImg && !isLayer && !onlyIcon ? 'picture-card' : undefined"
        :accept="myAccept"
        :max-count="myLimit"
        :multiple="multiple"
        :before-upload="handleBeforeUpload"
        :custom-request="handleCustomRequest"
        :file-list="fileList"
        @remove="handleBeforeRemove"
        @preview="handlePreview"
      >
        <lr-button v-if="onlyIcon" :icon-name="icon" type="text" />
        <div v-else-if="isUploadImg && !isLayer && !readonly">
          <lr-icon icon="ant-design:plus-outlined" />
          <div style="margin-top: 8px">{{ $t(placeholder) }}</div>
        </div>
        <a-popover
          v-else-if="isLayer && showFileList && fileList.length > 0 && !previewVisible"
          placement="bottom"
        >
          <template #content>
            <upload-list
              :style="{ width: isUploadImg ? undefined : '400px' }"
              :list="fileList"
              :preview-file="handlePreview"
              :delete-file="handleBeforeRemove"
              :is-upload-img="isUploadImg"
              :readonly="readonly"
            />
          </template>
          <template #title>
            <span>{{ isUploadImg ? $t('图片列表') : $t('文件列表') }}</span>
          </template>
          <lr-button
            :label="readonly ? $t(btnLookText) : placeholder"
            :type="btnType"
            :size="btnSize"
          >
            <template v-if="!readonly" #icon>
              <lr-icon
                icon="ant-design:upload-outlined"
                :is-div="!placeholder"
                :class="{ 'lr-buttons-icon': !!placeholder }"
              />
            </template>
          </lr-button>
        </a-popover>

        <lr-button v-else-if="!readonly" :label="placeholder" :type="btnType" :size="btnSize">
          <template #icon>
            <lr-icon
              icon="ant-design:upload-outlined"
              :is-div="!placeholder"
              :class="{ 'lr-buttons-icon': !!placeholder }"
            />
          </template>
        </lr-button>
      </a-upload>
      <div v-if="isTip" style="margin-top: 4px">
        <a-typography-text>{{
          `${$t('只能上传不超过')}${maxSize}${sizeType}${$t('的')}${myAccept || ''}${$t('文件')},${myLimitText}`
        }}</a-typography-text>
      </div>
      <upload-list
        style="margin-top: 4px"
        v-if="!isLayer && !isUploadImg && showFileList && fileList.length > 0"
        :list="fileList"
        :preview-file="handlePreview"
        :delete-file="handleBeforeRemove"
        :readonly="readonly"
        :is-show-success-icon="isShowSuccessIcon"
      />
    </template>

    <lr-modal-full
      v-model:visible="previewVisible"
      :title="`${$t('文件预览')}【${previewTitle}】`"
      btn-text="下载"
      :destroy-on-close="true"
      @ok="handleDownFile"
      :has-btns="!!apiUrl"
    >
      <a-watermark
        class="lr-block"
        style="overflow: hidden"
        :content="annexContentUser"
        :width="annexWidth"
        :height="annexHeight"
        :rotate="annexRotate"
        :z-index="annexZIndex"
        :image="annexImage"
        :font="annexFont"
        :gap="annexGap"
        :offset="annexOffset"
      >
        <lr-file-preview
          v-if="previewVisible"
          class="lr-block"
          :file-id="previewFileId"
          :file-name="previewTitle"
          :direct-src="previewDirectSrc"
        />
      </a-watermark>
    </lr-modal-full>
  </div>
</template>

<script lang="ts" setup>
  import { PropType, computed, inject, ref, watch } from 'vue';
  import { useFramework } from '../utils/useFramework';
  import { createNamespace } from '../utils/components';
  import { getFileIcon, downFile } from '../utils/file';
  import { buildUUID } from '../utils/method';
  import { formatToDate } from '../utils/date';
  import {
    DRAFT_FOLDER_SUFFIX,
    UPLOAD_DRAFT_KEY,
    type UploadDraftItem,
  } from '../utils/uploadDraft';
  import UploadList from './list.vue';

  defineOptions({ name: createNamespace('upload').name });

  const props = defineProps({
    /**
     * @zh 输入值
     * @vModel
     */
    value: {
      type: String as PropType<string>,
    },
    /**
     * @zh 是否只读
     */
    readonly: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 限制上传数,-1表示不限制
     */
    limit: {
      type: Number,
      default: 1,
    },
    /**
     * @zh 是否允许多选
     */
    multiple: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 最大上传大小
     */
    maxSize: Number,
    /**
     * @zh 尺寸大小单位
     */
    sizeType: String,
    /**
     * @zh 文件类型
     */
    accept: String,

    /**
     * @zh 是否显示文件列表
     */
    showFileList: {
      type: Boolean,
      default: true,
    },

    /**
     * @zh 是否支持拖动上传
     */
    drag: {
      type: Boolean,
      default: false,
    },

    /**
     * @zh 只显示名称
     */
    onlyName: {
      type: Boolean,
      default: false,
    },
    /**
     *  * @zh 只显示图标
     */
    onlyIcon: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 图标,只显示图标时使用
     */
    icon: {
      type: String,
      default: 'ant-design:paper-clip-outlined',
    },
    /**
     * @zh 只显示文件列表,可查看和删除,不能新增
     */
    onlyShowList: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 文件列表的icon大小
     */
    listIconSize: {
      type: Number,
      default: 24,
    },

    /**
     * @zh 是否显示提示语
     */
    isTip: Boolean,
    /**
     * @zh 按钮文字
     */
    placeholder: {
      type: String,
      default: '点击上传',
    },
    /**
     * @zh 按钮类型
     */
    btnType: {
      type: String,
      default: 'default',
    },
    /**
     * @zh 按钮大小
     */
    btnSize: {
      type: String as PropType<'large' | 'middle' | 'small'>,
    },
    /**
     * @zh 查看按钮文字
     */
    btnLookText: {
      type: String,
      default: '查看',
    },

    /**
     * @zh 不允许请求后端，表单设计预览使用
     */
    isNotApi: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 是否自动上传
     */
    autoUpload: {
      type: Boolean,
      default: true,
    },

    /**
     * @zh 是否开启密级设置
     */
    isSecretLevel: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 附件归属数据库编码，用于后续孤儿附件清理
     */
    dbCode: {
      type: String,
      default: '',
    },
    /**
     * @zh 附件归属表名，用于后续孤儿附件清理
     */
    tableName: {
      type: String,
      default: '',
    },
    /**
     * @zh 附件归属字段名，用于后续孤儿附件清理
     */
    tableField: {
      type: String,
      default: '',
    },
    /**
     * @zh 密级最大值
     */
    maxSecretLevel: {
      type: Number,
      default: 4,
    },

    /**
     * @zh 是否上传图片
     */
    isUploadImg: {
      type: Boolean,
      default: false,
    },

    /**
     * @zh 文件列表是否弹窗显示
     */
    isLayer: {
      type: Boolean,
      default: false,
    },

    /**
     * @zh 上传方法
     */
    upload: Function,
    /**
     * @zh 上传回调
     */
    uploadCallback: Function,
    /**
     * @zh 水印内容
     * @defaultValue ['当前登录人员姓名 账号', '预览时间']
     */
    annexContent: {
      type: [String, Array] as PropType<string | string[]>,
      default: undefined,
    },
    /**
     * @zh 水印的宽度，content 的默认值为自身的宽度
     * @defaultValue 120
     */
    annexWidth: {
      type: Number,
      default: 120,
    },
    /**
     * @zh 水印的高度，content 的默认值为自身的高度
     * @defaultValue 64
     */
    annexHeight: {
      type: Number,
      default: 64,
    },
    /**
     * @zh 水印绘制时，旋转的角度，单位 °
     * @defaultValue -22
     */
    annexRotate: {
      type: Number,
      default: -22,
    },
    /**
     * @zh 追加的水印元素的 z-index
     * @defaultValue 9
     */
    annexZIndex: {
      type: Number,
      default: 9,
    },
    /**
     * @zh 图片源，建议导出 2 倍或 3 倍图，优先级高
     */
    annexImage: {
      type: String,
      default: undefined,
    },
    /**
     * @zh 水印之间的间距
     */
    annexGap: {
      type: Array as PropType<number[]>,
      default: undefined,
    },
    /**
     * @zh 水印距离容器左上角的偏移量，默认为 gap/2
     */
    annexOffset: {
      type: Array as PropType<number[]>,
      default: undefined,
    },
    /**
     * @zh 字体颜色
     * @defaultValue rgba(0,0,0,.15)
     */
    annexTextColor: {
      type: String,
      default: 'rgba(0,0,0,.15)',
    },
    /**
     * @zh 字体大小
     * @defaultValue 16
     */
    annexTextFontSize: {
      type: Number,
      default: 16,
    },
    /**
     * @zh 字体粗细
     */
    annexTextFontWeight: {
      type: [String, Number] as PropType<'normal' | 'light' | 'weight' | number>,
      default: 'normal',
    },
    /**
     * @zh 字体类型
     * @defaultValue sans-serif
     */
    annexTextFontFamily: {
      type: String,
      default: 'sans-serif',
    },
    /**
     * @zh 字体样式
     */
    annexTextFontStyle: {
      type: String as PropType<'none' | 'normal' | 'italic' | 'oblique'>,
      default: 'normal',
    },
    /**
     * @zh 只保存最近项
     */
    isSaveLast: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 是否展示上传成功图标
     */
    isShowSuccessIcon: {
      type: Boolean,
      default: true,
    },
  });

  const emit = defineEmits({
    'update:value': (_value: string) => true,
    /**
     * @zh 值改变
     * @param _value
     */
    change: (data: { value: string }) => true,
    /**
     * @zh 当文件开始上传时触发
     */
    start: (data: any) => true,

    /**
     * @zh 当文件上传成功时触发
     */
    success: (data: any) => true,
    /**
     * @zh 当文件上传失败时触发
     */
    error: (data: any) => true,
    /**
     * @zh 当文件上传失败时触发
     */
    delete: (data: any) => true,
    load: (data: any) => true,
    /**
     * @zh 关闭自动上传时，文件的值改变
     * @param _value
     */
    notUploadChange: (data: { value: string }) => true,
  });

  const { useMessage, useFile, apiUrl, token, getLoginInfo, t } = useFramework({});

  const { fileChunkedUpload, deleteFile, loadFiles } = useFile();

  const { error, warning, createConfirm } = useMessage();

  const myLimit = computed(() => {
    if (props.limit === -1) {
      return undefined;
    }
    return props.limit;
  });

  const myLimitText = computed(() => {
    if (props.limit === -1) {
      return '';
    }
    return `,${t('上传数量')}${props.limit}`;
  });

  const myAccept = computed(() => {
    if (props.isUploadImg) {
      return props.accept || 'image/*';
    }
    return props.accept;
  });

  const folderId = ref<string>('');

  const draftSession = inject(UPLOAD_DRAFT_KEY, undefined);

  const formProvide = inject('jcode_form_provide', {} as Record<string, any>);

  const realFolderId = computed(() => props.value || folderId.value);

  /**
   * 表单暂存模式：只有自定义表单（cSchemaForm）渲染、且拿到 useCForm 会话的上传组件才开启。
   * 上传先落 "{附件夹主键}-draft" 暂存附件夹，业务数据保存成功后由后端转正，表单关闭时丢弃。
   * 系统表单等没有转正入口的场景保持原有的即时保存行为。
   */
  const isDraftMode = computed(
    () =>
      !!draftSession &&
      !!formProvide.components &&
      !formProvide.isPreview &&
      !props.isNotApi &&
      !props.readonly &&
      !props.upload &&
      !props.uploadCallback,
  );

  let draftItem: UploadDraftItem | null = null;

  // 附件夹重新生成时暂存的延迟删除记录，删除按文件主键生效，与附件夹无关
  let pendingRemovedFileIds: string[] = [];

  const ensureDraftItem = () => {
    if (!draftSession || !isDraftMode.value) {
      return null;
    }
    if (draftItem && draftItem.folderId !== realFolderId.value) {
      // 附件夹被重新生成（如清空后重填），旧的登记信息作废
      pendingRemovedFileIds.push(...draftItem.removedFileIds);
      draftSession.unregister(draftItem);
      draftItem = null;
    }
    if (!draftItem) {
      draftItem = {
        folderId: realFolderId.value,
        draftFileIds: new Set<string>(),
        removedFileIds: pendingRemovedFileIds,
      };
      draftSession.register(draftItem);
      pendingRemovedFileIds = [];
    }
    return draftItem;
  };

  const param = computed(() => ({
    folderId: isDraftMode.value
      ? `${realFolderId.value}${DRAFT_FOLDER_SUFFIX}`
      : realFolderId.value,
    maxSize: props.maxSize,
    sizeType: props.sizeType,
    dbCode: props.dbCode,
    tableName: props.tableName,
    tableField: props.tableField,
  }));

  const fileList = ref<any[]>([]);
  const updateFilelist = () => {
    fileList.value = [...fileList.value];
  };

  const compareSize = (fileSize: number) => {
    if (props.maxSize && props.sizeType) {
      let size = fileSize;
      switch (props.sizeType) {
        case 'GB':
          size = 1024 * 1024 * 1024 * props.maxSize;
          break;
        case 'MB':
          size = 1024 * 1024 * props.maxSize;
          break;
        case 'KB':
          size = 1024 * props.maxSize;
          break;
        case 'B':
        default:
          size = props.maxSize;
          break;
      }
      if (size < fileSize) {
        return false;
      }
    }
    return true;
  };

  // 数据值问题
  watch(
    () => props.value,
    async (val) => {
      if (val) {
        if (loadFiles && val !== folderId.value) {
          const list = await loadFiles(val);

          const myList: any = [];

          list.forEach((t: any) => {
            myList.push({
              name: t.f_FileName,
              url: `${apiUrl}/system/annexesfile/${t.f_Id}?token=${token?.value}`,
              id: t.f_Id,
              status: 'done',
            });
          });
          fileList.value = myList;
          emit('load', { list: fileList.value });
        }
      } else {
        folderId.value = buildUUID();
        fileList.value = [];
      }
    },
    {
      immediate: true,
    },
  );

  // 文件预览
  const previewVisible = ref(false);
  const previewTitle = ref('');
  const previewFileId = ref('');
  // 本地选择的图片可能还没上传，直接用 file.url
  const previewDirectSrc = ref('');
  let preViewFile: any = null;
  const getNowDate = ref(formatToDate(new Date(), 'YYYY-MM-DD'));

  const handlePreview = (file: any) => {
    if (file.isPreview === false && !props.isUploadImg) {
      warning && warning('级别不够，无权限预览！');
      return;
    }
    const fileExt = file.name.split('.')[file.name.split('.').length - 1].toLowerCase();
    preViewFile = file;
    previewTitle.value = file.name;

    if (['jpg', 'gif', 'png', 'bmp', 'jpeg', 'svg', 'webp'].includes(fileExt)) {
      previewDirectSrc.value = file.url;
      previewFileId.value = '';
    } else {
      if (props.isNotApi) {
        warning && warning(`预览表单中,不支持预览！`);
        return;
      }

      if (file.status !== 'done') {
        warning && warning(`当前文件还没上传成功,不支持预览！`);
        return;
      }

      if (!apiUrl) {
        warning && warning(`当前文件不支持预览！`);
        return;
      }

      previewDirectSrc.value = '';
      previewFileId.value = file.response?.fileId || file.id;
    }

    previewVisible.value = true;
    getNowDate.value = formatToDate(new Date(), 'YYYY-MM-DD HH:mm:ss');
  };

  // 删除附件
  const removeAnnexes = async (fileId: string) => {
    if (props.isNotApi) {
      return;
    }

    if (isDraftMode.value) {
      const item = ensureDraftItem();
      if (item?.draftFileIds.has(fileId)) {
        // 还在暂存附件夹，没有影响已保存的数据，可以直接删除
        item.draftFileIds.delete(fileId);
        if (deleteFile) {
          await deleteFile(fileId);
        }
      } else if (item && !item.removedFileIds.includes(fileId)) {
        // 已保存的附件延迟到表单保存成功后再真删，取消表单即保持原样
        item.removedFileIds.push(fileId);
      }
      return;
    }

    if (deleteFile) {
      await deleteFile(fileId);
    }
  };

  const handleRemove = async (file: any) => {
    await removeAnnexes(file.response?.fileId || file.id);

    fileList.value = fileList.value.filter((item: any) => item.id !== file.id);
    if (fileList.value.length === 0) {
      emit('update:value', '');
      emit('change', { value: '' });
    }
    emit('delete', { file, list: fileList.value });
  };

  const handleBeforeRemove = (file: any) =>
    new Promise((resolve) => {
      if (createConfirm) {
        createConfirm({
          title: '提示',
          iconType: 'warning',
          content: `您确定删除【${file.name}】?`,
          onOk: () => {
            handleRemove(file);
            resolve(true);
          },
          onCancel: () => {
            resolve(false);
          },
        });
      } else {
        handleRemove(file);
        resolve(true);
      }
    });

  // 文件下载
  const handleDownFile = () => {
    if (preViewFile.isDown === false) {
      warning && warning('级别不够，无权限下载！');
    }
    const fileId = preViewFile.response?.fileId || preViewFile.id;

    const url = `${apiUrl}/system/annexesfile/${fileId}?token=${token?.value}`;

    downFile(url);
  };

  // 文件上传
  const onStart = (file: any) => {
    emit('start', { file, list: fileList.value });
  };
  const onUpLoadProgress = (file: any, fileSize: number, percent: number) => {
    file.percent = percent;
    file.uploadSize = fileSize;
    updateFilelist();
  };
  const onUpLoadSuccess = (file: any) => {
    file.status = 'done';

    file.id += '1';
    file.uid += '1';
    if (file.response?.fileId) {
      ensureDraftItem()?.draftFileIds.add(file.response.fileId);
    }
    updateFilelist();
    emit('success', { file, list: fileList.value });
    if (!props.value) {
      emit('update:value', folderId.value);
      emit('change', { value: folderId.value });
    }
  };

  const onError = (file: any, error: any) => {
    console.error(error, 'jcode 极简搭:文件上传错误！');
    file.status = 'error';
    updateFilelist();
    emit('error', { file, list: fileList.value });
  };

  const setFile = (file: any) => {
    file.status = props.autoUpload ? 'uploading' : 'unUpload'; // 状态有：unUpload uploading done error removed
    file.uploadSize = 0;
    file.icon = getFileIcon(file.name, file.type);
    if (!fileChunkedUpload) {
      file.icon = 'ant-design:file-text-outlined';
    }

    file.id = file.uid;
    file.url = window.URL.createObjectURL(file);
    file.date = formatToDate();
    file.param = param.value;
  };

  const chunkedUpload = (file: any) => {
    fileList.value.push(file);

    if (file.status === 'unUpload') {
      emit('notUploadChange', { value: file.url });
      return;
    }

    if (!props.isNotApi && props.upload) {
      props.upload(file);
    } else if (!props.isNotApi && fileChunkedUpload) {
      fileChunkedUpload(file, {
        onStart,
        onProgress: onUpLoadProgress,
        onSuccess: onUpLoadSuccess,
        onError,
        uploadCallback: props.uploadCallback,
      });
    } else {
      onUpLoadSuccess(file);
    }
  };

  const handleBeforeUpload = async (file: any) => {
    if (!compareSize(file.size)) {
      error && error('上传文件超出大小了');
      return false;
    }
    if (props.isSaveLast && fileList.value.length > 0) {
      const myFile = fileList.value[0];
      await removeAnnexes(myFile.response?.fileId || myFile.id);

      fileList.value = [];
    } else if (props.limit !== -1 && props.limit <= fileList.value.length) {
      warning && warning(`当前限制选择${props.limit}个文件`);
      return false;
    }
  };

  const handleCustomRequest = (data: any) => {
    setFile(data.file);
    chunkedUpload(data.file);
  };

  // 方法
  const pUploadFiles = () => {
    if (props.autoUpload) {
      return;
    }

    if (props.isSaveLast) {
      fileList.value.splice(0, fileList.value.length - 1);
    }
    fileList.value.forEach((file: any) => {
      if (file.status === 'unUpload') {
        file.status = 'uploading';
        chunkedUpload(file);
      }
    });
  };

  // 水印
  const annexContentUser = computed(() => {
    if (props.annexContent || !getLoginInfo) {
      return props.annexContent;
    }

    const userContent: string | any[] = [
      `${getLoginInfo?.value.name || ''} ${getLoginInfo?.value.account || ''}`,
      `${getNowDate.value}`,
    ];
    return userContent;
  });
  const annexFont = computed(() => ({
    color: props.annexTextColor,
    fontSize: props.annexTextFontSize,
    fontWeight: props.annexTextFontWeight,
    fontFamily: props.annexTextFontFamily,
    fontStyle: props.annexTextFontStyle,
  }));

  /**
   * @public
   * @zh 手动触发上传文件,关闭自动上传有用
   */
  function uploadFiles() {
    pUploadFiles();
  }

  defineExpose({
    uploadFiles,
  });
</script>

<style lang="less">
  @import './upload';
</style>
