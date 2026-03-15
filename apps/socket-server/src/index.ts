import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { config } from "./config";
import authMiddleware from "./middleware/auth";
import handlePlazaJoin from "./handlers/plaza/join-handler";
import {
  handlePlazaLeave,
  handleDisconnect,
} from "./handlers/plaza/leave-handler";
import handlePlazaMove from "./handlers/plaza/movement-handler";
import handlePlazaChat from "./handlers/chat/chat-handler";
import handleBroadcastSend from "./handlers/broadcast/broadcast-handler";
import {
  startPresenceUpdates,
  stopPresenceUpdates,
  handlePresenceUpdate,
} from "./handlers/presence/presence-handler";
import SOCKET_EVENTS from "./events/index";
import { getSocketUser } from "./types/index";

const app = http.createServer({
  maxHeaderSize: 16 * 1024,
});

const io = new Server(app, {
  cors: {
    origin: config.CORS_ORIGIN,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

io.use(authMiddleware);

io.on(SOCKET_EVENTS.CONNECTION, (socket) => {
  const user = getSocketUser(socket);
  const userId = user.userId;
  const nickname = user.nickname;

  console.log(
    `[Socket Connected] User: ${nickname} (${userId}) | Socket ID: ${socket.id}`
  );

  socket.on(SOCKET_EVENTS.PLAZA_JOIN, (data) => {
    try {
      handlePlazaJoin(socket, io, data);
      console.log(`[Plaza Join] ${nickname} joined plaza`);
    } catch (error) {
      console.error("[Plaza Join Error]", error);
      socket.emit(SOCKET_EVENTS.ERROR, {
        message: "Failed to join plaza",
        code: "JOIN_FAILED",
      });
    }
  });

  socket.on(SOCKET_EVENTS.PLAZA_MOVE, (data) => {
    try {
      handlePlazaMove(socket, io, data);
    } catch (error) {
      console.error("[Plaza Move Error]", error);
      socket.emit(SOCKET_EVENTS.ERROR, {
        message: "Failed to move",
        code: "MOVE_FAILED",
      });
    }
  });

  socket.on(SOCKET_EVENTS.PLAZA_CHAT, (data) => {
    try {
      handlePlazaChat(socket, io, data);
      console.log(`[Plaza Chat] ${nickname}: ${data.message}`);
    } catch (error) {
      console.error("[Plaza Chat Error]", error);
      socket.emit(SOCKET_EVENTS.ERROR, {
        message: "Failed to send chat message",
        code: "CHAT_FAILED",
      });
    }
  });

  socket.on(SOCKET_EVENTS.PLAZA_LEAVE, () => {
    try {
      handlePlazaLeave(socket, io);
      console.log(`[Plaza Leave] ${nickname} left plaza`);
    } catch (error) {
      console.error("[Plaza Leave Error]", error);
    }
  });

  socket.on(SOCKET_EVENTS.BROADCAST_SEND, (data) => {
    try {
      handleBroadcastSend(socket, io, data);
      console.log(`[Broadcast] ${nickname}: ${data.message}`);
    } catch (error) {
      console.error("[Broadcast Error]", error);
      socket.emit(SOCKET_EVENTS.ERROR, {
        message: "Failed to send broadcast",
        code: "BROADCAST_FAILED",
      });
    }
  });

  socket.on(SOCKET_EVENTS.PRESENCE_UPDATE, () => {
    try {
      handlePresenceUpdate(socket, io);
    } catch (error) {
      console.error("[Presence Update Error]", error);
    }
  });

  socket.on(SOCKET_EVENTS.DISCONNECT, () => {
    try {
      handleDisconnect(socket, io);
      console.log(
        `[Socket Disconnected] User: ${nickname} (${userId}) | Socket ID: ${socket.id}`
      );
    } catch (error) {
      console.error("[Disconnect Error]", error);
    }
  });

  socket.on(SOCKET_EVENTS.ERROR, (error) => {
    console.error("[Socket Error]", error);
  });
});

startPresenceUpdates(io);

const PORT = config.PORT;
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║        Socket.io Server - Taeja World (태자월드)             ║
╚════════════════════════════════════════════════════════════╝

✓ Server is running on port ${PORT}
✓ CORS enabled for: ${config.CORS_ORIGIN}
✓ Environment: ${config.NODE_ENV}
✓ Ready to accept connections

  `);
});

const gracefulShutdown = () => {
  console.log("Gracefully shutting down...");
  stopPresenceUpdates();
  io.close();
  app.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

export { app, io };
