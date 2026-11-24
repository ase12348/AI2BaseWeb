<template>
  <div class="lr-block l-knowledge-page">
    <div class="l-knowledge-toolbar">
      <lr-button
        type="primary"
        iconName="ant-design:plus-outlined"
        @click="handleAdd"
        :label="$t('新建')"
      />
      <a-input-search
        v-model:value="keyword"
        :placeholder="$t('请输入关键词')"
        shape="round"
        allow-clear
        class="l-knowledge-search"
      />
    </div>

    <a-spin :spinning="loading" wrapper-class-name="l-knowledge-spin">
      <div class="l-knowledge-grid" v-if="filterList.length > 0">
        <div
          class="l-knowledge-card"
          v-for="item in filterList"
          :key="item.f_Id"
          @click="handleDesign(item)"
        >
          <div class="l-knowledge-card-head">
            <div class="l-knowledge-card-icon">
              <lr-icon :icon="item.f_Icon || 'ant-design:database-outlined'" :size="24" />
            </div>
            <div class="l-knowledge-card-title">
              <div class="l-knowledge-card-name" :title="item.f_Name">{{ item.f_Name }}</div>
              <div class="l-knowledge-card-creator">
                {{ item.f_CreateUserName }}/{{ item.f_CreateUserId }}
              </div>
            </div>
          </div>
          <div class="l-knowledge-card-desc" :title="item.f_Description">
            {{ item.f_Description }}
          </div>
          <div class="l-knowledge-card-foot">
            <div class="l-knowledge-card-time">
              <lr-icon icon="ant-design:clock-circle-outlined" :size="14" />
              <span>{{ item.f_CreateDate }}</span>
            </div>
            <div class="l-knowledge-card-actions">
              <span class="l-knowledge-action" :title="$t('编辑')" @click.stop="handleEdit(item)">
                <lr-icon icon="ant-design:edit-outlined" :size="16" />
              </span>
              <span class="l-knowledge-action" :title="$t('复制')" @click.stop="handleCopy(item)">
                <lr-icon icon="ant-design:copy-outlined" :size="16" />
              </span>
              <span
                class="l-knowledge-action is-danger"
                :title="$t('删除')"
                @click.stop="handleDelete(item)"
              >
                <lr-icon icon="ant-design:delete-outlined" :size="16" />
              </span>
            </div>
          </div>
        </div>
      </div>
      <a-empty v-else-if="!loading" :description="$t('暂无知识库')" class="l-knowledge-empty" />
    </a-spin>

    <lr-dynamic-layer ref="layerRef" />
  </div>
</template>
<script lang="ts" setup>
  import { computed, h, onMounted, ref } from 'vue';
  import { useMessage } from '@/core/hooks/useMessage';
  import { api, type knowledgeEntity } from '../../api/knowledge';
  import KnowledgeDesign from './design.vue';
  import { t } from '@/core/locales/setupI18n';

  const { createConfirm, success } = useMessage();

  const loading = ref(false);
  const keyword = ref('');
  const list = ref<knowledgeEntity[]>([]);
  const layerRef = ref();

  // 知识库示例
  const sampleList: knowledgeEntity[] = [
    {
      f_Id: 'knowledge_sample_1',
      f_Name: t('示例知识库'),
      f_Icon: 'ant-design:book-outlined',
      f_Description: `${t('这是一个示例知识库')}，${t('用于演示列表与表单效果')}，${t('接入后端接口后可直接删除')}。`,
      f_EmbedModel: t('向量模型'),
      f_IsBuiltIn: 1,
      f_Published: 1,
      f_CreateUserName: t('管理员'),
      f_CreateUserId: 'admin',
      f_CreateDate: '2026-10-08 10:00:00',
      f_ModifyDate: '',
    },
  ];

  // 关键词在前端实时过滤（名称/描述）
  const filterList = computed(() => {
    const key = keyword.value.trim().toLowerCase();
    if (!key) {
      return list.value;
    }
    return list.value.filter((item) =>
      [item.f_Name, item.f_Description].some((v) => (v || '').toLowerCase().includes(key)),
    );
  });

  const loadData = async () => {
    loading.value = true;
    try {
      // 接口异常或无数据时回退到示例列表
      // const res = await api.getList();
      list.value = sampleList;
    } finally {
      loading.value = false;
    }
  };

  // 打开表单弹窗
  const openForm = (param: Record<string, any>) => {
    layerRef.value.open({
      name: 'system_knowledge_form',
      width: 600,
      height: 420,
      afterOk: loadData,
      ...param,
    });
  };

  const handleAdd = () => {
    openForm({
      title: t('新建知识库'),
      param: { isEdit: false },
    });
  };

  const handleEdit = (row: knowledgeEntity) => {
    openForm({
      title: `${t('编辑知识库')}【${row.f_Name}】`,
      param: { isEdit: true, entity: row },
    });
  };

  // 点击卡片打开知识库管理页
  const handleDesign = (row: knowledgeEntity) => {
    layerRef.value.open({
      title: t('知识库管理'),
      name: h(KnowledgeDesign),
      type: 'full',
      hasHeader: false,
      hasBtns: false,
      destroyOnClose: true,
      param: { id: row.f_Id, entity: row },
    });
  };

  const handleCopy = (row: knowledgeEntity) => {
    createConfirm({
      title: t('提示'),
      iconType: 'warning',
      content: `${t('您确定复制')}【${row.f_Name}】${t('吗')}`,
      onOk: async () => {
        const res = await api.copy(row.f_Id);
        if (res) {
          success(t('复制成功'));
          loadData();
        }
      },
    });
  };

  const handleDelete = (row: knowledgeEntity) => {
    createConfirm({
      title: t('提示'),
      iconType: 'warning',
      content: `${t('您确定删除')}【${row.f_Name}】${t('吗')}`,
      onOk: async () => {
        const res = await api.remove(row.f_Id);
        if (res) {
          success(t('删除成功'));
          loadData();
        }
      },
    });
  };

  onMounted(() => {
    loadData();
  });
</script>

<style lang="less">
  .l-knowledge-page {
    display: flex;
    box-sizing: border-box;
    flex-direction: column;
    height: 100%;
    padding: 12px 16px;
    overflow: hidden;
    background-color: var(--color-bg-layout);

    .l-knowledge-toolbar {
      display: flex;
      flex-shrink: 0;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;

      .l-knowledge-search {
        width: 240px;
      }
    }

    .l-knowledge-spin {
      flex: 1;
      min-height: 0;
      overflow: hidden;

      .ant-spin-container {
        height: 100%;
        overflow-y: auto;
      }
    }

    .l-knowledge-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
      padding-bottom: 8px;
    }

    .l-knowledge-card {
      display: flex;
      box-sizing: border-box;
      flex-direction: column;
      padding: 16px;
      transition:
        box-shadow 0.2s ease,
        border-color 0.2s ease;
      border: 1px solid var(--color-border);
      border-radius: 8px;
      background-color: var(--color-bg-container);
      cursor: pointer;

      &:hover {
        border-color: var(--color-primary, #1677ff);
        box-shadow: 0 4px 12px rgb(0 0 0 / 8%);
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
        width: 48px;
        height: 48px;
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
        height: 44px;
        margin: 12px 0;
        overflow: hidden;
        color: var(--color-text-secondary);
        font-size: 13px;
        line-height: 22px;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
      }

      &-foot {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: auto;
      }

      &-time {
        display: flex;
        align-items: center;
        gap: 4px;
        color: var(--color-text-secondary);
        font-size: 12px;
      }

      &-actions {
        display: flex;
        align-items: center;
        gap: 12px;
      }
    }

    .l-knowledge-action {
      display: inline-flex;
      align-items: center;
      transition: color 0.2s ease;
      color: var(--color-text-secondary);
      cursor: pointer;

      &:hover {
        color: var(--color-primary, #1677ff);
      }

      &.is-danger:hover {
        color: #f56c6c;
      }
    }

    .l-knowledge-empty {
      padding-top: 80px;
    }
  }
</style>
