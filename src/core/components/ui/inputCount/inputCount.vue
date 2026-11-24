<template>
  <lr-button v-bind="$attrs" :type="type" :size="size" :label="label" @click="handleOpen" />
  <a-form-item-rest>
    <lr-modal
      v-model:visible="formVisible"
      :title="$t('公式设置')"
      :height="800"
      :width="1200"
      @ok="handleOk"
      @closed="handleClosed"
    >
      <div class="lr-block lr-input-count">
        <div class="lr-input-count-top">
          <div class="lr-input-count-tool">
            <a-typography-title :level="5">{{ $t('计算公式') }}=</a-typography-title>
            <a-space>
              <lr-button type="text" @click="handleLeft">
                <template #icon>
                  <lr-icon icon="ant-design:arrow-left-outlined" />
                </template>
              </lr-button>
              <lr-button type="text" @click="handleRight">
                <template #icon>
                  <lr-icon icon="ant-design:arrow-right-outlined" />
                </template>
              </lr-button>
              <lr-button type="link" label="退格" @click="handleCallBack" />
              <lr-button type="link" danger label="清空" @click="handleClear" />
            </a-space>
          </div>
          <div class="lr-input-count-codebox">
            <span class="lr-input-count-cursor" v-if="formatJson.cells.length == 0"></span>
            <template v-for="(item, index) in formatJson.cells" :key="index">
              <span class="fun_color" v-if="item.type == 'fun'">
                {{ item.value.toUpperCase() }}
              </span>
              <span class="comp_color" v-else-if="item.type == 'comp'">
                #{{ getLabel(item.value) }}#
              </span>
              <span class="num_color" v-else-if="item.type == 'num'">
                {{ item.value }}
              </span>
              <span class="lr-input-count-cursor" v-if="index + 1 == formatJson.cursor"></span>
            </template>
          </div>
        </div>
        <a-space class="lr-input-count-mid">
          <lr-button
            v-for="(item, index) in buttonList"
            :key="index"
            @click="handleClick(item.value, 'num')"
          >
            {{ item.label }}
          </lr-button>
        </a-space>
        <div class="lr-input-count-bottom">
          <div class="lr-input-count-left">
            <template v-for="(item, index) of list" :key="index">
              <a-typography-title :level="5">{{ $t(item.label) }}</a-typography-title>
              <a-space :size="[8, 8]" wrap style="margin-bottom: 16px">
                <template v-for="citem in item.children" :key="citem.value">
                  <lr-button @click="handleClick(citem.value, 'comp')">{{
                    $t(citem.label)
                  }}</lr-button>
                </template>
              </a-space>
            </template>
          </div>
          <div class="lr-input-count-right">
            <div class="lr-input-count-funs">
              <a-typography-title style="padding: 8px" :level="5">{{
                $t('函数列表')
              }}</a-typography-title>
              <div class="lr-input-count-funs-content">
                <lr-button
                  type="text"
                  v-for="(item, index) in funList"
                  style="border-radius: 0; text-align: left"
                  :key="index"
                  @mouseover="handleMouseover(item.des)"
                  @click="handleClick(item.value, 'fun')"
                >
                  {{ item.label }}
                </lr-button>
              </div>
            </div>
            <div class="lr-input-count-fundes">
              <a-typography-paragraph>
                <ul>
                  <li v-for="(item, index) in des" :key="index" style="margin-bottom: 8px">
                    <a-typography-text style="font-size: 14px; font-weight: 300">
                      {{ $t(item) }}</a-typography-text
                    >
                  </li>
                </ul>
              </a-typography-paragraph>
            </div>
          </div>
        </div>
      </div>
    </lr-modal>
  </a-form-item-rest>
</template>

<script lang="ts" setup>
  import { PropType, computed, ref, reactive } from 'vue';
  import { deepClone } from '../utils/method';

  defineOptions({ name: 'LrInputCount' });

  const props = defineProps({
    /**
     * @zh 组件数据
     * @vModel
     */
    value: String,
    /**
     * @zh 组件列表
     */
    list: {
      type: Array as PropType<Record<string, any>[]>,
      default: () => [],
    },
    /**
     * @zh 按钮的类型，分为五种：主要按钮、幽灵按钮、虚框按钮、链接按钮、文字按钮、次要按钮。
     * @defaultValue 'default'
     */
    type: {
      type: String as PropType<'primary' | 'ghost' | 'dashed' | 'link' | 'text' | 'default'>,
      default: 'primary',
    },
    /**
     * @zh 设置按钮大小
     * @defaultValue 'middle'
     */
    size: {
      type: String as PropType<'large' | 'middle' | 'small'>,
    },
    label: {
      type: String,
      default: '公式设置',
    },
  });

  const emit = defineEmits({
    'update:value': (_value: string) => true,
    /**
     * @zh 改变事件
     */
    change: (data: { value: string | undefined; data: any }) => true,
  });
  const buttonList = [
    { label: 1, value: 1 },
    { label: 2, value: 2 },
    { label: 3, value: 3 },
    { label: 4, value: 4 },
    { label: 5, value: 5 },
    { label: 6, value: 6 },
    { label: 7, value: 7 },
    { label: 8, value: 8 },
    { label: 9, value: 9 },
    { label: 0, value: 0 },
    { label: 'i', value: 'i' },
    { label: '+', value: '+' },
    { label: '-', value: '-' },
    { label: '*', value: '*' },
    { label: '/', value: '/' },
    { label: '>', value: '>' },
    { label: '<', value: '<' },
    { label: '=', value: '=' },
    { label: '(', value: '(' },
    { label: ')', value: ')' },
    { label: '[', value: '[' },
    { label: ']', value: ']' },
    { label: "'", value: "'" },
    { label: `"`, value: `"` },
    { label: ',', value: ',' },
    { label: '.', value: '.' },
  ];

  const funList = [
    {
      label: 'ABS',
      value: 'abs',
      des: [
        'ABS函数可以获取一个数的绝对值',
        '用法：ABS(数字)',
        '示例：ABS(-8)可以返回8，也就是-8的绝对值',
      ],
    },
    {
      label: 'AVERAGE',
      value: 'average',
      des: [
        'AVERAGE函数可以获取一组数值的算术平均值',
        '用法：AVERAGE(数字1,数字2,...)',
        '示例：AVERAGE({语文成绩},{数学成绩}, {英语成绩})返回三门课程的平均分',
      ],
    },
    {
      label: 'CEILING',
      value: 'ceiling',
      des: [
        'CEILING函数可以将数字增大到最接近原值的指定因数的倍数',
        '用法：CEILING(数字,因数)',
        '示例：CEILING(7,6)返回12，因为12比7大的同时，也是6的倍数中最接近7的数字',
      ],
    },
    {
      label: 'COUNT',
      value: 'count',
      des: [
        'COUNT函数可以获取参数的数量',
        '用法：COUNT(值,值,...)',
        '示例：COUNT(小明,小王,小张,小李)返回4，也就是人员的数量',
      ],
    },
    {
      label: 'COUNTIF',
      value: 'countif',
      des: [
        'COUNTIF函数可以获取数组中满足条件的参数个数',
        "用法：COUNTIF(数组,'条件')",
        "示例：COUNTIF(子表单.性别, '女')，可得到子表单中性别填的是'女'的数据条数；COUNTIF([1,2,3,4],'>2')，可得到1,2,3,4中大于2的数字数量，结果为2。",
      ],
    },
    {
      label: 'FIXED',
      value: 'fixed',
      des: [
        'FIXED函数可将数字舍入到指定的小数位数并输出为文本',
        '用法：FIXED(数字,小数位数)',
        "示例：FIXED(3.1415,2)返回'3.14'",
      ],
    },
    {
      label: 'FLOOR',
      value: 'floor',
      des: [
        'FLOOR函数可将数字减小到最接近原值的指定因数的倍数',
        '用法：FLOOR(数字,因数)',
        '示例：FLOOR(7,6)返回6，因为6比7小的同时，也是6的倍数中最接近7的数字',
      ],
    },
    {
      label: 'INT',
      value: 'int',
      des: [
        'INT函数可以获取一个数的整数部分',
        '用法：INT(数字)',
        '示例：INT(3.1415)返回3，也就是3.1415的整数部分',
      ],
    },
    {
      label: 'LARGE',
      value: 'large',
      des: [
        'LARGE函数可以获取数据集中第k个最大值',
        '用法：LARGE(数组,k)',
        "示例：LARGE({学生成绩.数学成绩},1)返回子表单'学生成绩'中排名第1的'数学成绩'",
      ],
    },
    {
      label: 'LOG',
      value: 'log',
      des: [
        'LOG函数可以根据指定底数返回数字的对数',
        '用法：LOG(数字,底数)',
        '示例：LOG(100,10)返回2，也就是以10为底数100的对数',
      ],
    },
    {
      label: 'MAX',
      value: 'max',
      des: [
        'MAX函数可以获取一组数值的最大值',
        '用法：MAX(数字1,数字2,...)',
        '示例：MAX({语文成绩},{数学成绩},{英语成绩})返回三门课程中的最高分',
      ],
    },
    {
      label: 'MIN',
      value: 'min',
      des: [
        'MIN函数可以获取一组数值的最小值',
        '用法：MIN(数字1,数字2,...)',
        '示例：MIN({语文成绩},{数学成绩},{英语成绩})返回三门课程中的最低分',
      ],
    },
    {
      label: 'MOD',
      value: 'mod',
      des: [
        'MOD函数可以获取两数相除的余数',
        '用法：MOD(被除数,除数)',
        '示例：MOD(4,3)返回1，也就是4/3的余数',
      ],
    },
    {
      label: 'POWER',
      value: 'power',
      des: [
        'POWER函数可以获取数字乘幂的结果',
        '用法：POWER(数字,指数)',
        '示例：POWER(3，2)返回9，也就是3的2次方',
      ],
    },
    {
      label: 'PRODUCT',
      value: 'product',
      des: [
        'PRODUCT函数可以获取一组数值的乘积',
        '用法：PRODUCT(数字1,数字2,...)',
        '示例：PRODUCT({单价}, {数量})获取总价，也就是单价和数量的乘积',
      ],
    },
    {
      label: 'RAND',
      value: 'rand',
      des: [
        'RAND函数可返回大于等于0且小于1的均匀分布随机实数',
        '用法：RAND()',
        '示例：RAND()返回0.424656',
      ],
    },
    {
      label: 'ROUND',
      value: 'round',
      des: [
        'ROUND函数可以将数字四舍五入到指定的位数',
        '用法：ROUND(数字,数字位数)',
        '示例：ROUND(3.1485,2)返回3.15',
      ],
    },
    {
      label: 'SMALL',
      value: 'small',
      des: [
        'SMALL函数可以返回数据集中第k个最小值',
        '用法：SMALL(数组,k)',
        "示例：SMALL({学生成绩.数学成绩}, 1)返回子表单'学生成绩'中排名倒数第一的'数学成绩'",
      ],
    },
    {
      label: 'SQRT',
      value: 'sqrt',
      des: [
        'SQRT函数可以获取一个数字的正平方根',
        '用法：SQRT(数字)',
        '示例：SQRT(9)返回3，也就是9的正平方根',
      ],
    },
    {
      label: 'SUM',
      value: 'sum',
      des: [
        'SUM函数可以获取一组数值的总和',
        '用法：SUM(数字1,数字2,...)',
        '示例：SUM({语文成绩},{数学成绩}, {英语成绩})返回三门课程的总分',
      ],
    },
    {
      label: 'SUMPRODUCT',
      value: 'sumproduct',
      des: [
        'SUMPRODUCT函数可以将数组间对应的元素相乘，并返回乘积之和，适用于加权求和',
        '用法：SUMPRODUCT(数组,数组...)',
        '示例：SUMPRODUCT([1,2,3],[0.1,0.2,0.3])返回1.4，也就是 1×0.1 + 2×0.2 + 3×0.3的值',
      ],
    },
  ];

  const formVisible = ref(false);
  const des = ref<any[]>([]);
  const formatJson = reactive<Record<string, any>>({
    cells: [],
    cursor: 0,
  });
  const currentData = computed({
    get() {
      return JSON.parse(props.value || '[]');
    },
    set(list) {
      emit('update:value', list.length > 0 ? JSON.stringify(list) : '');
      emit('change', { value: list.length > 0 ? JSON.stringify(list) : '', data: list });
    },
  });

  const handleMouseover = (val: any[]) => {
    des.value = val;
  };

  const handleClick = (value: string | number, type: string) => {
    const cell: Record<string, any> = {
      value,
      type,
    };
    formatJson.cells.splice(formatJson.cursor, 0, cell);
    formatJson.cursor += 1;
    if (type === 'fun') {
      const leftBracket = {
        value: '(',
        type,
      };
      const rightBracket = {
        value: ')',
        type,
      };
      formatJson.cells.splice(formatJson.cursor, 0, leftBracket, rightBracket);
      formatJson.cursor += 1;
    }
  };

  const handleLeft = () => {
    if (formatJson.cursor > 0) {
      formatJson.cursor -= 1;
    }
  };
  const handleRight = () => {
    if (formatJson.cursor < formatJson.cells.length) {
      formatJson.cursor += 1;
    }
  };
  const handleCallBack = () => {
    if (formatJson.cursor > 0) {
      formatJson.cells.splice(formatJson.cursor - 1, 1);
      formatJson.cursor -= 1;
    }
  };
  const handleClear = () => {
    formatJson.cells = [];
    formatJson.cursor = 0;
  };

  const handleOpen = () => {
    formatJson.cells = deepClone(currentData.value);
    formatJson.cursor = formatJson.cells.length;
    formVisible.value = true;
  };

  const handleOk = () => {
    currentData.value = formatJson.cells;
    formVisible.value = false;
  };

  const handleClosed = () => {
    formatJson.cells = [];
    formatJson.cursor = 0;
    formVisible.value = false;
  };

  const compsMap = computed(() => {
    const res: Record<string, string> = {};
    props.list.forEach((item) => {
      item.children.forEach((citem: any) => {
        res[citem.value] = `${item.label}.${citem.label}`;
      });
    });
    return res;
  });

  const getLabel = (value: string) => compsMap.value[value] || value;
</script>

<style lang="less">
  @import './inputCount';
</style>
