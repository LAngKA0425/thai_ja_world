import type { Socket, Server } from "socket.io";
import type { PlazaUserState } from "../../types/index";
import { getSocketUser } from "../../types/index";
import plazaService from "../../services/plaza-service";
import presenceService from "../../services/presence-service";
import { joinPlazaRoom, PLAZA_ROOM_NAME } from "../../rooms/plaza-room";
import sendSystemMessage from "../chat/system-message-handler";
import SOCKET_EVENTS from "../../events/index";
import { PLAZA_CONFIG } from "@taeja/shared";

export const handlePlazaJoin = (
  socket: Socket,
  io: Server,
  data: any
): void => {
  const user = getSocketUser(socket);

  const newUser: PlazaUserState = {
    userId: user.userId,
    nickname: user.nickname,
    avatarId: data.avatarId || user.avatarId || "default",
    position: data.position || { x: 500, y: 400 },
    direction: "none",
    velocity: { vx: 0, vy: 0 },
    joinedAt: new Date(),
  };

  const added = plazaService.addUser(newUser);

  if (!added) {
    socket.emit(SOCKET_EVENTS.ERROR, {
      message: "Plaza is full or user already joined",
      code: "PLAZA_FULL",
    });
    return;
  }

  presenceService.addUser({
    userId: user.userId,
    nickname: user.nickname,
    socketId: socket.id,
    avatarId: data.avatarId || user.avatarId || "default",
    connectedAt: new Date(),
  });

  joinPlazaRoom(socket);

  const currentUsers = plazaService.getUsers();

  socket.emit(SOCKET_EVENTS.PLAZA_USER_LIST, {
    users: currentUsers.map((u) => ({
      userId: u.userId,
      nickname: u.nickname,
      position: u.position,
      avatarId: u.avatarId,
      joinedAt: u.joinedAt,
    })),
    totalUsers: currentUsers.length,
    maxUsers: PLAZA_CONFIG.maxUsers,
  });

  io.to(PLAZA_ROOM_NAME).emit(SOCKET_EVENTS.PLAZA_JOIN, {
    userId: user.userId,
    nickname: user.nickname,
    avatarId: data.avatarId || user.avatarId || "default",
    position: newUser.position,
    totalUsers: currentUsers.length + 1,
  });

  sendSystemMessage(io, `${user.nickname}님이 입장했습니다`);
};

export default handlePlazaJoin;
