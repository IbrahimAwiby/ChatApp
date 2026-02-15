import React, { useState, useEffect } from "react";
import assets from "../assets/assets";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import toast from "react-hot-toast";
import ImageModal from "./ImageModal";

const RightSidebar = ({ selectedUser, onClose }) => {
  const { user: currentUser, logout } = useAuth();
  const { messages, isUserOnline, users } = useChat(); // Add users from context
  const [media, setMedia] = useState([]);
  const [imageModal, setImageModal] = useState({
    isOpen: false,
    imageUrl: null,
    senderName: "",
  });
  const [activeMenu, setActiveMenu] = useState(null);
  const [userProfile, setUserProfile] = useState(selectedUser);

  console.log("RightSidebar rendering with selectedUser:", selectedUser);

  // Update userProfile when selectedUser changes or users array updates
  useEffect(() => {
    if (selectedUser) {
      // Find the latest user data from the users array
      const latestUser = users.find((u) => u._id === selectedUser._id);

      if (latestUser) {
        // If we found the user in the users array, use that data
        setUserProfile(latestUser);
      } else if (selectedUser._id === currentUser?._id) {
        // If it's the current user and not found in users array, use currentUser
        setUserProfile(currentUser);
      } else {
        // Fallback to the selectedUser prop
        setUserProfile(selectedUser);
      }
    }
  }, [selectedUser, users, currentUser]);

  // Check if selected user is the current user
  const isCurrentUser = userProfile?._id === currentUser?._id;

  // Extract media from messages when selectedUser changes
  useEffect(() => {
    console.log("RightSidebar useEffect - userProfile:", userProfile);
    console.log("RightSidebar useEffect - messages length:", messages.length);

    if (userProfile && messages.length > 0) {
      const mediaUrls = messages
        .filter((msg) => msg.image && msg.image.trim() !== "")
        .map((msg) => ({
          url: msg.image,
          createdAt: msg.createdAt,
          messageId: msg._id,
          senderName: msg.senderId?.fullName || userProfile.fullName,
        }));

      // Remove duplicates
      const uniqueMedia = mediaUrls.filter(
        (item, index, self) =>
          index === self.findIndex((t) => t.url === item.url),
      );

      console.log("Media found:", uniqueMedia.length);
      setMedia(uniqueMedia);
    } else {
      console.log("No media found or no selected user");
      setMedia([]);
    }
  }, [userProfile, messages]);

  const handleImageClick = (url, senderName) => {
    setImageModal({
      isOpen: true,
      imageUrl: url,
      senderName,
    });
  };

  const handleProfileImageClick = () => {
    if (userProfile?.profilePic) {
      handleImageClick(userProfile.profilePic, userProfile.fullName);
    }
  };

  const handleDownload = async (url) => {
    try {
      toast.loading("Downloading...", { id: "download" });

      const response = await fetch(url);
      const blob = await response.blob();

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `image-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(downloadUrl);

      toast.success("Downloaded!", { id: "download" });
      setActiveMenu(null);
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download", { id: "download" });
    }
  };

  const toggleMenu = (messageId) => {
    setActiveMenu(activeMenu === messageId ? null : messageId);
  };

  const handleLogout = () => {
    logout();
    onClose(); // Close sidebar after logout
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setActiveMenu(null);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  if (!userProfile) {
    console.log("RightSidebar: No selected user, returning null");
    return null;
  }

  const online = isUserOnline(userProfile._id);

  return (
    <>
      <ImageModal
        isOpen={imageModal.isOpen}
        onClose={() => setImageModal({ ...imageModal, isOpen: false })}
        imageUrl={imageModal.imageUrl}
        senderName={imageModal.senderName}
      />

      <div className="bg-[#1a1a2e] md:bg-[#8185B2]/10 text-white w-full h-full flex flex-col">
        {/* Mobile Close Button */}
        <button
          onClick={onClose}
          className="md:hidden absolute top-4 right-4 z-10 bg-violet-600 rounded-full p-2 hover:bg-violet-700 transition-colors shadow-lg"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-white"
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

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Profile Section */}
          <div className="pt-8 px-4">
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <button
                  onClick={handleProfileImageClick}
                  className="focus:outline-none focus:ring-2 focus:ring-violet-500 rounded-full"
                  title="Click to view profile picture"
                >
                  <img
                    src={userProfile?.profilePic || assets.avatar_icon}
                    alt="profilePic"
                    className="w-20 h-20 rounded-full object-cover border-2 border-violet-500/50 cursor-pointer hover:opacity-90 transition-opacity"
                  />
                </button>
                {isCurrentUser && (
                  <span className="absolute -top-1 -right-1 bg-violet-500 rounded-full p-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 2a1 1 0 011 1v1.323l3.954-1.628a1 1 0 01.75 1.854l-3.954 1.628 2.382 3.058a1 1 0 01-1.53 1.232L10 8.289l-2.602 2.378a1 1 0 01-1.53-1.232l2.382-3.058-3.954-1.628a1 1 0 01.75-1.854L9 4.323V3a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                )}
              </div>

              <h1 className="text-lg font-medium flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    online ? "bg-green-500 animate-pulse" : "bg-gray-500"
                  }`}
                ></span>
                {userProfile.fullName}
                {isCurrentUser && (
                  <span className="text-xs bg-violet-500/30 text-violet-300 px-2 py-0.5 rounded-full">
                    You
                  </span>
                )}
              </h1>

              <p className="text-center text-gray-300 text-xs max-w-[200px]">
                {userProfile.bio || "No bio yet"}
              </p>

              {/* User Stats */}
              <div className="flex gap-4 mt-2">
                <div className="text-center">
                  <p className="text-sm font-semibold text-violet-400">
                    {media.length}
                  </p>
                  <p className="text-xs text-gray-400">Media</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-violet-400">
                    {online ? "●" : "○"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {online ? "Online" : "Offline"}
                  </p>
                </div>
                {isCurrentUser && (
                  <div className="text-center">
                    <p className="text-sm font-semibold text-violet-400">★</p>
                    <p className="text-xs text-gray-400">You</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <hr className="border-[#ffffff50] my-3 mx-4" />

          {/* Media Header */}
          <div className="px-4">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium">Shared Media</p>
              <span className="text-xs px-2 py-0.5 bg-violet-500/20 rounded-full text-violet-400">
                {media.length}
              </span>
            </div>
          </div>

          {/* Fixed Height Media Grid - 240px with scroll */}
          <div className="px-4 mt-2">
            <div className="h-67 sm:h-60 overflow-y-auto border border-gray-700/50 rounded-lg p-2 bg-black/20">
              {media.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {media.map((item, index) => (
                    <div
                      key={item.messageId || index}
                      className="relative group rounded-lg overflow-hidden border border-gray-700 hover:border-violet-500 transition-all aspect-square"
                    >
                      <img
                        src={item.url}
                        alt={`media-${index}`}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() =>
                          handleImageClick(item.url, item.senderName)
                        }
                      />

                      {/* Three dots menu button - visible on mobile */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMenu(item.messageId);
                        }}
                        className="absolute top-1 right-1 z-20 bg-black/60 rounded-full p-1.5 md:hidden"
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

                      {/* Mobile Menu Popup */}
                      {activeMenu === item.messageId && (
                        <div
                          className="absolute top-8 right-1 z-30 bg-[#282142] rounded-lg shadow-xl border border-gray-600 overflow-hidden"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => {
                              handleImageClick(item.url, item.senderName);
                              setActiveMenu(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-white hover:bg-violet-600/30 flex items-center gap-2 border-b border-gray-600"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path
                                fillRule="evenodd"
                                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            View
                          </button>
                          <button
                            onClick={() => handleDownload(item.url)}
                            className="w-full px-4 py-2 text-left text-sm text-white hover:bg-green-600/30 flex items-center gap-2"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Download
                          </button>
                        </div>
                      )}

                      {/* Desktop hover overlay - hidden on mobile */}
                      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex items-center justify-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleImageClick(item.url, item.senderName);
                          }}
                          className="bg-violet-600 p-1.5 rounded-full hover:bg-violet-700 transition-colors"
                          title="View"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path
                              fillRule="evenodd"
                              d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(item.url);
                          }}
                          className="bg-green-600 p-1.5 rounded-full hover:bg-green-700 transition-colors"
                          title="Download"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>

                      {/* Date indicator */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-[8px] text-gray-300 text-center">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 mb-2 opacity-30"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-xs">No media shared yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Logout Button - visible only on mobile */}
        <div className="md:hidden p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-medium py-3 px-4 rounded-full hover:from-red-600 hover:to-red-700 transition-all hover:scale-105 duration-200 shadow-lg shadow-red-500/30 flex items-center justify-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                clipRule="evenodd"
              />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default RightSidebar;
