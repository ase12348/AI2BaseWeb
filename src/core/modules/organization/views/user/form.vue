<template>
  <lr-c-schema-form ref="formRef" :formConfig="{ labelWidth: '80px' }" />
</template>
<script lang="ts" setup>
  import type { FormSchemaConfig } from '/#/form';
  import { ref, h } from 'vue';
  import { Tag } from 'ant-design-vue';
  import { HashingFactory } from '@/core/utils/jcode';
  import { useAuth } from '/@/core/hooks/useAuth';
  import { useForm } from '/@/core/hooks/useForm';
  import { useMessage } from '@/core/hooks/useMessage';
  import { useDataItem } from '@/core/hooks/data/useDataItem';
  import { useOrganization } from '/@/core/hooks/data/useOrganization';
  import pageInfo from './page';
  import { api } from '../../api/user';
  import { api as deptRoleApi } from '../../api/deptRole';
  import { t } from '@/core/locales/setupI18n';

  const { success, warning } = useMessage();
  const { getDataItem, loadDataItemList } = useDataItem();
  const { getLoginInfo } = useOrganization();
  const deptRoleList = ref<Record<string, string>[]>([]);

  const formConfigs: Record<string, FormSchemaConfig> = {
    tabs: {
      type: 'tabs',
    },
    f_Account: {
      config: {},
      rule: [
        { required: true, message: t('请输入') },
        {
          type: 'only',
          lr_table: 'lr_base_user',
          lr_key: 'f_UserId',
        },
      ],
    },
    f_RealName: { config: {}, rule: [{ required: true, message: t('请输入') }] },
    f_CompanyId: {
      type: 'treeSelect',
      config: { dataType: 'company', 'tree-default-expand-all': true },
      rule: [{ required: true, message: t('请选择') }],
    },
    f_DepartmentId: {
      type: 'lr-input-department',
      config: {
        companyRequired: true,
        getUpConfig: ({ formData }) => {
          return {
            companyId: formData.f_CompanyId,
          };
        },
      },
      rule: [{ required: true, message: t('请选择') }],
    },
    f_Password: {
      type: 'password',
      config: {
        getUpConfig: () => ({
          readonly: isEdit,
        }),
      },
      rule: [{ required: true, message: t('请输入') }],
    },
    f_Birthday: { type: 'date' },
    f_Description: { type: 'textarea', config: { span: 24 } },
    f_EnabledMark: { type: 'switch' },
    f_SecurityLevel: {
      type: 'switch',
      config: { checkedValue: 5, unCheckedValue: 0, disabled: !getLoginInfo.value.isAdmin },
    },
    f_Type: {
      type: 'radio',
      config: {
        options: [
          { label: t('试用'), value: 2 },
          { label: t('正式'), value: 1 },
          { label: t('离职'), value: 3 },
        ],
        defaultValue: 1,
      },
    },
    f_SortCode: { config: { defaultValue: '99' } },

    f_Gender: {
      type: 'radio',
      config: {
        options: [
          { label: t('男'), value: 1 },
          { label: t('女'), value: 0 },
        ],
        defaultValue: 1,
      },
    },
    formRoles: {
      type: 'gridtable',
      config: {
        isAddBtn: true,
        isRemoveBtn: true,
        title: '角色选择',
        addLayerWidth: 1000,
        addLayerHeight: 640,
        addLayerName: 'lr-role-panel',
        addDataFilter: (selectList: Record<string, any>[], oldList: Record<string, any>[]) => {
          const addList = selectList.filter(
            (t) => oldList.findIndex((t2) => t2.f_ObjectId == t.f_RoleId) == -1,
          );
          return addList.map((t) => ({
            f_Category: 1,
            f_ObjectId: t.f_RoleId,
          }));
        },
      },
    },
    'formRoles.EnCode': {
      config: {
        dataType: 'role',
        valueIdKey: 'f_ObjectId',
        labelKey: 'f_EnCode',
      },
    },
    'formRoles.FullName': {
      config: {
        dataType: 'role',
        valueIdKey: 'f_ObjectId',
      },
    },
    formPosts: {
      type: 'gridtable',
      config: {
        isAddBtn: true,
        isRemoveBtn: true,
        title: '岗位选择',
        addLayerWidth: 1000,
        addLayerHeight: 640,
        addLayerName: 'lr-post-panel',
        addDataFilter: (selectList: Record<string, any>[], oldList: Record<string, any>[]) => {
          const addList = selectList.filter(
            (t) => oldList.findIndex((t2) => t2.f_ObjectId == t.f_PostId) == -1,
          );

          const res = addList.map((t) => ({
            f_Category: 2,
            f_ObjectId: t.f_PostId,
            f_AttrCode: '0',
          }));

          if (oldList.length === 0) {
            res[0].f_AttrCode = '1';
          }

          return res;
        },
      },
    },
    'formPosts.f_AttrCode': {
      config: {
        width: 80,
        align: 'center',
        formatter: ({ cellValue, index }) => {
          return h(
            Tag,
            {
              bordered: false,
              color: cellValue == '1' ? 'warning' : 'success',
              style: {
                cursor: cellValue == '1' ? '' : 'pointer',
              },
              onClick: async () => {
                const formPostsData = getValue('formPosts');
                const main = formPostsData.find((item: any) => {
                  return item.f_AttrCode === '1';
                });
                if (main) {
                  main.f_AttrCode = '0';
                }
                formPostsData[index].f_AttrCode = '1';
                setFormData({ formPosts: [...formPostsData] });
              },
            },
            () => (cellValue === '1' ? t('主岗') : t('兼岗')),
          );
        },
      },
    },
    'formPosts.EnCode': {
      config: {
        minWidth: 100,
        dataType: 'post',
        valueIdKey: 'f_ObjectId',
        labelKey: 'f_EnCode',
      },
    },
    'formPosts.Company': {
      config: {
        minWidth: 100,
        dataType: 'post',
        valueIdKey: 'f_ObjectId',
        labelKey: 'f_CompanyId',
      },
    },
    'formPosts.Name': {
      config: {
        minWidth: 100,
        dataType: 'post',
        valueIdKey: 'f_ObjectId',
      },
    },
    formDepartments: {
      type: 'gridtable',
      config: {
        isAddBtn: true,
        isRemoveBtn: true,
        title: '部门选择',
        addLayerWidth: 1000,
        addLayerHeight: 640,
        addLayerName: 'lr-department-panel',
        addDataFilter: (selectList: Record<string, any>[], oldList: Record<string, any>[]) => {
          const addList = selectList.filter(
            (t) => oldList.findIndex((t2) => t2.f_ObjectId == t.f_DepartmentId) == -1,
          );
          return addList.map((t) => ({
            f_Category: 3,
            f_ObjectId: t.f_DepartmentId,
          }));
        },
      },
    },
    'formDepartments.EnCode': {
      config: {
        dataType: 'department',
        valueIdKey: 'f_ObjectId',
        labelKey: 'f_EnCode',
      },
    },
    'formDepartments.f_AttrCode': {
      type: 'select',
      config: {
        loadOptions: () => deptRoleList,
      },
    },
    'formDepartments.Name': {
      config: {
        dataType: 'department',
        valueIdKey: 'f_ObjectId',
      },
    },
    formCompanys: {
      type: 'gridtable',
      config: {
        isAddBtn: true,
        isRemoveBtn: true,
        title: '公司选择',
        addLayerWidth: 1000,
        addLayerHeight: 640,
        addLayerName: 'lr-company-panel',
        addDataFilter: (selectList: Record<string, any>[], oldList: Record<string, any>[]) => {
          const addList = selectList.filter(
            (t) => oldList.findIndex((t2) => t2.f_ObjectId == t.f_CompanyId) == -1,
          );
          return addList.map((t) => ({
            f_Category: 4,
            f_ObjectId: t.f_CompanyId,
          }));
        },
      },
    },
    'formCompanys.EnCode': {
      config: {
        dataType: 'company',
        valueIdKey: 'f_ObjectId',
        labelKey: 'f_EnCode',
      },
    },
    'formCompanys.f_AttrCode': {
      type: 'select',
      config: {
        loadOptions: () => deptRoleList,
      },
    },
    'formCompanys.Name': {
      config: {
        dataType: 'company',
        valueIdKey: 'f_ObjectId',
      },
    },
  };

  const { getFormSchema } = useAuth(pageInfo, { formConfigs });
  const formRef = ref();
  const schemas = getFormSchema();
  const { getFormData, setFormData, validateForm, resetForm, getValue } = useForm(formRef, {
    schemas,
  });
  let isEdit = false;
  let keyValue = '';

  // 这些字段已从表单移除，但后端 SaveEntity 是全量 Update，
  // 不回填就会把库里原值写成 null。open 时缓存原值，保存时回填。
  const newExtFields = (): Record<string, any> => ({
    f_Telephone: '',
    f_UserType: '',
    f_SalaryLevel: '',
    f_IsCheckPassword: '',
    f_IdCard: '',
    f_Party: '',
    f_Job: '',
    f_Level: '',
    f_SecretLevel: '',
    f_Title: '',
    f_Role: '',
    f_Post: '',
    f_WorkerDegree: '',
  });
  let originExt = newExtFields();

  const saveForm = async ({ keyValue, isEdit }: Record<string, any>) => {
    const formData = getFormData();
    formData.main.f_UserId = keyValue;
    Object.assign(formData.main, originExt);

    const roles = formData.formRoles;
    const posts = formData.formPosts;
    const departments = formData.formDepartments;
    const companys = formData.formCompanys;

    if (departments.length > 0 && departments.findIndex((t) => !t.f_AttrCode) != -1) {
      warning(t('请完善部门角色信息'));
      return false;
    }
    if (companys.length > 0 && companys.findIndex((t) => !t.f_AttrCode) != -1) {
      warning(t('请完善公司角色信息'));
      return false;
    }

    const postData = {
      user: formData.main,
      roles,
      posts,
      departments,
      companys,
    };

    if (isEdit) {
      return await api.update(keyValue, postData);
    } else {
      postData.user.f_Password = HashingFactory.createMD5Hashing().hash(postData.user.f_Password);
      return await api.add(postData);
    }
  };

  // 表单打开
  const open = async (param) => {
    isEdit = param.isEdit;
    keyValue = param.keyValue;
    originExt = newExtFields();

    await loadDataItemList('deptRoleCategory', false);
    const categoryList = getDataItem.value['deptRoleCategory'];
    const categoryMap = {};
    categoryList.forEach((item) => {
      categoryMap[item.f_ItemValue] = item.f_ItemName;
    });

    const list = await deptRoleApi.getList();
    const myDeptRoleList: Record<string, any>[] = [];
    if (list && list.length > 0) {
      list.forEach((item) => {
        if (item.fEnabledMark == 1) {
          myDeptRoleList.push({
            value: item.fCode,
            label: `${categoryMap[item.fCategory]}-${item.fName}`,
          });
        }
      });
    }
    deptRoleList.value = myDeptRoleList;

    if (isEdit) {
      const entity = await api.get(keyValue);
      if (entity) {
        Object.keys(originExt).forEach((key) => {
          originExt[key] = entity.user?.[key] ?? '';
        });
        if (entity.posts.length > 0 && entity.posts.findIndex((t) => t.f_AttrCode === '1') == -1) {
          entity.posts[0].f_AttrCode = '1';
        }
        if (entity.user.f_Type == undefined) {
          entity.user.f_Type = 1;
        }

        setFormData({
          main: entity.user,
          formRoles: entity.roles,
          formPosts: entity.posts,
          formDepartments: entity.departments,
          formCompanys: entity.companys || [],
        });
      }
    }
    formRef.value.setProps('f_Password', { disabled: !!isEdit });
    formRef.value.setProps('f_Account', { disabled: !!isEdit });
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
