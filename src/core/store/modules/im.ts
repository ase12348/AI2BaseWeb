import { defineStore } from 'pinia';
import { store } from '/@/core/store';
import { useOrganization } from '/@/core/hooks/data/useOrganization';
import { api } from '@/core/modules/message/api/contact';
import { api as apiMsg } from '@/core/modules/message/api/msg';
import { api as apiMsgSys } from '@/core/modules/message/api/msgsys';
import { formatToDateTime } from '@/core/utils/jcode';

const { loadUser } = useOrganization();
let chatTimer;
interface StateType {
  hasNoReadChatList: boolean;
  chatList: any[];
  chatUserId: string;

  messageList: Record<string, any>;

  systemMsgNum: number;
}
export const useImStore = defineStore({
  id: 'im',
  state: (): StateType => ({
    hasNoReadChatList: false,
    chatList: [], // 聊天列表信息
    chatUserId: '',

    messageList: {}, // 消息集合

    systemMsgNum: 0,
  }),
  getters: {},
  actions: {
    refreshChat(): void {
      if (!chatTimer) {
        chatTimer = setTimeout(async () => {
          chatTimer = null;
          const list = (await api.getList()) || [];
          list.forEach((item) => {
            loadUser(item.f_OtherUserId, true);
          });
          this.chatList = list;
          this.SET_HASNOREADCHATLIST();
        }, 50);
      }
    },
    async removeChat(chat): Promise<void> {
      this.chatList.splice(
        this.chatList.findIndex((t) => t.f_Id == chat.f_Id),
        1,
      );
      this.SET_HASNOREADCHATLIST();
      await api.remove(chat.f_Id);
    },
    SET_HASNOREADCHATLIST(): void {
      if (
        this.chatList.findIndex((t) => t.f_NoReadNum > 0 && t.f_OtherUserId != this.chatUserId) > -1
      ) {
        this.hasNoReadChatList = true;
      } else {
        this.hasNoReadChatList = false;
      }
    },
    revChatMsg(chat): void {
      const myChat = this.chatList.find((t) => t.f_OtherUserId == chat.userId);

      if (myChat) {
        let num = myChat.f_NoReadNum + 1;
        if (myChat.f_OtherUserId == this.chatUserId) {
          num = 0;
        }
        myChat['f_NoReadNum'] = num;
        myChat['f_Content'] = chat.msg;
        myChat['f_Time'] = chat.dateTime;
        this.ADD_MSG({
          list: [
            {
              f_MsgId: chat.id,
              f_SendUserId: chat.userId,
              f_RecvUserId: chat.myUserId,
              f_Content: chat.msg,
              f_CreateDate: chat.dateTime,
            },
          ],
          sendUserId: chat.userId,
        });
        this.SET_HASNOREADCHATLIST();
      } else {
        this.refreshChat();
      }
    },
    async addChat(chatList): Promise<void> {
      chatList.forEach((chat) => {
        const myChat = this.chatList.find(
          (t) => t.f_MyUserId == chat.f_MyUserId && t.f_OtherUserId == chat.f_OtherUserId,
        );
        if (!myChat) {
          chat.f_NoReadNum = 0;
          chat.f_Content = '';
          chat.f_Time = formatToDateTime(new Date(), 'YYYY-MM-DD HH:mm:ss');
          this.chatList.push(chat);
        }
      });
      await api.addList(chatList);
      await this.refreshChat();
    },
    setChatUserId(userId): void {
      this.chatUserId = userId;
      if (userId) {
        api.updateState(userId);
        const myChat = this.chatList.find((t) => t.f_OtherUserId == userId);
        if (myChat) {
          myChat.f_NoReadNum = 0;
        }
        this.SET_HASNOREADCHATLIST();
      }
    },
    async refreshMessage({ recvUserId, sendUserId }: Record<string, any>): Promise<void> {
      const query = {
        rows: 30,
        page: 1,
        sidx: 'F_CreateDate DESC',
        toId: recvUserId,
        sendId: sendUserId,
      };
      // 获取聊天记录
      const data = (await apiMsg.getPage(query)) || {};
      this.ADD_MSG({ list: data.rows, sendUserId });
    },
    async sendMsg(data): Promise<any> {
      this.ADD_MSG({ list: [data], sendUserId: data.f_RecvUserId });
      data.f_MsgId = await apiMsg.add(data);

      const myChat = this.chatList.find((t) => t.f_OtherUserId == data.f_RecvUserId);
      if (myChat) {
        myChat.f_Content = data.f_Content;
        myChat.f_Time = data.f_CreateDate;
      }

      return data.f_MsgId;
    },
    async refreshSystemMsgNum(): Promise<void> {
      const num = await apiMsgSys.getSysNum();
      this.systemMsgNum = num;
    },
    ADD_MSG({ list, sendUserId }): void {
      if (list.length > 0) {
        const msgList = this.messageList[sendUserId] || [];
        const addList = list.filter(
          (t) => msgList.findIndex((t2) => t.f_MsgId == t2.f_MsgId) == -1,
        );
        msgList.push(...addList);
        const msg = msgList.sort((a, b) => {
          return Date.parse(a.f_CreateDate) - Date.parse(b.f_CreateDate);
        });
        this.messageList[sendUserId] = msg;
      }
    },
  },
});

// Need to be used outside the setup
export function useImStoreWithOut() {
  return useImStore(store);
}
