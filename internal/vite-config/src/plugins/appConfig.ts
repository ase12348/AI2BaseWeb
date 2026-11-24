import GenerateConfig from 'unplugin-config/vite';
import { type PluginOption } from 'vite';

const GLOBAL_CONFIG_FILE_NAME = 'jcode.config.js';
// This constant sets the output directory for the Vite package
const OUTPUT_DIR = 'dist';
export async function createConfigPluginConfig(
  shouldGenerateConfig: boolean,
  baseDir: string,
): Promise<PluginOption> {
  // LINK /src/utils/env.ts -> getVariableName
  const APP_NAME = 'jcode_framework';
  // https://github.com/kirklin/unplugin-config
  return GenerateConfig({
    appName: APP_NAME,
    baseDir: baseDir,
    envVariables: {
      prefix: 'VITE_GLOB_',
    },
    configFile: {
      generate: shouldGenerateConfig,
      fileName: GLOBAL_CONFIG_FILE_NAME,
      outputDir: OUTPUT_DIR,
    },
    htmlInjection: {
      decodeEntities: true,
    },
  });
}
