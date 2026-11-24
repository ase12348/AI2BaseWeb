<template>
  <img
    :key="id"
    v-if="qrUrl || (format != 'qr' && !isNullOrEmpty(value))"
    ref="barcodeRef"
    :src="qrUrl"
  />
</template>

<script lang="ts" setup>
  import { watch, computed, ref, PropType } from 'vue';
  import { createNamespace } from '../utils/components';
  import { isNullOrEmpty } from '../utils/is';
  import JsBarcode from 'jsbarcode';

  defineOptions({ name: createNamespace('barcode').name });

  const props = defineProps({
    /**
     * @zh 条码值
     */
    value: {
      type: [String, Number],
    },
    /**
     * @zh 条码格式
     */
    format: {
      type: String as PropType<
        | 'CODE128'
        | 'CODE128A'
        | 'CODE128B'
        | 'CODE128C'
        | 'EAN13'
        | 'EAN8'
        | 'EAN5'
        | 'EAN2'
        | 'UPC'
        | 'CODE39'
        | 'ITF'
        | 'ITF14'
        | 'MSI10'
        | 'MSI11'
        | 'MSI1010'
        | 'MSI1110'
        | 'pharmacode'
        | 'codabar'
        | 'qr'
      >,
      default: 'CODE128',
    },
    /**
     * @zh 单个条码线宽度
     */
    width: {
      type: Number,
      default: 2,
    },
    /**
     * @zh 高度
     */
    height: {
      type: Number,
      default: 100,
    },
    /**
     * @zh 是否显示文本
     */
    displayValue: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 文本内容
     */
    text: String,
    /**
     * @zh 文字样式
     */
    fontOptions: {
      type: String,
      default: '',
    },
    /**
     * @zh 字体
     */
    font: {
      type: String,
      default: 'monospace',
    },
    /**
     * @zh 文字对齐方式
     */
    textAlign: {
      type: String,
      default: 'center',
    },
    /**
     * @zh 文本位置
     */
    textPosition: {
      type: String,
      default: 'bottom',
    },
    /**
     * @zh 条码和文字间隔
     */
    textMargin: {
      type: Number,
      default: 2,
    },
    /**
     * @zh 文字大小
     */
    fontSize: {
      type: Number,
      default: 20,
    },
    /**
     * @zh 背景色
     */
    background: {
      type: String,
      default: '#ffffff',
    },
    /**
     * @zh 条码颜色
     */
    color: {
      type: String,
      default: '#000000',
    },
    /**
     * @zh margin值
     */
    margin: {
      type: Number,
      default: 0,
    },
    /**
     * @zh marginTop值
     */
    marginTop: Number,
    /**
     * @zh marginRight值
     */
    marginRight: Number,
    /**
     * @zh marginBottom值
     */
    marginBottom: Number,
    /**
     * @zh marginLeft值
     */
    marginLeft: Number,
    /**
     * @zh 平划，只对EAN8/EAN13有效果
     */
    flat: {
      type: Boolean,
      default: false,
    },

    // 二维码属性
    /**
     * @zh 尺寸
     */
    size: {
      type: Number,
      default: 400,
    },
    /**
     * @zh 纠错等级
     */
    correctLevel: {
      type: Number,
      default: 0,
    },
    /**
     * @zh 根据二维码的背景自动计算color值
     */
    autoColor: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 背景图片
     */
    backgroundImage: String,
    /**
     * @zh 背景图像上方的调暗遮罩的颜色
     */
    backgroundDimming: String,
    /**
     * @zh 背景图像上方的调暗遮罩的颜色
     */
    gifBackground: String,

    /**
     * @zh 使用白色边距，而不是透明的，在边距上显示二维码的背景。
     */
    whiteMargin: {
      type: Boolean,
      default: true,
    },

    /**
     * @zh logo图
     */
    logoImage: String,
    /**
     * @zh logo缩放值
     */
    logoScale: {
      type: Number,
      default: 0.2,
    },
    /**
     * @zh logoMargin
     */
    logoMargin: {
      type: Number,
      default: 6,
    },
    /**
     * @zh logo圆角
     */
    logoCornerRadius: {
      type: Number,
      default: 8,
    },
  });

  const barcodeRef = ref();
  const id = ref(1);
  const qrUrl = ref('');
  const options = computed(() => {
    const options: Record<string, any> = {};
    if (props.format === 'qr') {
      options.text = props.value + '';
      options.size = props.size;
      options.margin = props.margin;
      options.correctLevel = props.correctLevel;
      options.colorDark = props.color;
      options.colorLight = props.background;
      options.autoColor = props.autoColor;

      options.backgroundImage = props.backgroundImage;
      options.backgroundDimming = props.backgroundDimming;
      options.gifBackground = props.gifBackground;

      options.whiteMargin = props.whiteMargin;

      options.logoImage = props.logoImage;
      options.logoScale = props.logoScale;
      options.logoMargin = props.logoMargin;
      options.logoCornerRadius = props.logoCornerRadius;
    } else {
      options.format = props.format;
      options.width = props.width;
      options.height = props.height;
      options.text = props.text;
      options.fontOptions = props.fontOptions;
      options.textAlign = props.textAlign;
      options.textPosition = props.textPosition;
      options.textMargin = props.textMargin;
      options.fontSize = props.fontSize;
      options.background = props.background;
      options.lineColor = props.color;

      options.margin = props.margin;
      options.marginTop = props.marginTop;
      options.marginRight = props.marginRight;
      options.marginBottom = props.marginBottom;
      options.marginLeft = props.marginLeft;

      options.displayValue = props.displayValue;

      options.flat = props.flat;
    }

    // console.log(options,'options');

    return options;
  });
  const showCode = () => {
    if (props.format === 'qr') {
      if (!(window as any).AwesomeQR) {
        console.error('缺少awesome-qr.js');
        return;
      }

      new (window as any).AwesomeQR.AwesomeQR(options.value)
        .draw()
        .then((dataURL: any) => {
          qrUrl.value = dataURL;
          id.value++;
        })
        .catch((err: any) => {
          console.error(err);
        });
    } else if (barcodeRef.value) {
      if (!isNullOrEmpty(props.value)) {
        JsBarcode(barcodeRef.value, props.value + '', options.value);
      }
    } else if (!isNullOrEmpty(props.value)) {
      setTimeout(() => {
        showCode();
      }, 100);
    }
  };
  watch(
    () => [props.value],
    () => {
      showCode();
    },
    { immediate: true },
  );
  watch(options, () => {
    showCode();
  });
</script>

<style lang="less">
  @import './barcode';
</style>
