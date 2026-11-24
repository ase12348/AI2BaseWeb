<template>
  <a-popover trigger="click" v-model:open="isOpen" @open-change="handleOpenChange">
    <template #content>
      <div class="lr-color-view">
        <div style="display: flex; justify-content: space-between">
          <div
            class="lr-color-view-panel"
            :style="{ background: 'rgb(' + bgcolor.r + ',' + bgcolor.g + ',' + bgcolor.b + ')' }"
          >
            <div class="background">
              <div class="mask" @click="handleClick($event, 0)"></div>
              <div
                class="pointer"
                @mousedown.stop="mouseStart($event, 0)"
                :style="{ top: site[0].top + 'px', left: site[0].left + 'px' }"
              ></div>
            </div>
          </div>
          <div class="lr-color-view-hue-controller">
            <div class="hue" @click="handleClick($event, 1)"></div>
            <div
              class="thumb"
              @mousedown.stop="mouseStart($event, 1)"
              :style="{ top: site[1].top + 'px' }"
            ></div>
          </div>
        </div>
        <div class="lr-color-view-transparency-controller lr-svg-bg">
          <div class="transparency" @click="handleClick($event, 2)"></div>
          <div
            class="thumb"
            @mousedown.stop="mouseStart($event, 2)"
            :style="{ left: site[2].left + 'px' }"
          ></div>
        </div>
        <div class="alternative">
          <div
            @click="handleSetColor(item)"
            class="alternative__item lr-svg-bg"
            v-for="(item, index) in colorList"
            :key="index"
          >
            <div
              class="alternative__item-content"
              :style="{
                background: 'rgba(' + item.r + ',' + item.g + ',' + item.b + ',' + item.a + ')',
              }"
            ></div>
          </div>
        </div>
        <div class="lr-color-view-bottom">
          <a-input style="width: 160px" :value="showValue" readonly />
          <a-space>
            <lr-button type="link" @click="handleClear">{{ $t('清空') }}</lr-button>
            <lr-button @click="handleOk">{{ $t('确定') }} </lr-button>
          </a-space>
        </div>
      </div>
    </template>
    <div class="lr-svg-bg lr-color-button">
      <div class="lr-block" :style="{ 'background-color': showValue }"></div>
    </div>
  </a-popover>
</template>
<script lang="ts" setup>
  import { ref, computed, reactive } from 'vue';

  const props = defineProps({
    value: String,
  });

  const emit = defineEmits(['update:value']);

  const isOpen = ref(false);

  const showValue = computed(() =>
    isOpen.value ? `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})` : props.value,
  );

  let hsb = {
    h: 0,
    s: 0,
    b: 0,
  };

  const bgcolor = reactive({
    r: 255,
    g: 0,
    b: 0,
  });

  const rgba = reactive({
    r: 0,
    g: 0,
    b: 0,
    a: 1,
  });

  const colorList = [
    {
      r: 244,
      g: 67,
      b: 54,
      a: 1,
    },
    {
      r: 233,
      g: 30,
      b: 99,
      a: 1,
    },
    {
      r: 156,
      g: 39,
      b: 176,
      a: 1,
    },
    {
      r: 103,
      g: 58,
      b: 183,
      a: 1,
    },
    {
      r: 63,
      g: 81,
      b: 181,
      a: 1,
    },
    {
      r: 33,
      g: 150,
      b: 243,
      a: 1,
    },
    {
      r: 3,
      g: 169,
      b: 244,
      a: 1,
    },
    {
      r: 0,
      g: 188,
      b: 212,
      a: 1,
    },
    {
      r: 0,
      g: 150,
      b: 136,
      a: 1,
    },
    {
      r: 139,
      g: 195,
      b: 74,
      a: 1,
    },
    {
      r: 205,
      g: 220,
      b: 57,
      a: 1,
    },
    {
      r: 255,
      g: 235,
      b: 59,
      a: 1,
    },
    {
      r: 255,
      g: 193,
      b: 7,
      a: 1,
    },
    {
      r: 255,
      g: 152,
      b: 0,
      a: 1,
    },
    {
      r: 121,
      g: 85,
      b: 72,
      a: 1,
    },
    {
      r: 158,
      g: 158,
      b: 158,
      a: 1,
    },
    {
      r: 0,
      g: 0,
      b: 0,
      a: 0.5,
    },
    {
      r: 0,
      g: 0,
      b: 0,
      a: 0,
    },
  ];

  const site = reactive([
    {
      top: 0,
      left: 0,
    },
    {
      top: 0,
      left: 0,
    },
    {
      top: 0,
      left: 0,
    },
  ]);
  const move = reactive({
    index: 0,
    isMove: false,
    pageX: 0,
    pageY: 0,
    top: 0,
    left: 0,
  });
  const maxWidth = 280;
  const maxHeight = 180;

  const mouseStart = (e: MouseEvent, index: number) => {
    move.index = index;
    move.isMove = true;
    move.pageX = e.pageX;
    move.pageY = e.pageY;
    move.top = site[index].top;
    move.left = site[index].left;

    document.onmouseup = onMouseup;
    document.onmousemove = onMousemove;
  };

  const onMousemove = (e: MouseEvent) => {
    if (move.isMove) {
      let x = move.left + e.pageX - move.pageX;
      let y = move.top + e.pageY - move.pageY;

      if (x < 0) x = 0;
      if (y < 0) y = 0;

      if (x > maxWidth) x = maxWidth;
      if (y > maxHeight) y = maxHeight;

      site[move.index].top = y;
      site[move.index].left = x;

      setColor(move.index);
    }
  };
  const onMouseup = () => {
    move.isMove = false;
    document.onmouseup = null;
    document.onmousemove = null;
  };

  const handleClick = (e: MouseEvent, index: number) => {
    site[index].top = e.offsetY;
    site[index].left = e.offsetX;

    setColor(index);
  };

  const handleSetColor = ({ r, g, b, a }: { r: number; g: number; b: number; a: number }) => {
    rgba.r = r;
    rgba.g = g;
    rgba.b = b;
    rgba.a = a;

    hsb = rgbToHsb(rgba);
    changeViewByHsb();
  };

  const setRgb = () => {
    const rgb = hsbToRgb(hsb);
    rgba.r = rgb.r;
    rgba.g = rgb.g;
    rgba.b = rgb.b;
  };
  const setColor = (type: number) => {
    switch (type) {
      case 0:
        hsb.s = Math.round((site[type].left * 100) / maxWidth);
        hsb.b = Math.round(100 - (100 * site[type].top) / maxHeight);
        setRgb();
        break;
      case 1:
        {
          hsb.h = Math.round((360 * site[type].top) / maxHeight);
          const rgb = hsbToRgb({
            h: hsb.h,
            s: 100,
            b: 100,
          });
          bgcolor.r = rgb.r;
          bgcolor.g = rgb.g;
          bgcolor.b = rgb.b;
          setRgb();
        }
        break;
      case 2:
        rgba.a = Number((site[type].left / maxWidth).toFixed(2));
        break;
    }
  };

  const hsbToRgb = (hsb: any) => {
    const rgb = { r: 0, g: 0, b: 0 };
    let h = Math.round(hsb.h);
    const s = Math.round((hsb.s * 255) / 100);
    const v = Math.round((hsb.b * 255) / 100);
    if (s === 0) {
      rgb.r = v;
      rgb.g = v;
      rgb.b = v;
    } else {
      const t1 = v;
      const t2 = ((255 - s) * v) / 255;
      const t3 = ((t1 - t2) * (h % 60)) / 60;
      if (h === 360) h = 0;
      if (h < 60) {
        rgb.r = t1;
        rgb.b = t2;
        rgb.g = t2 + t3;
      } else if (h < 120) {
        rgb.g = t1;
        rgb.b = t2;
        rgb.r = t1 - t3;
      } else if (h < 180) {
        rgb.g = t1;
        rgb.r = t2;
        rgb.b = t2 + t3;
      } else if (h < 240) {
        rgb.b = t1;
        rgb.r = t2;
        rgb.g = t1 - t3;
      } else if (h < 300) {
        rgb.b = t1;
        rgb.g = t2;
        rgb.r = t2 + t3;
      } else if (h < 360) {
        rgb.r = t1;
        rgb.g = t2;
        rgb.b = t1 - t3;
      } else {
        rgb.r = 0;
        rgb.g = 0;
        rgb.b = 0;
      }
    }
    return {
      r: Math.round(rgb.r),
      g: Math.round(rgb.g),
      b: Math.round(rgb.b),
    };
  };
  const rgbToHsb = (rgb: any) => {
    const hsb = {
      h: 0,
      s: 0,
      b: 0,
    };
    const min = Math.min(rgb.r, rgb.g, rgb.b);
    const max = Math.max(rgb.r, rgb.g, rgb.b);
    const delta = max - min;
    hsb.b = max;
    hsb.s = max !== 0 ? (255 * delta) / max : 0;
    if (hsb.s !== 0) {
      if (rgb.r === max) hsb.h = (rgb.g - rgb.b) / delta;
      else if (rgb.g === max) hsb.h = 2 + (rgb.b - rgb.r) / delta;
      else hsb.h = 4 + (rgb.r - rgb.g) / delta;
    } else hsb.h = -1;
    hsb.h *= 60;
    if (hsb.h < 0) hsb.h = 0;
    hsb.s *= 100 / 255;
    hsb.b *= 100 / 255;
    return hsb;
  };

  const changeViewByHsb = () => {
    site[0].left = Math.round((hsb.s * maxWidth) / 100);
    site[0].top = Math.round(((100 - hsb.b) * maxHeight) / 100);
    const rgb = hsbToRgb({
      h: hsb.h,
      s: 100,
      b: 100,
    });
    bgcolor.r = rgb.r;
    bgcolor.g = rgb.g;
    bgcolor.b = rgb.b;

    site[1].top = (hsb.h / 360) * maxHeight;
    site[2].left = rgba.a * maxWidth;
  };

  const handleOpenChange = (visible: boolean) => {
    if (visible) {
      if (props.value?.indexOf('rgba') !== -1) {
        const colorList = props.value?.replace('rgba(', '').replace(')', '').split(',');
        if (colorList?.length === 4) {
          rgba.r = Number(colorList[0]);
          rgba.g = Number(colorList[1]);
          rgba.b = Number(colorList[2]);
          rgba.a = Number(colorList[3]);
        }
      } else if (props.value?.indexOf('#') !== -1 && props.value?.length >= 7) {
        // console.log(props.value,props.value?.length,props.value?.indexOf('#') !== -1)

        const color = props.value?.slice(1); // 去掉'#'号
        rgba.r = parseInt('0x' + color.slice(0, 2), 16);
        rgba.g = parseInt('0x' + color.slice(2, 4), 16);
        rgba.b = parseInt('0x' + color.slice(4, 6), 16);
        rgba.a = 1;

        // eslint-disable-next-line radix
        // console.log(parseInt('0x' + color.slice(4, 6), 100))
      } else {
        rgba.r = 0;
        rgba.g = 0;
        rgba.b = 0;
        rgba.a = 1;
      }

      hsb = rgbToHsb(rgba);
      changeViewByHsb();
    }
  };

  const handleClear = (e: any) => {
    isOpen.value = false;
    emit('update:value', undefined);
  };

  const handleOk = (e: any) => {
    emit('update:value', showValue.value);
    isOpen.value = false;
  };
</script>
