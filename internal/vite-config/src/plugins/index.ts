import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { type PluginOption } from 'vite';

import { createConfigPluginConfig } from './appConfig';
import { configCompressPlugin } from './compress';
import { configHtmlPlugin } from './html';
import { configVisualizerConfig } from './visualizer';

interface Options {
  isBuild: boolean;
  root: string;
  compress: string;
  enableAnalyze?: boolean;
  htmlData?: Record<string, any>;
  baseDir: string;
}

async function createPlugins({ isBuild, compress, enableAnalyze, htmlData, baseDir }: Options) {
  const vitePlugins: (PluginOption | PluginOption[])[] = [vue(), vueJsx()];

  const appConfigPlugin = await createConfigPluginConfig(isBuild, baseDir);
  vitePlugins.push(appConfigPlugin);

  // vite-plugin-html
  vitePlugins.push(configHtmlPlugin({ isBuild, htmlData }));

  // The following plugins only work in the production environment
  if (isBuild) {
    // rollup-plugin-gzip
    vitePlugins.push(
      configCompressPlugin({
        compress,
      }),
    );
  }

  // rollup-plugin-visualizer
  if (enableAnalyze) {
    vitePlugins.push(configVisualizerConfig());
  }

  return vitePlugins;
}

export { createPlugins };
