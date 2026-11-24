import { t } from '@/core/locales/setupI18n';
// AI模型提供商及其模型、API密钥获取地址配置
export interface ModelProvider {
  value: string;
  label: string;
  /** 提供商API密钥管理页地址 */
  keyUrl: string;
  models: string[];
}

/**
 * providerList —— 模型供应商与模型型号清单
 * 数据核对时间：2026-09-21
 *
 * 说明：
 * 1. models 里填的是各家开放平台**真实可用的 model 入参字符串**，不是产品名。
 * 2. 带 -YYYYMMDD / -0902 这类后缀的是快照版本，线上会滚动更新；不带后缀的是滚动别名。
 * 3. 已下线的历史型号不再收录（例如 kimi-latest、deepseek-chat、deepseek-reasoner、gpt-4o 系列）。
 */

export const providerList: ModelProvider[] = [
  // ============================================================
  // 一、中国区 · 自研模型厂商
  // ============================================================
  {
    value: 'zhipu',
    label: `${t('智谱')} - ${t('中国')}`,
    keyUrl: 'https://open.bigmodel.cn/usercenter/proj-mgmt/apikeys',
    models: [
      'glm-5.3', // 当前旗舰，编程/Agent，1M 上下文
      'glm-5.3-flash', // 原生多模态，价格约为旗舰 1/40
      'glm-5.2', // 长程任务工程交付
      'glm-5.1',
      'glm-5',
      'glm-5-turbo', // 面向 OpenClaw / 长链路 Agent 场景
      'glm-4.7',
      'glm-4.7-flash', // 免费档
      'glm-4.6',
      'glm-ocr',
    ],
  },
  {
    value: 'deepseek',
    label: `DeepSeek - ${t('中国')}`,
    keyUrl: 'https://platform.deepseek.com/api_keys',
    models: [
      'deepseek-flash', // V4.1-Flash 的官方调用名，当前主力
      'deepseek-v4-pro', // 旗舰（2026-09-14 起逐步路由至 V4.1-Flash）
      'deepseek-v4-flash', // 旧名，兼容路由到 V4.1-Flash
      'deepseek-v4-flash-vision-exp', // 实验性视觉输入
      'deepseek-v3.2', // 旧代，仅第三方平台仍在托管
      // 注意：deepseek-chat / deepseek-reasoner 已于 2026-07-24 正式下线，无法调用
    ],
  },
  {
    value: 'qwen',
    label: `${t('阿里云百炼')} - ${t('中国')}`,
    keyUrl: 'https://bailian.console.aliyun.com/?tab=model#/api-key',
    models: [
      'qwen3.8-max',
      'qwen3.8-max-0902',
      'qwen3.8-flash',
      'qwen3.7-plus', // 均衡档，1M 上下文，性价比首选
      'qwen3.7-flash',
      'qwen-long', // 超长文档
      'qwen3-coder-plus',
      'qwen3-coder-flash',
      'qwen3-vl-plus',
      // 百炼同时代管三方模型
      'deepseek-v4-pro',
      'kimi-k3',
      'glm-5.2',
      'MiniMax-M2.5',
    ],
  },
  {
    value: 'qwenai',
    label: `${t('千问')}AI${t('平台')} - ${t('中国')}`,
    keyUrl: 'https://platform.qianwenai.com/home/api-keys',
    models: [
      'qwen3.8-max',
      'qwen3.7-plus',
      'qwen3.7-flash',
      'qwen3.5-plus',
      'qwen3.5-flash',
      // 同接口代理的三方模型
      'deepseek-v4-pro',
      'deepseek-v4-flash',
      'kimi-k3',
      'glm-5.2',
      'MiniMax-M3',
      'mimo-v2.5-pro',
    ],
  },
  {
    value: 'kimi',
    label: `Kimi - ${t('中国')}`,
    keyUrl: 'https://platform.moonshot.cn/console/api-keys',
    models: [
      'kimi-k3', // 旗舰，1M 上下文
      'kimi-k3-swarm-max', // Agent Swarm 模式
      'kimi-k2.7-code', // 编程专用，256K
      'kimi-k2.7-code-highspeed',
      'kimi-k2.6',
      // 注意：kimi-k2.5 / kimi-latest / kimi-k2-* 均已下线
    ],
  },
  {
    value: 'minimax',
    label: `MiniMax - ${t('中国')}`,
    keyUrl: 'https://platform.minimaxi.com/user-center/basic-information/interface-key',
    models: [
      'MiniMax-M3', // 原生多模态，1M 上下文
      'MiniMax-M2.7',
      'MiniMax-M2.7-highspeed',
      'MiniMax-M2.5',
      'MiniMax-M2.5-highspeed',
    ],
  },
  {
    value: 'xiaomi',
    label: `${t('小米')} MiMo - ${t('中国')}`,
    keyUrl: 'https://platform.xiaomimimo.com/',
    models: [
      'mimo-v2.5-pro',
      'mimo-v2.5', // 原生全模态，1M 上下文
      'mimo-v2.5-asr',
      'mimo-v2.5-tts',
      'mimo-v2.5-tts-voiceclone',
      'mimo-v2.5-tts-voicedesign',
      'MiMo-X-Pro-Preview', // 下代内测
      'MiMo-X-Flash-Preview',
    ],
  },

  // ============================================================
  // 二、中国区 · 新增供应商
  // ============================================================
  {
    value: 'volcengine',
    label: `${t('火山方舟')}（${t('豆包')}）- ${t('中国')}`,
    keyUrl: 'https://ark.volcengine.com/region:cn-beijing/apikey',
    models: [
      'doubao-seed-2-1-pro-260628',
      'doubao-seed-2-1-turbo-260628',
      'doubao-seed-evolving', // 滚动迭代别名，每周更新
      'doubao-seed-2-0-pro-260215',
      'doubao-seed-2-0-lite-260428',
      'doubao-seed-code-preview-251028',
    ],
  },
  {
    value: 'hunyuan',
    label: `${t('腾讯混元')}（TokenHub）- ${t('中国')}`,
    keyUrl: 'https://console.cloud.tencent.com/tokenhub',
    models: [
      'hy4-preview', // 770B 旗舰，1M 上下文（已开源）
      'hy3',
      'hy-mt2-pro', // 翻译旗舰
      'hy-mt2-plus',
      'hy-mt2-lite',
      'hunyuan-role-latest',
    ],
  },
  {
    value: 'qianfan',
    label: `${t('百度千帆')}（${t('文心')}）- ${t('中国')}`,
    keyUrl: 'https://console.bce.baidu.com/qianfan/ais/console/applicationConsole/application',
    models: [
      'ernie-5.1',
      'ernie-5.0',
      'ernie-4.5-turbo-128k',
      'ernie-4.5-turbo-32k',
      'ernie-4.5-turbo-vl',
      // 千帆亦代管三方模型
      'deepseek-v4-pro',
      'glm-5.2',
      'kimi-k2.6',
      'MiMo-V2.5',
    ],
  },
  {
    value: 'stepfun',
    label: `${t('阶跃星辰')} - ${t('中国')}`,
    keyUrl: 'https://platform.stepfun.com/interface-key',
    models: [
      'step-5-preview', // 600B MoE / 27B 激活，1M 上下文，10-15 开源权重
      'step-3.7-flash',
      'step-3.5-flash',
    ],
  },
  {
    value: 'xfyun',
    label: `${t('讯飞星火')} - ${t('中国')}`,
    keyUrl: 'https://console.xfyun.cn/services/cbm',
    // 讯飞的 model 入参命名较特殊，上线前请在“模型服务”页核对一次
    models: [
      'spark-x2.5', // 293B-A30B，256K 上下文，200+ 语种
      '4.0Ultra',
      'generalv3.5',
    ],
  },
  {
    value: 'siliconflow',
    label: `${t('硅基流动')} - ${t('中国')}`,
    keyUrl: 'https://cloud.siliconflow.cn/account/ak',
    // 聚合平台，model 入参为「组织/模型名」，以平台模型广场为准
    models: [
      'deepseek-v4-pro',
      'deepseek-v4-flash',
      'Qwen/Qwen3.8-Max',
      'zai-org/GLM-5.3',
      'moonshotai/Kimi-K3',
      'MiniMaxAI/MiniMax-M3',
    ],
  },

  // ============================================================
  // 三、国际模型厂商
  // ============================================================
  {
    value: 'openai',
    label: `OpenAI - ${t('国际')}`,
    keyUrl: 'https://platform.openai.com/api-keys',
    models: [
      'gpt-6-astra',
      'gpt-5.6-sol',
      'gpt-5.6-terra',
      'gpt-5.6-luna',
      'gpt-5.5',
      'gpt-5.4',
      'gpt-5.3-codex', // 1M 上下文，长程代码 Agent
      'gpt-oss-120b',
      // gpt-5-codex 已于 2026-07-23 退役；gpt-4o 系列 2026-10-23 关停
    ],
  },
  {
    value: 'anthropic',
    label: `Anthropic - ${t('国际')}`,
    keyUrl: 'https://console.anthropic.com/settings/keys',
    models: [
      'claude-fable-5-1',
      'claude-opus-5',
      'claude-sonnet-5',
      'claude-haiku-4-5',
      'claude-opus-4-8',
      // Mythos 5.1 与 Fable 5.1 同源，仅向已认证的安全/科研用户开放
    ],
  },
  {
    value: 'google',
    label: `Google Gemini - ${t('国际')}`,
    keyUrl: 'https://aistudio.google.com/apikey',
    models: [
      'gemini-3.8-flash',
      'gemini-3.7-flash',
      'gemini-3.6-flash',
      'gemini-3.5-flash-lite',
      'gemini-3.1-pro-preview',
    ],
  },
  {
    value: 'xai',
    label: `xAI Grok - ${t('国际')}`,
    keyUrl: 'https://console.x.ai/team/default/api-keys',
    models: ['grok-4.6', 'grok-4.5', 'grok-4.3', 'grok-4.20-reasoning', 'grok-code-fast-1'],
  },
  {
    value: 'meta',
    label: `Meta - ${t('国际')}`,
    keyUrl: 'https://llama.developer.meta.com/',
    models: ['muse-spark-1.3', 'llama-4-maverick', 'llama-4-scout'],
  },
  {
    value: 'mistral',
    label: `Mistral - ${t('国际')}`,
    keyUrl: 'https://console.mistral.ai/api-keys',
    models: [
      'mistral-large-2512', // Mistral Large 3，Apache 2.0
      'mistral-medium-3.5',
      'mistral-small-4',
      'ministral-3-14b',
      'devstral-2512',
    ],
  },

  // ============================================================
  // 四、聚合网关与自建
  // ============================================================
  {
    value: 'openrouter',
    label: `OpenRouter - ${t('聚合')}`,
    keyUrl: 'https://openrouter.ai/keys',
    models: [
      'anthropic/claude-fable-5.1',
      'anthropic/claude-opus-5',
      'openai/gpt-6-astra',
      'google/gemini-3.8-flash',
      'x-ai/grok-4.6',
      'deepseek/deepseek-v4-pro',
      'moonshotai/kimi-k3',
      'minimax/minimax-m3',
      'meta/muse-spark-1.3',
      'mistralai/mistral-large-2512',
      'qwen/qwen3.8-max',
    ],
  },
  {
    value: 'ollama',
    label: `Ollama - ${t('本地')}`,
    keyUrl: 'https://ollama.com/download',
    // 本地模型名以 ollama list 实际拉取的 tag 为准
    models: ['qwen3:8b', 'qwen3-coder:30b', 'glm4:9b', 'deepseek-r1:7b'],
  },
  {
    value: 'custom',
    label: `${t('自定义')}（OpenAI ${t('兼容')}）`,
    keyUrl: 'https://platform.openai.com/docs/api-reference',
    // 自建 vLLM / SGLang / TGI 等网关，或企业内部代理。model 填实际 served-model-name
    models: ['自定义'],
  },
];

// 提供商选项
export const providerOptions = providerList.map(({ value, label }) => ({ value, label }));

// 获取提供商信息
export const getProvider = (value: string) => providerList.find((item) => item.value === value);

// 按提供商获取模型选项
export const getModelOptions = (provider: string) => {
  return (getProvider(provider)?.models || []).map((model) => ({ value: model, label: model }));
};

// 获取提供商API密钥管理页地址
export const getKeyUrl = (provider: string) => getProvider(provider)?.keyUrl || '';
