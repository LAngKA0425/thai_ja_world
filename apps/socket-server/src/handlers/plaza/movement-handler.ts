import type { Socket, Server } from "socket.io";
import { getSocketUser } from "../../types/index";
import plazaService from "../../services/plaza-service";
import { PLAZA_ROOM_NAME } from "../../rooms/plaza-room";
import SOCKET_EVENTS from "../../events/index";
import {
  PLAZA_BOUNDARIES,
  PLAZA_MOVEMENT,
} from "@taeja/shared";

export const handlePlazaMove = (
  socket: Socket,
  io: Server,
  data: any
): void => {
  const user = getSocketUser(socket);

  if (
    !data.position ||
    typeof data.position.x !== "number" ||
    typeof data.position.y !== "number"
  ) {
    socket.emit(SOCKET_EVENTS.ERROR, {
      message: "Invalid position data",
      code: "INVALID_POSITION",
    });
    return;
  }

  if (
    data.position.x < PLAZA_BOUNDARIES.minX ||
    data.position.x > PLAZA_BOUNDARIES.maxX ||
    data.position.y < PLAZA_BOUNDARIES.minY ||
    data.position.y > PLAZA_BOUNDARIES.maxY
  ) {
    socket.emit(SOCKET_EVENTS.ERROR, {
      message: "Position out of plaza boundaries",
      code: "OUT_OF_BOUNDS",
    });
    return;
  }

  const updatedUser = plazaService.moveUser(
    user.userId,
    data.position,
    data.direction,
    data.velocity
  );

  if (updatedUser) {
    io.to(PLAZA_ROOM_NAME).emit(SOCKET_EVENTS.PLAZA_MOVE, {
      userId: user.userId,
      nickname: user.nickname,
      position: updatedUser.position,
      direction: updatedUser.direction || "none",
      velocity: updatedUser.velocity || { vx: 0, vy: 0 },
    });
  }
};

export default handlePlazaMove;
