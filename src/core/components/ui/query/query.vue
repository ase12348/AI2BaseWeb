<template>
  <div class="query-panel">
    <div class="query-top-panel">
      <a-form class="query-top-panel-left">
        <template v-for="searchInputItem of searchInputList" :key="searchInputItem.id">
          <a-form-item
            v-if="isOpenMoreSearch || searchInputItem.config?.isQuickSearch"
            :label="$t(searchInputItem.config?.label || '')"
            style="margin-left: 8px"
          >
            <div
              :style="{
                width: `${searchInputItem.config?.width || 160}px`,
                display: 'inline-block',
              }"
            >
              <lr-c-input
                v-model="searchForm[searchInputItem.id]"
                :type="
                  searchInputItem.config?.getInputType
                    ? searchInputItem.config?.getInputType(searchForm)
                    : searchInputItem.type
                "
                :style="{ width: `${searchInputItem.config?.width || 160}px` }"
                :config="getInputConfig(searchInputItem.config)"
                @change="hanleSearch(searchInputItem.config?.immediate)"
              />
            </div>
          </a-form-item>
        </template>
        <a-space
          v-if="searchInputList.length > 0"
          align="start"
          style="margin: 0; margin-top: 9px; margin-left: 8px"
        >
          <lr-button :loading="tableLoading" type="primary" @click="hanleSearch(true)">{{
            $t('查询')
          }}</lr-button>
          <lr-button @click="hanleResetSearch()">{{ $t('重置') }}</lr-button>
          <lr-button v-if="isNeedMoreSearch" type="link" @click="handleToggleMoreSearch()">{{
            $t(isOpenMoreSearch ? '收起' : '展开')
          }}</lr-button>
        </a-space>
      </a-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, computed, PropType, watch } from 'vue';
  import { createNamespace } from '../utils/components';
  import { clearData } from '../utils/method';

  defineOptions({ name: createNamespace('query').name });

  const props = defineProps({
    /**
     * @zh 查询框
     */
    searchInputList: {
      type: Array as PropType<Record<string, any>[]>,
      default: () => [],
    },
  });

  const emit = defineEmits({
    /**
     * @zh 点击查询时触发
     * @property Record<string, any> searchForm
     */
    search: (searchForm: Record<string, any>) => true,
  });

  // 参数定义
  const tableLoading = ref(false);
  const searchWord = ref('');
  const searchForm = reactive<Record<string, any>>({});

  const getInputConfig = (config: Record<string, any>) => {
    const myConfig = { ...config };
    if (myConfig.getUpConfig) {
      const _config = config.getUpConfig({
        formData: searchForm,
        config: myConfig,
      });
      if (_config) {
        Object.keys(_config).forEach((key) => {
          myConfig[key] = _config[key];
        });
      }
    }
    return myConfig;
  };

  const hanleSearch = async (isSearch: boolean) => {
    if (isSearch) {
      emit('search', searchForm);
    }
  };

  // 重置
  const hanleResetSearch = async () => {
    searchWord.value = '';
    setDefaultSearchForm();
    await hanleSearch(true);
  };

  // 高级查询
  const isNeedMoreSearch = computed(() => {
    if (
      props.searchInputList.length > 0 &&
      props.searchInputList.findIndex((t: any) => t.config?.isQuickSearch !== true) > -1
    ) {
      return true;
    }
    return false;
  });
  const isOpenMoreSearch = ref(false);
  const handleToggleMoreSearch = () => {
    isOpenMoreSearch.value = !isOpenMoreSearch.value;
  };

  // 查询值
  const setDefaultSearchForm = () => {
    clearData(searchForm);
    props.searchInputList.forEach((t: any) => {
      searchForm[t.id] = t.config?.defaultValue;
    });
  };
  // 修改查询值
  const pSetSearchFormData = (id: string, value: any) => {
    searchForm[id] = value;
  };
  // 获取查询值
  const pGetSearchFormData = (id: string) => searchForm[id];

  watch(
    () => props.searchInputList,
    () => {
      setDefaultSearchForm();
    },
    {
      immediate: true,
    },
  );

  /**
   * @zh 修改查询值
   * @public
   */
  function setSearchFormData(id: string, value: any) {
    pSetSearchFormData(id, value);
  }

  /**
   * @zh 获取查询值
   * @public
   */
  function getSearchFormData(id: string) {
    return pGetSearchFormData(id);
  }

  defineExpose({ setSearchFormData, getSearchFormData });
</script>

<style lang="less">
  @import './query.less';
</style>
