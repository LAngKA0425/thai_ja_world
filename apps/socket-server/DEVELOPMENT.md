# Socket Server Development Guide

## Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

### Running the Server

#### Development Mode (with hot reload)
```bash
npm run dev
```

#### Build for Production
```bash
npm run build
```

#### Start Production Server
```bash
npm run start
```

## Environment Setup

Create a `.env` file in the root directory:

```env
PORT=3001
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=dev-secret-key-change-in-production
NODE_ENV=development
```

**Important**: In production, change `JWT_SECRET` to a secure, random string.

## Socket Event Flow

### 1. Connection & Authentication

Client connects with JWT token:
```javascript
const socket = io('http://localhost:3001', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

Token payload should include:
```json
{
  "userId": "user123",
  "nickname": "사용자이름"
}
```

### 2. Plaza Join Flow

```javascript
// Client emits
socket.emit('plaza:join', {
  avatarId: 'avatar-001',
  position: { x: 500, y: 400 }
});

// Server responds
socket.on('plaza:user_list', (data) => {
  // { users: [...], totalUsers: 5, maxUsers: 100 }
});

// Other users receive
socket.on('plaza:join', (data) => {
  // { userId, nickname, position, totalUsers }
});
```

### 3. Plaza Chat

```javascript
// Client sends message
socket.emit('plaza:chat', {
  message: '안녕하세요!'
});

// All users in plaza receive
socket.on('plaza:chat', (data) => {
  // { id, userId, nickname, message, timestamp }
});
```

### 4. Plaza Movement

```javascript
// Client moves
socket.emit('plaza:move', {
  position: { x: 520, y: 410 },
  direction: 'right',
  velocity: { vx: 5, vy: 0 }
});

// All users receive movement update
socket.on('plaza:move', (data) => {
  // { userId, nickname, position, direction, velocity }
});
```

### 5. Broadcast (Announcement)

```javascript
// Client sends broadcast
socket.emit('broadcast:send', {
  message: '안녕하세요!',
  type: 'NORMAL' // or 'PREMIUM'
});

// All connected users receive
socket.on('broadcast:receive', (data) => {
  // { id, userId, nickname, message, type, sentAt, expiresAt, timeRemainingMs }
});
```

### 6. Presence Tracking

```javascript
// Server emits every 10 seconds
socket.on('presence:online_count', (data) => {
  // { onlineCount, timestamp }
});

// Client can update presence
socket.emit('presence:update');
```

### 7. Disconnect

```javascript
// Client disconnects
socket.disconnect();

// Server removes from plaza
// Other users receive plaza:leave event
socket.on('plaza:leave', (data) => {
  // { userId, nickname, totalUsers }
});
```

## Service Architecture

### PlazaService
Manages plaza state in-memory:
- User positions and avatars
- Movement validation
- Plaza boundaries enforcement

```typescript
plazaService.addUser(user): boolean
plazaService.removeUser(userId): PlazaUserState | null
plazaService.moveUser(userId, position, direction, velocity): PlazaUserState | null
plazaService.getUsers(): PlazaUserState[]
plazaService.getUserCount(): number
```

### BroadcastService
Manages broadcasts with expiration:
- Cooldown tracking per user
- Message validation
- Automatic expiration after duration

```typescript
broadcastService.addBroadcast(userId, nickname, message, type): Broadcast | null
broadcastService.getBroadcasts(): Broadcast[]
broadcastService.checkCooldown(userId): { canBroadcast: boolean, ... }
broadcastService.setCooldown(userId, cooldownMs): void
```

### PresenceService
Tracks online users:
- User status
- Online count
- Connection metadata

```typescript
presenceService.addUser(user): void
presenceService.removeUser(userId): SocketUser | null
presenceService.getOnlineCount(): number
presenceService.getUserStatus(userId): { isOnline: boolean, user?: SocketUser }
```

## Error Handling

All errors are emitted via the `error` event:

```javascript
socket.on('error', (error) => {
  // { message, code, cooldownMs?, nextAvailableAt? }
});
```

Error codes:
- `INVALID_POSITION` — Position data invalid
- `OUT_OF_BOUNDS` — Position outside plaza boundaries
- `BROADCAST_COOLDOWN` — User on cooldown
- `MESSAGE_TOO_LONG` — Message exceeds limit
- `INVALID_TYPE` — Invalid broadcast type
- `PLAZA_FULL` — Plaza at max capacity

## Broadcast Types

### NORMAL
- Max length: 50 characters
- Duration: 2 minutes
- Cooldown: 60 seconds

### PREMIUM
- Max length: 100 characters
- Duration: 5 minutes
- Cooldown: 30 seconds

## Plaza Constraints

- **Max Users**: 100
- **Width**: 1000px
- **Height**: 800px
- **Chat Message Limit**: 200 characters
- **Presence Update Interval**: 10 seconds

## Debugging

### Enable Detailed Logging

Modify `src/index.ts` to add more logging:

```typescript
io.on('connection', (socket) => {
  console.log(`[Connected] ${socket.id}`);

  socket.onAny((eventName, ...args) => {
    console.log(`[Event] ${eventName}`, args);
  });
});
```

### Monitor Active Users

```bash
# In development
curl http://localhost:3001/debug/users 2>/dev/null | jq
```

## Testing

### Manual Testing with Socket.io Client

```javascript
const io = require('socket.io-client');
const jwt = require('jsonwebtoken');

// Generate test token
const token = jwt.sign(
  { userId: 'test-user', nickname: '테스트' },
  'dev-secret-key-change-in-production'
);

const socket = io('http://localhost:3001', {
  auth: { token }
});

socket.on('connect', () => {
  console.log('Connected!');

  // Join plaza
  socket.emit('plaza:join', {
    avatarId: 'avatar-001',
    position: { x: 500, y: 400 }
  });
});

socket.on('plaza:user_list', (data) => {
  console.log('Users in plaza:', data);
});
```

## Production Checklist

- [ ] Change `JWT_SECRET` to a secure value
- [ ] Set `NODE_ENV=production`
- [ ] Configure `CORS_ORIGIN` for your domain
- [ ] Set appropriate `PORT`
- [ ] Enable HTTPS/WSS in production
- [ ] Set up monitoring and logging
- [ ] Configure rate limiting
- [ ] Set up backups for persistent storage if needed
- [ ] Test failover and reconnection behavior

## Common Issues

### "Authentication token not provided"
- Ensure client is sending token in `auth` option
- Check token is valid JWT format

### "Position out of plaza boundaries"
- Validate coordinates are within 0-1000 (x) and 0-800 (y)

### "Broadcast cooldown"
- Wait for cooldown period before sending next broadcast
- NORMAL: 60 seconds
- PREMIUM: 30 seconds

### Connection drops
- Socket.io automatically handles reconnection
- Ensure proper error handlers are in place

## Performance Considerations

- Plaza is limited to 100 users to prevent performance degradation
- Broadcasts are limited to 10 concurrent messages
- Chat history is maintained in-memory with rotation
- Consider implementing Redis for distributed deployment

## Architecture Notes

The socket server uses an in-memory architecture ideal for:
- Single-server deployments
- Development and testing
- Small to medium user bases (<1000 concurrent users)

For scaling to larger deployments, consider:
- Using Socket.io with Redis adapter for horizontal scaling
- Implementing persistent storage for broadcasts and chat
- Load balancing across multiple socket server instances
- Separate authentication and authorization services
