<script lang="ts">
  import { defineComponent, computed, provide, unref, watch } from 'vue';
  import { theme } from 'ant-design-vue';
  import { ThemeEnum } from '/@/core/enums/appEnum';
  import { useAppSetting } from '/@/core/hooks/setting/useAppSetting';
  import { useDataItem } from '/@/core/hooks/data/useDataItem';
  import { useDbSource } from '/@/core/hooks/data/useDbSource';
  import { useOrganization } from '/@/core/hooks/data/useOrganization';
  import { useGlobSetting } from '/@/core/hooks/setting';
  import { useUserStore } from '/@/core/store/organization/user';
  import { useMessage } from '@/core/hooks/useMessage';
  import { useFile } from '@/core/hooks/useFile';
  import { useMenu } from '/@/core/hooks/useMenu';
  import { useExcel } from '/@/core/hooks/useExcel';
  import { useLabel } from '/@/core/hooks/useLabel';
  import useData from '/@/core/hooks/useData';
  import { defHttp } from '/@/core/utils/http/axios';
  import { t } from '@/core/locales/setupI18n';

  export default defineComponent({
    inheritAttrs: false,
    setup(props, { slots }) {
      // 主题
      const { useToken } = theme;
      const { token } = useToken();

      const { getTheme } = useAppSetting();
      const isDark = computed(() => getTheme.value.mode === ThemeEnum.DARK);

      // 配置参数
      const { urlPrefix, apiUrl, options } = useGlobSetting();
      const logoImg = computed(
        () => `${urlPrefix}${getTheme.value.jcodeLayerLogo || getTheme.value.jcodeLogo}`,
      );
      const mapKey = options.params.mapKey;

      const userStore = useUserStore();

      const useHttp = () => ({
        httpGet: (data) => defHttp.get(data),
        httpPost: (data) => defHttp.post(data),
        httpPut: (data) => defHttp.put(data),
        httpDelete: (data) => defHttp.delete(data),
      });

      const {
        excelExport,
        excelImportDownTemplate,
        excelImportUpload,
        excelImportDownTemplateByConfig,
        excelImportUploadData,
        excelImportUploadByConfig,
      } = useExcel();

      const { getLabelByComponent } = useLabel();

      provide('jcode_app_provide', {
        themeToken: token,
        themeDark: isDark,

        // 框架提供数据加载方法
        useDbSource,
        useDataItem,
        useOrganization,
        useMenu,
        useData,

        // 方法
        useMessage,
        useFile,

        // 信息
        token: computed(() => userStore.getToken),
        apiUrl,
        mapKey,
        logoImg: computed(() => logoImg.value),

        useHttp,

        // 翻译
        t,
        excelExport,
        excelImportDownTemplate,
        excelImportUpload,
        excelImportUploadData,
        excelImportDownTemplateByConfig,
        excelImportUploadByConfig,

        getLabelByComponent,
      });

      function camelToHyphen(str) {
        return str
          .replace(/([A-Z])/g, '-$1')
          .toLowerCase()
          .replace('jcode_', 'jcode-');
      }
      const themeColor = computed(() => {
        const unrefToken = unref(token) as Record<string, any>;
        const tableVar: Record<string, any> = {
          '--vxe-ui-font-primary-color': unrefToken.colorPrimary,
          '--vxe-ui-font-color': unrefToken.colorText,
          '--vxe-ui-font-disabled-color': unrefToken.colorTextSecondary,
          '--vxe-ui-base-popup-border-color': unrefToken.colorBorderSecondary,
          '--vxe-ui-layout-background-color': unrefToken.colorBgContainer,
          '--vxe-ui-table-header-font-color': unrefToken.colorText,
          '--vxe-ui-table-header-background-color':
            unrefToken.jcode_colorBgTableHeader || '#fafafa',
          '--vxe-ui-table-row-hover-background-color':
            unrefToken.jcode_colorBgTableHeader || '#fafafa',
          '--vxe-ui-table-row-current-background-color': unrefToken.colorPrimaryBg,
          '--vxe-ui-table-row-hover-current-background-color': unrefToken.colorPrimaryBgHover,

          '--vxe-ui-table-resizable-color': unrefToken.colorBorderSecondary,
          '--vxe-ui-table-body-background-color': unrefToken.colorBgContainer,
          '--vxe-ui-table-border-color': unrefToken.colorBorderSecondary,
          '--vxe-ui-icon-background-color': unrefToken.colorTextQuaternary,
          '--vxe-ui-font-lighten-color': unrefToken.colorTextSecondary,

          '--vxe-ui-table-row-striped-background-color':
            unrefToken.jcode_colorBgTableHeader || '#fafafa',
          '--vxe-ui-table-row-hover-striped-background-color':
            unrefToken.jcode_colorBgTableStriped || '#f5f7fa',
          '--vxe-ui-loading-color': unrefToken.colorPrimary,
          '--vxe-ui-loading-background-color': unrefToken.colorFillQuaternary,
          '--vxe-ui-table-border-radius': unrefToken.borderRadius + 'px',
          '--vxe-ui-table-cell-padding-left': '4px',
          '--vxe-ui-table-cell-padding-right': '4px',
        };
        let res = '';

        Object.keys(unrefToken).forEach((key) => {
          if (!['fontFamily'].includes(key) && key.indexOf('motion') == -1) {
            let value = unrefToken[key];

            if (key.indexOf('Size') !== -1 || key.indexOf('width') !== -1) {
              value = `${value}px`;
            }

            res += `--${camelToHyphen(key)}:${value};`;
          }
        });
        Object.keys(tableVar).forEach((key) => {
          const value = tableVar[key];
          res += `${key}:${value};`;
        });

        return res;
      });

      watch(
        themeColor,
        () => {
          document.body.setAttribute('style', themeColor.value);
        },
        { immediate: true },
      );

      return () => slots.default?.();
    },
  });
</script>
