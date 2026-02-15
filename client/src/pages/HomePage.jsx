import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import RightSidebar from "../components/RightSidebar";
import { useChat } from "../../context/ChatContext";

const HomePage = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRightSidebar, setShowRightSidebar] = useState(false);
  const {
    setSelectedUser: setContextSelectedUser,
    selectedUser: contextSelectedUser,
  } = useChat();
  const isUpdatingRef = useRef(false);

  // Sync local to context
  useEffect(() => {
    if (selectedUser && !isUpdatingRef.current) {
      console.log("HomePage: Syncing local to context:", selectedUser);
      isUpdatingRef.current = true;
      setContextSelectedUser(selectedUser);
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 100);
    }
  }, [selectedUser, setContextSelectedUser]);

  // Sync context to local (for when selection happens from notification)
  useEffect(() => {
    if (contextSelectedUser && !isUpdatingRef.current) {
      if (!selectedUser || selectedUser._id !== contextSelectedUser._id) {
        console.log("HomePage: Syncing context to local:", contextSelectedUser);
        isUpdatingRef.current = true;
        setSelectedUser(contextSelectedUser);
        setTimeout(() => {
          isUpdatingRef.current = false;
        }, 100);
      }
    }
  }, [contextSelectedUser]);

  const handleToggleRightSidebar = () => {
    console.log("Toggling right sidebar, current state:", showRightSidebar);
    console.log("Current selected user:", selectedUser);
    setShowRightSidebar(!showRightSidebar);
  };

  const handleCloseRightSidebar = () => {
    console.log("Closing right sidebar");
    setShowRightSidebar(false);
  };

  console.log("HomePage selectedUser:", selectedUser);
  console.log("HomePage showRightSidebar:", showRightSidebar);

  return (
    <div className="border w-full h-screen sm:px-[10%] sm:py-[3%]">
      <div
        className={`backdrop-blur-xl border-2 border-gray-600 rounded-2xl overflow-hidden h-full grid grid-cols-1 relative ${
          selectedUser
            ? "md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]"
            : "md:grid-cols-2"
        }`}
      >
        {/* Sidebar - hidden on mobile when user is selected */}
        <div
          className={`${selectedUser && window.innerWidth < 768 ? "hidden" : "block"} md:block`}
        >
          <Sidebar
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
          />
        </div>

        {/* ChatContainer - always visible when user selected */}
        {selectedUser && (
          <ChatContainer
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
            onToggleRightSidebar={handleToggleRightSidebar}
          />
        )}

        {/* RightSidebar - overlay on mobile */}
        {selectedUser && (
          <>
            {/* Backdrop for mobile */}
            {showRightSidebar && window.innerWidth < 768 && (
              <div
                className="fixed inset-0 bg-black/50 z-40 md:hidden"
                onClick={handleCloseRightSidebar}
              />
            )}

            {/* RightSidebar */}
            <div
              className={`
              ${
                showRightSidebar
                  ? "fixed inset-y-0 right-0 w-[85%] max-w-[350px] z-50 md:static md:w-auto md:z-auto"
                  : "hidden md:block"
              }
              transition-all duration-300 ease-in-out
            `}
            >
              {selectedUser && (
                <RightSidebar
                  selectedUser={selectedUser}
                  onClose={handleCloseRightSidebar}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;
