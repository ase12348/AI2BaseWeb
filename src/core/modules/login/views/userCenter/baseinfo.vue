<template>
  <div class="lr-block">
    <a-form
      class="mt-16px"
      :colon="false"
      :label-col="{ style: { width: '80px' } }"
      :wrapper-col="{ span: 14 }"
    >
      <template v-if="options.params.isTenant">
        <a-form-item
          class="mb-16px"
          :label="$t('租户号')"
          v-if="getLoginInfo.tenantName && getLoginInfo.tenantNo != 'host'"
        >
          <a-input :value="getLoginInfo.tenantNo" :readonly="true" />
        </a-form-item>
        <a-form-item :label="$t('租户')" v-if="getLoginInfo.tenantName">
          <a-input :value="getLoginInfo.tenantName" :readonly="true" />
        </a-form-item>
        <a-form-item :label="$t('租户公司')" v-if="getLoginInfo.tenantCompany">
          <a-input :value="getLoginInfo.tenantCompany" :readonly="true" />
        </a-form-item>
      </template>

      <a-form-item :label="$t('账号')">
        <a-input :value="getLoginInfo.account" :readonly="true" />
      </a-form-item>
      <a-form-item :label="$t('姓名')">
        <a-input :value="getLoginInfo.name" :readonly="true" />
      </a-form-item>
      <a-form-item :label="$t('性别')">
        <a-radio-group :value="getLoginInfo.gender" :readonly="true">
          <a-radio :value="1">{{ $t('男') }}</a-radio>
          <a-radio :value="0">{{ $t('女') }}</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item :label="$t('公司')">
        <lr-input-company :modelValue="getLoginInfo.companyId" :readonly="true" />
      </a-form-item>
      <a-form-item :label="$t('部门')">
        <lr-input-department :modelValue="getLoginInfo.departmentId" :readonly="true" />
      </a-form-item>
      <a-form-item :label="$t('岗位')">
        <a-input :value="postName" :readonly="true" />
      </a-form-item>
      <a-form-item :label="$t('角色')">
        <a-input :value="roleName" :readonly="true" />
      </a-form-item>
      <a-form-item :label="$t('备注')">
        <a-textarea :value="getLoginInfo.description" :readonly="true" />
      </a-form-item>
    </a-form>
  </div>
</template>
<script lang="ts" setup>
  import { computed } from 'vue';
  import { useGlobSetting } from '/@/core/hooks/setting';
  import { useOrganization } from '/@/core/hooks/data/useOrganization';

  const { options } = useGlobSetting();
  const { getLoginInfo, getRoleName, getPostName } = useOrganization();

  const roleName = computed(() => {
    return getRoleName(String(getLoginInfo.value.roleIds || []));
  });

  const postName = computed(() => {
    return getPostName(String(getLoginInfo.value.postIds || []));
  });
</script>
