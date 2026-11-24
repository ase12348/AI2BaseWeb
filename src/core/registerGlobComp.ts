import type { App } from 'vue';
import antd from 'ant-design-vue';
import { VxeButton, VxeModal, VxeTooltip } from 'vxe-pc-ui';
import VXETable from 'vxe-table';

import 'vxe-pc-ui/lib/style.css';
import 'vxe-table/lib/style.css';
import JcodeUI from '@/core/components/ui';
import WebComponent from '@/core/components';

export function registerGlobComp(app: App) {
  app
    .use(antd)
    .use(VxeButton)
    .use(VxeModal)
    .use(VxeTooltip)
    .use(VXETable)
    .use(JcodeUI)
    .use(WebComponent);
}
