<template>
  <a-spin :spinning="loading" :tip="$t('图片上传中...')">
    <div ref="editorRef" class="lr-text-editor" :style="styleObj"></div>
  </a-spin>
</template>

<script lang="ts" setup>
  import { PropType, computed, ref, onMounted, watch } from 'vue';
  import { isNumber } from '../utils/is';
  // @ts-ignore
  import Quill from 'quill';
  import 'quill/dist/quill.snow.css';

  import { useFramework } from '../utils/useFramework';

  defineOptions({ name: 'LrTextEditor' });

  const props = defineProps({
    /**
     * @zh 输入值
     */
    value: {
      type: String as PropType<string>,
    },
    /**
     * @zh 高度
     */
    height: {
      type: [String, Number],
    },
    /**
     * @zh 配置项
     */
    options: Object,
    /**
     * @zh 占位符
     */
    placeholder: String,
    /**
     * @zh 是否只读
     */
    readonly: Boolean,
    /**
     * @zh 是否上传图片
     */
    isUploadImg: {
      type: Boolean,
      default: true,
    },
  });

  const emit = defineEmits({
    'update:value': (value: string) => true,
    /**
     * @zh 当值发生改变时触发
     */
    change: (data: { value: string }) => true,
  });
  const { token, apiUrl } = useFramework({});

  const editorRef = ref();
  const loading = ref(false);
  const styleObj = computed(() => {
    const height = isNumber(props.height) ? props.height + 'px' : props.height;
    return {
      height,
    };
  });
  let quill: any = null;
  let content = '';

  const pSetContent = (val: string) => {
    if (quill !== null) {
      if (content !== val) {
        // 图片格式转化
        val = val || '';

        if (apiUrl && token) {
          val = val
            .replace(/{jcode_img_api}/g, `${apiUrl}/system/annexesfile/`)
            .replace(/{jcode_img_token}/g, `token=${token?.value}`);
        }

        content = val;
        quill.root.innerHTML = val;
      }
    }
  };

  onMounted(() => {
    const fontFamily = [
      'SimSun',
      'Microsoft-YaHei',
      'SimHei',
      'FangSong',
      'KaiTi',
      'Lishu',
      'Youyuan',
      'Pingfang',
      'Arial',
      'ComicSansMs',
      'CourierNew',
      'Tahoma',
      'TimesNewRoman',
      'Verdana',
    ];
    Quill.imports['formats/font'].whitelist = fontFamily;
    Quill.register(Quill.imports['formats/font'], true);

    // 自定义文字大小
    const fontSize = ['12px', '13px', '14px', '15px', '16px', '18px', '20px', '24px', '36px'];
    Quill.imports['attributors/style/size'].whitelist = fontSize;
    Quill.register(Quill.imports['attributors/style/size'], true);

    // 实例化
    quill = new Quill(editorRef.value, {
      theme: 'snow',
      placeholder: props.placeholder,
      readOnly: props.readonly,
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block'],
          [
            { list: 'ordered' },
            { list: 'bullet' },
            { script: 'sub' },
            { script: 'super' },
            { indent: '-1' },
            { indent: '+1' },
            { align: [] },
          ],
          [
            { color: [] },
            { background: [] },
            { font: fontFamily },
            { size: fontSize },
            { header: [1, 2, 3, 4, 5, 6, false] },
          ],
          ['link', 'image'],
        ],
      },
      ...props.options,
    });

    pSetContent(props.value || '');

    quill.on('text-change', () => {
      let value = quill.root.innerHTML;

      // 图片需要做一次转化
      if (apiUrl) {
        const delta = quill.getContents();
        const len = delta.ops.length;
        for (let i = 0; i < len; i++) {
          const deltaItem = delta.ops[i];
          if (
            deltaItem.insert &&
            deltaItem.insert.image &&
            deltaItem.insert.image.indexOf(apiUrl) > -1
          ) {
            const imageUrl = `${deltaItem.insert.image
              .replace(apiUrl + 'system/annexesfile/', '{jcode_img_api}')
              .replace(`token=${token?.value}`, '{jcode_img_token}')}`;
            value = value.replace(deltaItem.insert.image, imageUrl);
          }
        }
      }

      content = value;
      emit('update:value', value);
      emit('change', { value });
    });
  });

  watch(
    () => props.value,
    (val) => {
      console.log(val);
      pSetContent(val || '');
    },
  );
</script>

<style lang="less">
  @import './textEditor';
</style>
