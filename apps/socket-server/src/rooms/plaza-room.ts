import type { Socket } from "socket.io";

export const PLAZA_ROOM_NAME = "taeja-central-plaza";

export const joinPlazaRoom = (socket: Socket): void => {
  socket.join(PLAZA_ROOM_NAME);
};

export const leavePlazaRoom = (socket: Socket): void => {
  socket.leave(PLAZA_ROOM_NAME);
};

export const getPlazaRoomName = (): string => {
  return PLAZA_ROOM_NAME;
};

export default {
  PLAZA_ROOM_NAME,
  joinPlazaRoom,
  leavePlazaRoom,
  getPlazaRoomName,
};
