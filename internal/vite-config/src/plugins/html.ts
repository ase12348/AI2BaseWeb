/**
 * Plugin to minimize and use ejs template syntax in index.html.
 * https://github.com/anncwb/vite-plugin-html
 */
import type { PluginOption } from 'vite';
import { createHtmlPlugin } from 'vite-plugin-html';

export function configHtmlPlugin({
  isBuild,
  htmlData,
}: {
  isBuild: boolean;
  htmlData?: Record<string, any>;
}) {
  const htmlPlugin: PluginOption[] = createHtmlPlugin({
    minify: isBuild,
    inject: {
      data: htmlData,
    },
  });
  return htmlPlugin;
}
