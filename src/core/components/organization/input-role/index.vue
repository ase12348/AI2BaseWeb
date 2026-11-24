<template>
  <lr-input-layer
    v-model:value="myValue"
    icon="organization"
    :placeholder="readonly ? '' : placeholder"
    :readonly="readonly"
    :size="size"
    :clearable="clearable"
    valueKey="f_RoleId"
    labelKey="f_FullName"
    :columns="columns"
    :loadLayerData="loadData"
    :getText="getText"
    mode="client"
    @change="handleChange"
    ref="inputLayerRef"
  />
</template>
<script lang="ts" setup>
  import type { ColumnType } from '/#/page';
  import { watch, ref } from 'vue';
  import { useOrganization } from '/@/core/hooks/data/useOrganization';
  import { api as roleApi } from '@/core/modules/organization/api/role';

  const props = defineProps({
    /**
     * 输入值
     */
    modelValue: {
      type: String,
      default: undefined,
    },
    /**
     * 占位符
     */
    placeholder: {
      type: String,
      default: '请选择角色',
    },
    /**
     * @zh 是否禁用。
     */
    readonly: Boolean,
    /**
     * @zh 选框尺寸
     */
    size: {
      type: String as PropType<'small' | 'large' | 'middle'>,
    },
    /**
     * @zh 是否可以清除
     * @defaultValue true
     */
    clearable: {
      type: Boolean,
      default: true,
    },
  });
  const inputLayerRef = ref();
  let isChange = false;
  const emit = defineEmits(['update:modelValue', 'change']);

  const { loadRole, getRole } = useOrganization();

  const myValue = ref<string | undefined>();

  const columns: ColumnType[] = [
    { label: '编号', prop: 'f_EnCode', minWidth: 110, isKeyword: true },
    { label: '名称', prop: 'f_FullName', minWidth: 120, isKeyword: true },
    {
      label: '分类',
      prop: 'f_Category',
      width: 140,
      align: 'center',
      isFilter: true,
      config: {
        dataType: 'dataItem',
        dataCode: 'rolecategory',
        filteProp: 'roleId',
      },
    },
  ];

  const loadData = async (param) => {
    let res = await roleApi.getList();
    if (param.roleId) {
      res = res.filter((t) => t.f_Category == param.roleId);
    }
    return res;
  };

  const getText = (value) => {
    loadRole(value);
    const entity = getRole.value[value];
    if (isChange && entity) {
      isChange = false;
      emit('change', { value: myValue.value, data: entity });
    }
    return entity?.f_FullName || value;
  };

  const handleChange = ({ value, data }: { value: string; data: any }) => {
    myValue.value = value;
    emit('update:modelValue', value);
    emit('change', { value, data });
  };

  watch(
    () => props.modelValue,
    async (val) => {
      myValue.value = val;
    },
    { immediate: true },
  );
</script>
