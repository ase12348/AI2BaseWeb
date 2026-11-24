import { defHttp } from '/@/core/utils/http/axios';
import type { ThemeSetting } from '/@/core/store/modules/app';

/**
 * 个性化主题配置持久化载体
 * 后端表 lr_config_theme（jcode.core/core/jcode.iapplication/SystemConfig/Lrconfigtheme），
 * 主题内容以 JSON 字符串存放在 f_Content 中，按当前登录用户各存一份。
 */
export interface ThemeConfigEntity {
  f_Id?: string;
  f_Content: string;
}

export const api = {
  /** 获取当前登录用户的主题设置，未保存过时为 null */
  get: () =>
    defHttp.get<ThemeConfigEntity | null>({
      url: 'systemconfig/lrconfigthemes/gettheme',
      errorMessageMode: 'none',
    }),
  /** 保存当前登录用户的主题设置 */
  save: (theme: ThemeSetting) =>
    defHttp.put({
      url: 'systemconfig/lrconfigthemes/savetheme',
      data: { f_Content: JSON.stringify(theme) } as ThemeConfigEntity,
    }),
  /** 清除当前登录用户的主题设置 */
  remove: () =>
    defHttp.delete({
      url: 'systemconfig/lrconfigtheme/deletetheme',
      errorMessageMode: 'none',
    }),
};
