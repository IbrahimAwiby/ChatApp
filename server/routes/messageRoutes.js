import express from "express";
import { protectRoute } from "../middleware/auth.js";
import {
  deleteMessage,
  getLastMessages,
  getMessages,
  getUsersForSidebar,
  markMessageAsSeen,
  sendMessage,
} from "../controllers/messageController.js";

const messageRouter = express.Router();

messageRouter.get("/users", protectRoute, getUsersForSidebar);
messageRouter.get("/last-messages", protectRoute, getLastMessages);
messageRouter.get("/:id", protectRoute, getMessages);
messageRouter.get("/mark/:id", protectRoute, markMessageAsSeen);
messageRouter.post("/send/:id", protectRoute, sendMessage);
messageRouter.delete("/delete/:id", protectRoute, deleteMessage);

export default messageRouter;
