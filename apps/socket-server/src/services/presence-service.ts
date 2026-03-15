import type { SocketUser } from "../types/index";

class PresenceService {
  private onlineUsers: Map<string, SocketUser> = new Map();

  addUser(user: SocketUser): void {
    this.onlineUsers.set(user.userId, user);
  }

  removeUser(userId: string): SocketUser | null {
    const user = this.onlineUsers.get(userId);
    if (user) {
      this.onlineUsers.delete(userId);
      return user;
    }
    return null;
  }

  getUser(userId: string): SocketUser | null {
    return this.onlineUsers.get(userId) || null;
  }

  getUsers(): SocketUser[] {
    return Array.from(this.onlineUsers.values());
  }

  getOnlineCount(): number {
    return this.onlineUsers.size;
  }

  isOnline(userId: string): boolean {
    return this.onlineUsers.has(userId);
  }

  getUserStatus(userId: string): {
    isOnline: boolean;
    user?: SocketUser;
    lastSeen?: Date;
  } {
    const user = this.onlineUsers.get(userId);
    if (user) {
      return { isOnline: true, user };
    }
    return { isOnline: false };
  }

  clear(): void {
    this.onlineUsers.clear();
  }
}

export const presenceService = new PresenceService();
export default presenceService;
