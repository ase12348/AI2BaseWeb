<template>
  <div class="lr-block l-agent-page">
    <div class="l-agent-toolbar">
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
        class="l-agent-search"
      />
    </div>

    <a-spin :spinning="loading" wrapper-class-name="l-agent-spin">
      <div class="l-agent-grid" v-if="filterList.length > 0">
        <div
          class="l-agent-card"
          v-for="item in filterList"
          :key="item.f_Id"
          @click="handleDesign(item)"
        >
          <div class="l-agent-card-head">
            <div class="l-agent-card-icon">
              <lr-icon :icon="item.f_Icon || 'ant-design:robot-outlined'" :size="24" />
            </div>
            <div class="l-agent-card-title">
              <div class="l-agent-card-name" :title="item.f_Name">{{ item.f_Name }}</div>
              <div class="l-agent-card-creator">
                {{ item.f_CreateUserName }}/{{ item.f_CreateUserId }}
              </div>
            </div>
          </div>
          <div class="l-agent-card-desc" :title="item.f_Description">
            {{ item.f_Description }}
          </div>
          <div class="l-agent-card-foot">
            <div class="l-agent-card-tags">
              <a-tag v-if="item.f_IsBuiltIn" color="blue">{{ $t('内置') }}</a-tag>
              <a-tag v-if="item.f_Published" color="green">{{ $t('已发布') }}</a-tag>
            </div>
            <div class="l-agent-card-actions">
              <span class="l-agent-action" :title="$t('编辑')" @click.stop="handleEdit(item)">
                <lr-icon icon="ant-design:edit-outlined" :size="16" />
              </span>
              <span class="l-agent-action" :title="$t('复制')" @click.stop="handleCopy(item)">
                <lr-icon icon="ant-design:copy-outlined" :size="16" />
              </span>
              <span
                class="l-agent-action is-danger"
                :title="$t('删除')"
                @click.stop="handleDelete(item)"
              >
                <lr-icon icon="ant-design:delete-outlined" :size="16" />
              </span>
            </div>
          </div>
        </div>
      </div>
      <a-empty v-else-if="!loading" :description="$t('暂无智能体')" class="l-agent-empty" />
    </a-spin>

    <lr-dynamic-layer ref="layerRef" />

    <!-- 智能体设计页（点击卡片打开） -->
    <agent-design
      v-if="designVisible && designEntity"
      :entity="designEntity"
      @close="designVisible = false"
    />
  </div>
</template>
<script lang="ts" setup>
  import { computed, onMounted, ref } from 'vue';
  import { useMessage } from '@/core/hooks/useMessage';
  import { api, type agentEntity } from './data';
  import AgentDesign from './design.vue';
  import { t } from '@/core/locales/setupI18n';

  const { createConfirm, success } = useMessage();

  const loading = ref(false);
  const keyword = ref('');
  const list = ref<agentEntity[]>([]);
  const layerRef = ref();

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
      list.value = await api.getList();
    } finally {
      loading.value = false;
    }
  };

  // 打开表单弹窗
  const openForm = (param: Record<string, any>) => {
    layerRef.value.open({
      name: 'system_agent_form',
      width: 600,
      height: 420,
      afterOk: loadData,
      ...param,
    });
  };

  const handleAdd = () => {
    openForm({
      title: t('新建智能体'),
      param: { isEdit: false },
    });
  };

  const handleEdit = (row: agentEntity) => {
    openForm({
      title: `${t('编辑智能体')}【${row.f_Name}】`,
      param: { isEdit: true, entity: row },
    });
  };

  // 点击卡片打开设计页
  const designVisible = ref(false);
  const designEntity = ref<agentEntity>();
  const handleDesign = (row: agentEntity) => {
    designEntity.value = row;
    designVisible.value = true;
  };

  const handleCopy = (row: agentEntity) => {
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

  const handleDelete = (row: agentEntity) => {
    createConfirm({
      title: t('提示'),
      iconType: 'warning',
      content: `${t('您确定删除')}【${row.f_Name}】${t('吗')}`,
      onOk: async () => {
        const res = await api.remove(row.f_Id);
        if (res) {
          success('删除成功');
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
  .l-agent-page {
    display: flex;
    box-sizing: border-box;
    flex-direction: column;
    height: 100%;
    padding: 12px 16px;
    overflow: hidden;
    background-color: var(--color-bg-layout);

    .l-agent-toolbar {
      display: flex;
      flex-shrink: 0;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;

      .l-agent-search {
        width: 240px;
      }
    }

    .l-agent-spin {
      flex: 1;
      min-height: 0;
      overflow: hidden;

      .ant-spin-container {
        height: 100%;
        overflow-y: auto;
      }
    }

    .l-agent-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
      padding-bottom: 8px;
    }

    .l-agent-card {
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

      &-tags {
        display: flex;
        align-items: center;
      }

      &-actions {
        display: flex;
        align-items: center;
        gap: 12px;
      }
    }

    .l-agent-action {
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

    .l-agent-empty {
      padding-top: 80px;
    }
  }
</style>
