<template>
  <lr-input-layer
    v-model:value="myValue"
    icon="organization"
    :placeholder="readonly ? '' : placeholder"
    :readonly="readonly || ['create'].includes(mode)"
    :size="size"
    :clearable="clearable"
    :valueKey="valueKey"
    idKey="f_DepartmentId"
    labelKey="f_FullName"
    pidKey="f_ParentId"
    :isTree="true"
    :defaultExpandAll="false"
    :columns="columns"
    :loadLayerData="loadData"
    :getText="getText"
    :layerOpenSelectShow="true"
    :isMultiSelect="isMultiSelect"
    @change="handleChange"
    ref="inputLayerRef"
  />
</template>
<script lang="ts" setup>
  import type { ColumnType } from '/#/page';
  import { watch, ref } from 'vue';
  import { isNullOrEmpty } from '@/core/utils/jcode';
  import { useOrganization } from '/@/core/hooks/data/useOrganization';
  import { api as departmentApi } from '@/core/modules/organization/api/department';

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
      default: '请选择部门',
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
    /**
     * @zh 是否选中登录者
     */
    isLogin: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 限定公司
     */
    companyId: String,

    /**
     * @zh 限定限定部门
     */
    departmentId: String,

    /**
     * @zh 是否一定需要公司
     */
    companyRequired: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 模式，用于区分编辑人员还是创建人员还是选择框
     */
    mode: {
      type: String as PropType<'default' | 'create'>,
      default: 'default',
    },
    valueKey: {
      type: String,
      default: 'f_DepartmentId',
    },
    /**
     * @zh 过滤部门
     */
    filterIds: String,
    /**
     * @zh 是否多选
     * @defaultValue false
     */
    isMultiSelect: Boolean,
  });
  const inputLayerRef = ref();
  let isChange = false;
  const emit = defineEmits(['update:modelValue', 'change']);

  const { loadDepartment, getDepartment, getDepartmentTree, getLoginInfo } = useOrganization();

  const myValue = ref<string | undefined>();

  const columns: ColumnType[] = [
    { label: '名称', prop: 'f_FullName', minWidth: 150, isKeyword: true },
    { label: '编码', prop: 'f_EnCode', width: 100 },
    {
      label: '公司',
      prop: 'f_CompanyId',
      width: 150,
      isFilter: !props.companyId && !props.departmentId,
      config: {
        filteProp: 'companyId',
        dataType: 'company',
      },
    },
    {
      label: '负责人',
      prop: 'f_Manager',
      width: 80,
      align: 'center',
      config: { dataType: 'user' },
    },
  ];

  const loadData = async (param) => {
    if (props.companyRequired && isNullOrEmpty(props.companyId)) {
      return [];
    }
    // console.log(param, 'param');
    let res = await departmentApi.getList(
      props.companyId || param.companyId || 'all',
      param.keyword,
      props.departmentId,
    );
    if (props.filterIds) {
      res = getDepartmentTree(res, '', props.filterIds.split(','));
    }
    // console.log(res, 'res');
    return res;
  };

  const getText = (value) => {
    if (props.isMultiSelect) {
      const valueList = value?.split(',') || [];
      const nameList: any[] = [];
      valueList.forEach((val) => {
        loadDepartment(val);
        const entity = getDepartment.value[val];
        if (entity) {
          nameList.push(entity);
        }
      });
      if (valueList.length === nameList.length) {
        if (isChange) {
          isChange = false;
          emit('change', { value: myValue.value, data: nameList });
        }
      }

      return nameList.map((item) => item.f_FullName).join(',');
    } else {
      loadDepartment(value);
      const entity = getDepartment.value[value];
      if (isChange && entity) {
        isChange = false;
        emit('change', { value: myValue.value, data: entity });
      }
      return entity?.f_FullName || value;
    }
  };

  const handleChange = ({ value, data }: { value: string; data: any }) => {
    myValue.value = value;
    emit('update:modelValue', value);
    emit('change', { value, data });
  };

  watch(
    () => props.modelValue,
    async (val) => {
      if (isNullOrEmpty(val)) {
        if (props.isLogin || (props.mode === 'create' && !props.readonly)) {
          myValue.value = getLoginInfo.value.departmentId;
          emit('update:modelValue', myValue.value);
          isChange = true;
          return;
        }
      }

      myValue.value = val;
    },
    { immediate: true },
  );

  watch(
    () => props.companyId,
    () => {
      inputLayerRef.value && inputLayerRef.value.resetData();
    },
  );
</script>
