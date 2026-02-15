import cloudinary from "../lib/cloudinary.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import { io, userSocketMap } from "../server.js";

// Get all users except the logged in user
export const getUsersForSidebar = async (req, res) => {
  try {
    const userId = req.user._id; // FIXED: removed curly braces around userId
    const filteredUsers = await User.find({ _id: { $ne: userId } }).select(
      "-password",
    );

    // count number of messages not seen
    const unseenMessages = {};
    const promises = filteredUsers.map(async (user) => {
      const messages = await Message.find({
        senderId: user._id,
        receiverId: userId,
        seen: false,
      });

      if (messages.length > 0) {
        unseenMessages[user._id] = messages.length;
      }
    });

    await Promise.all(promises);

    res.json({
      success: true,
      users: filteredUsers,
      unseenMessages,
    });
  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// get all messages for selected user
export const getMessages = async (req, res) => {
  try {
    const { id: selectedUserId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: selectedUserId },
        { senderId: selectedUserId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });

    // Find all unread messages sent by the selected user to me
    const unreadMessages = await Message.find({
      senderId: selectedUserId,
      receiverId: myId,
      seen: false,
    });

    // Mark them as seen in database
    if (unreadMessages.length > 0) {
      await Message.updateMany(
        { senderId: selectedUserId, receiverId: myId, seen: false },
        { seen: true },
      );

      // Emit seen events for each unread message to the sender
      unreadMessages.forEach((message) => {
        const senderSocketId = userSocketMap[selectedUserId];
        if (senderSocketId) {
          io.to(senderSocketId).emit("messageSeen", {
            messageId: message._id,
            seenBy: myId,
            chatId: selectedUserId,
          });
        }
      });
    }

    res.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// api to mark message as seen using message id
export const markMessageAsSeen = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id; // The user who is seeing the message

    // Find the message first to get sender info
    const message = await Message.findById(id);

    if (!message) {
      return res.json({
        success: false,
        message: "Message not found",
      });
    }

    // Update the message to seen
    await Message.findByIdAndUpdate(id, { seen: true });

    // Emit socket event to the sender that their message has been seen
    const senderSocketId = userSocketMap[message.senderId];
    if (senderSocketId) {
      io.to(senderSocketId).emit("messageSeen", {
        messageId: id,
        seenBy: userId,
        chatId: message.senderId, // The sender's ID
      });
      console.log(`Message ${id} seen by ${userId} - notified sender`);
    }

    res.json({
      success: true,
    });
  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// send message to selected user
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id;

    console.log("Sending message:", {
      senderId,
      receiverId,
      text,
      hasImage: !!image,
    });

    // Check if there's any content to send
    if (!text?.trim() && !image) {
      return res.json({
        success: false,
        message: "Cannot send empty message",
      });
    }

    let imageUrl;
    let imagePublicId;

    // Only attempt to upload if image exists
    if (image) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(image, {
          folder: "chat_messages",
          timeout: 60000,
        });
        imageUrl = uploadResponse.secure_url;
        imagePublicId = uploadResponse.public_id;
        console.log("Image uploaded successfully:", imageUrl);
      } catch (uploadError) {
        console.error("Image upload error:", uploadError);

        // If there's no text and image upload failed, return error
        if (!text?.trim()) {
          return res.json({
            success: false,
            message:
              "Failed to upload image. Please try again with a smaller image or check your connection.",
          });
        }

        // If there's text, continue without image
        console.log("Continuing with text only message");
      }
    }

    // Create message only if we have content
    const newMessage = await Message.create({
      senderId,
      receiverId,
      text: text?.trim() || "",
      image: imageUrl,
      imagePublicId,
    });

    console.log("Message created:", newMessage._id);

    // Populate sender info
    const populatedMessage = await Message.findById(newMessage._id)
      .populate("senderId", "fullName profilePic")
      .populate("receiverId", "fullName profilePic");

    // Emit the new message to the receiver's socket
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", populatedMessage);
      console.log("Message emitted to receiver:", receiverId);
    }

    // Also emit to sender for real-time update
    const senderSocketId = userSocketMap[senderId];
    if (senderSocketId && senderSocketId !== receiverSocketId) {
      io.to(senderSocketId).emit("newMessage", populatedMessage);
    }

    res.json({
      success: true,
      newMessage: populatedMessage,
    });
  } catch (error) {
    console.error("Send message error:", error.message);
    console.error("Full error:", error);

    res.json({
      success: false,
      message: error.message,
    });
  }
};

// delete message
export const deleteMessage = async (req, res) => {
  try {
    const messageId = req.params.id;
    const userId = req.user._id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    // 🔥 delete image from cloudinary if exists
    if (message.imagePublicId) {
      await cloudinary.uploader.destroy(message.imagePublicId);
    }

    await message.deleteOne();

    // Get both users in the conversation
    const user1Id = message.senderId.toString();
    const user2Id = message.receiverId.toString();

    // For each user, find their last message in this conversation
    const getLastMessageForUser = async (forUserId, otherUserId) => {
      return await Message.findOne({
        $or: [
          { senderId: forUserId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: forUserId },
        ],
      }).sort({ createdAt: -1 });
    };

    // Get last messages for both users
    const lastMessageForUser1 = await getLastMessageForUser(user1Id, user2Id);
    const lastMessageForUser2 = await getLastMessageForUser(user2Id, user1Id);

    // Prepare socket data for each user
    const socketDataForUser1 = {
      messageId: messageId,
      conversationId: user2Id,
      newLastMessage: lastMessageForUser1 || null,
    };

    const socketDataForUser2 = {
      messageId: messageId,
      conversationId: user1Id,
      newLastMessage: lastMessageForUser2 || null,
    };

    // Emit to both users if they're online
    const user1SocketId = userSocketMap[user1Id];
    const user2SocketId = userSocketMap[user2Id];

    if (user1SocketId) {
      io.to(user1SocketId).emit("deleteMessage", socketDataForUser1);
      console.log(`Delete event sent to user ${user1Id}`);
    }

    if (user2SocketId) {
      io.to(user2SocketId).emit("deleteMessage", socketDataForUser2);
      console.log(`Delete event sent to user ${user2Id}`);
    }

    // Also broadcast to all clients that a message was deleted
    // (useful for any other UI elements that might need this info)
    io.emit("messageDeleted", { messageId });

    res.json({ success: true });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get last message for each user (for sidebar preview)
export const getLastMessages = async (req, res) => {
  try {
    const userId = req.user._id; // FIXED: removed curly braces

    // Get all users except current user
    const users = await User.find({ _id: { $ne: userId } }).select(
      "_id fullName profilePic bio",
    );

    // If no other users exist, return empty arrays
    if (users.length === 0) {
      return res.json({
        success: true,
        users: [],
        lastMessages: {},
        unseenMessages: {},
      });
    }

    // Get last message for each user
    const lastMessages = {};

    // Use aggregation pipeline for better performance
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: userId }, { receiverId: userId }],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [{ $eq: ["$senderId", userId] }, "$receiverId", "$senderId"],
          },
          lastMessage: { $first: "$$ROOT" },
        },
      },
    ]);

    // Format the response
    messages.forEach((item) => {
      lastMessages[item._id] = {
        messageId: item.lastMessage._id,
        text: item.lastMessage.text,
        image: item.lastMessage.image,
        createdAt: item.lastMessage.createdAt,
        seen: item.lastMessage.seen,
        senderId: item.lastMessage.senderId,
        receiverId: item.lastMessage.receiverId,
      };
    });

    // Also get unseen messages count
    const unseenMessages = {};
    const unseenPromises = users.map(async (user) => {
      const count = await Message.countDocuments({
        senderId: user._id,
        receiverId: userId,
        seen: false,
      });
      if (count > 0) {
        unseenMessages[user._id] = count;
      }
    });

    await Promise.all(unseenPromises);

    res.json({
      success: true,
      users,
      lastMessages,
      unseenMessages,
    });
  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};
