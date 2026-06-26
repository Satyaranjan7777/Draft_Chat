import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

const getProfileUrl = (user) => user?.profilePicture?.url || user?.profilePic || "";

const CACHE_TTL = 60 * 1000;
let usersRequest = null;
let messagesRequestId = 0;

/**
 * Safely add a message to a list, deduplicating by _id.
 * Prevents duplicate UI entries when both the API response and the
 * socket event carry the same saved message.
 */
const addMessageDeduped = (messages, newMessage) => {
  const id = String(newMessage._id);
  if (messages.some((m) => String(m._id) === id)) return messages;
  return [...messages, newMessage];
};

export const useChatStore = create((set, get) => ({
  users: [],
  messages: [],
  messagesByUser: {},
  selectedUser: null,
  usersFetchedAt: 0,
  isUsersLoading: false,
  usersError: "",
  isMessagesLoading: false,
  isSendingMessage: false,

  getUsers: async (force = false) => {
    const { usersFetchedAt } = get();
    if (!force && usersFetchedAt && Date.now() - usersFetchedAt < CACHE_TTL) return;
    if (usersRequest) return usersRequest;

    set({ isUsersLoading: true, usersError: "" });
    usersRequest = axiosInstance
      .get("/message/users")
      .then((res) => {
        set({ users: res.data, usersFetchedAt: Date.now() });
      })
      .catch((error) => {
        const message = error?.response?.data?.message || "Unable to load contacts";
        set({ usersError: message });
        toast.error(message);
      })
      .finally(() => {
        usersRequest = null;
        set({ isUsersLoading: false });
      });

    return usersRequest;
  },

  getMessages: async (userId, background = false) => {
    const requestId = ++messagesRequestId;
    if (!background) {
      set({ isMessagesLoading: true });
    }
    try {
      const res = await axiosInstance.get(`/message/${userId}`);
      if (requestId !== messagesRequestId || get().selectedUser?._id !== userId) return;

      set({
        messages: res.data,
        messagesByUser: { ...get().messagesByUser, [userId]: res.data },
      });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to load messages");
    } finally {
      if (!background && requestId === messagesRequestId) {
        set({ isMessagesLoading: false });
      }
    }
  },

  setSelectedUser: (user) => {
    const cachedMessages = user?._id ? get().messagesByUser[user._id] : null;
    set({
      selectedUser: user,
      messages: cachedMessages || [],
      isMessagesLoading: Boolean(user?._id && !cachedMessages),
    });
    if (user?._id) {
      get().getMessages(user._id, Boolean(cachedMessages));
    }
  },

  sendMessage: async ({ text, image }) => {
    const selectedUser = get().selectedUser;
    if (!selectedUser?._id) return;

    set({ isSendingMessage: true });
    try {
      const res = await axiosInstance.post(`/message/send/${selectedUser._id}`, { text, image });
      const saved = res.data;

      // Deduplicate — the socket may also deliver this message to the sender
      const nextMessages = addMessageDeduped(get().messages, saved);
      set({
        messages: nextMessages,
        messagesByUser: { ...get().messagesByUser, [selectedUser._id]: nextMessages },
      });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to send message");
      throw error;
    } finally {
      set({ isSendingMessage: false });
    }
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    const selectedUser = get().selectedUser;

    if (!socket || !selectedUser) return;

    // Remove any existing listener before adding a new one
    socket.off("newMessage");

    socket.on("newMessage", (newMessage) => {
      const activeUser = get().selectedUser;
      if (!activeUser) return;

      const senderId = String(newMessage.senderId);
      const activeId = String(activeUser._id);

      // Show the message in the current conversation pane if it's relevant
      if (senderId === activeId || String(newMessage.receiverId) === activeId) {
        const nextMessages = addMessageDeduped(get().messages, newMessage);
        set({
          messages: nextMessages,
          messagesByUser: { ...get().messagesByUser, [activeId]: nextMessages },
        });
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket?.off("newMessage");
  },

  subscribeToProfileUpdates: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    if (socket.__chatProfileSubscribed) return;

    socket.__chatProfileSubscribed = true;
    socket.on("profileUpdated", (updatedUser) => {
      const currentUser = useAuthStore.getState().authUser;
      const currentId = String(currentUser?._id || currentUser?.id || "");
      const updatedId = String(updatedUser?._id || updatedUser?.id || "");

      if (currentId && updatedId && currentId === updatedId) {
        useAuthStore.setState({ authUser: updatedUser });
      }

      set({
        users: get().users.map((user) =>
          user._id === updatedUser._id ? { ...user, ...updatedUser } : user
        ),
        selectedUser:
          get().selectedUser?._id === updatedUser._id
            ? { ...get().selectedUser, ...updatedUser }
            : get().selectedUser,
      });
    });
  },

  getProfileUrl,
}));
