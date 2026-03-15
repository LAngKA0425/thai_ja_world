import { randomUUID } from "crypto";
import type { Socket, Server } from "socket.io";
import type { ChatMessage } from "../../types/index";
import { getSocketUser } from "../../types/index";
import { PLAZA_ROOM_NAME } from "../../rooms/plaza-room";
import SOCKET_EVENTS from "../../events/index";
import { PLAZA_CONFIG } from "@taeja/shared";

const chatHistory: ChatMessage[] = [];

export const handlePlazaChat = (
  socket: Socket,
  io: Server,
  data: any
): void => {
  const user = getSocketUser(socket);

  if (!data.message || typeof data.message !== "string") {
    socket.emit(SOCKET_EVENTS.ERROR, {
      message: "Message is required",
      code: "INVALID_MESSAGE",
    });
    return;
  }

  const trimmedMessage = data.message.trim();

  if (trimmedMessage.length === 0) {
    socket.emit(SOCKET_EVENTS.ERROR, {
      message: "Message cannot be empty",
      code: "EMPTY_MESSAGE",
    });
    return;
  }

  if (trimmedMessage.length > PLAZA_CONFIG.chatMessageLimit) {
    socket.emit(SOCKET_EVENTS.ERROR, {
      message: `Message exceeds maximum length of ${PLAZA_CONFIG.chatMessageLimit}`,
      code: "MESSAGE_TOO_LONG",
    });
    return;
  }

  const message: ChatMessage = {
    id: randomUUID(),
    userId: user.userId,
    nickname: user.nickname,
    message: trimmedMessage,
    timestamp: new Date(),
  };

  chatHistory.push(message);

  if (chatHistory.length > PLAZA_CONFIG.chatMessageLimit) {
    chatHistory.shift();
  }

  io.to(PLAZA_ROOM_NAME).emit(SOCKET_EVENTS.PLAZA_CHAT, {
    id: message.id,
    userId: message.userId,
    nickname: message.nickname,
    message: message.message,
    timestamp: message.timestamp,
  });
};

export const getChatHistory = (): ChatMessage[] => {
  return [...chatHistory];
};

export const clearChatHistory = (): void => {
  chatHistory.length = 0;
};

export default handlePlazaChat;
