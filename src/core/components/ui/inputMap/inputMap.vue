<template>
  <a-input-group v-bind="$attrs" style="display: flex; width: 100%" compact>
    <a-input
      style="flex: 1; width: 0"
      v-model:value="inputValue"
      :placeholder="placeholder ? $t(placeholder) : undefined"
      :readonly="readonly"
      :size="size"
      :allow-clear="readonly ? false : clearable"
      @focus="handleInputClick"
      ref="inputRef"
    />
    <lr-button :disabled="readonly" :size="size" @click="handleClick">
      <template #icon>
        <lr-icon icon="ant-design:environment-outlined" />
      </template>
    </lr-button>
  </a-input-group>
  <a-form-item-rest>
    <lr-layer
      ref="layerRef"
      :width="960"
      :height="504"
      btn-text="确认"
      @ok="handleLayerOk"
      @closed="handleClosed"
    >
      <lr-c-schema-index style="padding: 0" :schemas="indexSchemas" ref="indexRef" />
    </lr-layer>
  </a-form-item-rest>
</template>

<script lang="ts" setup>
  import { PropType, ref, unref, computed, h } from 'vue';
  import { createNamespace } from '../utils/components';
  import { isNullOrEmpty } from '../utils/is';
  import { useFramework } from '../utils/useFramework';

  defineOptions({ name: createNamespace('inputMap').name });

  const props = defineProps({
    /**
     * @zh 输入值
     * @vModel
     */
    value: {
      type: [String] as PropType<string>,
      default: null,
    },
    /**
     * @zh 占位符
     */
    placeholder: {
      type: String as PropType<string>,
      default: '请选择',
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
  });

  const emit = defineEmits({
    'update:value': (val: string | undefined) => true,
  });

  const { t } = useFramework({});
  const layerRef = ref();
  const inputRef = ref();
  const indexRef = ref();
  const getRef = (id: string) => indexRef.value.getRef(id);

  const addressInput = ref('');
  const lng = ref<number>(0);
  const lat = ref<number>(0);

  const tmpValue = ref('');
  const myValue = computed(() => {
    let value: string = props.value || '';
    if (props.value === null) {
      value = unref(tmpValue);
    }

    // 准备地图需要的json格式
    if (isNullOrEmpty(value)) {
      return {
        address: '',
        lng: 0,
        lat: 0,
      };
    }
    const valueList = value.split(',');
    return {
      address: valueList[0],
      lng: parseFloat(valueList[1]),
      lat: parseFloat(valueList[2]),
    };
  });
  const inputValue = computed({
    get() {
      return myValue.value.address;
    },
    set() {
      tmpValue.value = '';
      emit('update:value', undefined);
    },
  });

  const handleInputClick = () => {
    inputRef.value.blur();
  };

  const handleClick = () => {
    inputRef.value.blur();

    addressInput.value = myValue.value.address;
    lng.value = myValue.value.lng;
    lat.value = myValue.value.lat;
    layerRef.value.open('请选择地址');

    setTimeout(() => {
      getRef('map')?.setPoint(lng.value, lat.value);
    }, 100);
  };

  const searchOptions = ref<any[]>([]);
  const indexSchemas = [
    {
      type: 'lr-vpanel',
      config: {
        class: ['lr-block'],
      },
      children: [
        {
          type: 'div',
          slot: 'top',
          config: {
            style: {
              padding: '8px',
            },
          },
          children: [
            {
              type: 'a-auto-complete',
              config: {
                style: {
                  width: '100%',
                },
                placeholder: t('请填写详细地址'),
                value: addressInput,
                options: searchOptions,
                onSearch: () => {
                  // console.log(addressInput.value, 'searchText')
                  getRef('map').querySearchAsync(addressInput.value, (list: any) => {
                    // console.log(list, 'list')
                    searchOptions.value = list.map((t: any) => ({ ...t, value: t.uid }));
                  });
                },
                onSelect: (value: string, option: any) => {
                  addressInput.value = `(${option.title})${option.address}`;
                  lng.value = option.point.lng;
                  lat.value = option.point.lat;
                  getRef('map').setPoint(option.point.lng, option.point.lat);

                  // console.log(value, option)
                },
              },
              children: [
                {
                  slot: 'option',
                  config: {
                    h: (data: any) =>
                      h('div', {}, [
                        h(
                          'div',
                          { style: { color: 'var(--color-text)', 'font-size': '14px' } },
                          data.title,
                        ),
                        h(
                          'div',
                          {
                            style: {
                              color: 'var(--color-text-secondary)',
                              'font-size': '12px',
                              'margin-bottom': '4px',
                            },
                          },
                          data.address,
                        ),
                      ]),
                  },
                },
              ],
            },
          ],
        },
        {
          type: 'lr-map',
          id: 'map',
          config: {
            address: addressInput,
            lng,
            lat,
            onChange: (data: any) => {
              addressInput.value = data.value.address;
              lng.value = data.value.lng;
              lat.value = data.value.lat;
            },
          },
        },
      ],
    },
  ];

  const handleLayerOk = () => {
    if (
      !isNullOrEmpty(addressInput.value) &&
      !isNullOrEmpty(lng.value) &&
      !isNullOrEmpty(lat.value)
    ) {
      tmpValue.value = `${addressInput.value},${lng.value},${lat.value}`;
      emit('update:value', tmpValue.value);
    } else {
      emit('update:value', undefined);
    }
    layerRef.value.close();
  };

  const handleClosed = () => {};
</script>

<style lang="less">
  @import './inputMap';
</style>
