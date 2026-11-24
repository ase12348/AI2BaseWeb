<template>
  <div class="l-knowledge-design">
    <div class="l-knowledge-design-header">
      <div class="l-knowledge-design-header-left">
        <img v-if="logoImg" class="l-knowledge-design-logo" :src="logoImg" alt="logo" />
        <span class="l-knowledge-design-name" :title="knowledgeName">{{ knowledgeName }}</span>
      </div>
      <div class="l-knowledge-design-header-center">{{ $t('知识库管理') }}</div>
      <div class="l-knowledge-design-header-right">
        <span class="l-knowledge-design-close" @click="handleClose">{{ $t('关闭') }}</span>
      </div>
    </div>

    <div class="l-knowledge-design-body">
      <div class="l-knowledge-design-menu">
        <div
          v-for="menu in menus"
          :key="menu.key"
          class="l-knowledge-design-menu-item"
          :class="{ 'is-active': activeMenu === menu.key }"
          @click="activeMenu = menu.key"
        >
          <lr-icon :icon="menu.icon" :size="16" />
          <span>{{ $t(menu.label) }}</span>
        </div>
      </div>

      <div class="l-knowledge-design-content">
        <lr-layout v-if="activeMenu === 'docs'" :top="88" :top-move="false">
          <template #top>
            <div class="l-knowledge-design-docs-head">
              <span class="l-knowledge-design-docs-title">{{ $t('知识库文档') }}</span>
              <a-tooltip :title="$t('文档学习后才能被智能体检索使用')">
                <lr-icon
                  icon="ant-design:question-circle-filled"
                  :size="16"
                  class="l-knowledge-design-docs-tip"
                />
              </a-tooltip>
            </div>

            <div class="l-knowledge-design-docs-toolbar">
              <a-dropdown :trigger="['click']">
                <a-button type="primary">
                  <template #icon>
                    <lr-icon icon="ant-design:plus-outlined" :size="14" :is-div="false" />
                  </template>
                  {{ $t('添加内容') }}
                  <lr-icon icon="ant-design:down-outlined" :size="12" :is-div="false" />
                </a-button>
                <template #overlay>
                  <div class="l-knowledge-design-add-menu">
                    <div
                      v-for="item in addTypes"
                      :key="item.type"
                      class="l-knowledge-design-add-menu-item"
                      @click="handleAddType(item.type)"
                    >
                      <div class="l-knowledge-design-add-menu-item-title">
                        <lr-icon icon="ant-design:plus-outlined" :size="14" />
                        <span>{{ $t(item.label) }}</span>
                      </div>
                      <div class="l-knowledge-design-add-menu-item-desc">{{ $t(item.desc) }}</div>
                    </div>
                  </div>
                </template>
              </a-dropdown>
              <div class="l-knowledge-design-docs-filters">
                <a-select
                  v-model:value="docStatus"
                  class="l-knowledge-design-docs-type"
                  :options="docStatusOptions"
                />
                <a-input-search
                  v-model:value="docKeyword"
                  :placeholder="$t('请输入关键词')"
                  allow-clear
                  class="l-knowledge-design-docs-search"
                />
              </div>
            </div>
          </template>

          <lr-table :columns="docColumns" :data-source="filterDocs">
            <lr-table-buttons :list="docButtons" />
          </lr-table>
        </lr-layout>

        <div v-else-if="activeMenu === 'recall'" class="l-knowledge-design-recall">
          <div class="l-knowledge-design-recall-panel">
            <div class="l-knowledge-design-recall-title">
              {{ $t('召回测试') }}
              <a-tooltip :title="$t('根据给定的查询问题测试知识的召回效果')">
                <lr-icon
                  icon="ant-design:question-circle-filled"
                  :size="16"
                  class="l-knowledge-design-docs-tip"
                />
              </a-tooltip>
            </div>

            <a-textarea
              v-model:value="recallQuestion"
              :placeholder="$t('请输入测试问题')"
              :auto-size="{ minRows: 4, maxRows: 6 }"
              class="l-knowledge-design-recall-input"
            />
            <a-button
              type="primary"
              block
              class="l-knowledge-design-recall-btn"
              @click="handleRecallTest"
            >
              {{ $t('测试') }}
            </a-button>

            <div class="l-knowledge-design-recall-section">{{ $t('检索模式') }}</div>
            <div class="l-knowledge-design-recall-modes">
              <div
                v-for="mode in searchModes"
                :key="mode.key"
                class="l-knowledge-design-recall-mode"
                :class="{ 'is-active': searchMode === mode.key }"
                @click="searchMode = mode.key"
              >
                <div class="l-knowledge-design-recall-mode-title">
                  <lr-icon :icon="mode.icon" :size="16" />
                  <span>{{ $t(mode.label) }}</span>
                  <span v-if="mode.recommended" class="l-knowledge-design-recall-mode-tag">
                    {{ $t('推荐') }}
                  </span>
                </div>
                <div class="l-knowledge-design-recall-mode-desc">{{ $t(mode.desc) }}</div>
              </div>
            </div>

            <div v-if="searchMode === 'hybrid'" class="l-knowledge-design-recall-field">
              <div class="l-knowledge-design-recall-field-head">
                <span class="l-knowledge-design-recall-field-label">
                  {{ $t('权重') }}
                  <a-tooltip :title="$t('向量检索与全文检索在混合检索中的占比')">
                    <lr-icon
                      icon="ant-design:question-circle-filled"
                      :size="14"
                      class="l-knowledge-design-docs-tip"
                    />
                  </a-tooltip>
                </span>
                <span class="l-knowledge-design-recall-weight-legend">
                  <span class="is-vector">{{ $t('向量') }}：{{ weightVector.toFixed(2) }}</span>
                  <span class="is-fulltext">
                    {{ $t('全文') }}：{{ (1 - weightVector).toFixed(2) }}
                  </span>
                </span>
              </div>
              <a-slider
                v-model:value="weightVector"
                :min="0"
                :max="1"
                :step="0.01"
                :tooltip-formatter="null"
              />
            </div>

            <div class="l-knowledge-design-recall-field">
              <div class="l-knowledge-design-recall-field-head">
                <span class="l-knowledge-design-recall-field-label">
                  Top K
                  <a-tooltip
                    :title="
                      $t(
                        '最多从知识库中召回分段数，最低为1，最高为10。召回分段数越多，消耗的token也会越多',
                      )
                    "
                  >
                    <lr-icon
                      icon="ant-design:question-circle-filled"
                      :size="14"
                      class="l-knowledge-design-docs-tip"
                    />
                  </a-tooltip>
                </span>
              </div>
              <div class="l-knowledge-design-recall-slider">
                <a-slider v-model:value="topK" :min="1" :max="10" :step="1" />
                <a-input-number v-model:value="topK" :min="1" :max="10" :step="1" />
              </div>
            </div>

            <div class="l-knowledge-design-recall-field">
              <div class="l-knowledge-design-recall-field-head">
                <span class="l-knowledge-design-recall-field-label">
                  {{ $t('Rerank模型') }}
                </span>
              </div>
              <a-tree-select
                v-model:value="rerankModel"
                :tree-data="rerankModelOptions"
                :placeholder="$t('重排模型')"
                tree-default-expand-all
                allow-clear
                class="l-knowledge-design-recall-tree"
              />
            </div>

            <div v-if="searchMode !== 'fulltext'" class="l-knowledge-design-recall-field">
              <div class="l-knowledge-design-recall-field-head">
                <span class="l-knowledge-design-recall-field-label">
                  {{ $t('相似度阈值') }}
                  <a-tooltip :title="$t('仅召回相似度高于该阈值的结果')">
                    <lr-icon
                      icon="ant-design:question-circle-filled"
                      :size="14"
                      class="l-knowledge-design-docs-tip"
                    />
                  </a-tooltip>
                </span>
              </div>
              <div class="l-knowledge-design-recall-slider">
                <a-slider v-model:value="similarity" :min="0" :max="1" :step="0.1" />
                <a-input-number v-model:value="similarity" :min="0" :max="1" :step="0.1" />
              </div>
            </div>
          </div>

          <div class="l-knowledge-design-recall-result" :class="{ 'is-empty': !recallList.length }">
            <template v-if="recallList.length">
              <div v-for="item in recallList" :key="item.id" class="l-knowledge-design-recall-item">
                <div class="l-knowledge-design-recall-item-top">
                  <span class="l-knowledge-design-recall-item-id">id:{{ item.id }}</span>
                  <span class="l-knowledge-design-recall-item-count">{{
                    `${t('共')}${item.text.length}${t('字符')}`
                  }}</span>
                </div>
                <div class="l-knowledge-design-recall-item-meta">
                  <span>
                    {{ $t('来自') }}：<a class="l-knowledge-design-recall-item-doc">{{
                      item.documentName
                    }}</a>
                  </span>
                  <span class="l-knowledge-design-recall-item-divider"></span>
                  <span class="l-knowledge-design-recall-item-score">
                    {{ $t('相似度') }}：
                    <lr-icon icon="ant-design:folder-open-filled" :size="14" />
                    {{ item.score }}
                  </span>
                </div>
              </div>
            </template>
            <a-empty v-else :description="$t('暂无数据')" />
          </div>
        </div>

        <knowledge-config
          v-else-if="activeMenu === 'config' && entity"
          :entity="entity"
          @saved="handleConfigSaved"
        />

        <div v-else class="l-knowledge-design-agents">
          <div class="l-knowledge-design-agents-title">{{ $t('已关联的智能体') }}</div>
          <div v-if="agentList.length" class="l-knowledge-design-agents-grid">
            <div v-for="item in agentList" :key="item.f_Id" class="l-knowledge-design-agent-card">
              <div class="l-knowledge-design-agent-card-head">
                <div class="l-knowledge-design-agent-card-icon">
                  <lr-icon :icon="item.f_Icon || 'ant-design:robot-outlined'" :size="24" />
                </div>
                <div class="l-knowledge-design-agent-card-title">
                  <div class="l-knowledge-design-agent-card-name" :title="item.f_Name">
                    {{ item.f_Name }}
                  </div>
                  <div class="l-knowledge-design-agent-card-creator">
                    {{ item.f_CreateUserName }}/{{ item.f_CreateUserId }}
                  </div>
                </div>
              </div>
              <div class="l-knowledge-design-agent-card-desc" :title="item.f_Description">
                {{ item.f_Description }}
              </div>
            </div>
          </div>
          <a-empty v-else :description="$t('暂无关联')" class="l-knowledge-design-agents-empty" />
        </div>
      </div>
    </div>

    <lr-dynamic-layer ref="layerRef" />

    <lr-modal
      v-model:visible="uploadVisible"
      :title="$t('上传本地文档')"
      :width="600"
      :height="400"
      :btn-text="$t('保存')"
      @ok="handleUploadSave"
    >
      <div class="l-knowledge-design-upload">
        <a-upload-dragger
          class="l-knowledge-design-upload-drag"
          :show-upload-list="false"
          accept=".pdf,.doc,.docx,.txt,.md,.xls,.xlsx,.csv,.html"
          multiple
          :before-upload="handleBeforeUpload"
          :custom-request="handleUploadRequest"
        >
          <div class="l-knowledge-design-upload-drag-inner">
            <p class="ant-upload-drag-icon">
              <lr-icon icon="ant-design:upload-outlined" :size="24" />
            </p>
            <p class="ant-upload-text">{{ $t('将文件拖到此处，或点击上传') }}</p>
          </div>
        </a-upload-dragger>
        <div class="l-knowledge-design-upload-tip">
          {{
            $t(
              '一次只能上传20个文档，单个文件不超过100M，支持文件类型：.pdf,.doc,.docx,.txt,.md,.xls,.xlsx,.csv,.html',
            )
          }}
        </div>
        <div class="l-knowledge-design-upload-list">
          <div
            class="l-knowledge-design-upload-item"
            v-for="(item, index) in uploadFileList"
            :key="index"
          >
            <lr-icon icon="ant-design:file-text-outlined" :size="16" />
            <span class="l-knowledge-design-upload-item-name">{{ item.name }}</span>
            <a-progress
              v-if="item.status === 'uploading'"
              class="l-knowledge-design-upload-item-progress"
              :size="4"
              :percent="item.percent"
              :show-info="false"
            />
            <lr-icon
              v-else-if="item.status === 'error'"
              icon="ant-design:close-circle-filled"
              class="l-knowledge-design-upload-item-error"
            />
            <lr-icon
              v-else
              icon="ant-design:check-circle-filled"
              class="l-knowledge-design-upload-item-done"
            />
          </div>
        </div>
      </div>
    </lr-modal>

    <knowledge-learn
      v-if="learnVisible && learnDoc && entity"
      :entity="entity"
      :doc="learnDoc"
      :init-data="learnConfig"
      @close="learnVisible = false"
      @close-all="handleClose"
    />
  </div>
</template>
<script lang="ts" setup>
  import { computed, h, inject, ref } from 'vue';
  import { Tag } from 'ant-design-vue';
  import { useMessage } from '@/core/hooks/useMessage';
  import { useFile } from '@/core/hooks/useFile';
  import { countFileSize, formatToDate } from '@/core/utils/jcode';
  import type { ButtonType } from '/#/page';
  import type { knowledgeEntity } from '../../api/knowledge';
  import { api } from '../../api/knowledge';
  import type { agentEntity } from '../agent/data';
  import RenameForm from './rename.vue';
  import OnlineForm from './onlineForm.vue';
  import KnowledgeLearn from './learn.vue';
  import KnowledgeConfig from './config.vue';
  import { t } from '@/core/locales/setupI18n';

  // 知识库数据
  const entity = ref<knowledgeEntity>();
  // 顶部展示名称
  const knowledgeName = ref('');
  // 父级 layer 实例
  let pageLayerIns: any = null;

  const { info, success, createConfirm, loading, createMessage } = useMessage();
  // 登录者应用信息
  const provide = inject('jcode_app_provide', {} as Record<string, any>);
  const { logoImg } = provide;

  // 左侧菜单
  const menus = [
    { key: 'docs', label: t('知识库文档'), icon: 'ant-design:database-outlined' },
    { key: 'recall', label: t('召回测试'), icon: 'ant-design:check-square-outlined' },
    { key: 'config', label: t('知识库配置'), icon: 'ant-design:sliders-outlined' },
    { key: 'agent', label: t('关联智能体'), icon: 'ant-design:partition-outlined' },
  ];
  const activeMenu = ref('docs');

  // 召回测试
  const recallQuestion = ref('');
  // 检索模式
  const searchMode = ref('hybrid');
  const searchModes = [
    {
      key: 'hybrid',
      label: t('混合检索'),
      icon: 'ant-design:swap-outlined',
      recommended: true,
      desc: `${t('同时执行全文检索和向量检索')}，${t('并用重排序策略')}，${t('从而兼具两者优势')}`,
    },
    {
      key: 'vector',
      label: t('向量检索'),
      icon: 'ant-design:deployment-unit-outlined',
      desc: `${t('通过生成查询与文档内容的向量表示')}，${t('并计算相似度来检索相关文档片段')}`,
    },
    {
      key: 'fulltext',
      label: t('全文检索'),
      icon: 'ant-design:file-search-outlined',
      desc: `${t('索引文档中的所有词汇')}，${t('允许用户查询任何词汇')}，${t('并返回包含这些词汇的文本片段')}`,
    },
  ];
  // 向量权重（全文权重 = 1 - 向量权重），仅混合检索使用
  const weightVector = ref(0.38);
  // 最多召回分段数（1-10）
  const topK = ref(5);
  // 相似度阈值（0-1），全文检索不使用
  const similarity = ref(0.6);
  // Rerank 重排模型（一级分类不可选，仅叶子节点可选）
  const rerankModel = ref<string>();
  const rerankModelOptions = [
    {
      title: t('阿里云百炼'),
      value: 'aliyun_bailian',
      disabled: true,
      children: [{ title: t('重排模型'), value: t('重排模型') }],
    },
  ];
  // 召回测试结果分段
  interface recallItemEntity {
    documentId: string; //文档ID
    documentName: string; //文档名称
    id: string; //分段ID
    knowledgeId: string; //知识库ID
    score: number; //相似度
    text: string; //分段内容
  }
  const recallList = ref<recallItemEntity[]>([]);
  const handleRecallTest = () => {
    if (!recallQuestion.value.trim()) {
      info(t('请输入测试问题'));
      return;
    }
    // TODO
    recallList.value = [
      {
        documentId: '839204716283940157',
        documentName: `${t('简搭')}AI${t('开发白皮书')}.txt`,
        id: 'a3f8c21d-7b42-4e9a-b1c8-2f6d90ab45c7',
        knowledgeId: '839162057382910546',
        score: 0.536983625202883,
        text: ' ',
      },
    ];
  };

  // 文档状态
  const docStatusMap: Record<number, { label: string; color: string }> = {
    0: { label: t('待学习'), color: 'default' },
    1: { label: t('学习成功'), color: 'green' },
    2: { label: t('学习中'), color: 'blue' },
    3: { label: t('学习失败'), color: 'red' },
  };

  interface knowledgeDocEntity {
    f_Id: string;
    f_Name: string; //名称
    f_Size: string; //文档大小
    f_SegmentCount: number; //分段数
    f_Type: string; //文档类型（local/online/custom）
    f_ModifyDate: string; //修改时间
    f_Status: number; //文档状态
  }

  // 示例文档
  const sampleDocs: knowledgeDocEntity[] = [
    {
      f_Id: 'doc_sample_1',
      f_Name: `${t('员工差旅规则')}.docx`,
      f_Size: '29.25 KB',
      f_SegmentCount: 319,
      f_Type: 'local',
      f_ModifyDate: '2026-10-06 14:20:00',
      f_Status: 1,
    },
    {
      f_Id: 'doc_sample_2',
      f_Name: `${t('费用报销流程')}.pdf`,
      f_Size: '24.88 KB',
      f_SegmentCount: 0,
      f_Type: 'local',
      f_ModifyDate: '2026-10-07 09:10:00',
      f_Status: 0,
    },
  ];
  const docList = ref<knowledgeDocEntity[]>([]);

  // 根据当前知识库 ID 加载文档内容（后端未接入时回退示例数据）
  const loadDocs = async () => {
    const id = entity.value?.f_Id;
    try {
      // TODO
      // const res = await api.getDocList(id);
      // docList.value = res || [];
      docList.value = id ? sampleDocs : [];
    } catch (e) {
      docList.value = sampleDocs;
    }
  };

  // 文档状态筛选 + 关键词前端实时过滤（名称）
  const docStatus = ref<number | string>('');
  const docStatusOptions = [
    { label: t('全部'), value: '' },
    { label: t('待学习'), value: 0 },
    { label: t('学习成功'), value: 1 },
    { label: t('学习失败'), value: 3 },
  ];
  const docKeyword = ref('');
  const filterDocs = computed(() => {
    const key = docKeyword.value.trim().toLowerCase();
    return docList.value.filter(
      (item) =>
        (docStatus.value === '' || item.f_Status === docStatus.value) &&
        (!key || (item.f_Name || '').toLowerCase().includes(key)),
    );
  });

  const docColumns = [
    { label: '名称', prop: 'f_Name', minWidth: 200 },
    { label: '文档大小', prop: 'f_Size', width: 110 },
    { label: '分段', prop: 'f_SegmentCount', width: 90 },
    {
      label: '文档类型',
      prop: 'f_Type',
      width: 110,
      config: { dataType: 'dataItem', dataCode: 'KnowledgeType' },
    },
    { label: '修改时间', prop: 'f_ModifyDate', width: 180 },
    {
      label: '文档状态',
      prop: 'f_Status',
      width: 110,
      config: {
        formatter: ({ row }: { row: knowledgeDocEntity }) => {
          const status = docStatusMap[row.f_Status];
          return h(Tag, { color: status?.color }, () => status?.label || '');
        },
      },
    },
  ];

  // 行操作按钮
  const docButtons = ref<ButtonType[]>([
    {
      prop: 'learn',
      label: t('学习'),
      click: (row) => handleLearn(row as knowledgeDocEntity),
    },
    {
      prop: 'rename',
      label: t('重命名'),
      click: (row) => handleRename(row as knowledgeDocEntity),
    },
    {
      prop: 'delete',
      label: t('删除'),
      danger: true,
      click: (row) => handleDeleteDoc(row as knowledgeDocEntity),
    },
  ]);

  // 添加内容下拉候选
  const addTypes = [
    {
      type: 'local',
      label: t('本地文档'),
      desc: `${t('上传本地')} pdf/doc/docx/txt/md/xls/xlsx/csv/html ${t('等格式文件')}`,
    },
    { type: 'online', label: t('在线数据'), desc: t('获取在线网页内容') },
    {
      type: 'custom',
      label: t('自定义文档'),
      desc: `${t('自定义一个空文档')}，${t('手动添加内容')}`,
    },
  ];
  // 动态弹窗层
  const layerRef = ref();
  const handleAddType = (type: string) => {
    // 本地文档
    if (type === 'local') {
      uploadFileList.value = [];
      uploadVisible.value = true;
      return;
    }
    // 在线数据/自定义文档
    if (type === 'online' || type === 'custom') {
      const label = addTypes.find((item) => item.type === type)?.label || type;
      layerRef.value.open({
        title: label,
        name: h(OnlineForm),
        width: 560,
        height: type === 'online' ? 260 : 220,
        param: { type },
        afterOk: (data: any) => {
          if (data) {
            // TODO
            docList.value.unshift({
              f_Id: `doc_${type}_${Date.now()}`,
              f_Name: data.f_Name,
              f_Size: '-',
              f_SegmentCount: 0,
              f_Type: type,
              f_ModifyDate: formatToDate(new Date(), 'YYYY-MM-DD HH:mm:ss'),
              f_Status: 0,
            });
            success(t('保存成功'));
          }
        },
      });
      return;
    }
    // TODO
    const label = addTypes.find((item) => item.type === type)?.label || type;
    info(`${label}：待接入后端接口`);
  };

  // 本地文档上传弹窗
  const { fileChunkedUpload } = useFile();
  const uploadVisible = ref(false);
  const uploadFileList = ref<any[]>([]);
  const refreshUploadList = () => {
    uploadFileList.value = [...uploadFileList.value];
  };
  // 上传限制
  const MAX_UPLOAD_COUNT = 20;
  const MAX_UPLOAD_SIZE = 100 * 1024 * 1024;
  const uploadExts = ['pdf', 'doc', 'docx', 'txt', 'md', 'xls', 'xlsx', 'csv', 'html'];
  const handleBeforeUpload = (file: any, fileList: any[]) => {
    if (uploadFileList.value.length + fileList.length > MAX_UPLOAD_COUNT) {
      if (fileList[0]?.uid === file.uid) {
        info(`一次只能上传${MAX_UPLOAD_COUNT}个文档`);
      }
      return false;
    }
    const ext = (file.name || '').split('.').pop()?.toLowerCase() || '';
    if (!uploadExts.includes(ext)) {
      info(`不支持的文件类型：${file.name}`);
      return false;
    }
    if (file.size > MAX_UPLOAD_SIZE) {
      info(`单个文件不能超过100M：${file.name}`);
      return false;
    }
    return true;
  };
  // 真实分片上传
  const handleUploadRequest = ({ file }: any) => {
    file.status = 'uploading';
    file.percent = 0;
    uploadFileList.value.push(file);
    fileChunkedUpload(file, {
      onStart: () => {},
      onProgress: (_file: any, _loaded: number, percent: number) => {
        _file.percent = percent;
        refreshUploadList();
      },
      onSuccess: (_file: any) => {
        _file.status = 'done';
        refreshUploadList();
      },
      onError: (_file: any, err: any) => {
        console.error(err, '文件上传失败');
        _file.status = 'error';
        refreshUploadList();
      },
      // 不传自定义合并回调，使用框架默认的附件合并（api.merge）
      uploadCallback: undefined,
    });
  };
  // 保存
  const handleUploadSave = () => {
    const doneFiles = uploadFileList.value.filter((f) => f.status === 'done');
    if (!doneFiles.length) {
      info(t('请先上传文件'));
      return;
    }
    // TODO
    doneFiles.forEach((file) => {
      docList.value.unshift({
        f_Id: file.response?.fileId || `doc_${file.uid}`,
        f_Name: file.name,
        f_Size: countFileSize(file.size),
        f_SegmentCount: 0,
        f_Type: 'local',
        f_ModifyDate: formatToDate(new Date(), 'YYYY-MM-DD HH:mm:ss'),
        f_Status: 0,
      });
    });
    success(t('保存成功'));
    uploadVisible.value = false;
  };

  // 学习
  const learnVisible = ref(false);
  const learnDoc = ref<knowledgeDocEntity>();
  const learnConfig = ref<Record<string, any>>();
  const handleLearn = async (row: knowledgeDocEntity) => {
    learnDoc.value = row;
    learnConfig.value = undefined;
    loading(`${t('加载学习配置中')}...`);
    try {
      learnConfig.value = (await api.getLearnConfig(row.f_Id)) || undefined;
    } catch (e) {
      // 后端未接入或请求失败
      learnConfig.value = undefined;
    } finally {
      createMessage.destroy();
      learnVisible.value = true;
    }
  };

  // 重命名
  const handleRename = (row: knowledgeDocEntity) => {
    layerRef.value.open({
      title: t('重命名'),
      name: h(RenameForm),
      width: 560,
      height: 220,
      param: { entity: row },
      afterOk: (data: any) => {
        if (data) {
          // TODO
          row.f_Name = data.f_Name;
          success(t('重命名成功'));
        }
      },
    });
  };

  const handleDeleteDoc = (row: knowledgeDocEntity) => {
    createConfirm({
      title: t('提示'),
      iconType: 'warning',
      content: `${t('您确定删除')}【${row.f_Name}】${t('吗')}`,
      onOk: () => {
        // TODO
        const index = docList.value.findIndex((item) => item.f_Id === row.f_Id);
        if (index > -1) {
          docList.value.splice(index, 1);
        }
        success(t('删除成功'));
      },
    });
  };

  // 关联智能体
  const agentList = ref<agentEntity[]>([]);
  const sampleAgents: agentEntity[] = [
    {
      f_Id: 'agent_sample_1',
      f_Name: t('极简搭咨询助手'),
      f_Icon: 'ant-design:key-outlined',
      f_Description: `${t('运用在业务应用端的大迈')}AI${t('智能咨询助手')}，${t('提供智能咨询问答')}。`,
      f_IsBuiltIn: 0,
      f_Published: 1,
      f_CreateUserName: t('管理员'),
      f_CreateUserId: 'admin',
      f_CreateDate: '',
      f_ModifyDate: '',
    },
  ];

  // 根据当前知识库 ID 加载关联智能体（后端未接入时回退示例数据）
  const loadAgents = async () => {
    const id = entity.value?.f_Id;
    try {
      // TODO
      // const res = await api.getRelatedAgents(id);
      // agentList.value = res || [];
      agentList.value = id ? sampleAgents : [];
    } catch (e) {
      agentList.value = sampleAgents;
    }
  };

  const handleClose = () => {
    close();
  };

  // 知识库配置保存后同步顶部展示名称
  const handleConfigSaved = (data: knowledgeEntity) => {
    knowledgeName.value = data.f_Name;
    // 同步保存后的配置（含默认分段方式 segMode/seg），供学习页作为分段策略默认值
    entity.value = { ...(entity.value || {}), ...data };
  };

  // 由列表页 layerRef.value.open 打开
  const open = async (param: { id: string; entity?: knowledgeEntity }, layerIns?: any) => {
    pageLayerIns = layerIns || null;
    // 重置页面状态
    activeMenu.value = 'docs';
    recallQuestion.value = '';
    recallList.value = [];
    // 先用列表传入的数据占位，避免首屏空白
    if (param.entity) {
      entity.value = param.entity;
      knowledgeName.value = param.entity.f_Name;
    }
    // 根据知识 ID 获取知识库字段
    try {
      const data = await api.get(param.id);
      if (data) {
        entity.value = data;
        knowledgeName.value = data.f_Name;
      }
    } catch (e) {
      // 后端未接入时回退到列表传入的数据
    }
    // 加载知识库文档内容
    await loadDocs();
    // 加载关联智能体
    await loadAgents();
  };

  // 关闭知识库管理页（通知父级 layer 关闭）
  const close = () => {
    pageLayerIns?.close?.();
  };

  // 暴露方法
  defineExpose({ open, close });
</script>

<style lang="less">
  .l-knowledge-design {
    display: flex;
    position: fixed;
    z-index: 1000;
    flex-direction: column;
    inset: 0;
    background: radial-gradient(700px 320px at 10% -80px, rgb(255 158 188 / 40%), transparent 65%),
      radial-gradient(600px 300px at 72% -60px, rgb(125 205 255 / 45%), transparent 65%),
      linear-gradient(180deg, #c9d6f2 0%, #d6def4 45%, #e9edf6 100%);

    .l-knowledge-design-header {
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

    .l-knowledge-design-logo {
      height: 28px;
    }

    .l-knowledge-design-name {
      max-width: 240px;
      overflow: hidden;
      color: #1f1f1f;
      font-size: 16px;
      font-weight: 700;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .l-knowledge-design-close {
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

    .l-knowledge-design-body {
      display: flex;
      box-sizing: border-box;
      flex: 1;
      min-height: 0;
      margin: 0 12px 12px;
      overflow: hidden;
      border-radius: 8px;
      background-color: var(--color-bg-container);
    }

    .l-knowledge-design-menu {
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      width: 180px;
      padding-top: 8px;
      overflow-y: auto;
      border-right: 1px solid var(--color-border-secondary, #f0f0f0);

      &-item {
        display: flex;
        align-items: center;
        padding: 12px 16px;
        transition:
          background-color 0.2s ease,
          color 0.2s ease;
        border-left: 3px solid transparent;
        color: var(--color-text);
        font-size: 14px;
        cursor: pointer;

        &:hover {
          background-color: var(--color-bg-text-hover, rgb(0 0 0 / 4%));
        }

        &.is-active {
          border-left-color: var(--color-primary, #1677ff);
          background-color: rgb(22 119 255 / 8%);
          color: var(--color-primary, #1677ff);
        }

        span {
          margin-left: 8px;
        }
      }
    }

    .l-knowledge-design-content {
      box-sizing: border-box;
      flex: 1;
      min-width: 0;
      padding: 16px;
      overflow: hidden;
    }

    .l-knowledge-design-docs {
      &-head {
        display: flex;
        align-items: center;
        gap: 6px;
      }

      &-title {
        color: var(--color-text);
        font-size: 16px;
        font-weight: 600;
      }

      &-tip {
        color: var(--color-text-quaternary, #bfbfbf);
        cursor: pointer;
      }

      &-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin: 16px 0;
      }

      &-filters {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      &-type {
        width: 120px;
      }

      &-search {
        width: 220px;
      }
    }

    .l-knowledge-design-agents {
      &-title {
        margin-bottom: 16px;
        padding-bottom: 16px;
        border-bottom: 1px solid var(--color-border-secondary, #f0f0f0);
        color: var(--color-text);
        font-size: 16px;
        font-weight: 600;
      }

      &-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 16px;
      }

      &-empty {
        padding-top: 80px;
      }
    }

    .l-knowledge-design-agent-card {
      display: flex;
      box-sizing: border-box;
      flex-direction: column;
      padding: 20px;
      transition: box-shadow 0.2s ease;
      border: 1px solid var(--color-border);
      border-radius: 8px;
      background-color: var(--color-bg-container);

      &:hover {
        box-shadow: 0 0 12px rgb(0 0 0 / 12%);
      }

      &-head {
        display: flex;
        align-items: center;
      }

      &-icon {
        display: flex;
        flex-shrink: 0;
        align-items: center;
        justify-content: center;
        width: 56px;
        height: 56px;
        margin-right: 12px;
        border-radius: 8px;
        background-color: var(--color-primary, #1677ff);
        color: #fff;
      }

      &-title {
        flex: 1;
        min-width: 0;
      }

      &-name {
        overflow: hidden;
        color: var(--color-text);
        font-size: 16px;
        font-weight: 600;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      &-creator {
        margin-top: 2px;
        color: var(--color-text-secondary);
        font-size: 13px;
      }

      &-desc {
        display: -webkit-box;
        margin-top: 16px;
        overflow: hidden;
        color: var(--color-text-secondary);
        font-size: 14px;
        line-height: 22px;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 3;
        line-clamp: 3;
      }
    }

    .l-knowledge-design-recall {
      display: flex;
      height: 100%;
      gap: 16px;

      &-panel {
        box-sizing: border-box;
        flex-shrink: 0;
        width: 420px;
        padding-right: 8px;
        overflow-y: auto;
      }

      &-result {
        box-sizing: border-box;
        flex: 1;
        min-width: 0;
        padding: 16px;
        overflow-y: auto;
        border-radius: 8px;
        background-color: var(--color-bg-layout, #f5f5f5);

        &.is-empty {
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }

      &-item {
        margin-bottom: 8px;
        padding: 16px;
        border-radius: 8px;
        background-color: var(--color-bg-container, #fff);

        & + & {
          margin-top: 16px;
        }

        &-top {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        &-id {
          color: var(--color-text);
          font-size: 15px;
          font-weight: 600;
        }

        &-count {
          color: var(--color-text-tertiary, #999);
          font-size: 14px;
        }

        &-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 10px;
          color: var(--color-text-secondary, #666);
          font-size: 14px;
        }

        &-doc {
          color: var(--color-primary, #1677ff);
          cursor: pointer;
        }

        &-divider {
          width: 1px;
          height: 14px;
          background-color: var(--color-border, #e8e8e8);
        }

        &-score {
          display: flex;
          align-items: center;
          gap: 4px;
        }
      }

      &-title {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 12px;
        color: var(--color-text);
        font-size: 16px;
        font-weight: 600;
      }

      &-input {
        margin-bottom: 12px;
      }

      &-btn {
        margin-bottom: 20px;
      }

      &-section {
        margin-bottom: 12px;
        color: var(--color-text);
        font-size: 14px;
        font-weight: 600;
      }

      &-modes {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-bottom: 20px;
      }

      &-mode {
        padding: 12px 16px;
        transition: all 0.2s ease;
        border: 1px solid var(--color-border-secondary, #f0f0f0);
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
          gap: 8px;
          color: var(--color-text);
          font-size: 14px;
          font-weight: 600;
        }

        &-tag {
          padding: 0 6px;
          border-radius: 4px;
          background-color: rgb(255 77 79 / 10%);
          color: #ff4d4f;
          font-size: 12px;
          font-weight: 400;
        }

        &-desc {
          margin-top: 6px;
          color: var(--color-text-secondary);
          font-size: 12px;
          line-height: 1.6;
        }
      }

      &-field {
        margin-bottom: 20px;

        &-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 4px;
        }

        &-label {
          display: flex;
          align-items: center;
          gap: 4px;
          color: var(--color-text);
          font-size: 14px;
        }
      }

      &-weight-legend {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 12px;

        .is-vector {
          color: var(--color-primary, #1677ff);

          &::before {
            content: '';
            display: inline-block;
            width: 6px;
            height: 6px;
            margin-right: 4px;
            border-radius: 50%;
            background-color: var(--color-primary, #1677ff);
          }
        }

        .is-fulltext {
          color: #52c41a;

          &::before {
            content: '';
            display: inline-block;
            width: 6px;
            height: 6px;
            margin-right: 4px;
            border-radius: 50%;
            background-color: #52c41a;
          }
        }
      }

      &-slider {
        display: flex;
        align-items: center;
        gap: 12px;

        .ant-slider {
          flex: 1;
          margin: 4px 0;
        }

        .ant-input-number {
          flex-shrink: 0;
          width: 72px;
        }
      }

      &-tree {
        width: 100%;
      }
    }
  }

  /* lr-modal 内容 teleport 到 body，样式需独立于页面根类名（同 .l-knowledge-design-add-menu） */
  .l-knowledge-design-upload {
    display: flex;
    box-sizing: border-box;
    flex-direction: column;
    height: 100%;
    padding: 16px;
    overflow: hidden;

    &-drag {
      flex-shrink: 0;
      margin-bottom: 12px;

      // 压缩 antd 默认大内边距，拖拽区更紧凑
      .ant-upload-btn {
        padding: 16px 0;
      }

      p.ant-upload-drag-icon {
        margin-bottom: 8px;
      }
    }

    &-drag-inner {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    &-tip {
      margin-bottom: 8px;
      color: var(--color-text-secondary);
      font-size: 12px;
      line-height: 20px;
      text-align: right;
    }

    // 列表占满剩余高度，文件多时内部滚动
    &-list {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
    }

    &-item {
      display: flex;
      position: relative;
      align-items: center;
      gap: 8px;
      padding: 8px;
      border-radius: 4px;
      color: var(--color-text);
      font-size: 14px;

      &:hover {
        background-color: var(--color-bg-text-hover, rgb(0 0 0 / 4%));
      }

      &-name {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      &-progress {
        flex-shrink: 0;
        width: 120px;
        margin: 0;
      }

      &-done {
        flex-shrink: 0;
        color: #52c41a;
      }

      &-error {
        flex-shrink: 0;
        color: #f56c6c;
      }
    }
  }

  .l-knowledge-design-add-menu {
    box-sizing: border-box;
    width: 320px;
    padding: 4px 0;
    border-radius: 8px;
    background-color: var(--color-bg-container);
    box-shadow:
      0 6px 16px 0 rgb(0 0 0 / 8%),
      0 3px 6px -4px rgb(0 0 0 / 12%),
      0 9px 28px 8px rgb(0 0 0 / 5%);

    &-item {
      padding: 10px 16px;
      transition: background-color 0.2s ease;
      cursor: pointer;

      &:hover {
        background-color: var(--color-bg-text-hover, rgb(0 0 0 / 4%));
      }

      & + & {
        border-top: 1px solid var(--color-border-secondary, #f0f0f0);
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
        margin-top: 4px;
        color: var(--color-text-secondary);
        font-size: 12px;
      }
    }
  }
</style>
