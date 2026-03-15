/**
 * Example Socket.io Client for Taeja World Socket Server
 *
 * This demonstrates how to connect and interact with the socket server
 * in a real application.
 */

import { io, Socket } from 'socket.io-client';
import jwt from 'jsonwebtoken';

// Generate a test JWT token
const generateTestToken = (userId: string, nickname: string): string => {
  return jwt.sign(
    { userId, nickname },
    'dev-secret-key-change-in-production'
  );
};

interface User {
  userId: string;
  nickname: string;
  position: { x: number; y: number };
  avatarId: string;
}

class TaejaPlazaClient {
  private socket: Socket | null = null;
  private currentUser: User | null = null;
  private plazaUsers: Map<string, User> = new Map();

  /**
   * Connect to the socket server
   */
  connect(userId: string, nickname: string, serverUrl: string = 'http://localhost:3001'): Promise<void> {
    return new Promise((resolve, reject) => {
      const token = generateTestToken(userId, nickname);

      this.socket = io(serverUrl, {
        auth: { token },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      this.setupEventListeners();

      this.socket.on('connect', () => {
        console.log('[Client] Connected to socket server');
        this.currentUser = { userId, nickname, position: { x: 500, y: 400 }, avatarId: 'default' };
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('[Client] Connection error:', error);
        reject(error);
      });
    });
  }

  /**
   * Join the plaza
   */
  joinPlaza(avatarId: string = 'avatar-001', position?: { x: number; y: number }): void {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit('plaza:join', {
      avatarId,
      position: position || { x: Math.random() * 1000, y: Math.random() * 800 },
    });

    console.log('[Client] Joining plaza...');
  }

  /**
   * Leave the plaza
   */
  leavePlaza(): void {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit('plaza:leave');
    console.log('[Client] Leaving plaza...');
  }

  /**
   * Move in the plaza
   */
  moveInPlaza(position: { x: number; y: number }, direction: 'up' | 'down' | 'left' | 'right' | 'none' = 'none'): void {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit('plaza:move', {
      position,
      direction,
      velocity: { vx: 0, vy: 0 },
    });
  }

  /**
   * Send a chat message in the plaza
   */
  sendChat(message: string): void {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit('plaza:chat', { message });
    console.log(`[Client] Sent: ${message}`);
  }

  /**
   * Send a broadcast announcement
   */
  sendBroadcast(message: string, type: 'NORMAL' | 'PREMIUM' = 'NORMAL'): void {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit('broadcast:send', { message, type });
    console.log(`[Client] Broadcasting (${type}): ${message}`);
  }

  /**
   * Get list of users in plaza
   */
  getPlazaUsers(): User[] {
    return Array.from(this.plazaUsers.values());
  }

  /**
   * Set up all event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    // Plaza events
    this.socket.on('plaza:user_list', (data) => {
      console.log('[Event] plaza:user_list', {
        totalUsers: data.totalUsers,
        maxUsers: data.maxUsers,
        users: data.users.length,
      });

      data.users.forEach((user: any) => {
        this.plazaUsers.set(user.userId, {
          userId: user.userId,
          nickname: user.nickname,
          position: user.position,
          avatarId: user.avatarId,
        });
      });
    });

    this.socket.on('plaza:join', (data) => {
      console.log(`[Event] plaza:join - ${data.nickname} joined`, {
        position: data.position,
        totalUsers: data.totalUsers,
      });

      this.plazaUsers.set(data.userId, {
        userId: data.userId,
        nickname: data.nickname,
        position: data.position,
        avatarId: data.avatarId,
      });
    });

    this.socket.on('plaza:leave', (data) => {
      console.log(`[Event] plaza:leave - ${data.nickname} left`, {
        totalUsers: data.totalUsers,
      });

      this.plazaUsers.delete(data.userId);
    });

    this.socket.on('plaza:move', (data) => {
      console.log(`[Event] plaza:move - ${data.nickname} moved`, {
        position: data.position,
        direction: data.direction,
      });

      const user = this.plazaUsers.get(data.userId);
      if (user) {
        user.position = data.position;
      }
    });

    this.socket.on('plaza:chat', (data) => {
      console.log(`[Chat] ${data.nickname}: ${data.message}`);
    });

    this.socket.on('plaza:system_message', (data) => {
      console.log(`[System] ${data.message}`);
    });

    // Broadcast events
    this.socket.on('broadcast:receive', (data) => {
      if (data.success) {
        console.log('[Event] Broadcast sent successfully', { broadcastId: data.broadcastId });
      } else {
        const timeRemaining = Math.ceil(data.timeRemainingMs / 1000);
        console.log(`[Event] broadcast:receive`, {
          nickname: data.nickname,
          message: data.message,
          type: data.type,
          expiresIn: `${timeRemaining}s`,
        });
      }
    });

    // Presence events
    this.socket.on('presence:online_count', (data) => {
      console.log('[Event] presence:online_count', {
        onlineCount: data.onlineCount,
      });
    });

    this.socket.on('presence:user_status', (data) => {
      console.log('[Event] presence:user_status', {
        nickname: data.user?.nickname,
        isOnline: data.isOnline,
      });
    });

    // Error events
    this.socket.on('error', (error) => {
      console.error('[Error]', {
        message: error.message,
        code: error.code,
        cooldownMs: error.cooldownMs,
      });
    });

    // Connection events
    this.socket.on('disconnect', (reason) => {
      console.log('[Client] Disconnected:', reason);
    });

    this.socket.on('reconnect', () => {
      console.log('[Client] Reconnected');
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      console.log('[Client] Disconnected from socket server');
    }
  }
}

/**
 * Example usage
 */
async function main() {
  const client = new TaejaPlazaClient();

  try {
    // Connect to server
    await client.connect('user-123', '태자사용자');
    console.log('✓ Connected to socket server\n');

    // Join plaza
    client.joinPlaza('avatar-001', { x: 500, y: 400 });
    console.log('✓ Joining plaza...\n');

    // Wait for join to complete
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Send some messages
    client.sendChat('안녕하세요!');
    await new Promise(resolve => setTimeout(resolve, 500));

    client.sendChat('태자월드에 오신 것을 환영합니다!');
    await new Promise(resolve => setTimeout(resolve, 500));

    // Move around
    client.moveInPlaza({ x: 550, y: 420 }, 'right');
    await new Promise(resolve => setTimeout(resolve, 500));

    // Send a broadcast
    client.sendBroadcast('모두에게 인사합니다!', 'NORMAL');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // List current users
    console.log('\n✓ Users in plaza:');
    client.getPlazaUsers().forEach(user => {
      console.log(`  - ${user.nickname} at (${user.position.x}, ${user.position.y})`);
    });

    // Keep connection alive for 5 seconds
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Leave plaza
    client.leavePlaza();
    console.log('\n✓ Leaving plaza...');

    // Close connection
    await new Promise(resolve => setTimeout(resolve, 1000));
    client.disconnect();
  } catch (error) {
    console.error('Connection failed:', error);
    process.exit(1);
  }
}

// Export for use in other modules
export { TaejaPlazaClient, generateTestToken };

// Run example if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}
