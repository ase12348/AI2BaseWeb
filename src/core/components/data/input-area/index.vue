<template>
  <a-cascader
    v-model:value="value"
    :options="options"
    :placeholder="$t(placeholder)"
    :load-data="loadData"
  />
</template>
<script lang="ts" setup>
  import { ref, computed, onMounted, watch } from 'vue';
  import { useArea } from '/@/core/hooks/data/useArea';

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
      default: '请选择行政区域',
    },
  });

  const { getArea, getAreaOptions, loadAreaList } = useArea();
  const options: any = ref([]);
  onMounted(async () => {
    await loadAreaList('0');
    options.value = getAreaOptions(getArea.value['0']);
  });
  const loadData = async (selectedOptions) => {
    const targetOption = selectedOptions[selectedOptions.length - 1];
    await loadAreaList(targetOption.f_AreaId);
    targetOption.children = getAreaOptions(getArea.value[targetOption.f_AreaId], 3);
    options.value = [...options.value];
  };

  const emit = defineEmits(['update:modelValue', 'change']);
  let isChange = false;

  const handleChange = (val) => {
    isChange = true;
    if (!val || val.length == 0) {
      emit('change', undefined);
    } else {
      const one = getArea.value['0'] || [];
      const two = getArea.value[val[0]] || [];
      const three = getArea.value[val[1]] || [];

      const oneobj = one.find((t) => t.f_AreaCode == val[0]);
      const twoobj = two.find((t) => t.f_AreaCode == val[1]);
      const threeobj = three.find((t) => t.f_AreaCode == val[2]);

      emit('change', {
        value: value.value ? String(value) : undefined,
        data: [oneobj, twoobj, threeobj],
      });
    }
  };

  const value = computed({
    get() {
      return props.modelValue?.split(',') || [];
    },
    set(value) {
      emit('update:modelValue', value ? String(value) : undefined);
      handleChange(value);
    },
  });

  watch(
    value,
    async (val) => {
      console.log(val, 'area value');
      if (!isChange && val.length > 0) {
        await loadAreaList('0');
        await loadAreaList(val[0]);
        await loadAreaList(val[1]);

        const one = getAreaOptions(getArea.value['0']);
        const two = getAreaOptions(getArea.value[val[0]]);
        const three = getAreaOptions(getArea.value[val[1]]);

        const oneobj = one.find((t) => t.value == val[0]);
        const twoobj = two.find((t) => t.value == val[1]);

        if (oneobj) {
          // @ts-ignore
          oneobj.children = two;
        }
        if (twoobj) {
          // @ts-ignore
          twoobj.children = three;
        }

        options.value = [...one];
      }
      isChange = false;
    },
    { immediate: true },
  );
</script>
