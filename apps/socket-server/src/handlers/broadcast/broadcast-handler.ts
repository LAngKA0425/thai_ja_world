import type { Socket, Server } from "socket.io";
import { getSocketUser } from "../../types/index";
import broadcastService from "../../services/broadcast-service";
import SOCKET_EVENTS from "../../events/index";
import { BROADCAST_TYPES } from "@taeja/shared";

export const handleBroadcastSend = (
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

  if (!data.type || (data.type !== "NORMAL" && data.type !== "PREMIUM")) {
    socket.emit(SOCKET_EVENTS.ERROR, {
      message: "Invalid broadcast type",
      code: "INVALID_TYPE",
    });
    return;
  }

  const cooldownCheck = broadcastService.checkCooldown(user.userId);

  if (!cooldownCheck.canBroadcast) {
    socket.emit(SOCKET_EVENTS.ERROR, {
      message: `You must wait before broadcasting again`,
      code: "BROADCAST_COOLDOWN",
      cooldownMs: cooldownCheck.cooldownMs,
      nextAvailableAt: cooldownCheck.nextAvailableAt,
    });
    return;
  }

  const trimmedMessage = data.message.trim();
  const broadcastType =
    data.type === "PREMIUM" ? BROADCAST_TYPES.PREMIUM : BROADCAST_TYPES.NORMAL;

  if (trimmedMessage.length === 0) {
    socket.emit(SOCKET_EVENTS.ERROR, {
      message: "Message cannot be empty",
      code: "EMPTY_MESSAGE",
    });
    return;
  }

  if (trimmedMessage.length > broadcastType.maxLength) {
    socket.emit(SOCKET_EVENTS.ERROR, {
      message: `Message exceeds maximum length of ${broadcastType.maxLength}`,
      code: "MESSAGE_TOO_LONG",
    });
    return;
  }

  const broadcast = broadcastService.addBroadcast(
    user.userId,
    user.nickname,
    trimmedMessage,
    data.type
  );

  if (!broadcast) {
    socket.emit(SOCKET_EVENTS.ERROR, {
      message: "Failed to create broadcast",
      code: "BROADCAST_CREATION_FAILED",
    });
    return;
  }

  broadcastService.setCooldown(user.userId, broadcastType.cooldownMs);

  socket.emit(SOCKET_EVENTS.BROADCAST_RECEIVE, {
    success: true,
    broadcastId: broadcast.id,
    expiresAt: broadcast.expiresAt,
  });

  io.emit(SOCKET_EVENTS.BROADCAST_RECEIVE, {
    id: broadcast.id,
    userId: broadcast.userId,
    nickname: broadcast.nickname,
    message: broadcast.message,
    type: broadcast.type,
    sentAt: broadcast.sentAt,
    expiresAt: broadcast.expiresAt,
    timeRemainingMs: broadcast.expiresAt.getTime() - Date.now(),
  });
};

export const getBroadcasts = (): any[] => {
  return broadcastService.getBroadcasts().map((b) => ({
    id: b.id,
    userId: b.userId,
    nickname: b.nickname,
    message: b.message,
    type: b.type,
    sentAt: b.sentAt,
    expiresAt: b.expiresAt,
    timeRemainingMs: Math.max(0, b.expiresAt.getTime() - Date.now()),
  }));
};

export default handleBroadcastSend;
