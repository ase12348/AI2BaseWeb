export default function loadBMap(ak: string) {
  return new Promise((resolve, reject) => {
    // @ts-ignore
    if (typeof window.BMap !== 'undefined') {
      // @ts-ignore
      resolve(window.BMap);
      return;
    }
    // @ts-ignore
    window.onBMapCallback = function () {
      // @ts-ignore
      resolve(window.BMap);
    };
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = `https://api.map.baidu.com/api?v=3.0&ak=${
      ak || 'dPHQKHyFl1GmMBjGVbVCSs6GSrswTuPQ'
    }&callback=onBMapCallback`;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}
