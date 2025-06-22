import express from "express";
import userConroller from "./Services/Controller/userController";
import cors from "cors";
import mongoose from "mongoose";
import http from "http";
import { Server, Socket } from "socket.io";
import path from "path";
import cookieParser from "cookie-parser";
import conversetionController from "./Services/Controller/converstionController";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import multer from "multer";

dotenv.config();
const accesstoken: string = process.env.ACCESS_TOKEN_SECRET || "";
const port = 8000;
const app = express();
const server = http.createServer(app);
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(cookieParser());

const io = new Server(server, {
  maxHttpBufferSize: 1e8,
  pingTimeout: 60000,
  pingInterval: 25000,
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "DELETE"],
    credentials: true,
  },
});

interface userConnected {
  userId: string;
  socketId: string;
}

let users: userConnected[] = [];

const addUser = (userId: string, socketId: string) => {
  if (!users.some((user) => user.userId === userId)) {
    users.push({ userId, socketId });
  }
};

const removeUser = (socketId: string) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (id: string | string[]) => {
  if (Array.isArray(id)) {
    return users.filter((user) => id.includes(user.userId));
  } else {
    return users.find((user) => user.userId === id);
  }
};

io.on("connection", (socket: Socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("addUser", (userId) => {
    console.log(`Adding user: ${userId} with socket: ${socket.id}`);
    addUser(userId, socket.id);
    console.log("Current users:", users);
    io.emit("getUsers", users);
  });

  socket.on("createGroups", (chats) => {
    chats.forEach((chat: any) => socket.join(`conversation : ${chat._id}`));
  });

  socket.on("newGroupCreated", ({ chat, userId }) => {
    chat.users.forEach((user: string) => {
      const currUser = getUser(user);
      if (currUser) {
        if (!Array.isArray(currUser)) {
          if (currUser.userId !== userId) {
            io.to(currUser.socketId).emit("newConvo", chat);
          }
          const userSocket = io.sockets.sockets.get(currUser.socketId);
          userSocket?.join(`conversation : ${chat._id}`);
        }
      }
    });
  });

  socket.on("sendMessage", ({ senderId, reciverId, message, convoId }) => {
    console.log(`Message from ${senderId} to ${reciverId}: ${message}`);
    const user = getUser(reciverId);
    if (user) {
      if (!Array.isArray(user)) {
        console.log(`Sending message to socket: ${user.socketId}`);
        io.to(user.socketId).emit("getMessage", { senderId, message, convoId });
      } else {
        socket.to(`conversation : ${convoId}`).emit("getMessage", {
          senderId,
          message,
          convoId,
        });
      }
    } else {
      console.log(`Receiver ${reciverId} not found in users array`);
    }
  });

  socket.on("disconnect", (reason) => {
    console.log(`User disconnected: ${socket.id}, reason: ${reason}`);
    removeUser(socket.id);
    console.log("Users after disconnect:", users);
    io.emit("getUsers", users);
  });
});

mongoose
  .connect("mongodb://127.0.0.1:27017/ChatUsersDB")
  .then(() => console.log("Connected to DB"));

app.use("/images", express.static(path.join(__dirname, "Pictures")));
app.use("/users", userConroller);
app.use("/conversations", conversetionController);

server.listen(port, () => {
  console.log(`Server is running at http://127.0.0.1:${port}`);
});
