const httpReqs: Record<string, any> = [];
export function useUrl() {
  const addReq = (data: Record<string, any>) => {
    const index = httpReqs.findIndex((t) => t.url === data.url);
    if (index != -1) {
      httpReqs.splice(index, 1);
    }

    if (httpReqs.length == 200) {
      httpReqs.splice(0, 1);
    }
    data.time = new Date().getTime();

    httpReqs.push(data);

    // console.log(httpReqs, 'httpReqs');
  };

  const getReq = (url: string) => {
    return httpReqs.find((t) => t.url === url);
  };

  const getLastReq = () => {
    if (httpReqs.length > 0) {
      return httpReqs[httpReqs.length - 1];
    }
    return null;
  };

  const getLastTime = () => {
    const last = getLastReq();

    if (last) {
      const time = new Date().getTime();
      const diff = time - last.time;
      return Math.floor(diff / (60 * 1000));
    }

    return -1; // 表示没有请求过
  };

  return {
    addReq,
    getReq,
    getLastReq,
    getLastTime,
  };
}
