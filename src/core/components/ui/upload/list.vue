<template>
  <div
    :class="[
      'lr-upload-list',
      { 'lr-upload-image-list': isUploadImg, 'lr-upload-drag-list': drag },
    ]"
  >
    <template v-if="drag">
      <template v-if="showFileList">
        <div class="lr-upload-dragItem" v-for="item of list" :key="item.id">
          <lr-icon
            icon="ant-design:file-text-outlined"
            :style="{ color: item.color ? `var(${item.color})` : undefined }"
            :size="72"
            v-if="!isUploadImg"
          />
          <div style="position: relative; width: 72px; height: 72px; overflow: hidden" v-else>
            <img :src="item.url" style="width: 100%" alt="" />
          </div>

          <div class="lr-upload-dragItem-content">
            <a-typography-text
              ellipsis
              :content="`${$t(item.name)}${item.status === 'unUpload' ? '(' + $t('未传') + ')' : ''}`"
            />
            <div>
              <a-typography-text v-if="item.status === 'uploading'"
                >{{ countFileSize(item.uploadSize) }}/</a-typography-text
              >
              <a-typography-text>{{ countFileSize(item.size) }}</a-typography-text>
            </div>
          </div>

          <div class="lr-upload-dragItem-mask" v-show="item.status === 'error'">
            <lr-button type="link" v-if="item.status === 'done' || item.status === 'unUpload'">
              <template #icon>
                <lr-icon
                  icon="ant-design:eye-filled"
                  :size="listIconSize"
                  @click.stop="previewFile(item)"
                />
              </template>
            </lr-button>
            <lr-button
              type="link"
              danger
              v-if="!readonly && (item.status === 'done' || item.status === 'unUpload')"
            >
              <template #icon>
                <lr-icon
                  icon="ant-design:delete-filled"
                  :size="listIconSize"
                  @click.stop="deleteFile(item)"
                />
              </template>
            </lr-button>
          </div>
          <a-progress
            v-if="item.status === 'uploading'"
            :size="4"
            style="position: absolute; bottom: -4px; left: 0; margin: 0 !important"
            :percent="item.percent"
            :show-info="false"
          />
        </div>
      </template>
      <slot></slot>
    </template>
    <template v-else-if="isUploadImg">
      <div class="lr-upload-imgItem" v-for="item of list" :key="item.id">
        <img
          v-if="item.status === 'done' || item.status === 'unUpload'"
          :src="item.url"
          style="width: 100%"
          alt=""
        />
        <div class="lr-upload-imgItem-mask" v-show="item.status === 'error'">
          <lr-button type="link" v-if="item.status === 'done' || item.status === 'unUpload'">
            <template #icon>
              <lr-icon
                icon="ant-design:eye-filled"
                :size="listIconSize"
                @click.stop="previewFile(item)"
              />
            </template>
          </lr-button>
          <lr-button
            type="link"
            danger
            v-if="!readonly && (item.status === 'done' || item.status === 'unUpload')"
          >
            <template #icon>
              <lr-icon
                icon="ant-design:delete-filled"
                :size="listIconSize"
                @click.stop="deleteFile(item)"
              />
            </template>
          </lr-button>
        </div>
        <a-progress
          v-if="item.status === 'uploading'"
          :size="4"
          :percent="item.percent"
          :show-info="false"
        />
      </div>
    </template>
    <template v-else>
      <div class="lr-upload-item" v-for="item of list" :key="item.id">
        <lr-icon
          icon="ant-design:file-text-outlined"
          :style="{ color: item.color ? `var(${item.color})` : undefined }"
          :size="onlyShowList ? listIconSize : 28"
        />
        <div class="lr-upload-item-content">
          <a-typography-link
            ellipsis
            :content="`${$t(item.name)}${item.status === 'unUpload' ? '(' + $t('未传') + ')' : ''}`"
            @click.stop="previewFile(item)"
          />
        </div>
        <a-typography-text v-if="item.status === 'uploading'"
          >{{ countFileSize(item.uploadSize) }}/</a-typography-text
        >
        <a-typography-text>{{ countFileSize(item.size) }}</a-typography-text>
        <lr-icon
          v-if="item.status === 'done' && isShowSuccessIcon"
          class="lr-upload-item-success"
          icon="ant-design:check-circle-filled"
          :size="listIconSize"
        />
        <lr-icon
          v-if="!readonly"
          v-show="item.status === 'error'"
          class="lr-upload-item-error"
          icon="ant-design:delete-filled"
          :size="listIconSize"
          @click.stop="deleteFile(item)"
        />
        <a-progress
          v-if="item.status === 'uploading'"
          :size="4"
          style="position: absolute; bottom: -4px; left: 0; margin: 0 !important"
          :percent="item.percent"
          :show-info="false"
        />
      </div>
    </template>
  </div>
</template>
<script lang="ts" setup>
  import { PropType } from 'vue';
  import { countFileSize } from '../utils/file';

  defineProps({
    isUploadImg: {
      type: Boolean,
      default: false,
    },
    drag: {
      type: Boolean,
      default: false,
    },
    showFileList: {
      type: Boolean,
      default: true,
    },
    list: Array as PropType<Record<string, any>[]>,
    previewFile: {
      type: Function,
      required: true,
    },
    deleteFile: {
      type: Function,
      required: true,
    },
    /**
     * @zh 是否只读
     */
    readonly: {
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
    /**
     * @zh 只显示文件列表,可查看和删除,不能新增
     */
    listIconSize: {
      type: Number,
      default: 24,
    },
    /**
     * @zh 只显示文件列表,可查看和删除,不能新增
     */
    onlyShowList: {
      type: Boolean,
      default: false,
    },
  });
</script>
