import type { FormSchemaConfig } from '/#/form';

import { onMounted, watch } from 'vue';
import { existFiled } from '@/core/utils/validator';

export function useForm(
  refForm: any,
  {
    schemas,
    needFormatter,
    getSchemas,
    notInit,
  }: {
    schemas?: FormSchemaConfig[];
    needFormatter?: boolean;
    getSchemas?: any;
    notInit?: boolean;
  },
) {
  let isInt = false;

  const getId = (item: FormSchemaConfig, parentTableId: string) => {
    let id = item.id;
    if (!id && item.table && item.field) {
      id = `${item.table}.${item.field}`;
    }
    if (!id && item.table) {
      id = item.table;
    }
    if (!id && item.field) {
      id = item.field;
    }
    if (!item.id && parentTableId) {
      id = `${parentTableId}.${id}`;
    }

    return id;
  };

  const setFormConfig = (formSchema: FormSchemaConfig[], parentTableId = '') => {
    formSchema.forEach((item) => {
      item.id = getId(item, parentTableId);
      const configItem = item.config || {};
      item.config = configItem;
      configItem.field = item.field;
      configItem.table = item.table;
      configItem.label = item.name;

      const onlyRule = item.rule?.find((rule) => rule.type === 'only');

      // 设置字段不能重复
      if (onlyRule) {
        onlyRule.trigger = 'null';
        onlyRule.lr_field = onlyRule.lr_field || item.field;
        onlyRule.lr_existFiled = existFiled;
      }

      if (!parentTableId) {
        item.type = item.type || 'input';
      }

      if (item.children && item.children.length > 0) {
        const children: FormSchemaConfig[] = [];
        if (['collapse', 'tabs'].includes(item.type || '')) {
          if (!configItem.groups) {
            configItem.groups = [];

            item.children.forEach((childrenItem, index) => {
              configItem.groups.push({
                i: `c${index}`,
                label: childrenItem.name,
                span: childrenItem.config?.span,
                labelWidth: childrenItem.config?.labelWidth,
              });
              childrenItem.children?.forEach((groupItem) => {
                groupItem.slot = `c${index}`;
                children.push(groupItem);
              });
            });
            configItem.defaultValue = 'c0';
            item.children = children;
          }
        } else {
          children.push(...item.children);
        }

        setFormConfig(
          children,
          ['gridtable', 'inputRows', 'inputCards'].includes(item.type || '') ? item.id : '',
        );
      }
    });
  };

  onMounted(async () => {
    if (notInit) {
      return;
    }

    if (getSchemas) {
      schemas = await getSchemas();
    }

    // 表单组件为异步组件，模板引用可能晚于父组件 mounted 才可用
    if (refForm.value) {
      initForm(schemas || []);
      return;
    }
    const stop = watch(refForm, (formRef) => {
      if (!formRef) {
        return;
      }
      stop();
      initForm(schemas || []);
    });
  });

  const initForm = (mySchemas: FormSchemaConfig[]) => {
    if (needFormatter) {
      setFormConfig(mySchemas);
    }
    refForm.value && refForm.value.setInit(mySchemas);
    isInt = true;
  };

  // 校验表单
  const validateForm = () => {
    return refForm.value?.validate();
  };

  // 清除校验
  const clearFormValidate = () => {
    refForm.value?.clearValidate();
  };

  // 重置表单
  const resetForm = () => {
    refForm.value?.resetFields();
  };

  // 获取表单值
  const getFormData = (useTable = true) => {
    return refForm.value?.getFormData(useTable);
  };

  // 获取表单值
  const getValue = (id: string, useTable = true) => {
    return refForm.value?.getValue(id, useTable);
  };

  // 设置表单值
  const setFormData = (
    data: Record<string, any>,
    filter?: (key: string, value: any, table?: string) => boolean,
  ) => {
    if (isInt) {
      refForm.value?.setFormData(data, filter);
    } else {
      setTimeout(() => {
        setFormData(data, filter);
      });
    }
  };

  // 设置组件属性
  const setFormItemProps = (id: string, config: any) => {
    refForm.value?.setProps(id, config);
  };

  // 获取子表对象
  const getRef = (id: string) => {
    return refForm.value?.getRef(id);
  };

  return {
    initForm,
    validateForm,
    clearFormValidate,
    resetForm,
    getFormData,
    setFormData,
    getValue,
    setFormItemProps,
    getRef,
  };
}
