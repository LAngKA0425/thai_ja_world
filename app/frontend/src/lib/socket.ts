"use client";

import { io, type Socket } from "socket.io-client";

export interface PlazaUser {
  userId: string;
  nickname: string;
  avatarId?: string;
  position: { x: number; y: number };
}

export interface PlazaChatMessage {
  id: string;
  userId: string;
  nickname: string;
  message: string;
  timestamp: string;
}

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

export function createPlazaSocket(token: string): Socket {
  return io(SOCKET_URL, {
    transports: ["websocket", "polling"],
    auth: { token },
  });
}
