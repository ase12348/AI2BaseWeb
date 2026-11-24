import { computed } from 'vue';
import { useCompanyStore, type companyEntity } from '/@/core/store/organization/company';
import { useDepartmentStore, type departmentEntity } from '/@/core/store/organization/department';
import { usePostStore, type postEntity } from '@/core/store/organization/post';
import { useRoleStore } from '@/core/store/organization/role';
import { useUserStore } from '/@/core/store/organization/user';

import { toTree, isNullOrEmpty } from '@/core/utils/jcode';

export function useOrganization() {
  // 公司
  const companyStore = useCompanyStore();
  const loadCompanyList = (isCache: boolean = false) => {
    companyStore.load(isCache);
  };
  const getCompanyList = computed(() => {
    return companyStore.list;
  });
  const getCompanyTree = (list: companyEntity[], keyword: string, filterIds: string[]) => {
    list = (list || []).filter((t) => t.f_DeleteMark == 0 && t.f_EnabledMark == 1);
    if (keyword) {
      list = list.filter((t) => t.f_FullName.indexOf(keyword) > -1);
    }
    const res = toTree(list, 'f_CompanyId', 'f_ParentId', 'f_CompanyId', 'f_FullName', filterIds); // 转树
    return res;
  };

  // 部门
  const departmentStore = useDepartmentStore();
  const loadDepartmentList = (companyId: string, isCache: boolean = true) => {
    departmentStore.loadList(companyId, isCache);
  };
  const loadDepartment = (id: string) => {
    departmentStore.load(id);
  };
  const loadDepartmentFullName = async (id: string) => {
    await departmentStore.loadFullName(id);
  };
  const getDepartmentList = computed(() => departmentStore.listDic);
  const getDepartment = computed(() => departmentStore.oneDic);

  const getDepartmentTree = (list: departmentEntity[], keyword: string, filterIds: string[]) => {
    list = (list || []).filter((t) => t.f_DeleteMark == 0 && t.f_EnabledMark == 1);
    if (keyword) {
      list = list.filter((t) => t.f_FullName.indexOf(keyword) > -1);
    }
    const res = toTree(
      list,
      'f_DepartmentId',
      'f_ParentId',
      'f_DepartmentId',
      'f_FullName',
      filterIds,
    ); // 转树
    return res;
  };

  // 用户
  const userStore = useUserStore();
  const loadUser = (userIds: string, isCache: boolean = true) => {
    userStore.load(userIds, isCache);
  };
  const getUser = computed(() => userStore.dic);
  const getLoginInfo = computed(() => userStore.getLoginInfo);
  const setCurrentPost = (postId: string) => {
    userStore.setCurrentPost(postId);
    location.reload();
  };

  const getUserName = (value: string) => {
    loadUser(value);
    const userIdList = String(value).split(',');
    const names: any[] = [];
    userIdList.forEach((userId) => {
      const user = getUser.value[userId as string];
      names.push(user?.f_RealName || userId);
    });
    return String(names);
  };

  const getUserFullName = (userIdAndPostId: string, isFull: boolean = false) => {
    if (!userIdAndPostId) {
      return '';
    }
    const values = userIdAndPostId.split('|');
    const userValue = values[0];
    let postId = values.length > 1 ? values[1] : '';
    loadUser(userValue);
    const user = getUser.value[userValue];
    if (user) {
      let res = user.f_RealName;

      postId = postId || user.f_Post;

      if (postId) {
        const postName = getPostName(postId, '', isFull);
        if (postName) {
          res = `${postName}-${res}`;
        }
      } else {
        if (user.f_DepartmentId) {
          loadDepartment(user.f_DepartmentId);
          const department = getDepartment.value[user.f_DepartmentId];
          if (department) {
            res = `${department.f_FullName}-${res}`;
          }
        }
        if (isFull && user.f_CompanyId) {
          loadCompanyList(true);
          let companyName = '';
          for (let i = 0; i < getCompanyList.value.length; i++) {
            if (getCompanyList.value[i].f_CompanyId == user.f_CompanyId) {
              companyName = getCompanyList.value[i].f_FullName;
              break;
            }
          }
          if (companyName) {
            res = `${companyName}-${res}`;
          }
        }
      }

      return res;
    } else {
      return ' ';
    }
  };

  const loadUserDepartmentFullName = async (userIdAndPostId: string) => {
    if (!userIdAndPostId) {
      return;
    }
    const values = userIdAndPostId.split('|');
    const userValue = values[0];
    let postId = values.length > 1 ? values[1] : '';
    const user = getUser.value[userValue];
    if (user) {
      postId = postId || user.f_Post;
      if (postId) {
        const post = getPost.value[postId];
        if (post) {
          await loadDepartmentFullName(post.f_DepartmentId);
          return;
        }
      }
      if (user.f_DepartmentId) {
        await loadDepartmentFullName(user.f_DepartmentId);
      }
    }
  };

  // 角色
  const roleStore = useRoleStore();
  const loadRoleList = (isCache: boolean = true) => {
    roleStore.loadList(isCache);
  };
  const loadRole = (roleId: string, isCache: boolean = true) => {
    roleStore.load(roleId, isCache);
  };
  const getRoleList = computed(() => roleStore.list);
  const getRole = computed(() => {
    return roleStore.oneDic;
  });
  const getRoleName = (roleIds: string, labelKey?: string) => {
    if (isNullOrEmpty(roleIds)) {
      return '';
    }
    loadRoleList();
    const list = getRoleList.value.filter((t) => roleIds.indexOf(t.f_RoleId) != -1);
    labelKey = labelKey || 'f_FullName';
    return String(list.map((t) => t[labelKey]));
  };

  // 岗位
  const postStore = usePostStore();
  const loadPostList = (companyId: string, isCache: boolean = true) => {
    postStore.loadList(companyId, isCache);
  };
  const loadPost = (id: string) => {
    postStore.load(id);
  };
  const getPostList = computed(() => postStore.listDic);
  const getPost = computed(() => postStore.oneDic);
  const getUserPosts = (ids: string) => {
    if (isNullOrEmpty(ids)) {
      return [];
    }
    const labelKey = 'f_Name';
    const idList = ids.split(',');
    const list: Record<string, any>[] = [];
    idList.forEach((id) => {
      loadPost(id);
      const post = getPost.value[id];
      if (post) {
        if (post.deptName) {
          list.push({
            value: id,
            label: `${post.deptName}-${post[labelKey]}`,
          });
        } else {
          list.push({
            value: id,
            label: `${post[labelKey]}`,
          });
        }
      }
    });
    return list;
  };
  const getPostName = (ids: string, labelKey?: string, isFull?: boolean) => {
    if (isNullOrEmpty(ids)) {
      return '';
    }
    labelKey = labelKey || 'f_Name';
    const idList = ids.split(',');
    const labelList: string[] = [];
    idList.forEach((id) => {
      loadPost(id);
      const post = getPost.value[id];
      if (post) {
        if (labelKey == 'f_CompanyId') {
          labelList.push(`${post.companyName}`);
        } else if (labelKey == 'f_Name' && post.deptName) {
          const deptFullName = departmentStore.fullNameDic[post.f_DepartmentId] || '';
          if (isFull && deptFullName) {
            labelList.push(`${post.companyName}-${deptFullName}-${post[labelKey]}`);
          } else {
            labelList.push(`${post.deptName}-${post[labelKey]}`);
          }
        } else {
          labelList.push(`${post[labelKey]}`);
        }
      } else {
        labelList.push(id);
      }
    });

    return String(labelList);
  };
  const getPostTree = (list: postEntity[], keyword: string, filterIds: string[]) => {
    list = (list || []).filter((t) => t.f_DeleteMark == 0);
    if (keyword) {
      list = list.filter((t) => t.f_Name.indexOf(keyword) > -1);
    }
    const res = toTree(list, 'f_PostId', 'f_ParentId', 'f_PostId', 'f_Name', filterIds); // 转树
    return res;
  };

  return {
    loadCompanyList,
    getCompanyList,
    getCompanyTree,

    loadDepartmentList,
    loadDepartment,
    loadDepartmentFullName,
    loadUserDepartmentFullName,
    getDepartmentList,
    getDepartment,
    getDepartmentTree,

    loadUser,
    getUser,
    getLoginInfo,
    setCurrentPost,
    getUserFullName,
    getUserName,

    loadRoleList,
    loadRole,
    getRoleList,
    getRole,
    getRoleName,

    loadPostList,
    loadPost,
    getPostList,
    getPost,
    getPostTree,
    getPostName,
    getUserPosts,
  };
}
