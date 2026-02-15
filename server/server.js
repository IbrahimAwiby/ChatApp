import express from "express";
import cors from "cors";
import http from "http";
import dotenv from "dotenv/config";
import connectDB from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";

// create express app and HTTP server
const app = express();
const server = http.createServer(app);

// initialize socket.io server
export const io = new Server(server, {
  cors: {
    origin: [process.env.CLIENT_URL, process.env.SERVER_URL],
    credentials: true,
  },
});

// store online users
export const userSocketMap = {};

// Socket.io connection handler
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("User Connected", userId);

  if (userId) userSocketMap[userId] = socket.id;

  // Emit online users to all connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("User Disconnected", userId);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// connect to mongo db
await connectDB();

// middleware setup
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(
  cors({
    origin: [process.env.CLIENT_URL, process.env.SERVER_URL],
    credentials: true,
  }),
);

// routes setup
app.use("/api/status", (req, res) => {
  res.send("Server is live 🚀🚀");
});

app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`server is running on http://localhost:${PORT}`);
  });
}

// export server for vercel
export default server;
