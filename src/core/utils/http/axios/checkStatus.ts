import type { ErrorMessageMode } from '/#/axios';
import { useMessage } from '/@/core/hooks/useMessage';
import { useUserStoreWithOut } from '/@/core/store/organization/user';

import { t } from '@/core/locales/setupI18n';

const { error, createErrorModal } = useMessage();

export function checkStatus(
  status: number,
  msg: string,
  errorMessageMode: ErrorMessageMode = 'message',
): void {
  let errMessage = '';

  switch (status) {
    case 400:
      errMessage = msg;
      break;
    case 401:
      errMessage = msg || `${t('请求接口超时')},401`;
      break;
    case 403:
      errMessage = `${t('没有权限访问')},403`;
      break;
    case 404:
      errMessage = `${t('请求接口不存在')},404`;
      break;
    case 405:
      errMessage = `${t('请求接口类型错误')},405`;
      break;
    case 408:
      errMessage = `${t('请求接口超时')},408`;
      break;
    case 500:
      errMessage = msg || `${t('请求接口异常')},500`;
      break;
    case 4011:
      // 访问令牌过期：由 tokenRefresh 自动续期并重试，这里既不提示也不退出
      break;
    case 501:
      errMessage = '501';
      break;
    case 502:
      errMessage = '502';
      break;
    case 503:
      errMessage = '503';
      break;
    case 504:
      errMessage = '504';
      break;
    case 505:
      errMessage = '505';
      break;
    default:
  }

  if (errMessage) {
    if (errorMessageMode === 'modal') {
      createErrorModal({ title: t('错误信息'), content: errMessage });
    } else if (errorMessageMode === 'message') {
      error(errMessage, `global_error_message_status_${status}`);
    }
  }

  if (status == 401) {
    const userStore = useUserStoreWithOut();
    // 401 清除token信息并跳转到登录页面
    userStore.logout();
    // alert('登录超时，请重新登录');
  }
}
