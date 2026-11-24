<template>
  <div>
    <lr-input-layer
      v-model:value="myValue"
      icon="users"
      :placeholder="placeholder"
      :readonly="readonly || ['create', 'modify'].includes(mode)"
      :size="size"
      :clearable="clearable"
      valueKey="f_UserId"
      labelKey="f_RealName"
      :columns="columns"
      :is-page="true"
      sidx="F_SortCode ASC,F_CreateDate DESC"
      :loadLayerData="loadData"
      :getText="getText"
      @change="handleChange"
      ref="inputLayerRef"
      :isMultiSelect="isMultiSelect"
      :layerWidth="1000"
      :layerOpenSelectShow="true"
    />
  </div>
</template>
<script lang="ts" setup>
  import type { ColumnType } from '/#/page';
  import { ref, watch, h, computed } from 'vue';
  import { Tag } from 'ant-design-vue';
  import { isNullOrEmpty } from '@/core/utils/jcode';
  import { api as userApi } from '@/core/modules/organization/api/user';
  import { useOrganization } from '/@/core/hooks/data/useOrganization';

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
      default: '请选择人员',
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
     * @zh 限定部门
     */
    departmentId: String,
    /**
     * @zh 限定人员范围 1:无限制 2:登录者公司 3:登录者部门 4:自定义
     * @defaultValue 4
     */
    limits: String,
    /**
     * @zh 部门层级编码
     */
    departmentDeepNum: String,
    /**
     * @zh 模式，用于区分编辑人员还是创建人员还是选择框
     */
    mode: {
      type: String as PropType<'default' | 'create' | 'modify'>,
      default: 'default',
    },
    /**
     * @zh 是否编辑状态（相对于新建）,对于编辑人员还是创建人员有用
     */
    isEditState: Boolean,
    /**
     * @zh 是否多选
     * @defaultValue false
     */
    isMultiSelect: Boolean,
  });
  const inputLayerRef = ref();
  let isChange = false;
  const emit = defineEmits(['update:modelValue', 'change']);

  const { loadUser, getUser, getLoginInfo } = useOrganization();

  const myValue = ref<string | undefined>();
  const myComponentId = computed(() => {
    if (props.companyId) {
      return props.companyId;
    }
    if (props.limits === '2' || props.limits === '3') {
      return getLoginInfo.value.companyId;
    }
    return props.companyId;
  });

  const myDepartmentId = computed(() => {
    if (props.departmentId) {
      return props.departmentId;
    }
    if (props.limits === '3') {
      return getLoginInfo.value.departmentId;
    }
    return props.departmentId;
  });

  const columns: ColumnType[] = [
    { label: '姓名', prop: 'f_RealName', minWidth: 110, isKeyword: true },
    { label: '账号', prop: 'f_Account', width: 110, isKeyword: true },
    {
      label: '类别',
      prop: 'f_UserType',
      width: 80,
      align: 'center',
      isFilter: true,
      config: { dataType: 'dataItem', dataCode: 'usercategory', filteProp: 'userType' },
    },
    {
      label: '公司',
      prop: 'f_CompanyId',
      width: 140,
      isFilter: !props.companyId && !myComponentId.value && !props.departmentDeepNum,
      config: {
        filteProp: 'companyId',
        dataType: 'company',
      },
    },
    {
      label: '部门',
      prop: 'f_DepartmentId',
      width: 140,
      isFilter: true && !myDepartmentId.value && !props.departmentDeepNum,
      config: {
        dataType: 'department',
        filteProp: 'departmentId',
        upValue: myComponentId.value,
        upId: 'f_CompanyId',
      },
    },
    { label: '手机', prop: 'f_Mobile', width: 108, isKeyword: true },
    {
      label: '性别',
      prop: 'f_Gender',
      width: 64,
      align: 'center',
      config: {
        formatter: ({ row }) => {
          return h(
            Tag,
            {
              bordered: false,
              color: row.f_Gender == 1 ? 'processing' : 'error',
            },
            () => (row.f_Gender == 1 ? '男' : '女'),
          );
        },
      },
    },
  ];

  const loadData = async (param) => {
    param.type = 0; // 显示在职 试用人员
    if (myComponentId.value) {
      param.companyId = myComponentId.value;
    }
    if (myDepartmentId.value) {
      param.departmentId = myDepartmentId.value;
    }

    if (props.departmentDeepNum) {
      param.departmentDeepNum = props.departmentDeepNum;
    }

    const res = await userApi.getPages(param);
    return res;
  };

  const getText = (value) => {
    if (!value) {
      return value;
    }
    loadUser(value);
    const valueList = value.split(',');
    const userList: any[] = [];
    const labelList: string[] = [];
    valueList.forEach((v) => {
      const user = getUser.value[v];
      if (user) {
        labelList.push(user?.f_RealName);
        userList.push(user);
      } else {
        labelList.push(v);
      }
    });

    if (isChange && userList.length > 0) {
      isChange = false;
      emit('change', { value: myValue.value, data: props.isMultiSelect ? userList : userList[0] });
    }

    return String(labelList);
  };

  const handleChange = ({ value, data }: { value: string; data: any }) => {
    myValue.value = value;
    emit('update:modelValue', value);
    emit('change', { value, data });
  };

  watch(
    () => props.modelValue,
    async (val) => {
      if (isNullOrEmpty(val) || props.mode === 'modify') {
        switch (props.mode) {
          case 'create':
            if (!props.isEditState && !props.readonly) {
              myValue.value = getLoginInfo.value.id;
              emit('update:modelValue', myValue.value);
              isChange = true;
              return;
            }
            break;
          case 'modify':
            if (!props.readonly) {
              myValue.value = getLoginInfo.value.id;
              emit('update:modelValue', myValue.value);
              isChange = true;
              return;
            }
            break;
          default:
            if (props.isLogin) {
              myValue.value = getLoginInfo.value.id;
              emit('update:modelValue', myValue.value);
              isChange = true;
              return;
            }
            break;
        }
        myValue.value = getLoginInfo.value.id;
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
  watch(
    () => props.departmentId,
    () => {
      inputLayerRef.value && inputLayerRef.value.resetData();
    },
  );
  watch(
    () => props.departmentDeepNum,
    () => {
      inputLayerRef.value && inputLayerRef.value.resetData();
    },
  );
</script>
