import { emitEvent, onEvent } from './eventBus';
import { HubConnectionBuilder } from '@microsoft/signalr';
import { useGlobSetting } from '/@/core/hooks/setting';

const { imUrl } = useGlobSetting();

let connection;
let isStop = false;

const imInit = async (userId) => {
  isStop = false;
  // 初始化im即时通讯
  connection = new HubConnectionBuilder()
    .withUrl(`${imUrl}/ChatsHub`)
    .withAutomaticReconnect({
      nextRetryDelayInMilliseconds: (retryContext) => {
        //console.log('im 重连', retryContext.elapsedMilliseconds)
        if (isStop) {
          return null;
        }

        if (retryContext.elapsedMilliseconds < 60000) {
          return 10000; // 10s重连一次
        } else {
          return 60000; // 60s重连一次
        }
      },
    })
    .build();

  connection.on('revMsg', (userId, msg, dateTime, id, isSystem) => {
    //console.log(userId, msg, dateTime, id, isSystem, 'revMsg')
    if (isSystem == 1) {
      // 系统消息
      emitEvent('jcode-im-system-message', {
        userId,
        msg,
        dateTime,
        id,
      });
    } else if (isSystem == 2) {
      // 系统消息（特定消息）
      emitEvent('jcode-im-system-ex-message', {
        userId,
        msg,
        dateTime,
        id,
      });
    } else {
      // 聊天信息
      emitEvent('jcode-im-chat-message', {
        userId,
        msg,
        dateTime,
        id,
      });
    }
  });

  connection.onclose(async () => {
    //console.log("Connection closed!", e)
    if (!isStop) {
      await start();
    }
  });

  async function start() {
    try {
      await connection.start();
      connection.invoke('SendInfo', userId);
      //console.log("SignalR Connected.")
    } catch (err) {
      console.log(err);
      setTimeout(start, 5000);
    }
  }

  // 监听发送事件
  onEvent('jcode-im-send', ({ sendUserId, recvUserId, msg, id, isSystem }) => {
    //console.log(sendUserId, recvUserId, msg, id, isSystem)
    if (isSystem == undefined) {
      isSystem = 0;
    }
    if (connection.state == 'Connected') {
      connection.invoke('SendMsg', sendUserId, recvUserId, msg, id, isSystem);
    }
  });

  await start();
};

const imClose = async () => {
  if (connection) {
    isStop = true;
    await connection.stop();
  }
};

export { imClose, imInit };
