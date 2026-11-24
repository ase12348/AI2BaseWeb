<template>
  <lr-c-schema-form :formConfig="{ span: 12, labelWidth: 64 }" ref="formRef" />
</template>
<script lang="ts" setup>
  import type { FormSchemaConfig } from '/#/form';
  import { ref } from 'vue';
  import { useMessage } from '@/core/hooks/useMessage';
  import { useAuth } from '/@/core/hooks/useAuth';
  import { useForm } from '/@/core/hooks/useForm';
  import { useDataItem } from '@/core/hooks/data/useDataItem';

  import { useCompanyStore, companyEntity } from '/@/core/store/organization/company';
  import { api as deptRoleApi } from '../../api/deptRole';
  import pageInfo from './page';
  import { t } from '@/core/locales/setupI18n';

  const companyStore = useCompanyStore();
  const { success } = useMessage();

  const { getDataItem, loadDataItemList } = useDataItem();
  const formConfigs: Record<string, FormSchemaConfig> = {
    tabs: {
      type: 'tabs',
    },
    f_FullName: { config: {}, rule: [{ required: true, message: t('请输入') }] },
    f_ShortName: { config: {}, rule: [{ required: true, message: t('请输入') }] },
    f_EnCode: {
      config: {},
      rule: [
        { required: true, message: t('请输入') },
        { pattern: /^[-+]?\d+$/, message: t('需要为数字') },
        {
          type: 'only',
          lr_table: 'lr_base_company',
          lr_key: 'f_CompanyId',
        },
      ],
    },
    f_ParentId: {
      type: 'lr-input-company',
    },
    f_Manager: { type: 'lr-input-user' },
    f_Icon: { type: 'lr-input-icon', config: { defaultValue: 'company' } },
    f_Description: {
      type: 'textarea',
      config: { span: 24 },
    },
    /* f_ManagerId: { type: 'lr-input-user' },
    f_PartyManagerId: { type: 'lr-input-user' },
    f_ManagerIds: { type: 'lr-input-user' },
    f_LeaderIds: { type: 'lr-input-user' },
    f_DeptTag: {
      type: 'select',
      config: { mode: 'multiple', dataType: 'dataItem', dataCode: 'DeptTagsManage' },
    }, */
  };

  const formRef = ref();
  const deptRoleMap = ref<Record<string, string>>({});
  const { getFormSchema } = useAuth(pageInfo, { formConfigs });

  // const schemas = getFormSchema();
  const getMyFormSchema = async () => {
    const schema = getFormSchema();

    await loadDataItemList('deptRoleCategory', false);
    const categoryList = getDataItem.value['deptRoleCategory'];
    const categoryMap = {};
    categoryList.forEach((item) => {
      categoryMap[item.f_ItemValue] = item.f_ItemName;
    });

    const list = await deptRoleApi.getList();
    const map = {};
    if (list && list.length > 0) {
      list.forEach((item) => {
        if (item.fEnabledMark == 1) {
          const code = `deptRole_${item.fCode}`;
          deptRoleMap[code] = item.fCode;
          map[item.fCategory] = map[item.fCategory] || [];
          map[item.fCategory].push({
            id: code,
            slot: `tab${item.fCategory}`,
            type: 'lr-input-user',
            config: { field: code, label: item.fName, isMultiSelect: true },
          });
        }
      });
    }
    const mapKeys = Object.keys(map);
    if (mapKeys.length > 0) {
      schema.forEach((item) => {
        item.slot = 'c0';
      });
      const mainForm = [
        {
          id: 'tabs',
          type: 'tabs',
          config: {
            defaultValue: 'c0',
            label: '选项卡',
            groups: [
              {
                i: 'c0',
                label: t('基础信息'),
                labelWidth: 88,
                span: 12,
              },
            ],
          },
          children: [...schema],
        },
      ];
      mapKeys.forEach((key) => {
        // @ts-ignore
        mainForm[0].config.groups.push({
          i: `tab${key}`,
          label: categoryMap[key],
          span: 24,
          labelWidth: 120,
        });
        mainForm[0].children.push(...map[key]);
      });

      return mainForm;
    }

    return schema;
  };

  const { getFormData, setFormData, validateForm, resetForm } = useForm(formRef, {
    schemas: [],
    getSchemas: getMyFormSchema,
  });
  let isEdit = false;
  let keyValue = '';
  // 详细地址已从表单移除，但后端 Update 是全量更新，不回填就会把库里原值写成 null
  let originAddress = '';

  const getForm = () => {
    const formData = getFormData().main as companyEntity;
    formData.f_ParentId = formData.f_ParentId || '0';
    formData.f_CompanyId = keyValue;
    formData.f_Address = originAddress;

    // 获取部门角色数据
    const deptRoleList: Record<string, any> = [];
    Object.keys(deptRoleMap).forEach((key) => {
      const value = formData[key];
      if (value) {
        const valueList = value.split(',');
        valueList.forEach((userId: string) => {
          deptRoleList.push({
            f_AttrCode: deptRoleMap[key],
            f_UserId: userId,
            f_Type: 1,
          });
        });

        delete formData[key];
      }
    });
    formData.deptRoleList = JSON.stringify(deptRoleList);

    return formData;
  };

  const saveForm = async ({ keyValue, isEdit }: Record<string, any>) => {
    const formData = getForm();
    if (isEdit) {
      return await companyStore.update(keyValue, formData);
    } else {
      return await companyStore.add(formData);
    }
  };

  // 表单打开
  const open = async (param) => {
    isEdit = param.isEdit;
    keyValue = param.keyValue;
    originAddress = '';
    if (isEdit) {
      const entity = await companyStore.get(keyValue);
      if (entity) {
        originAddress = entity.f_Address || '';
        if (entity.deptRoleList) {
          const dic: Record<string, any> = {};
          const deptRoleList: Record<string, any>[] = JSON.parse(entity.deptRoleList);
          deptRoleList.forEach((item) => {
            dic[item.F_AttrCode] = dic[item.F_AttrCode] || [];
            dic[item.F_AttrCode].push(item.F_UserId);
          });

          Object.keys(dic).forEach((key) => {
            if (dic[key]) {
              entity[`deptRole_${key}`] = String(dic[key]);
            }
          });
        }

        if (entity.f_ParentId === '0') {
          //@ts-ignore
          entity.f_ParentId = undefined;
        }
        setFormData({ main: entity });
      }
    }
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
  };

  // 暴露方法
  defineExpose({ open, beforeClose, ok, closed });
</script>
