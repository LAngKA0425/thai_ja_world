import type { Socket, Server } from "socket.io";
import { getSocketUser } from "../../types/index";
import type { ValidatedAuthPayload } from "../../types/index";
import plazaService from "../../services/plaza-service";
import presenceService from "../../services/presence-service";
import { leavePlazaRoom, PLAZA_ROOM_NAME } from "../../rooms/plaza-room";
import sendSystemMessage from "../chat/system-message-handler";
import SOCKET_EVENTS from "../../events/index";

export const handlePlazaLeave = (
  socket: Socket,
  io: Server
): void => {
  const user = getSocketUser(socket);

  const removedUser = plazaService.removeUser(user.userId);
  presenceService.removeUser(user.userId);

  leavePlazaRoom(socket);

  if (removedUser) {
    io.to(PLAZA_ROOM_NAME).emit(SOCKET_EVENTS.PLAZA_LEAVE, {
      userId: user.userId,
      nickname: user.nickname,
      totalUsers: plazaService.getUserCount(),
    });

    sendSystemMessage(io, `${user.nickname}님이 퇴장했습니다`);
  }
};

export const handleDisconnect = (socket: Socket, io: Server): void => {
  const user = (socket as any).user as ValidatedAuthPayload | undefined;

  if (user) {
    const removedUser = plazaService.removeUser(user.userId);
    presenceService.removeUser(user.userId);

    if (removedUser) {
      io.to(PLAZA_ROOM_NAME).emit(SOCKET_EVENTS.PLAZA_LEAVE, {
        userId: user.userId,
        nickname: user.nickname,
        totalUsers: plazaService.getUserCount(),
      });

      sendSystemMessage(io, `${user.nickname}님의 연결이 끊어졌습니다`);
    }
  }
};

export default {
  handlePlazaLeave,
  handleDisconnect,
};
