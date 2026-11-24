import type { InjectionKey } from 'vue';
import { api } from '@/core/modules/system/api/annexesFile';

/**
 * 暂存附件夹后缀，与后端 AnnexesDraft.FolderSuffix 保持一致
 * 表单未保存前上传的附件先挂在 "{附件夹主键}-draft" 下，业务数据保存成功后由后端转正
 */
export const DRAFT_FOLDER_SUFFIX = '-draft';

/** 上传组件登记到暂存会话的信息 */
export interface UploadDraftItem {
  /** 真实附件夹主键 */
  folderId: string;
  /** 本次会话内上传、仍在暂存附件夹中的文件主键 */
  draftFileIds: Set<string>;
  /** 本次会话内被移除的已保存附件主键，表单保存成功后才真正删除 */
  removedFileIds: string[];
}

/** 表单附件暂存会话，由 useCForm 创建并注入给表单内的上传组件 */
export interface UploadDraftSession {
  register: (item: UploadDraftItem) => void;
  unregister: (item: UploadDraftItem) => void;
  /** 表单保存成功后提交：删除被移除的附件（暂存附件由后端保存时转正） */
  commit: () => Promise<void>;
  /** 表单关闭后丢弃：删除本次未保存的上传 */
  discard: () => Promise<void>;
}

export const UPLOAD_DRAFT_KEY: InjectionKey<UploadDraftSession> = Symbol('lr-upload-draft');

/**
 * 创建一个表单附件暂存会话
 * @returns 会话对象，需在表单保存成功时调用 commit、关闭时调用 discard
 */
export function createUploadDraftSession(): UploadDraftSession {
  const items = new Set<UploadDraftItem>();

  return {
    register(item: UploadDraftItem) {
      items.add(item);
    },
    unregister(item: UploadDraftItem) {
      items.delete(item);
    },
    async commit() {
      for (const item of items) {
        // 单个删除失败只记录日志，遗漏的附件后续由孤儿附件清理任务兜底
        for (const fileId of item.removedFileIds) {
          try {
            await api.remove(fileId);
          } catch (err) {
            console.error(err, `jcode 极简搭:删除已保存附件失败！${fileId}`);
          }
        }
        item.removedFileIds.length = 0;
        item.draftFileIds.clear();
      }
    },
    async discard() {
      for (const item of items) {
        if (item.draftFileIds.size > 0) {
          try {
            await api.removeDraft(item.folderId);
          } catch (err) {
            console.error(err, `jcode 极简搭:丢弃暂存附件失败！${item.folderId}`);
          }
        }
        item.draftFileIds.clear();
        item.removedFileIds.length = 0;
      }
    },
  };
}
