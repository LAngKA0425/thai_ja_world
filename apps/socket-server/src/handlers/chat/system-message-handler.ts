import { Server } from "socket.io";
import { PLAZA_ROOM_NAME } from "../../rooms/plaza-room";
import SOCKET_EVENTS from "../../events/index";

export const sendSystemMessage = (
  io: Server,
  message: string
): void => {
  io.to(PLAZA_ROOM_NAME).emit(SOCKET_EVENTS.PLAZA_SYSTEM_MESSAGE, {
    message,
    timestamp: new Date(),
    type: "system",
  });
};

export default sendSystemMessage;
