import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { useAuth } from "./AuthContext";
import api from "../src/lib/api";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import assets from "../src/assets/assets";
import MessageNotification from "../src/components/MessageNotification";

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [unseenMessages, setUnseenMessages] = useState({});
  const [loading, setLoading] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [lastMessages, setLastMessages] = useState({});

  const { user, isAuthenticated } = useAuth();
  const socketRef = useRef();
  const messageIdsRef = useRef(new Set());

  // Socket connection
  useEffect(() => {
    if (!isAuthenticated || !user?._id) return;

    const socketUrl =
      import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
    console.log("Connecting to socket:", socketUrl);

    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    socketRef.current = io(socketUrl, {
      query: { userId: user._id },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketRef.current.on("connect", () => {
      console.log("Socket connected");
      setSocketConnected(true);
    });

    socketRef.current.on("getOnlineUsers", (users) => {
      console.log("Online users:", users);
      setOnlineUsers(users);
    });

    socketRef.current.on("userProfileUpdated", (updatedUserData) => {
      console.log("User profile updated:", updatedUserData);

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === updatedUserData.userId
            ? {
                ...user,
                fullName: updatedUserData.fullName,
                profilePic: updatedUserData.profilePic,
                bio: updatedUserData.bio,
              }
            : user,
        ),
      );

      setSelectedUser((prevSelected) => {
        if (prevSelected && prevSelected._id === updatedUserData.userId) {
          return {
            ...prevSelected,
            fullName: updatedUserData.fullName,
            profilePic: updatedUserData.profilePic,
            bio: updatedUserData.bio,
          };
        }
        return prevSelected;
      });
    });

    socketRef.current.on("newMessage", (message) => {
      console.log("New message received:", message);

      if (messageIdsRef.current.has(message._id)) {
        console.log("Duplicate message detected, skipping");
        return;
      }

      messageIdsRef.current.add(message._id);

      // Update messages if this is for the currently selected user
      if (
        selectedUser &&
        (message.senderId?._id === selectedUser._id ||
          message.receiverId?._id === selectedUser._id)
      ) {
        setMessages((prev) => {
          if (prev.some((msg) => msg._id === message._id)) {
            return prev;
          }
          return [...prev, message];
        });

        // If the message is from the selected user and we're currently chatting,
        // mark it as seen immediately
        if (message.senderId?._id === selectedUser._id) {
          markMessageAsSeen(message._id);
        }
      }

      // Update lastMessages for the sidebar
      const otherUserId =
        message.senderId?._id === user._id
          ? message.receiverId?._id
          : message.senderId?._id;

      if (otherUserId) {
        setLastMessages((prev) => ({
          ...prev,
          [otherUserId]: {
            messageId: message._id,
            text: message.text,
            image: message.image,
            createdAt: message.createdAt,
            seen: message.seen,
            senderId: message.senderId?._id,
            receiverId: message.receiverId?._id,
          },
        }));
      }

      // Update unseen messages count - ONLY if message is from someone else AND not currently chatting with them
      if (message.senderId?._id !== user._id) {
        // Check if we're not currently chatting with this sender
        if (!selectedUser || selectedUser._id !== message.senderId?._id) {
          setUnseenMessages((prev) => ({
            ...prev,
            [message.senderId?._id]: (prev[message.senderId?._id] || 0) + 1,
          }));

          // Show enhanced notification without reply feature
          toast.custom(
            (t) => (
              <MessageNotification
                t={t}
                message={message}
                onClose={() => {
                  console.log("Notification closed");
                }}
              />
            ),
            {
              duration: 4000,
              position: "top-right",
            },
          );
        }
      }
    });

    // Update the deleteMessage socket handler
    socketRef.current.on("deleteMessage", (data) => {
      console.log("Message deleted via socket:", data);

      // Remove from messages
      setMessages((prev) => prev.filter((msg) => msg._id !== data.messageId));

      // Update lastMessages with the new last message for this conversation
      if (data.conversationId) {
        setLastMessages((prev) => {
          const updated = { ...prev };

          if (data.newLastMessage) {
            // Update with the new last message
            updated[data.conversationId] = {
              messageId: data.newLastMessage._id,
              text: data.newLastMessage.text,
              image: data.newLastMessage.image,
              createdAt: data.newLastMessage.createdAt,
              seen: data.newLastMessage.seen,
              senderId: data.newLastMessage.senderId,
              receiverId: data.newLastMessage.receiverId,
            };
          } else {
            // No more messages, remove from lastMessages
            delete updated[data.conversationId];
          }

          return updated;
        });
      }
    });

    // Also listen for the broadcast event (optional)
    socketRef.current.on("messageDeleted", ({ messageId }) => {
      console.log("Message deleted broadcast:", messageId);
      // You might want to refresh lastMessages here if needed
      // fetchUsers();
    });

    socketRef.current.on("messageSeen", ({ messageId, seenBy, chatId }) => {
      console.log("Message seen event received:", {
        messageId,
        seenBy,
        chatId,
      });

      // Update messages to show as seen
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === messageId ? { ...msg, seen: true } : msg,
        ),
      );

      // Update lastMessages seen status
      setLastMessages((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((key) => {
          if (updated[key].messageId === messageId) {
            updated[key] = { ...updated[key], seen: true };
          }
        });
        return updated;
      });
    });

    socketRef.current.on("disconnect", () => {
      console.log("Socket disconnected");
      setSocketConnected(false);
    });

    socketRef.current.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
      }
      messageIdsRef.current.clear();
    };
  }, [isAuthenticated, user?._id, selectedUser]);

  // Fetch users
  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
    }
  }, [isAuthenticated]);

  // Fetch messages when selected user changes
  useEffect(() => {
    if (selectedUser?._id) {
      fetchMessages(selectedUser._id);
      // Clear unseen messages for selected user IMMEDIATELY
      setUnseenMessages((prev) => {
        const newUnseen = { ...prev };
        delete newUnseen[selectedUser._id];
        return newUnseen;
      });
    } else {
      setMessages([]);
      messageIdsRef.current.clear();
    }
  }, [selectedUser?._id]);

  const fetchUsers = async (showToast = false) => {
    try {
      const response = await api.get("/messages/last-messages");
      if (response.data.success) {
        setUsers(response.data.users || []);
        setUnseenMessages(response.data.unseenMessages || {});
        setLastMessages(response.data.lastMessages || {});
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      setLoading(true);
      console.log("Fetching messages for user:", userId);
      const response = await api.get(`/messages/${userId}`);
      console.log("Messages response:", response.data);

      if (response.data.success) {
        response.data.messages.forEach((msg) =>
          messageIdsRef.current.add(msg._id),
        );
        setMessages(response.data.messages);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const markMessageAsSeen = async (messageId) => {
    try {
      await api.get(`/messages/mark/${messageId}`);
    } catch (error) {
      console.error("Failed to mark message as seen:", error);
    }
  };

  const sendMessage = async (text, image = null) => {
    if (!selectedUser?._id) {
      toast.error("Please select a user to chat with");
      return { success: false, message: "No user selected" };
    }

    if (!text?.trim() && !image) {
      toast.error("Cannot send empty message");
      return { success: false, message: "Cannot send empty message" };
    }

    try {
      const response = await api.post(`/messages/send/${selectedUser._id}`, {
        text: text?.trim() || "",
        image,
      });

      if (response.data && response.data.success) {
        messageIdsRef.current.add(response.data.newMessage._id);
        return { success: true, message: response.data.newMessage };
      } else {
        toast.error(response.data?.message || "Failed to send message");
        return {
          success: false,
          message: response.data?.message || "Failed to send message",
        };
      }
    } catch (error) {
      console.error("Send message error:", error);
      toast.error(error.response?.data?.message || "Failed to send message");
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to send message",
      };
    }
  };
  // Add refreshLastMessages function
  const refreshLastMessages = async () => {
    try {
      const response = await api.get("/messages/last-messages");
      if (response.data.success) {
        setLastMessages(response.data.lastMessages || {});
      }
    } catch (error) {
      console.error("Failed to refresh last messages:", error);
    }
  };
  const deleteMessage = async (messageId) => {
    try {
      const response = await api.delete(`/messages/delete/${messageId}`);
      if (response.data.success) {
        messageIdsRef.current.delete(messageId);

        // No need to manually update lastMessages here
        // The socket event will handle it for both users

        toast.success("Message deleted");
        return { success: true };
      }
      toast.error(response.data.message);
      return { success: false, message: response.data.message };
    } catch (error) {
      console.error("Delete message error:", error);
      toast.error(error.response?.data?.message || "Failed to delete message");
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete message",
      };
    }
  };

  const markAsSeen = async (messageId) => {
    try {
      await api.get(`/messages/mark/${messageId}`);
    } catch (error) {
      console.error("Failed to mark message as seen:", error);
    }
  };

  const isUserOnline = (userId) => {
    return onlineUsers.includes(userId);
  };

  const selectUser = (user) => {
    console.log("Selecting user in ChatContext:", user);
    setSelectedUser(user);
  };

  const value = {
    users,
    selectedUser,
    setSelectedUser: selectUser,
    messages,
    loading,
    sendMessage,
    deleteMessage,
    markAsSeen,
    isUserOnline,
    unseenMessages,
    socketConnected,
    lastMessages,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
