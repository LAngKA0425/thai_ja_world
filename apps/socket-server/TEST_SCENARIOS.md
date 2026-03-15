# Socket Server Test Scenarios

Complete testing guide for the Taeja World Socket.io server.

## Prerequisites

```bash
# Install dependencies
npm install

# Start the server
npm run dev
```

The server should start on `http://localhost:3001` with CORS enabled for `http://localhost:3000`.

## Test Scenario 1: Basic Connection & Authentication

### Objective
Verify socket connection with JWT authentication

### Steps
1. Create a test script with socket.io-client:

```javascript
const io = require('socket.io-client');
const jwt = require('jsonwebtoken');

const token = jwt.sign(
  { userId: 'test-user-1', nickname: '테스트1' },
  'dev-secret-key-change-in-production'
);

const socket = io('http://localhost:3001', {
  auth: { token }
});

socket.on('connect', () => {
  console.log('✓ Connected successfully');
  console.log('Socket ID:', socket.id);
  socket.disconnect();
});

socket.on('error', (error) => {
  console.error('✗ Connection failed:', error);
});
```

### Expected Results
- Socket connects successfully
- Socket ID is assigned
- User info is extracted from JWT

---

## Test Scenario 2: Plaza Join & User List

### Objective
Verify plaza join functionality and user list broadcast

### Steps

```javascript
const socket = io('http://localhost:3001', { auth: { token } });

socket.on('connect', () => {
  // Join plaza
  socket.emit('plaza:join', {
    avatarId: 'avatar-001',
    position: { x: 500, y: 400 }
  });
});

socket.on('plaza:user_list', (data) => {
  console.log('✓ Received user list');
  console.log('Total users:', data.totalUsers);
  console.log('Max users:', data.maxUsers);
  console.log('Users in list:', data.users.map(u => u.nickname));
});

socket.on('plaza:join', (data) => {
  console.log('✓ User joined event');
  console.log('User:', data.nickname);
  console.log('Position:', data.position);
  console.log('Total users:', data.totalUsers);
});
```

### Expected Results
- User successfully joins plaza
- Current user receives full user list
- Other connected users receive plaza:join event
- User count increases
- System message: "사용자님이 입장했습니다"

---

## Test Scenario 3: Multiple Users in Plaza

### Objective
Test multiple concurrent users and presence

### Steps

```javascript
const jwt = require('jsonwebtoken');
const io = require('socket.io-client');

async function createUser(userId, nickname) {
  const token = jwt.sign(
    { userId, nickname },
    'dev-secret-key-change-in-production'
  );

  return new Promise((resolve) => {
    const socket = io('http://localhost:3001', { auth: { token } });

    socket.on('connect', () => {
      socket.emit('plaza:join', {
        avatarId: `avatar-${userId}`,
        position: {
          x: Math.random() * 1000,
          y: Math.random() * 800
        }
      });
    });

    socket.on('plaza:user_list', (data) => {
      console.log(`✓ ${nickname} received user list: ${data.totalUsers} users`);
      resolve(socket);
    });

    socket.on('plaza:join', (data) => {
      console.log(`✓ ${nickname} sees ${data.nickname} joined (total: ${data.totalUsers})`);
    });
  });
}

// Create 5 users
(async () => {
  for (let i = 1; i <= 5; i++) {
    await createUser(`user-${i}`, `사용자${i}`);
    await new Promise(r => setTimeout(r, 500));
  }
})();
```

### Expected Results
- Multiple users connect and join plaza
- Each user receives updated user list
- Each user sees others joining
- Presence tracking shows all users online
- Total user count is accurate

---

## Test Scenario 4: Plaza Chat

### Objective
Test plaza chat messaging

### Steps

```javascript
let socket1, socket2;

// Create two connected users
socket1 = createUser('user-1', '사용자1').then((s) => {
  socket1 = s;

  socket1.on('plaza:chat', (data) => {
    console.log(`✓ Socket1 received: ${data.nickname}: ${data.message}`);
  });
});

socket2 = createUser('user-2', '사용자2').then((s) => {
  socket2 = s;

  socket2.on('plaza:chat', (data) => {
    console.log(`✓ Socket2 received: ${data.nickname}: ${data.message}`);
  });

  // Send message
  setTimeout(() => {
    socket2.emit('plaza:chat', { message: '안녕하세요!' });
  }, 1000);
});
```

### Expected Results
- Both users receive the chat message
- Message includes sender's nickname
- Message includes timestamp
- Message has unique ID
- Message appears in both clients

### Error Cases
- Empty message rejected
- Message too long (>200 chars) rejected
- Invalid message data rejected

---

## Test Scenario 5: Plaza Movement

### Objective
Test user movement tracking

### Steps

```javascript
socket.on('plaza:move', (data) => {
  console.log(`✓ ${data.nickname} moved to (${data.position.x}, ${data.position.y})`);
  console.log(`Direction: ${data.direction}`);
  console.log(`Velocity: ${data.velocity.vx}, ${data.velocity.vy}`);
});

// Emit movement
socket.emit('plaza:move', {
  position: { x: 550, y: 420 },
  direction: 'right',
  velocity: { vx: 5, vy: 0 }
});
```

### Expected Results
- Movement updates broadcast to all users
- Position is validated (within bounds)
- Direction and velocity are optional
- Out-of-bounds positions are rejected
- Invalid position data is rejected

### Error Cases
- Position: { x: -10, y: 400 } → OUT_OF_BOUNDS error
- Position: { x: 'invalid', y: 400 } → INVALID_POSITION error
- Missing position data → INVALID_POSITION error

---

## Test Scenario 6: Broadcast - Normal Type

### Objective
Test NORMAL broadcast with cooldown

### Steps

```javascript
const socket = io('http://localhost:3001', { auth: { token } });

socket.on('connect', () => {
  socket.emit('plaza:join', { avatarId: 'avatar-001' });

  // Wait a bit then send broadcast
  setTimeout(() => {
    socket.emit('broadcast:send', {
      message: '이것은 일반 확성기입니다',
      type: 'NORMAL'
    });
  }, 1000);
});

socket.on('broadcast:receive', (data) => {
  if (data.success) {
    console.log('✓ Broadcast sent successfully');
    console.log('Broadcast ID:', data.broadcastId);
    console.log('Expires at:', data.expiresAt);
  } else {
    console.log('✓ Received broadcast from other user');
    console.log(`${data.nickname}: ${data.message}`);
    console.log(`Expires in: ${Math.ceil(data.timeRemainingMs / 1000)}s`);
  }
});

socket.on('error', (error) => {
  if (error.code === 'BROADCAST_COOLDOWN') {
    console.log(`✗ On cooldown for ${error.cooldownMs}ms`);
    console.log(`Next available: ${error.nextAvailableAt}`);
  }
});
```

### Expected Results
- NORMAL broadcast sent successfully
- 50-character limit enforced
- 60-second cooldown applied
- 2-minute expiration set
- All connected users receive broadcast
- Broadcast auto-expires after 2 minutes

### Error Cases
- Message > 50 chars → MESSAGE_TOO_LONG error
- Broadcast within 60s → BROADCAST_COOLDOWN error
- Empty message → EMPTY_MESSAGE error

---

## Test Scenario 7: Broadcast - Premium Type

### Objective
Test PREMIUM broadcast with different limits

### Steps

```javascript
socket.emit('broadcast:send', {
  message: '이것은 프리미엄 확성기입니다. 100글자까지 허용됩니다.',
  type: 'PREMIUM'
});
```

### Expected Results
- PREMIUM broadcast sent
- 100-character limit enforced
- 30-second cooldown (shorter than NORMAL)
- 5-minute expiration (longer than NORMAL)
- Broadcast visible to all users
- Auto-expires after 5 minutes

---

## Test Scenario 8: Cooldown Enforcement

### Objective
Test broadcast cooldown system

### Steps

```javascript
// Send NORMAL broadcast
socket.emit('broadcast:send', {
  message: '첫 번째 확성기',
  type: 'NORMAL'
});

// Immediately try to send another (should fail)
setTimeout(() => {
  socket.emit('broadcast:send', {
    message: '두 번째 확성기',
    type: 'NORMAL'
  });
}, 100);

socket.on('error', (error) => {
  if (error.code === 'BROADCAST_COOLDOWN') {
    console.log('✓ Cooldown enforced');
    console.log(`Remaining cooldown: ${error.cooldownMs}ms`);
    console.log(`Next available: ${error.nextAvailableAt}`);
  }
});

// After 60 seconds, try again (should succeed)
setTimeout(() => {
  socket.emit('broadcast:send', {
    message: '60초 후 확성기',
    type: 'NORMAL'
  });
}, 60000);
```

### Expected Results
- First broadcast succeeds
- Second broadcast fails with BROADCAST_COOLDOWN
- Cooldown remaining is ~59-60 seconds
- After cooldown expires, new broadcast succeeds

---

## Test Scenario 9: Presence Tracking

### Objective
Test online user count and status

### Steps

```javascript
socket.on('presence:online_count', (data) => {
  console.log(`✓ Online count: ${data.onlineCount} users`);
  console.log(`Timestamp: ${data.timestamp}`);
});

socket.on('presence:user_status', (data) => {
  console.log(`✓ User status: ${data.user?.nickname}`);
  console.log(`Is online: ${data.isOnline}`);
});

// Emit presence update
socket.emit('presence:update');
```

### Expected Results
- Presence updates every 10 seconds
- Online count is accurate
- User status reflects connection state
- Presence:online_count is broadcast to all users

---

## Test Scenario 10: Disconnect & Leave

### Objective
Test proper cleanup on disconnect

### Steps

```javascript
// Open two connections
const socket1 = createUser('user-1', '사용자1');
const socket2 = createUser('user-2', '사용자2');

// Both join plaza
socket1.emit('plaza:join', { avatarId: 'avatar-1' });
socket2.emit('plaza:join', { avatarId: 'avatar-2' });

// Socket2 listens for leave events
socket2.on('plaza:leave', (data) => {
  console.log(`✓ ${data.nickname} left`);
  console.log(`Remaining users: ${data.totalUsers}`);
});

socket2.on('plaza:system_message', (data) => {
  console.log(`✓ System message: ${data.message}`);
});

// Disconnect socket1
setTimeout(() => {
  socket1.disconnect();
  console.log('Socket1 disconnected');
}, 2000);
```

### Expected Results
- Disconnecting user is removed from plaza
- Other users see plaza:leave event
- User count decreases
- System message: "사용자님의 연결이 끊어졌습니다"
- Services properly cleaned up

---

## Test Scenario 11: Plaza Capacity Limit

### Objective
Test maximum user limit

### Steps

```javascript
const sockets = [];

// Create 101 users (100 should succeed, 1 should fail)
for (let i = 0; i < 101; i++) {
  const token = jwt.sign(
    { userId: `user-${i}`, nickname: `사용자${i}` },
    'dev-secret-key-change-in-production'
  );

  const socket = io('http://localhost:3001', { auth: { token } });

  socket.on('connect', () => {
    socket.emit('plaza:join', { avatarId: `avatar-${i}` });
  });

  socket.on('error', (error) => {
    if (error.code === 'PLAZA_FULL') {
      console.log(`✓ User ${i} rejected: ${error.message}`);
    }
  });

  socket.on('plaza:user_list', () => {
    console.log(`✓ User ${i} joined plaza`);
  });

  sockets.push(socket);
}
```

### Expected Results
- First 100 users join successfully
- 101st user receives PLAZA_FULL error
- User count capped at 100
- No additional users can join until capacity decreases

---

## Test Scenario 12: Error Handling

### Objective
Test comprehensive error handling

### Steps

```javascript
socket.on('error', (error) => {
  console.log('Error Code:', error.code);
  console.log('Message:', error.message);
  if (error.cooldownMs) console.log('Cooldown:', error.cooldownMs);
});

// Test various errors
socket.emit('plaza:move', {
  position: { x: -100, y: 400 } // OUT_OF_BOUNDS
});

socket.emit('plaza:move', {
  position: { x: 'invalid', y: 400 } // INVALID_POSITION
});

socket.emit('plaza:chat', {
  message: '' // EMPTY_MESSAGE
});

socket.emit('plaza:chat', {
  message: 'x'.repeat(201) // MESSAGE_TOO_LONG
});

socket.emit('broadcast:send', {
  message: 'test',
  type: 'INVALID_TYPE' // INVALID_TYPE
});
```

### Expected Results
- All errors include proper error codes
- Error messages are descriptive
- Cooldown errors include remaining time
- Invalid operations are rejected gracefully
- No server crashes
- User can continue operating after errors

---

## Stress Testing

### Load Test: 100 Concurrent Users

```javascript
async function stressTest() {
  const sockets = [];

  console.time('Load test');

  for (let i = 0; i < 100; i++) {
    const token = jwt.sign(
      { userId: `stress-user-${i}`, nickname: `ストレス${i}` },
      'dev-secret-key-change-in-production'
    );

    const socket = io('http://localhost:3001', {
      auth: { token },
      reconnection: false
    });

    socket.on('connect', () => {
      socket.emit('plaza:join', {
        avatarId: `avatar-${i % 10}`,
        position: {
          x: Math.random() * 1000,
          y: Math.random() * 800
        }
      });

      // Simulate random activity
      setInterval(() => {
        socket.emit('plaza:move', {
          position: {
            x: Math.random() * 1000,
            y: Math.random() * 800
          }
        });
      }, Math.random() * 5000 + 1000);

      if (Math.random() > 0.9) {
        setInterval(() => {
          socket.emit('plaza:chat', {
            message: `Message from user ${i}`
          });
        }, Math.random() * 10000 + 5000);
      }
    });

    sockets.push(socket);
  }

  console.timeEnd('Load test');

  // Monitor for 30 seconds
  setTimeout(() => {
    sockets.forEach(s => s.disconnect());
    console.log('✓ Stress test completed');
  }, 30000);
}

stressTest();
```

### Expected Results
- Server handles 100 concurrent users
- No memory leaks
- Events deliver reliably
- Movement updates smooth
- Chat messages broadcast correctly
- Server remains stable

---

## Monitoring & Debugging

### Check Server Logs

```bash
# Terminal 1: Start server
npm run dev

# Terminal 2: Connect client and watch logs
# Should see:
# [Socket Connected] User: 사용자 (user-1) | Socket ID: abc123xyz
# [Plaza Join] 사용자 joined plaza
# [Plaza Chat] 사용자: 메시지 내용
# [Socket Disconnected] User: 사용자 (user-1) | Socket ID: abc123xyz
```

### Connection Issues

```javascript
socket.on('connect_error', (error) => {
  console.error('Connection error:', error.message);
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
});

socket.on('reconnect', () => {
  console.log('Reconnected');
});
```

---

## Cleanup

After testing, verify cleanup:

```bash
# Kill all node processes
pkill -f "node"

# Check server log for proper shutdown message
# Should see: "Server closed"
```

## Summary Checklist

- [ ] Connection and authentication working
- [ ] Plaza join/leave functionality
- [ ] Multiple users in plaza
- [ ] Chat messaging
- [ ] Movement tracking
- [ ] NORMAL broadcast with cooldown
- [ ] PREMIUM broadcast with cooldown
- [ ] Presence tracking
- [ ] Disconnect handling
- [ ] Capacity limits
- [ ] Error handling
- [ ] Stress testing passed
- [ ] Memory usage stable
- [ ] Event delivery reliable
