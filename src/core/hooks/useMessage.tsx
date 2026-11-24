import type { ModalFuncProps } from 'ant-design-vue/lib/modal/Modal';
import { Modal, message as Message, notification } from 'ant-design-vue';
import { NotificationArgsProps, ConfigProps } from 'ant-design-vue/lib/notification';
import { t } from '@/core/locales/setupI18n';
import { isString } from '/@/core/utils/is';
import { h } from 'vue';
import { Icon } from '@/core/components/ui';

export interface NotifyApi {
  info(config: NotificationArgsProps): void;
  success(config: NotificationArgsProps): void;
  error(config: NotificationArgsProps): void;
  warn(config: NotificationArgsProps): void;
  warning(config: NotificationArgsProps): void;
  open(args: NotificationArgsProps): void;
  close(key: String): void;
  config(options: ConfigProps): void;
  destroy(): void;
}

export declare type NotificationPlacement = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
export declare type IconType = 'success' | 'info' | 'error' | 'warning';
export interface ModalOptionsEx extends Omit<ModalFuncProps, 'iconType'> {
  iconType: 'warning' | 'success' | 'error' | 'info';
}
export type ModalOptionsPartial = Partial<ModalOptionsEx> & Pick<ModalOptionsEx, 'content'>;

function getIcon(iconType: string) {
  let iconCode = '';
  if (iconType === 'warning') {
    iconCode = 'info-circle-filled';
  } else if (iconType === 'success') {
    iconCode = 'check-circle-filled';
  } else if (iconType === 'info') {
    iconCode = 'info-circle-filled';
  } else {
    iconCode = 'close-circle-filled';
  }

  return h(Icon, {
    icon: `ant-design:${iconCode}`,
    size: 24,
  });
}

function renderContent({ content }: Pick<ModalOptionsEx, 'content'>) {
  if (isString(content)) {
    return <div innerHTML={`<div>${t(content) as string}</div>`}></div>;
  } else {
    return content;
  }
}

/**
 * @description: Create confirmation box
 */
function createConfirm(options: ModalOptionsEx) {
  const iconType = options.iconType || 'warning';
  Reflect.deleteProperty(options, 'iconType');
  const opt: ModalFuncProps = {
    centered: true,
    icon: getIcon(iconType),
    ...options,
    content: renderContent(options),
  };
  return Modal.confirm(opt);
}

const getBaseOptions = () => {
  return {
    okText: t('确定'),
    centered: true,
  };
};

function createModalOptions(options: ModalOptionsPartial, icon: string): ModalOptionsPartial {
  if (options.title) {
    options.title = t(options.title + '');
  }

  return {
    ...getBaseOptions(),
    ...options,
    content: renderContent(options),
    icon: getIcon(icon),
  };
}

function createSuccessModal(options: ModalOptionsPartial) {
  return Modal.success(createModalOptions(options, 'success'));
}

function createErrorModal(options: ModalOptionsPartial) {
  return Modal.error(createModalOptions(options, 'error'));
}

function createInfoModal(options: ModalOptionsPartial) {
  return Modal.info(createModalOptions(options, 'info'));
}

function createWarningModal(options: ModalOptionsPartial) {
  return Modal.warning(createModalOptions(options, 'warning'));
}

function success(content: string, key?: string | number) {
  content = t(content);

  return Message.success({ content, key });
}
function error(content: string, key?: string | number) {
  content = t(content);

  return Message.error({ content, key });
}
function info(content: string, key?: string | number) {
  content = t(content);

  return Message.info({ content, key });
}
function warning(content: string, key?: string | number) {
  content = t(content);

  return Message.warning({ content, key });
}
function loading(content: string) {
  content = t(content);

  return Message.loading(content, 0);
}

notification.config({
  placement: 'topRight',
  duration: 3,
});

/**
 * @description: message
 */
export function useMessage() {
  return {
    createMessage: Message,
    notification: notification as NotifyApi,
    createConfirm,
    createSuccessModal,
    createErrorModal,
    createInfoModal,
    createWarningModal,
    success,
    error,
    info,
    warning,
    loading,
  };
}
