import type { Socket, Server } from "socket.io";
import { getSocketUser } from "../../types/index";
import presenceService from "../../services/presence-service";
import SOCKET_EVENTS from "../../events/index";

let presenceUpdateInterval: NodeJS.Timeout | null = null;

export const startPresenceUpdates = (io: Server): void => {
  if (presenceUpdateInterval) {
    return;
  }

  presenceUpdateInterval = setInterval(() => {
    const onlineCount = presenceService.getOnlineCount();
    io.emit(SOCKET_EVENTS.PRESENCE_ONLINE_COUNT, {
      onlineCount,
      timestamp: new Date(),
    });
  }, 10000);
};

export const stopPresenceUpdates = (): void => {
  if (presenceUpdateInterval) {
    clearInterval(presenceUpdateInterval);
    presenceUpdateInterval = null;
  }
};

export const handlePresenceUpdate = (socket: Socket, io: Server): void => {
  const user = getSocketUser(socket);

  const status = presenceService.getUserStatus(user.userId);

  io.emit(SOCKET_EVENTS.PRESENCE_USER_STATUS, {
    userId: user.userId,
    isOnline: status.isOnline,
    user: status.user ? {
      userId: status.user.userId,
      nickname: status.user.nickname,
      connectedAt: status.user.connectedAt,
    } : undefined,
    timestamp: new Date(),
  });
};

export default {
  startPresenceUpdates,
  stopPresenceUpdates,
  handlePresenceUpdate,
};
