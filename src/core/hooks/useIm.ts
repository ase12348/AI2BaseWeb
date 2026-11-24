import { computed } from 'vue';
import { useImStore } from '@/core/store/modules/im';

export function useIm() {
  const imStore = useImStore();
  const getChatList = computed(() => imStore.chatList);
  const getMessageList = computed(() => imStore.messageList);
  const getHasNoReadChat = computed(() => imStore.hasNoReadChatList);
  const getSystemMsgNum = computed(() => imStore.systemMsgNum);
  const refreshChat = () => {
    imStore.refreshChat();
  };
  const removeChat = (chat) => {
    imStore.removeChat(chat);
  };
  const setChatUserId = (ids: string) => {
    imStore.setChatUserId(ids);
  };
  const refreshMessage = (msg: Record<string, any>) => {
    imStore.refreshMessage(msg);
  };
  const addChat = (chart) => {
    imStore.addChat(chart);
  };
  const sendMsg = async (data) => {
    return await imStore.sendMsg(data);
  };
  const revChatMsg = (chat) => {
    imStore.revChatMsg(chat);
  };
  const refreshSystemMsgNum = () => {
    imStore.refreshSystemMsgNum();
  };

  return {
    getChatList,
    getMessageList,
    getHasNoReadChat,
    getSystemMsgNum,
    refreshChat,
    removeChat,
    setChatUserId,
    refreshMessage,
    addChat,
    sendMsg,
    revChatMsg,
    refreshSystemMsgNum,
  };
}
