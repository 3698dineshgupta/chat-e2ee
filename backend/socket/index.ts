import { Server, Socket } from "socket.io";
import http from "http";

/* ================================
   Custom Socket Type
================================ */

export interface CustomSocket extends Socket {
  userID?: string;
  channelID?: string;
}

/* ================================
   Socket Topics
================================ */

export enum SOCKET_TOPIC {
  CHAT_MESSAGE = "chat-message",
  LIMIT_REACHED = "limit-reached",
  DELIVERED = "delivered",
  MESSAGE = "message",
  ON_ALICE_JOIN = "alice-join",
  WEBRTC_SESSION_DESCRIPTION = "webrtc-session-description",
  ON_ALICE_DISCONNECTED = "alice-disconnected",
}

/* ================================
   Socket Instance
================================ */

let io: Server | null = null;

/* ================================
   Init Socket Server
================================ */

export const initSocket = (server: http.Server): Server => {
  if (io) return io;

  io = new Server(server, {
    cors: {
      origin: "*",
      credentials: true,
    },
  });

  console.log("Socket server started ✅");

  io.on("connection", (socket: CustomSocket) => {
    console.log("Client connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("Disconnected:", socket.id);
    });
  });

  return io;
};

/* ================================
   Emit Helper
================================ */

export const socketEmit = (
  topic: SOCKET_TOPIC,
  socketId: string,
  data: any
) => {
  if (!io) return;

  io.to(socketId).emit(topic, data);
};
