import { ArrowLeft, Image, Loader2, MessageCircle, RefreshCw, Search, Send, UsersRound, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import Avatar from "../components/Avatar";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const getProfileUrl = (user) => user?.profilePicture?.url || user?.profilePic || "";

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const formatMessageTime = (dateValue) => {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const HomePage = () => {
  const messageEndRef = useRef(null);
  const imageInputRef = useRef(null);
  const { authUser, onlineUsers, socket } = useAuthStore();
  const {
    users,
    messages,
    selectedUser,
    isUsersLoading,
    usersError,
    isMessagesLoading,
    isSendingMessage,
    getUsers,
    setSelectedUser,
    sendMessage,
    subscribeToMessages,
    unsubscribeFromMessages,
    subscribeToProfileUpdates,
  } = useChatStore();
  const [messageText, setMessageText] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [imageData, setImageData] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  useEffect(() => {
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [selectedUser, socket, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    subscribeToProfileUpdates();
  }, [socket, subscribeToProfileUpdates]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleImageSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return;
    }

    const dataUrl = await readFileAsDataUrl(file);
    setImagePreview(dataUrl);
    setImageData(dataUrl);
  };

  const clearImage = () => {
    setImagePreview("");
    setImageData("");
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const text = messageText.trim();
    if ((!text && !imageData) || isSendingMessage) return;

    await sendMessage({ text, image: imageData });
    setMessageText("");
    clearImage();
  };

  const selectedUserOnline = selectedUser?._id && onlineUsers.includes(selectedUser._id);
  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return users;

    return users.filter((user) =>
      [user.fullName, user.email, user.username]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query)),
    );
  }, [searchQuery, users]);

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-base-200 p-2 text-base-content sm:p-4">
      <section className="mx-auto grid h-[calc(100dvh-4.5rem)] max-w-7xl overflow-hidden rounded-2xl bg-base-100 shadow-sm ring-1 ring-base-300 sm:h-[calc(100vh-5.5rem)] lg:grid-cols-[340px_1fr]">
        <aside className={`${selectedUser ? "hidden lg:flex" : "flex"} min-h-0 flex-col border-r border-base-300 bg-base-100`}>
          <div className="border-b border-base-300 p-4">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-content">
                <UsersRound className="h-5 w-5" />
              </span>
              <div>
                <h1 className="text-lg font-bold">Chats</h1>
                <p className="text-sm opacity-60">{onlineUsers.length} online</p>
              </div>
            </div>
            <label className="input input-bordered mt-4 flex w-full items-center gap-2 bg-base-100">
              <Search className="h-4 w-4 opacity-60" />
              <span className="sr-only">Search users</span>
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search users"
                className="min-w-0 flex-1"
              />
            </label>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            {isUsersLoading ? (
              <div className="space-y-2 p-1" aria-label="Loading contacts">
                {Array.from({ length: 6 }, (_, index) => (
                  <div key={index} className="flex items-center gap-3 rounded-xl p-3">
                    <div className="skeleton h-11 w-11 shrink-0 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="skeleton h-3 w-2/3" />
                      <div className="skeleton h-2.5 w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : usersError ? (
              <div className="grid h-full place-items-center px-6 text-center">
                <div>
                  <div className="alert alert-error text-left text-sm">{usersError}</div>
                  <button type="button" className="btn btn-primary btn-sm mt-4" onClick={() => getUsers(true)}>
                    <RefreshCw className="h-4 w-4" />
                    Retry
                  </button>
                </div>
              </div>
            ) : users.length === 0 ? (
              <div className="grid h-full place-items-center px-6 text-center">
                <div>
                  <MessageCircle className="mx-auto h-10 w-10 opacity-30" />
                  <h2 className="mt-4 font-semibold">No contacts yet</h2>
                  <p className="mt-1 text-sm opacity-60">Other registered users will appear here.</p>
                </div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="grid h-full place-items-center px-6 text-center">
                <div>
                  <Search className="mx-auto h-10 w-10 opacity-30" />
                  <h2 className="mt-4 font-semibold">No users found</h2>
                  <p className="mt-1 text-sm opacity-60">Try a different name or email.</p>
                </div>
              </div>
            ) : (
              filteredUsers.map((user) => {
                const isActive = selectedUser?._id === user._id;
                const isOnline = onlineUsers.includes(user._id);

                return (
                  <button
                    key={user._id}
                    type="button"
                    className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      isActive ? "bg-primary/15 ring-1 ring-primary/30" : "hover:bg-base-200"
                    }`}
                    onClick={() => setSelectedUser(user)}
                  >
                    <div className="relative">
                      <Avatar src={getProfileUrl(user)} name={user.fullName} size="md" />
                      <span
                        className={`absolute bottom-0 right-0 h-3 w-3 rounded-full ring-2 ring-base-100 ${
                          isOnline ? "bg-success" : "bg-base-300"
                        }`}
                        aria-label={isOnline ? "Online" : "Offline"}
                      />
                    </div>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{user.fullName}</span>
                      <span className={`block text-xs ${isOnline ? "text-success" : "opacity-55"}`}>
                        {isOnline ? "Online" : "Offline"}
                      </span>
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <section className={`${selectedUser ? "flex" : "hidden lg:flex"} min-h-0 flex-col bg-base-200`}>
          {selectedUser ? (
            <>
              <header className="flex h-16 shrink-0 items-center justify-between border-b border-base-300 bg-base-100 px-4">
                <div className="flex min-w-0 items-center gap-3">
                  <button
                    type="button"
                    className="btn btn-ghost btn-square btn-sm lg:hidden"
                    onClick={() => setSelectedUser(null)}
                    aria-label="Back to contacts"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <div className="relative">
                    <Avatar src={getProfileUrl(selectedUser)} name={selectedUser.fullName} size="sm" />
                    <span
                      className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-base-100 ${
                        selectedUserOnline ? "bg-success" : "bg-base-300"
                      }`}
                    />
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-bold">{selectedUser.fullName}</h2>
                    <p className={`text-xs ${selectedUserOnline ? "text-success" : "opacity-55"}`}>
                      {selectedUserOnline ? "Online" : "Offline"}
                    </p>
                  </div>
                </div>
              </header>

              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
                {isMessagesLoading ? (
                  <div className="grid h-full place-items-center opacity-60">
                    <LoadingSpinner label="Loading messages" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="grid h-full place-items-center text-center">
                    <div>
                      <MessageCircle className="mx-auto h-12 w-12 opacity-30" />
                      <h2 className="mt-4 font-semibold">No messages yet</h2>
                      <p className="mt-1 text-sm opacity-60">Send the first message to start the conversation.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => {
                      const isMine = message.senderId === (authUser?._id || authUser?.id);

                      return (
                        <div key={message._id} className={`chat ${isMine ? "chat-end" : "chat-start"}`}>
                          {!isMine && <Avatar src={getProfileUrl(selectedUser)} name={selectedUser.fullName} size="sm" />}
                          <div className="max-w-[78%]">
                            <div className={`chat-bubble ${isMine ? "chat-bubble-primary" : ""}`}>
                              {message.image && (
                                <img
                                  src={message.image}
                                  alt="Shared attachment"
                                  loading="lazy"
                                  decoding="async"
                                  className="mb-2 max-h-64 rounded-xl object-cover"
                                />
                              )}
                              {message.text && <p className="whitespace-pre-wrap text-sm leading-6">{message.text}</p>}
                            </div>
                            <span className="chat-footer px-1 text-[11px] opacity-50">{formatMessageTime(message.createdAt)}</span>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messageEndRef} />
                  </div>
                )}
              </div>

              <form className="shrink-0 border-t border-base-300 bg-base-100 p-3" onSubmit={handleSubmit}>
                {imagePreview && (
                  <div className="mb-3 flex items-center gap-3 rounded-xl bg-base-200 p-2 ring-1 ring-base-300">
                    <img src={imagePreview} alt="Selected preview" className="h-16 w-16 rounded-lg object-cover" />
                    <button
                      type="button"
                      className="btn btn-ghost btn-square btn-sm"
                      onClick={clearImage}
                      aria-label="Remove selected image"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                )}
                <div className="flex items-end gap-2">
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleImageSelect}
                  />
                  <button
                    type="button"
                    className="btn btn-outline btn-square shrink-0"
                    onClick={() => imageInputRef.current?.click()}
                    aria-label="Attach image"
                  >
                    <Image className="h-5 w-5" />
                  </button>
                  <textarea
                    value={messageText}
                    onChange={(event) => setMessageText(event.target.value)}
                    placeholder="Type a message"
                    rows={1}
                    className="textarea textarea-bordered max-h-32 min-h-11 flex-1 resize-none bg-base-100"
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        handleSubmit(event);
                      }
                    }}
                  />
                  <button
                    type="submit"
                    disabled={isSendingMessage || (!messageText.trim() && !imageData)}
                    className="btn btn-primary btn-square shrink-0"
                    aria-label="Send message"
                  >
                    {isSendingMessage ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="grid h-full place-items-center text-center">
              <div>
                <MessageCircle className="mx-auto h-14 w-14 opacity-30" />
                <h2 className="mt-4 text-xl font-bold">Select a conversation</h2>
                <p className="mt-2 text-sm opacity-60">Choose a contact to view messages and start chatting.</p>
              </div>
            </div>
          )}
        </section>
      </section>
    </main>
  );
};

export default HomePage;
