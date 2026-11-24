import { useGlobSetting } from '/@/core/hooks/setting';
import { isNullOrEmpty } from '/@/core/utils/jcode';
import { ensureValidAccessToken } from '/@/core/utils/http/tokenRefresh';
import { api } from '/@/core/modules/system/api/annexesFile';
import { HashingFactory } from '@/core/utils/jcode';

import { t } from '@/core/locales/setupI18n';

// 如果上传错误，获取报错信息
function getError(action, xhr) {
  let msg;
  if (xhr.response) {
    msg = `${xhr.response.error || xhr.response}`;
  } else if (xhr.responseText) {
    msg = `${xhr.responseText}`;
  } else {
    msg = `fail to post ${action} ${xhr.status}`;
  }
  const err = new Error(msg);
  // @ts-ignore
  err.status = xhr.status;
  // @ts-ignore
  err.method = 'post';
  // @ts-ignore
  err.url = action;
  return err;
}

export default function fileChunkedUpload(option, callback) {
  const webCofing = useGlobSetting();

  if (typeof XMLHttpRequest === 'undefined') {
    return;
  }
  let flieMd5 = ''; // 文件的唯一标识

  const { file, data, filename, withCredentials } = option;
  let action = webCofing.apiUrl;
  // 分片上传用 XHR 直连，不走 axios 拦截器，先取一个未过期的访问令牌
  let uploadToken = '';

  const fileReader = new FileReader(); // 文件读取类
  const chunkSize = 1024 * 1024 * 0.5; // 单个分片大小 // 改成0.5M nginx 有限制
  const fileChunkedList: any[] = []; // 文件分片完成之后的数组
  const percentage: any[] = []; // 文件上传进度的数组，单项就是一个分片的进度

  // 文件开始分片，push到fileChunkedList数组中， 并用第一个分片去计算文件的md5
  let num = 0;
  for (let i = 0; i < file.size; i = i + chunkSize) {
    const tmp = file.slice(i, Math.min(i + chunkSize, file.size));
    if (i === 0) {
      fileReader.readAsArrayBuffer(tmp);
    }
    const formData = new FormData();
    formData.append(filename, tmp, file.name); // 文件
    fileChunkedList.push({ formData: formData, size: tmp.size, index: num });
    num++;
  }

  fileReader.onload = async (e) => {
    flieMd5 = HashingFactory.createMD5Hashing(e.target?.result) + new Date().getTime();
    // 密级设定
    if (!isNullOrEmpty(file.secretLevel)) {
      flieMd5 = flieMd5 + file.secretLevel;
    }

    //console.log('文件md5为--------', flieMd5);
    action += `system/annexesfile/${flieMd5}`;

    // 将fileChunkedList转成FormData对象，并加入上传时需要的数据
    /*fileChunkedList = fileChunkedList.map((item, index) => {
            return { data: item, index: index }
        })*/

    // 更新上传进度条百分比的方法
    const updataPercentage = (e) => {
      let loaded = 0; // 当前已经上传文件的总大小
      percentage.forEach((item) => {
        loaded += item;
      });
      e.percent = (loaded / file.size) * 100;
      e.fileSize = loaded;
      e.uid = file.uid;

      option.onProgress && option.onProgress(e);
    };

    // 创建队列上传任务，limit是上传并发数
    function sendRequest(chunks, limit = 3) {
      return new Promise<void>((resolve, reject) => {
        const len = chunks.length;
        let counter = 0;
        let isStop = false;
        const start = async () => {
          if (isStop) {
            return;
          }
          const item = chunks.shift(); // 获取数组第一个参数
          if (item) {
            const xhr = new XMLHttpRequest();
            const index = item.index;

            // 分片上传失败回调
            xhr.onerror = function error(e) {
              isStop = true;
              reject(e);
            };
            xhr.onabort = function error(e) {
              isStop = true;
              reject(e);
            };

            // 分片上传成功回调
            xhr.onload = function onload() {
              if (xhr.status < 200 || xhr.status >= 300) {
                isStop = true;
                reject(getError(action, xhr));
              }

              const res = JSON.parse(xhr.response);
              if (res.code != 200) {
                isStop = true;
                const err = new Error(res.info) as Record<string, any>;
                err.status = res.code;
                err.method = 'post';
                err.url = action;
                reject(err);
              }

              if (counter === len - 1) {
                // 最后一个上传完成
                resolve();
              } else {
                counter++;
                start();
              }
              percentage[index] = item.size;
              updataPercentage({});
            };
            xhr.open('post', `${action}/${index}?token=${uploadToken}`, true);
            if (withCredentials && 'withCredentials' in xhr) {
              xhr.withCredentials = true;
            }
            /*const xhHeaders = headers || {}
                        for (const item in xhHeaders) {
                            if (xhHeaders.hasOwnProperty(item) && xhHeaders[item] !== null) {
                                xhr.setRequestHeader(item, headers[item])
                            }
                        }*/

            option.onStart &&
              option.onStart({
                uid: file.uid,
                xhr,
                chunks: len,
                id: flieMd5,
              });

            // 文件开始上传
            xhr.send(item.formData);

            //这里是把所有分片上传的xhr存到全局中，如果用户手动取消上传，或者上传出现错误，则要调用xhr.abort()把store中所有xhr的停止，不然文件还会继续上传
            //store.commit('SET_CHUNKEDUPLOADXHR', xhr)
          }
        };
        while (limit > 0) {
          setTimeout(() => {
            start();
          }, Math.random() * 1000);
          limit -= 1;
        }
      });
    }

    try {
      const chunks = fileChunkedList.length;
      uploadToken = await ensureValidAccessToken();
      // 调用上传队列方法 等待所有文件上传完成
      await sendRequest(fileChunkedList, 3);
      // 这里的参数根据自己实际情况写
      const formData = {
        folderId: data.folderId,
        filename: file._name || file.name,
        fileId: flieMd5,
        chunks: chunks,
      };
      formData.filename = formData.filename.replace(/\s+/g, '');
      // 给后端发送文件合并请求

      let fileInfo;

      if (callback) {
        fileInfo = await callback(formData, file.param);
        if (file.callback) {
          file.callback();
        }
      } else {
        fileInfo = await api.merge(formData);
      }

      if (fileInfo.data.code === 200) {
        option.onSuccess &&
          option.onSuccess({
            name: file._name || file.name,
            info: fileInfo.data.info,
            folderId: data.folderId,
            fileId: flieMd5,
            res: fileInfo,
            uid: file.uid,
          });
        return;
      } else {
        option.onError && option.onError(t('上传失败'), file.uid);
      }
    } catch (error) {
      console.error(error, '文件上传失败');
      option.onError && option.onError(error, file.uid);
    }
  };
}
