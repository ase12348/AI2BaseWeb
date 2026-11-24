<template>
  <div ref="codeWraperRef" class="lr-code-mirror" :style="{ height: height ? `${height}px` : '' }">
    <textarea ref="codeRef"></textarea>
  </div>
</template>

<script lang="ts" setup>
  import { watch, ref, onMounted, onUnmounted } from 'vue';
  import { format } from 'sql-formatter';
  import { createNamespace } from '../utils/components';

  defineOptions({ name: createNamespace('codeMirror').name });

  const props = defineProps({
    /**
     * @zh 值
     * @defaultValue ''
     */
    value: {
      type: String,
      default: '',
    },
    /**
     * @zh 语言模式
     */
    mode: {
      type: String,
      default: 'application/javascript',
    },
    /**
     * @zh 只读
     */
    readOnly: {
      type: Boolean,
      default: false,
    },
    /**
     * 高度设置
     */
    height: {
      type: Number,
    },
    /**
     * @zh 是否开启自动补全
     */
    isHint: Boolean,
    /**
     * @zh 自动补全方法
     */
    handleHint: Function,
    /**
     * @zh 是否滚动到最底部
     */
    isScrollToBottom: Boolean,
  });

  const emit = defineEmits({
    'update:value': (value: string) => true,
    change: (data: { value: string }) => true,
  });

  const codeRef = ref();
  const codeWraperRef = ref();
  const myValue = ref('');
  let editor: any;

  const handleShowHint = () => {
    const cur = editor.getCursor();
    const token = editor.getTokenAt(cur);
    const { end, start, string } = token;
    let list = [];
    if (props.handleHint) {
      list = props.handleHint(string);
    }
    return {
      list,
      // @ts-ignore
      from: window.CodeMirror.Pos(cur.line, start),
      // @ts-ignore
      to: window.CodeMirror.Pos(cur.line, end),
    };
  };

  const init = () => {
    const options = {
      lineNumbers: true,
      styleActiveLine: true,
      matchBrackets: true,
      readOnly: props.readOnly,
      mode: props.mode,
      indentUnit: 2,
      gutters: ['CodeMirror-lint-markers', 'CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
      foldGutter: {
        // @ts-ignore
        // eslint-disable-next-line new-cap
        rangeFinder: new window.CodeMirror.fold.combine(
          // @ts-ignore
          window.CodeMirror.fold.indent,
          // @ts-ignore
          window.CodeMirror.fold.comment,
        ),
      },
      // extraKeys:{"Ctrl":'autocomplete'}
    };

    if (props.mode === 'text/x-vue') {
      // @ts-ignore
      options.mode = {
        name: 'vue',
      };
    }

    if (props.isHint) {
      // @ts-ignore
      options.hintOptions = {
        hint: handleShowHint,
        completeSingle: false,
      };
    }

    // @ts-ignore
    editor = window.CodeMirror.fromTextArea(codeRef.value, options);

    myValue.value = props.value;
    editor.setValue(props.value);

    editor.on(
      'change',
      (instance: { showHint: () => void }, change: { origin: string; text: string[] }) => {
        if (props.isHint) {
          if (
            change.origin !== 'complete' &&
            /^(?!_)(?!.*?_$)[a-zA-Z0-9_\u4e00-\u9fa5]+$/g.test(change.text[0])
          ) {
            instance.showHint();
          }
        }

        const value = editor.getValue();
        myValue.value = value;
        emit('update:value', value);
        emit('change', { value });
      },
    );
  };

  const pSqlFormatter = () => {
    // 格式化sql语句
    let value = format(props.value);
    value = value
      .replace(/{ JCODE_SASSID }/g, '{JCODE_SASSID}')
      .replace(/{ JCODE_SASSID_NOTT }/g, '{JCODE_SASSID_NOTT}')
      .replace(/{ JCODE_SASSID_NOTA }/g, '{JCODE_SASSID_NOTA}')
      .replace(/@ /g, '@');
    emit('update:value', value);
    emit('change', { value });
  };

  const scrollToBottom = () => {
    // 获取滚动信息  注意是两个codemirror.codemirror
    const sc = editor.getScrollInfo();
    // 滚动 注意是两个codemirror.codemirror
    editor.scrollTo(sc.left, sc.height + sc.top);
  };

  const resizeObserver = new ResizeObserver(() => {
    editor && editor.refresh();
  });

  watch(
    () => props.value,
    (val: string) => {
      if (val !== myValue.value) {
        myValue.value = val;
        editor && editor.setValue(val);
        setTimeout(() => {
          editor && editor.refresh();
          if (props.isScrollToBottom) {
            scrollToBottom();
          }
        });
      }
    },
  );

  watch(
    () => props.mode,
    (val: string) => {
      editor && editor.setOption('mode', val);
    },
  );

  onMounted(() => {
    init();
    setTimeout(() => {
      editor && editor.refresh();
    }, 300);
    resizeObserver.observe(codeWraperRef.value);
  });

  onUnmounted(() => {
    editor.off('change');
    editor = null;
  });

  /**
   * @zh sql格式化
   * @public
   */
  function sqlFormatter() {
    pSqlFormatter();
  }

  defineExpose({
    sqlFormatter,
  });
</script>

<style lang="less">
  @import './codeMirror';
</style>
