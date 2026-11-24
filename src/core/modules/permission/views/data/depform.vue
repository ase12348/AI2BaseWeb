<template>
  <lr-layout class="l-tab-page" :top="230">
    <template #top>
      <lr-panel>
        <lr-c-schema-form
          ref="formRef"
          :formConfig="{ labelWidth: '80px' }"
          @change="handleChange"
        />
      </lr-panel>
    </template>
    <lr-panel>
      <lr-department-panel ref="departmentRef" />
    </lr-panel>
  </lr-layout>
</template>
<script lang="ts" setup>
  import type { FormSchemaConfig } from '/#/form';
  import { computed, ref } from 'vue';
  import { deepClone } from '/@/core/utils/jcode';
  import { useAuth } from '/@/core/hooks/useAuth';
  import { useForm } from '/@/core/hooks/useForm';
  import { useMessage } from '@/core/hooks/useMessage';
  import { useOrganization } from '/@/core/hooks/data/useOrganization';
  import { api } from '@/core/modules/permission/api/data';
  import pageInfo from './page';
  import { t } from '@/core/locales/setupI18n';

  const { loadRoleList, getRoleList } = useOrganization();
  const { success } = useMessage();
  loadRoleList(false);
  const roleList = computed(() => {
    let data = getRoleList.value;
    return data.map((item) => {
      return { label: item.f_FullName, value: item.f_RoleId };
    });
  });
  const departmentRef = ref();
  const formConfigs: Record<string, FormSchemaConfig> = {
    f_Code: {
      rule: [{ required: true, message: t('请输入') }],
    },
    f_Name: { config: {}, rule: [{ required: true }] },
    f_ObjectType: {
      type: 'radio',
      config: {
        options: [
          { value: 1, label: t('角色') },
          { value: 2, label: t('用户') },
        ],
        defaultValue: 1,
      },
    },
    f_ObjectId: {
      type: 'select',
      config: {
        getInputType: (formData: Record<string, any>) => {
          if (formData.f_ObjectType == 1) {
            return 'select';
          } else {
            return 'lr-input-user';
          }
        },
        loadOptions: () => roleList,
      },
      rule: [{ required: true }],
    },
  };
  const handleChange = async (component: Record<string, any>) => {
    if (component.id == 'f_ObjectType') {
      setFormData({ main: { f_ObjectId: undefined } });
    }
  };
  const { getFormSchema } = useAuth(pageInfo, { formConfigs });
  const formRef = ref();
  const schemas = getFormSchema('depform');

  const { getFormData, setFormData, validateForm, resetForm } = useForm(formRef, { schemas });
  let isEdit = false;
  let keyValue = '';

  const saveForm = async ({ keyValue, isEdit }: Record<string, any>) => {
    const formData = getFormData().main;
    const selected = (await departmentRef.value.ok()) || [];

    let formula = {
      departmentIds: (selected || []).map((t) => t.f_DepartmentId),
    };
    formData.f_Formula = JSON.stringify(formula);
    formData.f_Type = 4;
    if (isEdit) {
      return await api.update(keyValue, formData);
    } else {
      return await api.add(formData);
    }
  };
  const selectList = ref([]);
  // 表单打开
  const open = async (param) => {
    isEdit = param.isEdit;
    keyValue = param.row?.f_Id;
    if (isEdit) {
      const entity = deepClone(param.row);
      if (entity) {
        const formula = JSON.parse(entity.f_Formula);
        selectList.value = formula.departmentIds;
        setFormData({ main: entity });
        setTableData();
      }
    }
  };
  const setTableData = () => {
    setTimeout(() => {
      if (departmentRef.value) {
        departmentRef.value.setData(selectList.value);
      } else {
        setTableData;
      }
    }, 500);
  };
  // 表单关闭前
  const beforeClose = () => {};

  // 表单点击确定按钮
  const ok = async () => {
    if (await validateForm()) {
      let res = await saveForm({ keyValue, isEdit });
      if (res) {
        success(t('保存成功'));
        return true;
      }
    }
  };

  // 表单关闭后
  const closed = () => {
    resetForm();
    departmentRef.value.closed();
  };

  // 暴露方法
  defineExpose({ open, beforeClose, ok, closed });
</script>
