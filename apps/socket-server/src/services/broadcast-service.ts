import { randomUUID } from "crypto";
import type { Broadcast, UserCooldown } from "../types/index";
import { BROADCAST_CONFIG, BROADCAST_TYPES } from "@taeja/shared";

class BroadcastService {
  private broadcasts: Map<string, Broadcast> = new Map();
  private userCooldowns: Map<string, UserCooldown> = new Map();
  private broadcastList: Broadcast[] = [];

  addBroadcast(
    userId: string,
    nickname: string,
    message: string,
    type: "NORMAL" | "PREMIUM"
  ): Broadcast | null {
    const broadcastType =
      type === "PREMIUM" ? BROADCAST_TYPES.PREMIUM : BROADCAST_TYPES.NORMAL;

    if (message.length > broadcastType.maxLength) {
      return null;
    }

    const id = randomUUID();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + broadcastType.durationMs);

    const broadcast: Broadcast = {
      id,
      userId,
      nickname,
      message,
      type,
      sentAt: now,
      expiresAt,
      timeoutId: setTimeout(() => {
        this.broadcasts.delete(id);
        const index = this.broadcastList.findIndex((b) => b.id === id);
        if (index > -1) {
          this.broadcastList.splice(index, 1);
        }
      }, broadcastType.durationMs),
    };

    this.broadcasts.set(id, broadcast);
    this.broadcastList.push(broadcast);

    if (this.broadcastList.length > BROADCAST_CONFIG.maxConcurrentBroadcasts) {
      const oldest = this.broadcastList.shift();
      if (oldest) {
        clearTimeout(oldest.timeoutId);
        this.broadcasts.delete(oldest.id);
      }
    }

    return broadcast;
  }

  getBroadcasts(): Broadcast[] {
    return this.broadcastList.map((b) => ({
      ...b,
      timeRemainingMs: Math.max(0, b.expiresAt.getTime() - Date.now()),
    }));
  }

  getBroadcast(id: string): Broadcast | null {
    return this.broadcasts.get(id) || null;
  }

  checkCooldown(userId: string): {
    canBroadcast: boolean;
    cooldownMs?: number;
    nextAvailableAt?: Date;
  } {
    const cooldown = this.userCooldowns.get(userId);

    if (!cooldown) {
      return { canBroadcast: true };
    }

    const now = Date.now();
    const lastTime = cooldown.lastBroadcastTime.getTime();
    const elapsedTime = now - lastTime;

    if (elapsedTime >= cooldown.cooldownMs) {
      this.userCooldowns.delete(userId);
      return { canBroadcast: true };
    }

    const remainingCooldown = cooldown.cooldownMs - elapsedTime;
    const nextAvailableAt = new Date(now + remainingCooldown);

    return {
      canBroadcast: false,
      cooldownMs: remainingCooldown,
      nextAvailableAt,
    };
  }

  setCooldown(userId: string, cooldownMs: number): void {
    this.userCooldowns.set(userId, {
      userId,
      lastBroadcastTime: new Date(),
      cooldownMs,
    });

    setTimeout(() => {
      this.userCooldowns.delete(userId);
    }, cooldownMs);
  }

  clear(): void {
    this.broadcasts.forEach((b) => clearTimeout(b.timeoutId));
    this.broadcasts.clear();
    this.userCooldowns.clear();
    this.broadcastList = [];
  }
}

export const broadcastService = new BroadcastService();
export default broadcastService;
