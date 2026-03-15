import type { PlazaUserState } from "../types/index";
import {
  PLAZA_BOUNDARIES,
  PLAZA_CONFIG,
} from "@taeja/shared";

class PlazaService {
  private users: Map<string, PlazaUserState> = new Map();
  private userIdToSocketId: Map<string, string> = new Map();

  addUser(user: PlazaUserState): boolean {
    if (this.users.size >= PLAZA_CONFIG.maxUsers) {
      return false;
    }

    if (this.users.has(user.userId)) {
      return false;
    }

    const defaultPosition = {
      x: user.position?.x ?? Math.random() * PLAZA_BOUNDARIES.maxX,
      y: user.position?.y ?? Math.random() * PLAZA_BOUNDARIES.maxY,
    };

    const validatedUser: PlazaUserState = {
      ...user,
      position: this.validatePosition(defaultPosition),
    };

    this.users.set(user.userId, validatedUser);
    this.userIdToSocketId.set(user.userId, user.userId);

    return true;
  }

  removeUser(userId: string): PlazaUserState | null {
    const user = this.users.get(userId);
    if (user) {
      this.users.delete(userId);
      this.userIdToSocketId.delete(userId);
      return user;
    }
    return null;
  }

  moveUser(
    userId: string,
    position: { x: number; y: number },
    direction?: string,
    velocity?: { vx: number; vy: number }
  ): PlazaUserState | null {
    const user = this.users.get(userId);
    if (!user) {
      return null;
    }

    const validatedPosition = this.validatePosition(position);
    user.position = validatedPosition;
    if (direction) {
      user.direction = direction as
        | "up"
        | "down"
        | "left"
        | "right"
        | "none";
    }
    if (velocity) {
      user.velocity = velocity;
    }

    this.users.set(userId, user);
    return user;
  }

  getUser(userId: string): PlazaUserState | null {
    return this.users.get(userId) || null;
  }

  getUsers(): PlazaUserState[] {
    return Array.from(this.users.values());
  }

  getUserCount(): number {
    return this.users.size;
  }

  isUserInPlaza(userId: string): boolean {
    return this.users.has(userId);
  }

  private validatePosition(position: {
    x: number;
    y: number;
  }): { x: number; y: number } {
    return {
      x: Math.max(
        PLAZA_BOUNDARIES.minX,
        Math.min(PLAZA_BOUNDARIES.maxX, position.x)
      ),
      y: Math.max(
        PLAZA_BOUNDARIES.minY,
        Math.min(PLAZA_BOUNDARIES.maxY, position.y)
      ),
    };
  }

  clear(): void {
    this.users.clear();
    this.userIdToSocketId.clear();
  }
}

export const plazaService = new PlazaService();
export default plazaService;
