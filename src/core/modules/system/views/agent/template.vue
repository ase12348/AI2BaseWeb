<template>
  <!-- 提示词库弹窗 -->
  <lr-modal
    v-model:visible="modalVisible"
    :title="$t('提示词库')"
    :width="1060"
    :height="640"
    :hasCloseBtn="false"
    :btnText="$t('插入提示词')"
    @ok="handleInsert"
  >
    <div class="lr-block l-prompt-lib">
      <!-- 顶部：页签 + 搜索 + 新建 -->
      <div class="l-prompt-lib-toolbar">
        <div class="l-prompt-lib-tabs">
          <span
            v-for="tab in tabs"
            :key="tab.key"
            :class="['l-prompt-lib-tab', { 'is-active': tab.key === activeType }]"
            @click="switchType(tab.key)"
          >
            {{ $t(tab.label) }}
          </span>
        </div>
        <div class="l-prompt-lib-tools">
          <a-input-search
            v-model:value="keyword"
            :placeholder="$t('请输入关键词')"
            allow-clear
            class="l-prompt-lib-search"
          />
          <lr-button
            type="primary"
            iconName="ant-design:plus-outlined"
            :label="$t('新建提示词')"
            @click="handleAdd"
          />
        </div>
      </div>

      <!-- 主体：左侧列表 + 右侧内容预览 -->
      <div class="l-prompt-lib-body">
        <div class="l-prompt-lib-list">
          <div
            v-for="item in filterList"
            :key="item.f_Id"
            :class="['l-prompt-lib-item', { 'is-active': item.f_Id === current?.f_Id }]"
            @click="currentId = item.f_Id"
          >
            <div class="l-prompt-lib-item-name" :title="item.f_Name">{{ item.f_Name }}</div>
            <div class="l-prompt-lib-item-desc" :title="item.f_Description">
              {{ item.f_Description }}
            </div>
          </div>
          <a-empty v-if="filterList.length === 0" :description="$t('暂无提示词')" />
        </div>
        <div class="l-prompt-lib-preview">{{ current?.f_Content || '' }}</div>
      </div>
    </div>
    <template #btn>
      <lr-button size="mini" @click="handleCopy">{{ $t('复制提示词') }}</lr-button>
    </template>
  </lr-modal>

  <lr-dynamic-layer ref="layerRef" />
</template>
<script lang="ts" setup>
  import { computed, h, ref, watch } from 'vue';
  import { useMessage } from '@/core/hooks/useMessage';
  import { promptApi, type promptEntity } from './data';
  import PromptForm from './promptForm.vue';
  import { t } from '@/core/locales/setupI18n';

  const props = defineProps<{ visible: boolean }>();
  const emit = defineEmits(['update:visible', 'insert']);

  const { success, warning } = useMessage();

  const modalVisible = computed({
    get: () => props.visible,
    set: (v) => emit('update:visible', v),
  });

  // 系统内置提示词（Mock，f_Type: 0 系统分类）
  const systemPrompts: promptEntity[] = [
    {
      f_Id: 'sys_general',
      f_Type: 0,
      f_Name: '通用结构',
      f_Description: '适用于多种场景的提示词结构，可根据业务需要快速调整扩展',
      f_Content: `# 角色： 角色名称
角色概述和主要职责的一句话描述

## 目标：
角色的工作目标，如果有多目标可以分点列出，但建议更聚焦1-2个目标

## 技能：
1. 为了实现目标，角色需要具备的技能1
2. 为了实现目标，角色需要具备的技能2
3. 为了实现目标，角色需要具备的技能3

## 工作流：
1. 描述角色工作流程的第一步
2. 描述角色工作流程的第二步
3. 描述角色工作流程的第三步

## 输出格式：
如果对角色的输出格式有特定要求， 可以在这里强调并举例说明想要的输出格式

## 限制：
1. 限制1：描述角色对话过程中需要遵循的限制1
2. 限制2：描述角色对话过程中需要遵循的限制2
3. 限制3：描述角色对话过程中需要遵循的限制3`,
    },
    {
      f_Id: 'sys_task',
      f_Type: 0,
      f_Name: '任务执行',
      f_Description: '适用于有明确的工作步骤的任务执行场景，保证执行完整可追踪',
      f_Content: `# 角色： 任务执行助手
一个高效严谨的任务执行助手，负责按照明确的工作步骤逐步完成任务

## 目标：
- 按照既定步骤拆解并执行任务，确保每一步产出符合标准

## 技能：
1. 能够将复杂任务拆解为可执行的具体步骤
2. 能够对每一步的执行结果进行质量检查
3. 能够及时汇报执行进度与风险

## 工作流：
1. 接收任务，确认任务目标与约束条件
2. 按照步骤清单逐步执行，并记录每步的关键产出
3. 汇总执行结果，给出后续建议

## 输出格式：
按照“步骤编号 - 执行动作 - 执行结果”的结构化格式输出

## 限制：
1. 不跳过步骤、不越权执行
2. 信息不足时先向用户澄清，再继续执行`,
    },
    {
      f_Id: 'sys_role',
      f_Type: 0,
      f_Name: '角色扮演',
      f_Description: '适用于聊天陪伴、互动娱乐场景，塑造性格鲜明的对话角色',
      f_Content: `# 角色： 角色名称
一个性格鲜明的聊天陪伴角色，适用于聊天陪伴、互动娱乐场景

## 性格特点：
- 描述角色的性格、说话语气与口头禅

## 背景故事：
- 描述角色的出身、经历，让回答更有代入感

## 目标：
- 与用户建立情感连接，提供轻松愉快的互动体验

## 工作流：
1. 理解用户的情绪与话题
2. 以角色的口吻与视角进行回应
3. 适时引导话题，保持互动趣味性

## 限制：
1. 始终保持人设，不出戏、不暴露AI身份
2. 拒绝回答与角色设定无关的敏感话题`,
    },
    {
      f_Id: 'sys_skill',
      f_Type: 0,
      f_Name: '技能调用',
      f_Description: '适用于调用插件、工作流获取信息后完成复杂任务的场景',
      f_Content: `# 角色： 技能调度助手
一个善于调用插件、工作流获取信息并完成复杂任务的助手

## 目标：
- 根据用户诉求准确选择并调用可用技能，整合结果给出答案

## 可用技能：
1. 技能1：描述技能的功能与适用场景
2. 技能2：描述技能的功能与适用场景
3. 技能3：描述技能的功能与适用场景

## 工作流：
1. 分析用户意图，判断需要调用的技能
2. 以正确的参数调用技能并获取返回结果
3. 整合技能返回结果，生成最终回答

## 限制：
1. 只调用授权范围内的技能
2. 调用失败时说明原因并给出替代方案`,
    },
    {
      f_Id: 'sys_knowledge',
      f_Type: 0,
      f_Name: '基于知识库回答',
      f_Description: '适用于客服等基于特定知识库回答问题的场景，答案准确可追溯',
      f_Content: `# 角色： 知识库问答客服
一个基于特定知识库回答问题的客服角色，答案准确、可追溯

## 目标：
- 仅基于知识库内容回答用户问题，保证答案准确可追溯

## 技能：
1. 能够快速检索知识库并定位相关内容
2. 能够用简洁易懂的语言组织答案
3. 能够在问题模糊时引导用户补充信息

## 工作流：
1. 理解用户问题，提取关键信息
2. 检索知识库，匹配相关条目
3. 基于知识库内容组织答案并注明出处

## 限制：
1. 不编造知识库中不存在的内容
2. 无法回答时如实告知并转接人工客服`,
    },
  ];

  // 提示词数据（系统内置 + 接口个人数据）
  const prompts = ref<promptEntity[]>([...systemPrompts]);

  // 刷新个人提示词（含设计页“提交到提示词库”保存的数据）
  const loadData = async () => {
    const list = await promptApi.getList();
    prompts.value = [...systemPrompts, ...list];
  };
  watch(
    () => props.visible,
    (v) => {
      if (v) {
        loadData();
      }
    },
  );

  // 页签与关键词过滤
  const tabs: { key: 'system' | 'personal'; label: string }[] = [
    { key: 'system', label: t('系统') },
    { key: 'personal', label: t('个人') },
  ];
  const activeType = ref<'system' | 'personal'>('system');
  const keyword = ref('');
  const currentId = ref('');

  const filterList = computed(() => {
    const key = keyword.value.trim().toLowerCase();
    const type = activeType.value === 'personal' ? 1 : 0;
    return prompts.value.filter((item) => {
      if (item.f_Type !== type) {
        return false;
      }
      if (!key) {
        return true;
      }
      return [item.f_Name, item.f_Description].some((v) => (v || '').toLowerCase().includes(key));
    });
  });

  // 当前选中项（未命中时回退到列表第一条）
  const current = computed(
    () => filterList.value.find((item) => item.f_Id === currentId.value) || filterList.value[0],
  );

  const switchType = (type: 'system' | 'personal') => {
    activeType.value = type;
    keyword.value = '';
    currentId.value = '';
  };

  // 复制提示词
  const handleCopy = async () => {
    if (!current.value) {
      warning(t('请先选择提示词'));
      return;
    }
    try {
      await navigator.clipboard.writeText(current.value.f_Content);
      success(t('已复制到剪贴板'));
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  // 插入提示词
  const handleInsert = () => {
    if (!current.value) {
      warning(t('请先选择提示词'));
      return;
    }
    emit('insert', current.value.f_Content);
    modalVisible.value = false;
  };

  // 新建提示词：打开统一表单弹窗（promptForm），分类跟随当前页签
  const layerRef = ref();
  const handleAdd = () => {
    const type = activeType.value === 'personal' ? 1 : 0;
    layerRef.value.open({
      title: t('新建提示词'),
      name: h(PromptForm),
      width: 620,
      height: 600,
      btnText: t('确定'),
      param: { type },
      afterOk: async () => {
        await loadData();
        keyword.value = '';
        const list = prompts.value.filter((item) => item.f_Type === type);
        currentId.value = list[list.length - 1]?.f_Id || '';
      },
    });
  };
</script>

<style lang="less">
  .l-prompt-lib {
    display: flex;
    box-sizing: border-box;
    flex-direction: column;
    height: 100%;
    padding: 0 16px;
    overflow: hidden;

    &-toolbar {
      display: flex;
      flex-shrink: 0;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--color-border);
    }

    &-tabs {
      display: flex;
      align-items: center;
      gap: 28px;
      height: 48px;
    }

    &-tab {
      position: relative;
      color: var(--color-text);
      font-size: 15px;
      line-height: 48px;
      cursor: pointer;

      &.is-active {
        color: var(--color-primary, #1677ff);
        font-weight: 600;

        &::after {
          content: '';
          position: absolute;
          inset: auto 0 0;
          height: 2px;
          background: currentcolor;
        }
      }
    }

    &-tools {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    &-search {
      width: 260px;
    }

    &-body {
      display: flex;
      flex: 1;
      gap: 16px;
      min-height: 0;
      padding: 16px 0;
    }

    &-list {
      flex: 0 0 300px;
      overflow-y: auto;
    }

    &-item {
      margin-bottom: 8px;
      padding: 12px;
      border-radius: 6px;
      cursor: pointer;

      &:hover {
        background-color: var(--color-fill-quaternary, #f5f7fa);
      }

      &.is-active {
        background-color: var(--color-fill-tertiary, #eef1f6);
      }

      &-name {
        overflow: hidden;
        color: var(--color-text);
        font-size: 15px;
        font-weight: 500;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      &-desc {
        margin-top: 8px;
        overflow: hidden;
        color: var(--color-text-secondary);
        font-size: 13px;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    &-preview {
      flex: 1;
      min-width: 0;
      padding: 16px 20px;
      overflow-y: auto;
      border: 1px solid var(--color-border);
      border-radius: 6px;
      background-color: var(--color-bg-container);
      color: var(--color-text);
      font-size: 14px;
      line-height: 28px;
      white-space: pre-wrap;
    }
  }
</style>
