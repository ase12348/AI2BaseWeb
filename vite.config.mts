import { defineApplicationConfig } from '@vben/vite-config';
import web from '/@/config/web';

export default defineApplicationConfig({
  overrides: {
    optimizeDeps: {
      include: [],
    },
  },
  options: {
    htmlData: {
      title: web.title,
    },
  },
});
