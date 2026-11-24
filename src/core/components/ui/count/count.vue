<template>
  <a-input v-model:value="showValue" readonly />
</template>

<script lang="ts" setup>
  import { computed, watch, inject } from 'vue';
  import { createNamespace } from '../utils/components';
  import { numberToChinese, numberToThousandSeparator } from '../utils/method';
  import { evaluateFormula, matchCountif } from '../utils/formula';
  import { isArray } from '../utils/is';

  const averageFun = (...val: any) => {
    val = val.flat();

    let res = 0;
    for (let i = 0; i < val.length; i++) {
      res += val[i];
    }
    return res / val.length;
  };
  const ceilingFun = (num: any, significance: any) => {
    if (significance < 0) {
      return -Math.ceil(num / Math.abs(significance)) * significance || 0;
    }
    return Math.ceil(num / significance) * significance || 0;
  };
  const countFun = (...val: any) => {
    val = val.flat();
    return val.length;
  };
  const countifFun = (arr: any[], condition: string) => {
    let count = 0;
    if (Array.isArray(arr)) {
      for (let i = 0; i < arr.length; i++) {
        if (matchCountif(arr[i], condition)) count++;
      }
    }
    return count;
  };
  const fixedFun = (num: any, n: any) => {
    const res = num.toFixed(n);
    return res;
  };
  const floorFun = (number: any, significance: any) => {
    if (significance < 0) return -Math.floor(number / Math.abs(significance)) * significance || 0;
    return Math.floor(number / significance) * significance || 0;
  };
  const largeFun = (arr: any, n: any) => {
    if (Array.isArray(arr)) {
      arr.sort((a, b) => b - a);
      return arr[n - 1];
    }
  };
  const smallFun = (arr: any, n: any) => {
    if (Array.isArray(arr)) {
      arr.sort((a, b) => a - b);
      return arr[n - 1];
    }
  };
  const logFun = (num: any, n: any) => Math.log(num) / Math.log(n);
  const modFun = (a: any, b: any) => a % b;
  const productFun = (...arr: any) => {
    arr = arr.flat();
    let res = 1;
    for (let i = 0; i < arr.length; i++) {
      res *= arr[i];
    }
    return res;
  };
  const roundFun = (num: any, n: any) => {
    const res = num.toFixed(n);
    return Number(res);
  };
  const sumFun = (...arr: any) => {
    arr = arr.flat();
    let res = 0;
    for (let i = 0; i < arr.length; i++) {
      res += Number(arr[i]);
    }
    return res;
  };
  const sumproductFun = (...arr: any) => {
    const combined = arr[0].map((value: any, index: number) => {
      let n = value;
      for (let i = 1; i < arr.length; i++) {
        n *= arr[i][index] || 0;
      }
      return n;
    });
    const sum = combined.reduce((a: any, b: any) => a + b, 0);
    return sum;
  };

  defineOptions({ name: createNamespace('count').name });

  const props = defineProps({
    /**
     * @zh 计算的值
     */
    value: [Number, String],
    /**
     * @zh 计算公式设置
     * @defaultValue
     */
    formatJson: String,
    /**
     * @zh 保留小数位数
     */
    decimal: {
      type: Number,
    },
    /**
     * @zh 是否千位分隔
     */
    thousandSeparator: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 是否大写
     */
    isChinese: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 子表的行下标
     */
    tableIndex: {
      type: Number,
    },
    /**
     * @zh 组件数据
     */
    getData: Function,
  });

  const emit = defineEmits({
    'update:value': (_value: Record<string, any>) => true,
    change: (_data: Record<string, any>) => true,
  });

  const { getValue } = inject('jcode_form_provide', {} as Record<string, any>);

  const getCompValue = (id: string) => {
    const list = getValue(id);

    if (isArray(list)) {
      const arr: number[] = [];
      list.forEach((item: any) => {
        const itemNumber = Number(item);
        if (Number.isNaN(itemNumber)) {
          arr.push(0);
        } else {
          arr.push(itemNumber);
        }
      });
      return arr;
    }
    const res = Number(list);
    if (Number.isNaN(res)) return 0;
    return res;
  };

  const myValue = computed(() => {
    if (!getValue) {
      return '';
    }
    const formatJson = JSON.parse(props.formatJson || '[]');
    let json = '';
    for (let i = 0; i < formatJson.length; i++) {
      const item: Record<string, any> = formatJson[i] as any;

      if (item.type === 'fun' && item.value !== '(' && item.value !== ')') {
        if (['abs', 'max', 'min', 'sqrt'].includes(item.value)) {
          json += `Math.${item.value}`;
        } else if (['int', 'power', 'rand'].includes(item.value)) {
          switch (item.value) {
            case 'int':
              json += 'Math.floor';
              break;
            case 'power':
              json += 'Math.pow';
              break;
            case 'rand':
              json += 'Math.random';
              break;
          }
        } else {
          json += `${item.value}Fun`;
        }
      } else if (item.type === 'comp') {
        json += `getCompValue('${item.value}')`;
      } else if (item.value === 'i' && props.tableIndex !== undefined) {
        json += props.tableIndex;
      } else {
        json += item.value;
      }
    }

    if (!json) {
      return '';
    }

    let val;
    try {
      val = evaluateFormula(json, {
        averageFun,
        ceilingFun,
        countFun,
        countifFun,
        fixedFun,
        floorFun,
        largeFun,
        smallFun,
        logFun,
        modFun,
        productFun,
        roundFun,
        sumFun,
        sumproductFun,
        getCompValue,
      });
    } catch (e) {
      console.log(e, '计算组件公式运行错误');
      return '';
    }

    if (Number.isNaN(val)) return '';

    if (props.decimal !== undefined) {
      val = val.toFixed(props.decimal);
    }

    return val;
  });

  const showValue = computed(() => {
    let res = myValue.value;
    if (props.thousandSeparator) {
      res = numberToThousandSeparator(res);
    }

    if (props.isChinese) {
      res = numberToChinese(res);
    }

    return res;
  });

  watch(
    myValue,
    (val) => {
      emit('update:value', val);
      emit('change', { value: val, data: showValue.value });
    },
    { immediate: true },
  );
</script>

<style lang="less">
  @import './count';
</style>
