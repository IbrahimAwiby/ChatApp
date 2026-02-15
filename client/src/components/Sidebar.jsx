import React, { useEffect, useState } from "react";
import assets from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import { formatMessageTime } from "../lib/utils";

const Sidebar = ({ selectedUser, setSelectedUser }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user: currentUser, logout } = useAuth();
  const { users, isUserOnline, unseenMessages, lastMessages, loading } =
    useChat();
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Define functions BEFORE they're used in JSX
  // Toggle menu
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Close menu
  const closeMenu = () => {
    setMenuOpen(false);
  };

  // Handle navigation
  const handleNavigate = (path) => {
    navigate(path);
    closeMenu();
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    closeMenu();
  };

  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    window.location.reload();
  };

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuOpen && !event.target.closest(".menu-container")) {
        closeMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  // Create a "You" contact object from current user
  const youContact = currentUser
    ? {
        ...currentUser,
        isYou: true,
        fullName: `${currentUser.fullName}`,
        displayName: "Saved Messages",
      }
    : null;

  // Use only other users (filter out current user)
  const otherUsers = users.filter((u) => u._id !== currentUser?._id);

  // Get message preview
  const getMessagePreview = (message) => {
    if (!message) return "No messages yet";
    if (message.image) return "📷 Image";
    if (message.text) {
      return message.text.length > 25
        ? message.text.substring(0, 25) + "..."
        : message.text;
    }
    return "No messages yet";
  };

  // Filter function for search
  const matchesSearch = (contact) => {
    const searchLower = searchTerm.toLowerCase();
    if (contact.isYou) {
      return (
        "saved messages".includes(searchLower) ||
        contact.fullName.toLowerCase().includes(searchLower)
      );
    }
    return contact.fullName.toLowerCase().includes(searchLower);
  };

  // Loading skeleton for full page load
  if (loading && users.length === 0) {
    return (
      <div
        className={`bg-[#8185B2]/10 h-full p-5 rounded-r-xl overflow-y-scroll text-white ${
          selectedUser ? "max-md:hidden" : ""
        }`}
      >
        <div className="pb-5">
          <div className="flex justify-between items-center">
            <img src={assets.logo} alt="logo" className="max-w-40 opacity-50" />
            <div className="w-5 h-5 bg-gray-600 rounded animate-pulse"></div>
          </div>
          <div className="bg-[#282142] rounded-full h-10 mt-4 animate-pulse"></div>
        </div>
        <div className="mb-2 px-2">
          <div className="w-20 h-3 bg-gray-600 rounded animate-pulse"></div>
        </div>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-2 p-2 pl-4">
            <div className="w-10 h-10 bg-gray-600 rounded-full animate-pulse"></div>
            <div className="flex-1">
              <div className="flex justify-between">
                <div className="w-24 h-4 bg-gray-600 rounded animate-pulse"></div>
                <div className="w-12 h-3 bg-gray-600 rounded animate-pulse"></div>
              </div>
              <div className="w-32 h-3 bg-gray-600 rounded mt-2 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={`bg-[#8185B2]/10 h-full p-5 rounded-r-xl overflow-y-scroll text-white ${
        selectedUser ? "max-md:hidden" : ""
      }`}
    >
      <div className="pb-5">
        <div className="flex justify-between items-center">
          <img src={assets.logo} alt="logo" className="max-w-40" />

          <div className="flex items-center gap-2">
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-full hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500"
              aria-label="Refresh"
              title="Refresh page"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 text-white ${isRefreshing ? "animate-spin" : ""}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {/* Three-dot menu container */}
            <div className="relative menu-container">
              {/* Menu button */}
              <button
                onClick={toggleMenu}
                className="p-1.5 rounded-full hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500"
                aria-label="Menu"
                aria-expanded={menuOpen}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <circle cx="12" cy="5" r="2" />
                  <circle cx="12" cy="12" r="2" />
                  <circle cx="12" cy="19" r="2" />
                </svg>
              </button>

              {/* Dropdown menu */}
              {menuOpen && (
                <div className="absolute top-full right-0 z-50 w-40 py-2 rounded-lg bg-[#282142] border border-gray-600 shadow-xl animate-fadeIn">
                  {/* Edit Profile Option */}
                  <button
                    onClick={() => handleNavigate("/profile")}
                    className="w-full text-left px-4 py-3 text-sm text-gray-200 hover:text-white hover:bg-violet-600/30 transition-all duration-200 flex items-center gap-3"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    <span>Edit Profile</span>
                  </button>

                  <hr className="my-1 border-t border-gray-600/50" />

                  {/* Logout Option */}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-sm text-gray-200 hover:text-white hover:bg-red-600/30 transition-all duration-200 flex items-center gap-3"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="bg-[#282142] rounded-full flex items-center gap-2 py-3 px-4 mt-4 focus-within:ring-2 focus-within:ring-violet-500 transition-all">
          <img
            src={assets.search_icon}
            alt="search_icon"
            className="w-3 opacity-50"
          />
          <input
            placeholder="Search users or 'Saved Messages'..."
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-white text-sm placeholder-[#c8c8c8] flex-1"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Clear search"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Contacts list header */}
      <div className="mb-2 px-2 flex justify-between items-center">
        <p className="text-xs text-gray-400 uppercase tracking-wider">
          Chats ({otherUsers.length + (youContact ? 1 : 0)})
        </p>
        {youContact && (
          <span className="text-[10px] text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full">
            Saved Messages
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1">
        {/* Always show "You" contact first if it exists and matches search */}
        {youContact && matchesSearch(youContact) && (
          <div
            onClick={() => {
              console.log(
                "Sidebar: Contact clicked - setting selected user:",
                youContact,
              );
              setSelectedUser(youContact);
              closeMenu();
            }}
            className={`relative flex items-center gap-2 p-2 pl-4 rounded cursor-pointer max-sm:text-sm hover:bg-[#282142]/30 transition-all ${
              selectedUser?._id === youContact._id
                ? "bg-[#282142]/50 border-l-4 border-violet-500"
                : ""
            } bg-violet-500/5 hover:bg-violet-500/10`}
            key={youContact._id}
          >
            <div className="relative">
              <img
                src={youContact?.profilePic || assets.avatar_icon}
                alt="profile_picture"
                className="w-11 h-11 aspect-square rounded-full"
              />
              <span className="absolute -top-1 -right-1 bg-violet-500 rounded-full p-0.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3 text-white"
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
            </div>

            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium truncate flex items-center gap-1">
                  {youContact.fullName}
                  <span className="text-[10px] bg-violet-500/30 text-violet-300 px-1.5 py-0.5 rounded-full">
                    You
                  </span>
                </p>
              </div>

              <div className="flex justify-between items-center mt-0.5">
                <p className="text-xs text-gray-400 truncate max-w-[150px]">
                  <span className="flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                    </svg>
                    Saved Messages
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Show spinner while loading other users */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-400">
            <div className="relative">
              {/* Spinner */}
              <div className="w-12 h-12 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3 h-3 bg-violet-500 rounded-full animate-pulse"></div>
              </div>
            </div>
            <p className="text-sm mt-4">Loading contacts...</p>
            <p className="text-xs mt-1 text-gray-500">Please wait</p>
          </div>
        ) : /* Show other users that match search */
        otherUsers.filter(matchesSearch).length > 0 ? (
          otherUsers.filter(matchesSearch).map((contact) => {
            const online = isUserOnline(contact._id);
            const unseenCount = unseenMessages[contact._id] || 0;
            const lastMessage = lastMessages[contact._id];
            const messagePreview = getMessagePreview(lastMessage);
            const messageTime = lastMessage?.createdAt
              ? formatMessageTime(lastMessage.createdAt)
              : "";
            const isLastMessageFromMe =
              lastMessage &&
              (lastMessage.senderId === currentUser?._id ||
                lastMessage.senderId?._id === currentUser?._id);

            return (
              <div
                onClick={() => {
                  console.log(
                    "Sidebar: Contact clicked - setting selected user:",
                    contact,
                  );
                  setSelectedUser(contact);
                  closeMenu();
                }}
                className={`relative flex items-center gap-2 p-2 pl-4 rounded cursor-pointer max-sm:text-sm hover:bg-[#282142]/30 transition-all ${
                  selectedUser?._id === contact._id
                    ? "bg-[#282142]/50 border-l-4 border-violet-500"
                    : ""
                }`}
                key={contact._id}
              >
                <div className="relative">
                  <img
                    src={contact?.profilePic || assets.avatar_icon}
                    alt="profile_picture"
                    className="w-11 h-11 aspect-square rounded-full"
                  />
                  {online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#282142]"></span>
                  )}
                </div>

                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium truncate">
                      {contact.fullName}
                    </p>
                    {messageTime && (
                      <span className="text-[10px] text-gray-400 ml-2 whitespace-nowrap">
                        {messageTime}
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between items-center mt-0.5">
                    <p className="text-xs text-gray-400 truncate max-w-[150px]">
                      {isLastMessageFromMe && (
                        <span className="text-violet-400 mr-1">You:</span>
                      )}
                      {messagePreview}
                    </p>

                    {unseenCount > 0 && (
                      <div className="text-xs h-5 min-w-5 px-1.5 flex justify-center items-center rounded-full bg-violet-500 text-white font-medium ml-2">
                        {unseenCount}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          // No other users found that match search
          <div className="flex flex-col items-center justify-center py-8 text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mb-2 opacity-50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <p className="text-sm">No users found</p>
            <p className="text-xs mt-1">Try a different search</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
