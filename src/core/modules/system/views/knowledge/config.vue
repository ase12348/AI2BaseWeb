<template>
  <div class="l-knowledge-config">
    <div class="l-knowledge-config-head">
      <span class="l-knowledge-config-title">{{ $t('知识库配置') }}</span>
      <a-button type="primary" :loading="saving" @click="handleSave">{{ $t('保存') }}</a-button>
    </div>
    <div class="l-knowledge-config-body">
      <div class="l-knowledge-config-form">
        <lr-c-schema-form ref="formRef" :formConfig="{ labelWidth: '110px' }" />

        <div class="l-knowledge-config-seg">
          <div class="l-knowledge-config-seg-label is-required">{{ $t('默认分段方式') }}</div>
          <div class="l-knowledge-config-seg-content">
            <div class="l-knowledge-config-seg-desc">
              {{
                $t(
                  '语义分段更适合没有排版过的文章，即没有明显换行符号的文本，否则更推荐使用普通分段',
                )
              }}
            </div>
            <div class="l-knowledge-config-cards">
              <div
                v-for="item in segModes"
                :key="item.key"
                class="l-knowledge-config-card"
                :class="{ 'is-active': segMode === item.key }"
                @click="handleSegModeChange(item.key)"
              >
                <div class="l-knowledge-config-card-title">
                  <lr-icon :icon="item.icon" :size="14" />
                  <span>{{ $t(item.label) }}</span>
                </div>
                <div class="l-knowledge-config-card-desc">{{ $t(item.desc) }}</div>
                <lr-icon
                  v-if="segMode === item.key"
                  class="l-knowledge-config-card-check"
                  icon="ant-design:check-outlined"
                  :size="12"
                />
              </div>
            </div>
          </div>
        </div>

        <lr-c-schema-form ref="segFormRef" :formConfig="{ labelWidth: '110px' }" />
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import type { FormSchemaConfig } from '/#/form';
  import { nextTick, onMounted, ref } from 'vue';
  import { useAuth } from '/@/core/hooks/useAuth';
  import { useForm } from '/@/core/hooks/useForm';
  import { useMessage } from '@/core/hooks/useMessage';
  import { ruleDefault, ruleSelectDefault } from '/@/core/utils/validator';
  import pageInfo from './page';
  import type { knowledgeEntity } from '../../api/knowledge';
  import { api } from '../../api/knowledge';
  import { t } from '@/core/locales/setupI18n';

  const props = defineProps<{ entity: knowledgeEntity }>();
  const emit = defineEmits(['saved']);

  const { success } = useMessage();

  // 嵌入模型
  const embedModelOptions = [
    {
      label: t('阿里云百炼'),
      value: 'aliyun_bailian',
      disabled: true,
      children: [{ label: t('向量模型'), value: t('向量模型') }],
    },
  ];

  const formConfigs: Record<string, FormSchemaConfig> = {
    f_Name: {
      rule: [...ruleDefault],
    },
    f_EmbedModel: {
      type: 'treeSelect',
      config: {
        options: embedModelOptions,
        'tree-default-expand-all': true,
        labelTooltip: `${t('向量模型可以将分段数据转化为向量形式')}，${t('存储到向量数据库中')}，${t('便于后续根据用户问题查询匹配')}。`,
      },
      rule: [...ruleSelectDefault],
    },
    f_Description: {
      type: 'textarea',
    },
    f_Icon: {
      type: 'lr-input-icon',
      rule: [...ruleSelectDefault],
    },
  };

  const { getFormSchema } = useAuth(pageInfo, { formConfigs });
  const formRef = ref();
  const schemas = getFormSchema();
  const {
    getFormData: getMainFormData,
    setFormData: setMainFormData,
    validateForm: validateMainForm,
  } = useForm(formRef, { schemas });

  const saving = ref(false);

  // ===== 默认分段方式（字段与学习页分段策略参数一致）=====
  type SegModeKey = 'normal' | 'semantic' | 'ai';
  const segMode = ref<SegModeKey>((props.entity as any)?.segMode || 'normal');
  const segModes: { key: SegModeKey; label: string; icon: string; desc: string }[] = [
    {
      key: 'normal',
      label: t('普通分段'),
      icon: 'ant-design:align-left-outlined',
      desc: `${t('基于文章分隔符进行分段')}，${t('不会消耗模型')}token`,
    },
    {
      key: 'semantic',
      label: t('语义分段'),
      icon: 'ant-design:partition-outlined',
      desc: `${t('将文章拆分成句子')}，${t('通过语句向量相似度进行分段')}，${t('会消耗模型')}token`,
    },
    {
      key: 'ai',
      label: `AI${t('分段')}`,
      icon: 'ant-design:robot-outlined',
      desc: `${t('将文章提交给大模型分段')}，${t('会消耗大量模型')}token`,
    },
  ];

  const DEFAULT_PROMPT = `${t('你是一位文章分段助手')}，${t('根据文章内容的语义进行合理分段')}，${t('确保每个分段表述一个完整的语义')}，${t('每个分段字数控制在500字左右')}，${t('最大不超过1000字')}。${t('请严格按照文章内容进行分段')}，${t('不要对文章内容进行加工')}，${t('分段完成后输出分段结果')}。`;

  // 分段设置兜底默认值
  const segFallback: Record<string, any> = {
    identifiers: `${t('空行')},${t('回车')}`,
    maxLength: '500',
    overlapLength: '0',
    autoMerge: false,
    embedModel: t('向量模型'),
    threshold: 50,
    aiModel: undefined,
    prompt: DEFAULT_PROMPT,
    maxChars: '5000',
  };

  // 分段设置当前应使用的值
  const getSegValues = () => {
    const values: Record<string, any> = { ...segFallback, ...((props.entity as any)?.seg || {}) };
    if (Array.isArray(values.identifiers)) {
      values.identifiers = values.identifiers.join(',');
    }
    return values;
  };

  // 分段标识符候选
  const identifierOptions = [
    { label: '#', value: '#' },
    { label: '##', value: '##' },
    { label: '###', value: '###' },
    { label: '####', value: '####' },
    { label: '#####', value: '#####' },
    { label: '-', value: '-' },
    { label: t('空格'), value: t('空格') },
    { label: t('分号'), value: t('分号') },
    { label: t('逗号'), value: t('逗号') },
    { label: t('句号'), value: t('句号') },
    { label: t('回车'), value: t('回车') },
    { label: t('空行'), value: t('空行') },
    { label: 'tab', value: 'tab' },
  ];
  // 嵌入模型候选（语义分段参数）
  const segEmbedModelOptions = [{ label: t('向量模型'), value: t('向量模型') }];
  // AI 大模型候选
  const aiModelOptions = ref<{ label: string; value: string }[]>([]);

  const segFormRef = ref();
  const segSchemasByMode: Record<SegModeKey, FormSchemaConfig[]> = {
    normal: [
      {
        name: '分段标识符',
        field: 'identifiers',
        type: 'select',
        config: {
          mode: 'multiple',
          options: identifierOptions,
          defaultValue: `${t('空行')},${t('回车')}`,
        },
        rule: [...ruleSelectDefault],
      },
      {
        name: '分段最大长度',
        field: 'maxLength',
        type: 'input',
        config: { addonAfter: t('字符'), defaultValue: '500' },
        rule: [...ruleDefault],
      },
      {
        name: '分段重叠长度',
        field: 'overlapLength',
        type: 'input',
        config: { addonAfter: t('字符'), defaultValue: '0' },
      },
      {
        name: '自动合并较小分段',
        field: 'autoMerge',
        type: 'switch',
        config: { defaultValue: false },
      },
    ],
    semantic: [
      {
        name: '嵌入模型',
        field: 'embedModel',
        type: 'select',
        config: { options: segEmbedModelOptions, defaultValue: t('向量模型') },
        rule: [...ruleSelectDefault],
      },
      {
        name: '分段阈值',
        field: 'threshold',
        type: 'number',
        config: { min: 0, max: 100, isNotString: true, defaultValue: 50 },
        rule: [...ruleDefault],
      },
      {
        name: '分段最大长度',
        field: 'maxLength',
        type: 'input',
        config: { addonAfter: t('字符'), defaultValue: '500' },
        rule: [...ruleDefault],
      },
      {
        name: '分段重叠长度',
        field: 'overlapLength',
        type: 'input',
        config: { addonAfter: t('字符'), defaultValue: '0' },
      },
    ],
    ai: [
      {
        name: `AI${t('大模型')}`,
        field: 'aiModel',
        type: 'select',
        config: { options: aiModelOptions.value, placeholder: '请选择' },
        rule: [...ruleSelectDefault],
      },
      {
        name: '提示词设置',
        field: 'prompt',
        type: 'textarea',
        config: { defaultValue: DEFAULT_PROMPT },
        rule: [...ruleDefault],
      },
      {
        name: '单次最大字符数',
        field: 'maxChars',
        type: 'input',
        config: { addonAfter: t('字符'), defaultValue: '5000' },
      },
    ],
  };

  const {
    initForm: initSegForm,
    getFormData: getSegFormData,
    setFormData: setSegFormData,
    validateForm: validateSegForm,
  } = useForm(segFormRef, {
    schemas: segSchemasByMode[segMode.value],
    needFormatter: true,
  });

  // 载入当前分段方式的表单配置，并填入默认值
  const loadSegForm = () => {
    initSegForm(segSchemasByMode[segMode.value]);
    nextTick(() => setSegFormData({ main: getSegValues() }));
  };

  // 切换分段方式
  const handleSegModeChange = (mode: SegModeKey) => {
    if (segMode.value === mode) {
      return;
    }
    segMode.value = mode;
    loadSegForm();
  };

  // 打开配置页时用当前知识库数据回填基础表单，并初始化分段方式参数
  onMounted(() => {
    nextTick(() => {
      setMainFormData({ main: { ...props.entity } });
      loadSegForm();
    });
  });

  // 校验分段方式参数表单
  const checkSegForm = async () => {
    try {
      return (await validateSegForm()) !== false;
    } catch {
      return false;
    }
  };

  const handleSave = async () => {
    if (!(await validateMainForm())) {
      return;
    }
    if (!(await checkSegForm())) {
      return;
    }
    const postData = {
      ...getMainFormData().main,
      segMode: segMode.value,
      seg: getSegFormData().main,
    };
    saving.value = true;
    try {
      const res = await api.update(props.entity.f_Id, postData);
      if (res) {
        success(t('保存成功'));
        emit('saved', postData);
      }
    } finally {
      saving.value = false;
    }
  };
</script>

<style lang="less">
  .l-knowledge-config {
    display: flex;
    flex-direction: column;
    height: 100%;

    &-head {
      display: flex;
      flex-shrink: 0;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--color-border-secondary, #f0f0f0);
    }

    &-title {
      color: var(--color-text);
      font-size: 16px;
      font-weight: 600;
    }

    &-body {
      box-sizing: border-box;
      flex: 1;
      padding-top: 32px;
      overflow-y: auto;
    }

    &-form {
      max-width: 640px;
      margin-left: 50px;
    }

    &-seg {
      display: flex;
      align-items: flex-start;
      margin-top: 8px;

      &-label {
        box-sizing: border-box;
        flex-shrink: 0;
        width: 110px;
        padding-right: 12px;
        color: var(--color-text);
        font-size: 14px;
        text-align: right;

        &.is-required::before {
          content: '*';
          margin-right: 4px;
          color: #f56c6c;
        }
      }

      &-content {
        flex: 1;
        min-width: 0;
      }

      &-desc {
        margin-bottom: 12px;
        color: var(--color-text-secondary);
        font-size: 13px;
        line-height: 22px;
      }
    }

    &-cards {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    &-card {
      position: relative;
      box-sizing: border-box;
      padding: 12px;
      transition:
        border-color 0.2s ease,
        background-color 0.2s ease;
      border: 1px solid var(--color-border, #d9d9d9);
      border-radius: 8px;
      cursor: pointer;

      &:hover {
        border-color: var(--color-primary, #1677ff);
      }

      &.is-active {
        border-color: var(--color-primary, #1677ff);
        background-color: rgb(22 119 255 / 6%);
      }

      &-title {
        display: flex;
        align-items: center;
        gap: 6px;
        color: var(--color-text);
        font-size: 14px;
        font-weight: 600;
      }

      &-desc {
        margin-top: 6px;
        color: var(--color-text-secondary);
        font-size: 12px;
        line-height: 18px;
      }

      &-check {
        position: absolute;
        top: 0;
        right: 0;
        padding: 2px 4px 4px;
        border-radius: 0 8px;
        background-color: var(--color-primary, #1677ff);
        color: #fff;
      }
    }
  }
</style>
