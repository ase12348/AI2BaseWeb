<template>
  <div class="l-knowledge-learn">
    <div class="l-knowledge-learn-header">
      <div class="l-knowledge-learn-header-left">
        <img v-if="logoImg" class="l-knowledge-learn-logo" :src="logoImg" alt="logo" />
        <span class="l-knowledge-learn-title">{{ $t('知识库管理') }}</span>
      </div>
      <div class="l-knowledge-learn-header-center">{{ $t('知识库管理') }}</div>
      <div class="l-knowledge-learn-header-right">
        <span class="l-knowledge-learn-close" @click="handleCloseAll">{{ $t('关闭') }}</span>
      </div>
    </div>

    <div class="l-knowledge-learn-subhead">
      <div class="l-knowledge-learn-subhead-left">
        <span class="l-knowledge-learn-back" @click="handleClose">
          <lr-icon icon="ant-design:left-outlined" :size="16" />
        </span>
        <span class="l-knowledge-learn-docname" :title="doc.f_Name">{{ doc.f_Name }}</span>
        <a-tag :color="statusTag.color">{{ $t(statusTag.label) }}</a-tag>
      </div>
      <div class="l-knowledge-learn-subhead-right">
        <a-button v-if="isCustomDoc" type="primary" @click="handleLearnDoc">{{
          $t('学习')
        }}</a-button>
        <a-button @click="handleClose">{{ $t('取消') }}</a-button>
      </div>
    </div>

    <div class="l-knowledge-learn-body">
      <div v-if="isCustomDoc" class="l-kb-seg">
        <div class="l-kb-seg-head">
          <span class="l-kb-seg-head-title">{{ $t('分段预览') }}</span>
          <span class="l-kb-seg-head-count">{{ `共${totalSegments}分段` }}</span>
          <span class="l-kb-seg-head-add" @click="handleAddSegment">
            <lr-icon icon="ant-design:plus-outlined" :size="14" />
            {{ $t('添加分段') }}
          </span>
        </div>
        <div class="l-kb-seg-list">
          <div v-for="(seg, i) in segmentList" :key="seg.id" class="l-kb-seg-item">
            <div class="l-kb-seg-item-head">
              <span class="l-kb-seg-item-index">#{{ i + 1 }}</span>
              <span class="l-kb-seg-item-size">{{ `共${seg.content.length}字符` }}</span>
              <span class="l-kb-seg-item-actions">
                <a @click="handleEditSegment(seg)">{{ $t('编辑') }}</a>
                <a class="is-danger" @click="handleDeleteSegment(seg)">{{ $t('删除') }}</a>
              </span>
            </div>
            <div class="l-kb-seg-item-content">{{ seg.content }}</div>
          </div>
        </div>
      </div>
      <lr-layout
        v-else
        :right="collapsed ? PREVIEW_WIDTH : SETTING_WIDTH + PREVIEW_WIDTH"
        :right-move="false"
      >
        <div class="l-kb-raw">
          <div class="l-kb-raw-head">
            <span class="l-kb-raw-head-title">{{ $t('原文预览') }}</span>
            <div class="l-kb-raw-head-actions">
              <lr-button v-if="doc.f_Type === 'online'" @click="handleGetRawText" type="link">
                <template #icon>
                  <lr-icon icon="refresh" :is-div="false" />
                </template>
                {{ $t('获取原文') }}</lr-button
              >
              <a-tooltip :title="collapsed ? $t('收起') : $t('展开')">
                <span class="l-kb-raw-head-toggle" @click="collapsed = !collapsed">
                  <lr-icon
                    :icon="
                      collapsed
                        ? 'ant-design:double-left-outlined'
                        : 'ant-design:double-right-outlined'
                    "
                    :size="16"
                  />
                </span>
              </a-tooltip>
            </div>
          </div>
          <div class="l-kb-raw-content">{{ rawText }}</div>
        </div>

        <template #right>
          <lr-layout :left="collapsed ? 0 : SETTING_WIDTH" :left-move="!collapsed">
            <div class="l-kb-seg">
              <div class="l-kb-seg-head">
                <span class="l-kb-seg-head-title">{{ $t('分段预览') }}</span>
                <span class="l-kb-seg-head-count">{{ `共${totalSegments}分段` }}</span>
                <span class="l-kb-seg-head-add" @click="handleAddSegment">
                  <lr-icon icon="ant-design:plus-outlined" :size="14" />
                  {{ $t('添加分段') }}
                </span>
              </div>
              <div class="l-kb-seg-list">
                <div v-for="(seg, i) in segmentList" :key="seg.id" class="l-kb-seg-item">
                  <div class="l-kb-seg-item-head">
                    <span class="l-kb-seg-item-index">#{{ i + 1 }}</span>
                    <span class="l-kb-seg-item-size">{{ `共${seg.content.length}字符` }}</span>
                    <span class="l-kb-seg-item-actions">
                      <a @click="handleEditSegment(seg)">{{ $t('编辑') }}</a>
                      <a class="is-danger" @click="handleDeleteSegment(seg)">{{ $t('删除') }}</a>
                    </span>
                  </div>
                  <div class="l-kb-seg-item-content">{{ seg.content }}</div>
                </div>
              </div>
            </div>

            <template #left>
              <div class="l-kb-setting">
                <div class="l-kb-setting-head">
                  <span class="l-kb-setting-head-title">{{ $t('分段设置') }}</span>
                  <span class="l-kb-setting-head-reset" @click="handleReset">
                    <lr-icon icon="ant-design:sync-outlined" :size="14" />
                    {{ $t('重置') }}
                  </span>
                </div>
                <div class="l-kb-setting-body">
                  <a-collapse v-model:activeKey="activeKey" ghost class="l-kb-setting-collapse">
                    <a-collapse-panel key="parse" :header="$t('文档解析策略')">
                      <div class="l-kb-setting-block-body">
                        <div
                          class="l-kb-card"
                          :class="{ 'is-active': parseMode === 'accurate' }"
                          @click="parseMode = 'accurate'"
                        >
                          <div class="l-kb-card-title">{{ $t('精准解析') }}</div>
                          <div class="l-kb-card-desc">
                            {{ $t('从文档中提取图片、表格等元素，需要耗费更长的时间') }}
                          </div>
                          <div v-show="parseMode === 'accurate'" class="l-kb-card-options">
                            <a-checkbox v-model:checked="parseOptions.image">{{
                              $t('图片元素')
                            }}</a-checkbox>
                            <a-checkbox v-model:checked="parseOptions.ocr">{{
                              $t('扫描件（OCR）')
                            }}</a-checkbox>
                            <a-checkbox v-model:checked="parseOptions.table">{{
                              $t('表格元素')
                            }}</a-checkbox>
                          </div>
                          <lr-icon
                            v-if="parseMode === 'accurate'"
                            class="l-kb-card-check"
                            icon="ant-design:check-outlined"
                            :size="12"
                          />
                        </div>
                        <div
                          class="l-kb-card"
                          :class="{ 'is-active': parseMode === 'fast' }"
                          @click="parseMode = 'fast'"
                        >
                          <div class="l-kb-card-title">{{ $t('快速解析') }}</div>
                          <div class="l-kb-card-desc">
                            {{ $t('不会对文档提取图像、表格等元素，适用于纯文本') }}
                          </div>
                          <lr-icon
                            v-if="parseMode === 'fast'"
                            class="l-kb-card-check"
                            icon="ant-design:check-outlined"
                            :size="12"
                          />
                        </div>
                      </div>
                    </a-collapse-panel>

                    <a-collapse-panel key="seg" :header="$t('分段策略')">
                      <div class="l-kb-setting-block-body">
                        <div
                          v-for="item in segModes"
                          :key="item.key"
                          class="l-kb-card"
                          :class="{ 'is-active': segMode === item.key }"
                          @click="handleSegModeChange(item.key)"
                        >
                          <div class="l-kb-card-title">
                            <lr-icon :icon="item.icon" :size="14" />
                            <span>{{ $t(item.label) }}</span>
                          </div>
                          <div class="l-kb-card-desc">{{ $t(item.desc) }}</div>
                          <lr-icon
                            v-if="segMode === item.key"
                            class="l-kb-card-check"
                            icon="ant-design:check-outlined"
                            :size="12"
                          />
                        </div>

                        <lr-c-schema-form ref="segFormRef" :form-config="{ layout: 'vertical' }" />
                      </div>
                    </a-collapse-panel>
                  </a-collapse>

                  <div class="l-kb-setting-actions">
                    <a-button block @click="handleGenerateSegment">{{ $t('生成分段') }}</a-button>
                    <a-button
                      type="primary"
                      block
                      :disabled="!segmentList.length"
                      @click="handleLearnDoc"
                      >{{ $t('学习') }}</a-button
                    >
                  </div>
                </div>
              </div>
            </template>
          </lr-layout>
        </template>
      </lr-layout>
    </div>

    <lr-dynamic-layer ref="segLayerRef" />
  </div>
</template>
<script lang="ts" setup>
  import { computed, h, inject, nextTick, onMounted, reactive, ref } from 'vue';
  import type { FormSchemaConfig } from '/#/form';
  import { useForm } from '/@/core/hooks/useForm';
  import { ruleDefault, ruleSelectDefault } from '/@/core/utils/validator';
  import { useMessage } from '@/core/hooks/useMessage';
  import type { knowledgeEntity } from '../../api/knowledge';
  import SegmentForm from './segmentForm.vue';
  import { t } from '@/core/locales/setupI18n';

  interface knowledgeDocEntity {
    f_Id: string;
    f_Name: string;
    f_SegmentCount: number;
    f_Status: number;
    f_Type?: string; //文档类型（local/online/custom）
  }

  const props = defineProps<{
    entity: knowledgeEntity;
    doc: knowledgeDocEntity;
    // 学习页初始配置（打开前请求获取），作为分段设置的默认值
    initData?: Record<string, any>;
  }>();
  const emit = defineEmits(['close', 'closeAll']);

  // 自定义文档
  const isCustomDoc = computed(() => props.doc.f_Type === 'custom');

  const { info, success } = useMessage();
  // 登录者应用信息
  const provide = inject('jcode_app_provide', {} as Record<string, any>);
  const { logoImg } = provide;

  // 分段设置 / 分段预览两列宽度（px），用于 lr-layout 的 left/right 联动
  const SETTING_WIDTH = 400;
  const PREVIEW_WIDTH = 520;
  // 是否收起分段设置
  const collapsed = ref(false);

  // 折叠区展开状态
  // 折叠面板展开项
  const activeKey = ref(['parse', 'seg']);

  // 文档解析策略
  const parseMode = ref<'accurate' | 'fast'>(props.initData?.parseMode || 'accurate');
  const parseOptions = reactive({
    image: true,
    ocr: true,
    table: true,
    ...(props.initData?.parseOptions || {}),
  });

  // 分段策略
  type SegModeKey = 'normal' | 'semantic' | 'ai';
  const getDefaultSegMode = (): SegModeKey =>
    (props.initData?.segMode || (props.entity as any)?.segMode || 'normal') as SegModeKey;
  const segMode = ref<SegModeKey>(getDefaultSegMode());
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

  // 分段策略参数
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
    const values: Record<string, any> = {
      ...segFallback,
      ...((props.entity as any)?.seg || {}),
      ...(props.initData?.seg || {}),
    };
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
  // 嵌入模型候选
  const embedModelOptions = [{ label: t('向量模型'), value: t('向量模型') }];
  // AI 大模型候选
  const aiModelOptions = ref<{ label: string; value: string }[]>([]);

  // 分段设置表单
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
        config: { options: embedModelOptions, defaultValue: t('向量模型') },
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

  const { initForm, validateForm, setFormData } = useForm(segFormRef, {
    schemas: segSchemasByMode[segMode.value],
    needFormatter: true,
  });

  // 载入当前类别的表单配置，并填入传入值/默认值
  const loadSegForm = () => {
    initForm(segSchemasByMode[segMode.value]);
    nextTick(() => setFormData({ main: getSegValues() }));
  };

  // 首次进入按传入配置初始化分段设置
  onMounted(() => loadSegForm());

  // 切换分段策略类别
  const handleSegModeChange = (mode: SegModeKey) => {
    if (segMode.value === mode) {
      return;
    }
    segMode.value = mode;
    loadSegForm();
  };

  const docStatusMap: Record<number, { label: string; color: string }> = {
    0: { label: t('待学习'), color: 'default' },
    1: { label: t('学习成功'), color: 'green' },
    2: { label: t('学习中'), color: 'blue' },
    3: { label: t('学习失败'), color: 'red' },
  };
  const statusTag = computed(
    () => docStatusMap[props.doc.f_Status] || { label: t('待学习'), color: 'default' },
  );

  // 原文预览
  const rawText = `## ${t('一')} ${t('引言')}  ${t('简搭快速开发平台依托')} .NET ${t('技术体系')}，${t('后端基于')} ASP.NET Core ${t('框架精心封装而成')}，${t('前端采用')} Vue3 + TypeScript + Vite ${t('构建')}，${t('丰富的开箱即用功能')}，${t('涵盖')} RBAC ${t('功能')}、Xss ${t('防跨站攻击')}、${t('自动生成前后端代码')}、${t('兼容多种存储系统')}、SaaS ${t('多租户等诸多实用模块')}。${t('平台能够在国产信创数据库')}、${t('国产信创中间件')}、${t('国产信创操作系统上顺利部署')}，${t('并且包含多种通用技术组件')}。${t('这些组件能让开发者将精力集中在业务功能开发上')}，${t('降低技术难度')}，${t('节省人力成本')}，${t('缩短项目周期')}，${t('有效提升开发效率')}。

## ${t('三')} ${t('平台特性')} ${t('架构设计以开发者效率提升为核心目标')}，${t('通过封装通用技术组件')}、${t('标准化接口协议和自动化部署流程')}，${t('降低技术门槛')}；${t('以系统可靠性为基础')}，${t('采用分布式缓存')}、${t('集群化部署和多租户隔离机制')}，${t('保障高并发场景下的数据一致性和安全性')}。

- **${t('灵活的权限控制')}**：${t('基于')} RBAC ${t('权限管理模式')}，${t('该功能模块专门用于维护企业组织架构信息及员工信息')}，${t('主要涵盖组织架构管理')}、${t('部门管理')}、${t('分级管理员')}、${t('角色管理')}、${t('岗位管理等功能')}。`;

  // 获取原文
  const handleGetRawText = async () => {
    // TODO
  };

  // 分段预览
  interface segmentItem {
    id: string;
    content: string;
  }
  const segmentList = ref<segmentItem[]>([
    { id: 'seg_1', content: '#' },
    { id: 'seg_2', content: `### 3.2 ${t('功能特性')}` },
    { id: 'seg_3', content: '#' },
    {
      id: 'seg_4',
      content: `- **${t('灵活的权限控制')}**：${t('基于')} RBAC ${t('权限管理模式')}，${t('该功能模块专门用于维护企业组织架构信息及员工信息')}，${t('主要涵盖组织架构管理')}、${t('部门管理')}、${t('分级管理员')}、${t('角色管理')}、${t('岗位管理等功能')}。`,
    },
    {
      id: 'seg_5',
      content: `- **${t('第三方登录')}**：${t('提供开箱即用的第三方授权登录工具类库')}，${t('具备统一的接口标准')}，${t('支持接入任意')} OAuth ${t('网站')}。`,
    },
    { id: 'seg_6', content: '#' },
  ]);
  const totalSegments = computed(() => props.doc.f_SegmentCount || segmentList.value.length);

  // 返回/取消
  const handleClose = () => {
    emit('close');
  };

  // 关闭整个知识库
  const handleCloseAll = () => {
    emit('closeAll');
  };

  // 重置
  const handleReset = () => {
    activeKey.value = ['parse', 'seg'];
    parseMode.value = props.initData?.parseMode || 'accurate';
    Object.assign(
      parseOptions,
      { image: true, ocr: true, table: true },
      props.initData?.parseOptions || {},
    );
    segMode.value = getDefaultSegMode();
    loadSegForm();
    success(t('已重置分段设置'));
  };
  // 校验“分段设置”必填项（lr-c-schema-form 规则）
  const validateSegForm = async () => {
    try {
      return (await validateForm()) !== false;
    } catch {
      return false;
    }
  };

  // 添加分段
  const handleAddSegment = () => {
    segLayerRef.value.open({
      title: t('新建分段'),
      name: h(SegmentForm),
      width: 760,
      height: 600,
      param: { entity: {} },
      afterOk: (data: any) => {
        if (data) {
          segmentList.value.push({
            id: `seg_${Date.now()}`,
            content: data.content,
          });
          success(t('添加成功'));
        }
      },
    });
  };
  // 以下操作后端接口未接入，校验通过后先给出占位提示
  const handleGenerateSegment = async () => {
    if (!(await validateSegForm())) {
      return;
    }
    info(`${t('生成分段')}：${t('待接入后端接口')}`);
  };
  const handleLearnDoc = async () => {
    if (!(await validateSegForm())) {
      return;
    }
    info(`${t('学习')}：${t('待接入后端接口')}`);
  };
  // 编辑分段
  const segLayerRef = ref();
  const handleEditSegment = (seg: segmentItem) => {
    segLayerRef.value.open({
      title: t('编辑分段'),
      name: h(SegmentForm),
      width: 760,
      height: 600,
      param: { entity: seg },
      afterOk: (data: any) => {
        if (data) {
          const target = segmentList.value.find((item) => item.id === seg.id);
          if (target) {
            target.content = data.content;
          }
          success(t('保存成功'));
        }
      },
    });
  };
  const handleDeleteSegment = (seg: segmentItem) => {
    const index = segmentList.value.findIndex((item) => item.id === seg.id);
    if (index > -1) {
      segmentList.value.splice(index, 1);
    }
  };
</script>

<style lang="less">
  .l-knowledge-learn {
    display: flex;
    position: fixed;
    z-index: 1001;
    flex-direction: column;
    inset: 0;
    background: radial-gradient(700px 320px at 10% -80px, rgb(255 158 188 / 40%), transparent 65%),
      radial-gradient(600px 300px at 72% -60px, rgb(125 205 255 / 45%), transparent 65%),
      linear-gradient(180deg, #c9d6f2 0%, #d6def4 45%, #e9edf6 100%);

    .l-knowledge-learn-header {
      display: flex;
      flex-shrink: 0;
      align-items: center;
      justify-content: space-between;
      height: 56px;
      padding: 0 16px;

      &-left {
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 0;
      }

      &-center {
        padding: 6px 24px;
        border-radius: 18px;
        background: #fff;
        box-shadow: 0 2px 8px rgb(31 35 48 / 8%);
        color: #1f1f1f;
        font-size: 14px;
        font-weight: 600;
      }

      &-right {
        display: flex;
        align-items: center;
        gap: 12px;
      }
    }

    .l-knowledge-learn-logo {
      height: 28px;
    }

    .l-knowledge-learn-title {
      color: #1f1f1f;
      font-size: 16px;
      font-weight: 700;
    }

    .l-knowledge-learn-close {
      padding: 6px 16px;
      border-radius: 16px;
      background: #fff;
      box-shadow: 0 2px 8px rgb(31 35 48 / 8%);
      color: #1f1f1f;
      font-size: 14px;
      cursor: pointer;

      &:hover {
        color: var(--color-primary, #1677ff);
      }
    }

    .l-knowledge-learn-subhead {
      display: flex;
      box-sizing: border-box;
      flex-shrink: 0;
      align-items: center;
      justify-content: space-between;
      height: 56px;
      margin: 0 12px;
      padding: 0 16px;
      border-radius: 8px 8px 0 0;
      background-color: var(--color-bg-container);

      &-left {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
      }

      &-right {
        display: flex;
        flex-shrink: 0;
        align-items: center;
        gap: 8px;
      }
    }

    .l-knowledge-learn-back {
      display: inline-flex;
      align-items: center;
      color: var(--color-text);
      cursor: pointer;

      &:hover {
        color: var(--color-primary, #1677ff);
      }
    }

    .l-knowledge-learn-docname {
      max-width: 420px;
      overflow: hidden;
      color: var(--color-text);
      font-size: 15px;
      font-weight: 600;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .l-knowledge-learn-body {
      box-sizing: border-box;
      flex: 1;
      min-height: 0;
      margin: 0 12px 12px;
      overflow: hidden;
      border-radius: 0 0 8px 8px;
      background-color: var(--color-bg-container);
    }

    // 原文预览
    .l-kb-raw {
      display: flex;
      box-sizing: border-box;
      flex-direction: column;
      height: 100%;
      padding: 12px 16px;
      overflow: hidden;
      border-right: 1px solid var(--color-border-secondary, #f0f0f0);

      &-head {
        display: flex;
        flex-shrink: 0;
        align-items: center;
        justify-content: space-between;
        padding-bottom: 8px;

        &-title {
          color: var(--color-text);
          font-size: 15px;
          font-weight: 600;
        }

        &-actions {
          display: flex;
          align-items: center;
        }

        &-toggle {
          display: inline-flex;
          align-items: center;
          color: var(--color-text-secondary);
          cursor: pointer;

          &:hover {
            color: var(--color-primary, #1677ff);
          }
        }
      }

      &-content {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        color: var(--color-text);
        font-size: 13px;
        line-height: 22px;
        word-break: break-all;
        white-space: pre-wrap;
      }
    }

    // 分段设置
    .l-kb-setting {
      display: flex;
      box-sizing: border-box;
      flex-direction: column;
      height: 100%;
      padding: 12px 8px;
      overflow: hidden;
      border-right: 1px solid var(--color-border-secondary, #f0f0f0);

      &-head {
        display: flex;
        flex-shrink: 0;
        align-items: center;
        justify-content: space-between;
        padding-bottom: 8px;

        &-title {
          color: var(--color-text);
          font-size: 15px;
          font-weight: 600;
        }

        &-reset {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: var(--color-primary, #1677ff);
          font-size: 13px;
          cursor: pointer;
        }
      }

      &-body {
        flex: 1;
        min-height: 0;
        padding: 0 8px;
        overflow-y: auto;
      }

      &-actions {
        display: flex;
        flex-direction: column;
        flex-shrink: 0;
        gap: 12px;
      }

      &-collapse {
        .ant-collapse-header {
          color: var(--color-text);
          font-size: 14px;
          font-weight: 600;
        }

        .ant-collapse-content-box {
          padding: 0 0 8px;
        }
      }

      &-block-body {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
    }

    .l-kb-card {
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

      &-options {
        display: flex;
        flex-wrap: wrap;
        gap: 8px 16px;
        margin-top: 10px;
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

    // 分段策略参数表单
    .l-kb-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-top: 4px;

      &-item {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }

      &-label {
        display: flex;
        align-items: center;
        gap: 4px;
        color: var(--color-text);
        font-size: 13px;

        &.is-required::before {
          content: '*';
          color: #f56c6c;
        }
      }

      &-tip {
        color: var(--color-text-quaternary, #bfbfbf);
        cursor: pointer;
      }

      &-control {
        width: 100%;
      }
    }

    // 分段预览
    .l-kb-seg {
      display: flex;
      box-sizing: border-box;
      flex-direction: column;
      height: 100%;
      padding: 12px 16px;
      overflow: hidden;

      &-head {
        display: flex;
        flex-shrink: 0;
        align-items: center;
        gap: 10px;
        padding-bottom: 8px;

        &-reset {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: var(--color-primary, #1677ff);
          font-size: 13px;
          cursor: pointer;
        }

        &-title {
          color: var(--color-text);
          font-size: 15px;
          font-weight: 600;
        }

        &-count {
          color: var(--color-text-secondary);
          font-size: 12px;
        }

        &-add {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          margin-left: auto;
          color: var(--color-primary, #1677ff);
          font-size: 13px;
          cursor: pointer;
        }
      }

      &-list {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
      }

      &-item {
        box-sizing: border-box;
        margin-bottom: 12px;
        padding: 12px;
        border: 1px solid var(--color-border-secondary, #f0f0f0);
        border-radius: 8px;
        background-color: var(--color-bg-container);

        &-head {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        &-index {
          color: var(--color-text);
          font-size: 13px;
          font-weight: 600;
        }

        &-size {
          color: var(--color-text-secondary);
          font-size: 12px;
        }

        &-actions {
          display: inline-flex;
          margin-left: auto;
          gap: 12px;
          font-size: 13px;

          a {
            color: var(--color-primary, #1677ff);
            cursor: pointer;
          }

          .is-danger {
            color: #f56c6c;
          }
        }

        &-content {
          margin-top: 8px;
          color: var(--color-text);
          font-size: 13px;
          line-height: 20px;
          word-break: break-all;
        }
      }
    }
  }
</style>
