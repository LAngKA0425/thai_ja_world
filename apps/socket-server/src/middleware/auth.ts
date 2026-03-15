import { verify } from "jsonwebtoken";
import type { Socket } from "socket.io";
import type { AuthPayload, ValidatedAuthPayload } from "../types/index";
import { config } from "../config";

export const authMiddleware = (socket: Socket, next: (err?: Error) => void) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Authentication token not provided"));
    }

    const decoded = verify(token, config.JWT_SECRET) as AuthPayload;

    const tokenType = decoded.type;
    if (tokenType && tokenType !== "access") {
      return next(new Error("Access token is required"));
    }

    const resolvedUserId = decoded.userId || decoded.sub;
    if (!resolvedUserId) {
      return next(new Error("Invalid token payload"));
    }

    const validated: ValidatedAuthPayload = {
      userId: resolvedUserId,
      nickname: decoded.nickname || `user-${resolvedUserId.slice(0, 8)}`,
      avatarId: decoded.avatarId || "default",
      sub: decoded.sub,
      type: decoded.type,
      iat: decoded.iat,
      exp: decoded.exp,
    };

    (socket as any).user = validated;

    next();
  } catch (error) {
    if (error instanceof Error) {
      return next(new Error(`Authentication failed: ${error.message}`));
    }
    return next(new Error("Authentication failed"));
  }
};

export default authMiddleware;
