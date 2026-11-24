import type { buttonItem } from './interface';

export function useButtons(layerRef: any) {
  const handleOpenForm = (data: {
    name: any;
    type?: string;
    title?: string;
    width: number;
    height: number;
    formConfig: Record<string, any>;
    param: Record<string, any>;
    afterOk?: any;
    afterClose?: any;
    afterCancel?: any;
    hasBtns?: boolean;
  }) => {
    layerRef.value.open(data);
  };

  // 点击事件
  const handleClick = (btn: buttonItem) => {
    if (btn.disabled) return;

    if (btn.layerName) {
      if (btn.layerGetParam) {
        btn.layerParam = btn.layerGetParam();
      }
      handleOpenForm({
        title: btn.layerTitle,
        name: btn.layerName,
        width: btn.layerWidth || 1000,
        height: btn.layerHeight || 600,
        afterOk: btn.afterOk || null,
        afterClose: btn.afterClose || null,
        formConfig: btn.layerFormConfig || {},
        param: btn.layerParam || {},
        type: btn.layerType,
        hasBtns: btn.layerHasBtns,
      });
      return;
    }

    btn.click && btn.click({ handleOpenForm });
  };

  return {
    handleClick,
  };
}
