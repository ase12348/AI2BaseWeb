<template>
  <lr-c-schema-form ref="formRef" :formConfig="{ labelWidth: '80px' }" />
</template>
<script lang="ts" setup>
  import { ref, computed } from 'vue';
  import { api } from '/@/core/modules/language/api/mapping';
  import { useLanguage } from '/@/core/hooks/setting/useLanguage';
  import { useMessage } from '@/core/hooks/useMessage';

  import { deepClone } from '/@/core/utils/jcode';
  import { t } from '@/core/locales/setupI18n';

  const { getTypeList } = useLanguage();
  const { success } = useMessage();

  let isEdit = false;
  let keyValue = '';
  const scheme = computed(() => {
    const _columns: Record<string, any>[] = [];
    getTypeList.value.forEach((item) => {
      _columns.push({
        id: item.f_Code,
        type: 'input',
        config: {
          label: item.f_Name,
        },
      });
    });
    return _columns;
  });

  const getForm = () => {
    // 获取表单数据 对表单数据进行处理
    const formData = formRef.value.getFormData(false);
    const data: any = [];
    getTypeList.value.forEach((item) => {
      data.push({ f_Name: formData[item.f_Code], f_TypeCode: item.f_Code });
    });
    return data;
  };

  const saveForm = async ({ keyValue, isEdit }: Record<string, any>) => {
    const formData = getForm();
    if (isEdit) {
      return await api.update(keyValue, formData);
    } else {
      return await api.add(formData);
    }
  };

  const formRef = ref();

  // 表单打开
  const open = (param) => {
    isEdit = param.isEdit;
    keyValue = param.row?.f_code || '';
    formRef.value.setInit(deepClone(scheme.value), deepClone(param.row));
  };
  // 表单关闭前
  const beforeClose = () => {};

  // 表单点击确定按钮
  const ok = async () => {
    let res = await saveForm({ keyValue, isEdit });
    if (res) {
      success(t('保存成功'));
      return true;
    }
  };

  // 表单关闭后
  const closed = () => {};

  // 暴露方法
  defineExpose({ open, beforeClose, ok, closed });
</script>
