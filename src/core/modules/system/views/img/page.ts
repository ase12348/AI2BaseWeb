import type { AppPageConfig, ButtonType } from '/#/page';
import type { FormAuthConfigType } from '/#/form';
import { defineConfig } from '/@/core/utils';

const buttons: ButtonType[] = [
  {
    prop: 'add',
    label: '添加私有图片',
    classify: 'panel',
  },
  {
    prop: 'addpublic',
    label: '添加公有图片',
    type: 'primary',
    classify: 'panel',
  },
  {
    prop: 'dataItem',
    label: '分类管理',
    classify: 'tool',
    icon: 'ant-design:tool-filled',
  },

  { prop: 'delete', label: '删除', icon: 'delete-outlined', danger: true },
  { prop: 'set', label: '设置', icon: 'setting-outlined' },
];

const mainForm: FormAuthConfigType = {
  path: 'form',
  schema: [
    { name: '图片', field: 'src' },
    { name: '名称', field: 'f_FileName' },
    { name: '分类', field: 'f_FileType' },
    { name: '公共', field: 'f_IsPublic' },
  ],
};

export default defineConfig<AppPageConfig>({
  title: '图片管理',
  columns: [],
  buttons,
  forms: [mainForm],
  childPages: [
    {
      name: '分类管理',
      id: 'data_dataitem_index',
      notPages: ['data_dataitem_classifys_index'],
      notButtons: ['classifys'],
    },
  ],
});
