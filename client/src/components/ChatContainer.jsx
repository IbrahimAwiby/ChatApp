import React, { useEffect, useRef, useState } from "react";
import assets from "../assets/assets";
import { formatMessageTime } from "../lib/utils";
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import ImageModal from "./ImageModal";

// Theme configurations
const themes = {
  purple: {
    name: "Purple Haze",
    primary: "from-purple-400 to-violet-600",
    secondary: "bg-violet-500/20",
    accent: "text-violet-400",
    border: "border-violet-500/30",
    hover: "hover:bg-violet-500/10",
    myMessage: "bg-violet-500/20 border border-violet-500/30",
    theirMessage: "bg-gray-700/40 border border-gray-600/30",
    background: "bg-[#1a1a2e]/90",
    gradient: "from-[#1a1a2e] to-[#2a1a3a]",
  },
  blue: {
    name: "Ocean Blue",
    primary: "from-blue-400 to-cyan-600",
    secondary: "bg-blue-500/20",
    accent: "text-blue-400",
    border: "border-blue-500/30",
    hover: "hover:bg-blue-500/10",
    myMessage: "bg-blue-500/20 border border-blue-500/30",
    theirMessage: "bg-gray-700/40 border border-gray-600/30",
    background: "bg-[#1a2a3a]/90",
    gradient: "from-[#1a2a3a] to-[#1a3a4a]",
  },
  green: {
    name: "Forest Green",
    primary: "from-green-400 to-emerald-600",
    secondary: "bg-green-500/20",
    accent: "text-green-400",
    border: "border-green-500/30",
    hover: "hover:bg-green-500/10",
    myMessage: "bg-green-500/20 border border-green-500/30",
    theirMessage: "bg-gray-700/40 border border-gray-600/30",
    background: "bg-[#1a2a1a]/90",
    gradient: "from-[#1a2a1a] to-[#1a3a2a]",
  },
  amber: {
    name: "Sunset Amber",
    primary: "from-amber-400 to-orange-600",
    secondary: "bg-amber-500/20",
    accent: "text-amber-400",
    border: "border-amber-500/30",
    hover: "hover:bg-amber-500/10",
    myMessage: "bg-amber-500/20 border border-amber-500/30",
    theirMessage: "bg-gray-700/40 border border-gray-600/30",
    background: "bg-[#2a1a1a]/90",
    gradient: "from-[#2a1a1a] to-[#3a2a1a]",
  },
  rose: {
    name: "Rose Garden",
    primary: "from-rose-400 to-pink-600",
    secondary: "bg-rose-500/20",
    accent: "text-rose-400",
    border: "border-rose-500/30",
    hover: "hover:bg-rose-500/10",
    myMessage: "bg-rose-500/20 border border-rose-500/30",
    theirMessage: "bg-gray-700/40 border border-gray-600/30",
    background: "bg-[#2a1a2a]/90",
    gradient: "from-[#2a1a2a] to-[#3a1a3a]",
  },
  dark: {
    name: "Midnight Dark",
    primary: "from-gray-400 to-slate-600",
    secondary: "bg-gray-500/20",
    accent: "text-gray-300",
    border: "border-gray-500/30",
    hover: "hover:bg-gray-500/10",
    myMessage: "bg-gray-500/20 border border-gray-500/30",
    theirMessage: "bg-gray-700/40 border border-gray-600/30",
    background: "bg-[#0f0f0f]/90",
    gradient: "from-[#0f0f0f] to-[#1a1a1a]",
  },
};

// Helper function to format message date
const formatMessageDate = (date) => {
  const messageDate = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (messageDate.toDateString() === today.toDateString()) {
    return "Today";
  } else if (messageDate.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  } else if (messageDate.getFullYear() === today.getFullYear()) {
    return messageDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  } else {
    return messageDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
};

// Helper function to format last seen
const formatLastSeen = (date) => {
  if (!date) return "last seen recently";

  const lastSeen = new Date(date);
  const now = new Date();
  const diffMinutes = Math.floor((now - lastSeen) / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "last seen just now";
  if (diffMinutes < 60)
    return `last seen ${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
  if (diffHours < 24)
    return `last seen ${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7)
    return `last seen ${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

  return `last seen on ${lastSeen.toLocaleDateString()}`;
};

// Date Separator Component
const DateSeparator = ({ date }) => {
  return (
    <div className="flex items-center justify-center my-4">
      <div className="bg-gray-700/50 px-4 py-1 rounded-full">
        <span className="text-xs text-gray-300 font-medium">
          {formatMessageDate(date)}
        </span>
      </div>
    </div>
  );
};

// Confirmation Modal Component
const ConfirmModal = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-[#282142] border border-gray-600 rounded-xl shadow-2xl max-w-md w-full p-6 animate-fadeIn">
        <h3 className="text-xl font-semibold text-white mb-2">
          Confirm Delete
        </h3>
        <p className="text-gray-300 mb-6">{message}</p>

        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium"
          >
            Delete
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// Message Options Menu Component
const MessageOptionsMenu = ({
  isOpen,
  onClose,
  onCopy,
  onDelete,
  position,
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className={`absolute z-50 ${position} bg-[#282142] border border-gray-600 rounded-lg shadow-xl py-1 min-w-[160px]`}
      >
        <button
          onClick={onCopy}
          className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
          </svg>
          Copy Message
        </button>
        <button
          onClick={onDelete}
          className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-white/10 flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          Delete Message
        </button>
      </div>
    </>
  );
};

const ChatContainer = ({
  selectedUser,
  setSelectedUser,
  onToggleRightSidebar,
}) => {
  const scrollEnd = useRef();
  const fileInputRef = useRef();
  const [newMessage, setNewMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [sending, setSending] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [currentTheme, setCurrentTheme] = useState("purple");
  const [copiedMessageId, setCopiedMessageId] = useState(null);

  // Image modal state
  const [imageModal, setImageModal] = useState({
    isOpen: false,
    imageUrl: null,
    senderName: "",
  });

  // Message options menu state
  const [messageMenu, setMessageMenu] = useState({
    isOpen: false,
    messageId: null,
    messageText: null,
    messageImage: null,
    position: "top-0 right-0",
  });

  // Delete confirmation state
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    messageId: null,
  });

  const { messages, sendMessage, deleteMessage, isUserOnline, loading } =
    useChat();
  const { user } = useAuth();

  const theme = themes[currentTheme];

  useEffect(() => {
    if (scrollEnd.current) {
      scrollEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("chatTheme");
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  const handleCopyMessage = (text, messageId) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopiedMessageId(messageId);
        toast.success("Message copied!", {
          duration: 2000,
          icon: "📋",
        });
        setTimeout(() => setCopiedMessageId(null), 2000);
        setMessageMenu({ ...messageMenu, isOpen: false });
      })
      .catch(() => {
        toast.error("Failed to copy message");
      });
  };

  const handleCopyImage = (imageUrl) => {
    navigator.clipboard
      .writeText(imageUrl)
      .then(() => {
        toast.success("Image URL copied!", {
          duration: 2000,
          icon: "🔗",
        });
        setMessageMenu({ ...messageMenu, isOpen: false });
      })
      .catch(() => {
        toast.error("Failed to copy image URL");
      });
  };

  const handleImageClick = (imageUrl, senderName) => {
    setImageModal({
      isOpen: true,
      imageUrl,
      senderName,
    });
  };

  const handleMenuToggle = (e, messageId, text, image, isMyMessage) => {
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();
    const top = rect.top + window.scrollY;
    const left = rect.left + window.scrollX;

    setMessageMenu({
      isOpen: true,
      messageId,
      messageText: text,
      messageImage: image,
      position: `top-[${top}px] left-[${left}px]`,
      isMyMessage,
    });
  };

  const handleDeleteClick = (messageId) => {
    setMessageMenu({ ...messageMenu, isOpen: false });
    setDeleteModal({
      isOpen: true,
      messageId,
    });
  };

  const handleConfirmDelete = async () => {
    if (deleteModal.messageId) {
      await deleteMessage(deleteModal.messageId);
      setDeleteModal({ isOpen: false, messageId: null });
    }
  };

  const handleCancelDelete = () => {
    setDeleteModal({ isOpen: false, messageId: null });
  };

  const changeTheme = (themeKey) => {
    setCurrentTheme(themeKey);
    localStorage.setItem("chatTheme", themeKey);
    setShowThemeMenu(false);
    toast.success(`Theme: ${themes[themeKey].name}`, {
      duration: 2000,
      icon: "🎨",
    });
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();

    if (!newMessage.trim() && !selectedImage) return;

    if (!selectedUser) {
      toast.error("Please select a user to chat with");
      return;
    }

    setSending(true);
    let imageBase64 = null;

    if (selectedImage) {
      try {
        toast.loading("Processing image...", { id: "image-processing" });
        imageBase64 = await convertToBase64(selectedImage);
        toast.dismiss("image-processing");
      } catch (error) {
        console.error("Error converting image:", error);
        toast.error("Failed to process image");
        setSending(false);
        return;
      }
    }

    try {
      const result = await sendMessage(newMessage, imageBase64);

      if (result && result.success) {
        setNewMessage("");
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        toast.error(result?.message || "Failed to send message");
      }
    } catch (error) {
      console.error("Error in handleSendMessage:", error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.onerror = (error) => {
        console.error("Error converting to base64:", error);
        reject(error);
      };
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image too large. Max 5MB");
        return;
      }
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (!selectedUser) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 ${theme.background} max-md:hidden`}
      >
        <img src={assets.logo_icon} alt="logo_icon" className="max-w-16" />
        <p className="text-lg font-medium text-white">Chat anytime, anywhere</p>
      </div>
    );
  }

  // Group messages by date for separators
  const messagesWithSeparators = [];
  let lastDate = null;

  messages.forEach((msg, index) => {
    const currentDate = new Date(msg.createdAt).toDateString();

    if (currentDate !== lastDate) {
      messagesWithSeparators.push({
        type: "separator",
        date: msg.createdAt,
        key: `sep-${msg.createdAt}`,
      });
      lastDate = currentDate;
    }

    messagesWithSeparators.push({
      type: "message",
      message: msg,
      key: msg._id || index,
    });
  });

  return (
    <div
      className={`h-full overflow-scroll relative ${theme.background} backdrop-blur-lg`}
    >
      {/* Image Modal */}
      <ImageModal
        isOpen={imageModal.isOpen}
        onClose={() => setImageModal({ ...imageModal, isOpen: false })}
        imageUrl={imageModal.imageUrl}
        senderName={imageModal.senderName}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        message="Are you sure you want to delete this message? This action cannot be undone."
      />

      {/* Message Options Menu */}
      <MessageOptionsMenu
        isOpen={messageMenu.isOpen}
        onClose={() => setMessageMenu({ ...messageMenu, isOpen: false })}
        onCopy={() =>
          messageMenu.messageImage
            ? handleCopyImage(messageMenu.messageImage)
            : handleCopyMessage(messageMenu.messageText, messageMenu.messageId)
        }
        onDelete={() => handleDeleteClick(messageMenu.messageId)}
        position={messageMenu.position}
      />

      {/* Header */}
      <div className="flex items-center gap-3 py-3 mx-4 border-b border-stone-500">
        {/* Profile image - click to open right sidebar on mobile */}
        <div
          className="relative md:cursor-default"
          onClick={(e) => {
            e.stopPropagation();
            console.log(
              "Profile image clicked, window width:",
              window.innerWidth,
            );
            if (window.innerWidth < 768) {
              console.log("Mobile view - toggling right sidebar");
              if (onToggleRightSidebar) {
                onToggleRightSidebar();
              } else {
                console.error("onToggleRightSidebar is not defined");
              }
            }
          }}
          style={{ cursor: window.innerWidth < 768 ? "pointer" : "default" }}
        >
          <img
            src={selectedUser?.profilePic || assets.avatar_icon}
            className="w-10 h-10 rounded-full object-cover border-2 border-violet-500/50"
            alt="profile"
          />
          {/* Online indicator - only show if online */}
          {isUserOnline(selectedUser._id) && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1a1a2e]"></span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-lg text-white truncate">
              {selectedUser.fullName}
            </p>
          </div>
          {/* Last seen status */}
          <p className="text-xs text-gray-400">
            {isUserOnline(selectedUser._id) ? (
              <span className="text-green-400">Online</span>
            ) : (
              formatLastSeen(selectedUser.lastSeen)
            )}
          </p>
        </div>

        {/* Theme selector */}
        <div className="relative">
          <button
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            className={`p-2 rounded-full ${theme.hover} transition-colors`}
            title="Change theme"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-white"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M4 2a2 2 0 00-2 2v8a2 2 0 002 2h2v2a2 2 0 002 2h8a2 2 0 002-2V6a2 2 0 00-2-2h-2V4a2 2 0 00-2-2H4zm6 4a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
          </button>

          {showThemeMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-[#282142] border border-gray-600 rounded-lg shadow-xl z-50 py-2">
              {Object.entries(themes).map(([key, theme]) => (
                <button
                  key={key}
                  onClick={() => changeTheme(key)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-white/10 transition-colors flex items-center gap-2 ${
                    currentTheme === key ? theme.accent : "text-white"
                  }`}
                >
                  <span
                    className={`w-3 h-3 rounded-full bg-gradient-to-r ${theme.primary}`}
                  ></span>
                  {theme.name}
                  {currentTheme === key && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 ml-auto"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Back button */}
        <img
          onClick={() => setSelectedUser(null)}
          src={assets.arrow_icon}
          alt="arrow_icon"
          className="md:hidden max-w-7 cursor-pointer"
        />

        {/* Info button - opens right sidebar on desktop */}
        <img
          onClick={() => onToggleRightSidebar()}
          src={assets.help_icon}
          alt="help_icon"
          className="max-md:hidden max-w-5 cursor-pointer"
        />
      </div>

      {/* Chat area */}
      <div className="flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-white">Loading messages...</div>
          </div>
        ) : messages.length > 0 ? (
          messagesWithSeparators.map((item) => {
            if (item.type === "separator") {
              return <DateSeparator key={item.key} date={item.date} />;
            }

            const msg = item.message;
            const isMyMessage =
              msg.senderId?._id === user?._id || msg.senderId === user?._id;

            return (
              <div
                className={`flex items-end gap-2 mb-4 group relative ${
                  isMyMessage ? "justify-end" : "justify-start"
                }`}
                key={item.key}
              >
                {!isMyMessage && (
                  <div className="text-center text-xs">
                    <img
                      className="w-7 h-7 rounded-full object-cover"
                      src={selectedUser?.profilePic || assets.avatar_icon}
                      alt="avatar"
                    />
                  </div>
                )}

                <div className="relative max-w-[70%] group/message">
                  {msg.image ? (
                    <div className="relative">
                      <img
                        src={msg.image}
                        alt="message image"
                        className="max-w-full border border-gray-700 rounded-lg overflow-hidden cursor-pointer"
                        onClick={() =>
                          handleImageClick(
                            msg.image,
                            msg.senderId?.fullName || selectedUser?.fullName,
                          )
                        }
                      />

                      {/* Three dots menu for images */}
                      <button
                        onClick={(e) =>
                          handleMenuToggle(
                            e,
                            msg._id,
                            null,
                            msg.image,
                            isMyMessage,
                          )
                        }
                        className="absolute top-2 right-2 bg-black/50 rounded-full p-1.5 hover:bg-black/70 transition-opacity"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-white"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <p
                        className={`p-3 text-sm font-light rounded-lg break-words pr-8 ${
                          isMyMessage
                            ? `${theme.myMessage} text-white rounded-br-none`
                            : `${theme.theirMessage} text-white rounded-bl-none`
                        }`}
                      >
                        {msg.text}
                      </p>

                      {/* Three dots menu for text messages */}
                      <button
                        onClick={(e) =>
                          handleMenuToggle(
                            e,
                            msg._id,
                            msg.text,
                            null,
                            isMyMessage,
                          )
                        }
                        className="absolute top-2 right-2 bg-black/50 rounded-full p-1.5 opacity-0 group-hover/message:opacity-100 transition-opacity hover:bg-black/70"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-white"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>
                    </div>
                  )}

                  {/* Message time and status */}
                  <div
                    className={`flex items-center gap-1 text-xs mt-1 ${isMyMessage ? "justify-end" : "justify-start"}`}
                  >
                    <span className="text-gray-500">
                      {formatMessageTime(msg.createdAt)}
                    </span>
                    {isMyMessage && (
                      <span
                        className={
                          msg.seen ? "text-green-500" : "text-gray-400"
                        }
                        title={msg.seen ? "Seen" : "Delivered"}
                      >
                        {msg.seen ? "✓✓" : "✓"}
                      </span>
                    )}
                  </div>
                </div>

                {isMyMessage && (
                  <div className="text-center text-xs">
                    <img
                      className="w-7 h-7 rounded-full object-cover"
                      src={user?.profilePic || assets.avatar_icon}
                      alt="you"
                    />
                    <p className={`${theme.accent} text-xs font-medium`}>You</p>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="flex justify-center items-center h-full text-gray-400">
            No messages yet. Start a conversation!
          </div>
        )}
        <div ref={scrollEnd} />
      </div>

      {/* Image preview */}
      {imagePreview && (
        <div className="absolute bottom-20 left-3 bg-[#1a1a2e] p-2 rounded-lg border border-gray-600">
          <div className="relative">
            <img
              src={imagePreview}
              alt="preview"
              className="max-w-32 max-h-32 rounded"
            />
            <button
              onClick={removeSelectedImage}
              className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-white"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Bottom area */}
      <form
        onSubmit={handleSendMessage}
        className="absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3 bg-[#1a1a2e]/80 backdrop-blur"
      >
        <div className="flex-1 flex items-center bg-gray-100/12 px-3 rounded-full">
          <input
            className="flex-1 text-sm p-3 border-none rounded-lg outline-none text-white placeholder-gray-400 bg-transparent"
            type="text"
            placeholder="Send a message"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={sending}
          />
          <input
            type="file"
            hidden
            accept="image/*"
            id="image"
            ref={fileInputRef}
            onChange={handleImageSelect}
            disabled={sending}
          />
          <label htmlFor="image" className="cursor-pointer">
            <img
              src={assets.gallery_icon}
              alt="gallery_icon"
              className="w-5 mr-2"
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={sending || (!newMessage.trim() && !selectedImage)}
          className="disabled:opacity-50"
        >
          <img
            src={assets.send_button}
            alt="send_button"
            className="w-7 cursor-pointer"
          />
        </button>
      </form>
    </div>
  );
};

export default ChatContainer;
