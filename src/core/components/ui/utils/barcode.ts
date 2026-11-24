import JsBarcode from 'jsbarcode';

export const getBarcodeImg = (value: string, type: string, config: any) => {
  if (type === 'qr') {
    // 二维码
    if (!(window as any).AwesomeQR) {
      console.error('缺少awesome-qr.js');
      return;
    }
    return new Promise((resolve) => {
      const options = {
        text: value,
        ...config,
      };
      new (window as any).AwesomeQR.AwesomeQR(options)
        .draw()
        .then((dataURL: string) => {
          const img = document.createElement('IMG');
          img.setAttribute('src', dataURL);
          img.remove();
          resolve(dataURL);
        })
        .catch((err: any) => {
          console.error(err);
          resolve('');
        });
    });
  }
  // 一维码
  const options = {
    format: type,
    ...config,
  };
  const img = document.createElement('IMG');
  try {
    JsBarcode(img, value, options);
  } catch (error) {
    console.error(error);
  }
  const res = img.getAttribute('src');
  img.remove();
  return res;
};
