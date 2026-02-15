import React, { useEffect, useState } from "react";
import assets from "../assets/assets";
import toast from "react-hot-toast";
import { formatMessageTime } from "../lib/utils";

const MessageNotification = ({ t, message, onClose }) => {
  const [progress, setProgress] = useState(100);
  const duration = 4000;

  // Progress bar animation
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const handleClose = (e) => {
    e.stopPropagation();
    if (onClose) {
      onClose();
    }
    toast.dismiss(t.id);
  };

  return (
    <div
      className={`${
        t.visible ? "animate-slideInRight" : "animate-slideOutRight"
      } relative w-80 bg-gradient-to-br from-[#1a1a2e] to-[#282142] shadow-2xl rounded-xl pointer-events-auto border border-violet-500/30 backdrop-blur-lg overflow-hidden transform transition-all duration-300 hover:scale-[1.02] hover:shadow-violet-500/20`}
    >
      {/* Progress bar */}
      <div
        className="absolute top-0 left-0 h-1 bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-100"
        style={{ width: `${progress}%` }}
      />

      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar with status */}
          <div className="relative flex-shrink-0">
            <img
              className="h-12 w-12 rounded-full object-cover border-2 border-violet-500/50 shadow-lg"
              src={message.senderId?.profilePic || assets.avatar_icon}
              alt={message.senderId?.fullName}
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1a1a2e]"></span>

            {/* Message type indicator */}
            <div className="absolute -top-1 -right-1 bg-violet-500 rounded-full p-1 shadow-lg">
              {message.image ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-2.5 w-2.5 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-2.5 w-2.5 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-white truncate">
                {message.senderId?.fullName}
              </p>
              <span className="text-[10px] text-gray-400 whitespace-nowrap">
                {formatMessageTime(message.createdAt)}
              </span>
            </div>

            <p className="text-xs text-gray-300 mt-1 line-clamp-2">
              {message.image ? (
                <span className="flex items-center gap-1">
                  <span>📷</span>
                  <span>Shared an image</span>
                </span>
              ) : message.text?.length > 40 ? (
                message.text.substring(0, 40) + "..."
              ) : (
                message.text
              )}
            </p>
          </div>
        </div>

        {/* Action buttons - Only Close button remains */}
        <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-violet-500/20">
          <button
            onClick={handleClose}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-300 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-all duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
            Close
          </button>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-violet-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-purple-500/10 rounded-full blur-xl -ml-8 -mb-8"></div>
    </div>
  );
};

export default MessageNotification;
