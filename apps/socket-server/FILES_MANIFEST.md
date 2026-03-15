# Socket Server - Complete Files Manifest

## Overview
Complete Socket.io real-time server implementation for Taeja World (태자월드).
Total: 24 files with 618+ lines of TypeScript code.

## Directory Structure

```
apps/socket-server/
├── Configuration Files
│   ├── package.json                   # Project dependencies and scripts
│   ├── tsconfig.json                  # TypeScript compiler options
│   ├── .env.example                   # Environment variables template
│   └── .gitignore                     # Git ignore rules
│
├── Documentation
│   ├── README.md                      # Project overview and usage
│   ├── DEVELOPMENT.md                 # Development guide with examples
│   ├── DEPLOYMENT.md                  # Production deployment guide
│   ├── TEST_SCENARIOS.md              # Complete testing guide
│   ├── IMPLEMENTATION_SUMMARY.md      # Implementation details
│   └── FILES_MANIFEST.md             # This file
│
├── Example
│   └── example-client.ts              # Example client implementation
│
└── Source Code (src/)
    ├── index.ts                       # Main server entry point
    ├── config.ts                      # Configuration loader
    │
    ├── types/
    │   └── index.ts                   # TypeScript type definitions
    │
    ├── middleware/
    │   └── auth.ts                    # JWT authentication middleware
    │
    ├── services/
    │   ├── plaza-service.ts           # Plaza user & position management
    │   ├── broadcast-service.ts       # Broadcast message management
    │   └── presence-service.ts        # Online user tracking
    │
    ├── events/
    │   └── index.ts                   # Socket event constants
    │
    ├── rooms/
    │   └── plaza-room.ts              # Plaza room utilities
    │
    └── handlers/
        ├── plaza/
        │   ├── join-handler.ts        # Plaza join event
        │   ├── leave-handler.ts       # Plaza leave & disconnect events
        │   └── movement-handler.ts    # Plaza movement event
        │
        ├── chat/
        │   ├── chat-handler.ts        # Plaza chat messaging
        │   └── system-message-handler.ts  # System message utility
        │
        ├── broadcast/
        │   └── broadcast-handler.ts   # Broadcast announcement events
        │
        └── presence/
            └── presence-handler.ts    # Presence tracking events
```

## File Descriptions

### Core Files

#### `/package.json` (34 lines)
**Purpose**: Project configuration and dependencies

**Key Dependencies**:
- socket.io: 4.7.0 - Real-time communication
- cors: 2.8.5 - CORS middleware
- dotenv: 16.4.0 - Environment variable loading
- jsonwebtoken: 9.0.0 - JWT authentication
- @taeja/shared: * - Shared types and constants

**Scripts**:
- `dev`: Run development server with hot reload
- `build`: Compile TypeScript to JavaScript
- `start`: Run production server

#### `/tsconfig.json` (20 lines)
**Purpose**: TypeScript compiler configuration

**Key Settings**:
- Target: ES2020
- Module: commonjs
- Strict mode enabled
- ESM interop enabled
- Source maps enabled

#### `/.env.example` (4 lines)
**Purpose**: Template for environment variables

**Variables**:
- PORT: Server port (default: 3001)
- CORS_ORIGIN: Allowed origin (default: http://localhost:3000)
- JWT_SECRET: JWT signing key
- NODE_ENV: Environment (development/production)

### Source Code

#### `/src/index.ts` (142 lines)
**Purpose**: Main server entry point

**Responsibilities**:
- Create HTTP server and Socket.io instance
- Configure CORS and authentication
- Register all event handlers
- Start presence update interval
- Handle graceful shutdown
- Log server startup and connections

**Key Features**:
- Comprehensive error handling
- Connection logging
- Presence tracking
- Event listener registration

#### `/src/config.ts` (14 lines)
**Purpose**: Configuration management

**Exports**:
- PORT: From env or 3001
- CORS_ORIGIN: From env or localhost:3000
- JWT_SECRET: From env or dev default
- NODE_ENV: From env or development

#### `/src/types/index.ts` (57 lines)
**Purpose**: TypeScript type definitions

**Types**:
- `SocketUser`: Connected socket user info
- `PlazaUserState`: User position and avatar in plaza
- `ChatMessage`: Message structure
- `Broadcast`: Active broadcast with expiration
- `UserCooldown`: Cooldown tracking
- `AuthPayload`: JWT token payload
- `AuthenticatedSocket`: Socket with user attached

#### `/src/middleware/auth.ts` (28 lines)
**Purpose**: JWT authentication middleware

**Functionality**:
- Verify JWT tokens from socket auth
- Extract userId and nickname
- Attach user to socket object
- Handle authentication errors
- Prevent unauthenticated connections

#### `/src/services/plaza-service.ts` (111 lines)
**Purpose**: Plaza state management

**Methods**:
- `addUser()`: Add user to plaza
- `removeUser()`: Remove user from plaza
- `moveUser()`: Update user position
- `getUser()`: Get single user
- `getUsers()`: Get all plaza users
- `getUserCount()`: Get user count
- `isUserInPlaza()`: Check if user exists
- `validatePosition()`: Enforce plaza boundaries
- `clear()`: Reset service

**State**:
- In-memory Map of users
- Position validation
- Capacity checking

#### `/src/services/broadcast-service.ts` (113 lines)
**Purpose**: Broadcast message management

**Methods**:
- `addBroadcast()`: Create new broadcast
- `getBroadcasts()`: Get active broadcasts
- `getBroadcast()`: Get single broadcast
- `checkCooldown()`: Check user cooldown status
- `setCooldown()`: Set user cooldown
- `clear()`: Reset service

**Features**:
- Per-user cooldown tracking
- Automatic expiration with timeouts
- Type-based configuration
- Maximum concurrent broadcasts limit

#### `/src/services/presence-service.ts` (48 lines)
**Purpose**: Online user tracking

**Methods**:
- `addUser()`: Add online user
- `removeUser()`: Remove online user
- `getUser()`: Get user info
- `getUsers()`: Get all online users
- `getOnlineCount()`: Count online users
- `isOnline()`: Check if user online
- `getUserStatus()`: Get user status
- `clear()`: Reset service

#### `/src/events/index.ts` (46 lines)
**Purpose**: Socket event name constants

**Event Categories**:
- Connection/Disconnection
- Plaza (join, leave, move, chat, system messages)
- Broadcast (send, receive, expire)
- Presence (update, online count, user status)
- User (profile card requests/responses)
- Notifications
- Friends
- Minihome/Guestbook
- Typing indicators
- Messages
- Sync

#### `/src/rooms/plaza-room.ts` (17 lines)
**Purpose**: Room management utilities

**Constants & Functions**:
- `PLAZA_ROOM_NAME`: "taeja-central-plaza"
- `joinPlazaRoom()`: Add socket to plaza room
- `leavePlazaRoom()`: Remove socket from room
- `getPlazaRoomName()`: Get room name

#### `/src/handlers/plaza/join-handler.ts` (59 lines)
**Purpose**: Handle plaza:join event

**Functionality**:
- Add user to plaza service
- Add user to presence service
- Join socket to plaza room
- Send current user list to joiner
- Broadcast join event to others
- Send system message

**Validations**:
- Check plaza capacity
- Check duplicate user
- Validate avatar ID

#### `/src/handlers/plaza/leave-handler.ts` (57 lines)
**Purpose**: Handle plaza:leave and disconnect events

**Functions**:
- `handlePlazaLeave()`: Manual leave event
- `handleDisconnect()`: Automatic on disconnect

**Functionality**:
- Remove user from plaza
- Remove from presence
- Leave plaza room
- Broadcast leave event
- Send system message

#### `/src/handlers/plaza/movement-handler.ts` (58 lines)
**Purpose**: Handle plaza:move event

**Functionality**:
- Validate position data
- Check boundaries
- Update user position
- Broadcast movement to all

**Validations**:
- Position coordinates required
- X must be 0-1000
- Y must be 0-800

#### `/src/handlers/chat/chat-handler.ts` (74 lines)
**Purpose**: Handle plaza:chat event

**Functionality**:
- Validate message data
- Check message length
- Generate unique message ID
- Maintain chat history
- Broadcast to all in plaza

**Validations**:
- Message required
- Max 200 characters
- Cannot be empty

**Features**:
- In-memory chat history
- Automatic history rotation
- Timestamp tracking

#### `/src/handlers/chat/system-message-handler.ts` (15 lines)
**Purpose**: Send system messages to plaza

**Exports**:
- `sendSystemMessage()`: Emit system message to plaza

**Usage**:
- Join/leave notifications
- Admin announcements

#### `/src/handlers/broadcast/broadcast-handler.ts` (109 lines)
**Purpose**: Handle broadcast:send event

**Functionality**:
- Check cooldown
- Validate message
- Create broadcast
- Set cooldown
- Emit to all users

**Validations**:
- Type must be NORMAL or PREMIUM
- Message required
- Max length depends on type
- Cooldown enforced
- Cannot be empty

**Functions**:
- `handleBroadcastSend()`: Main handler
- `getBroadcasts()`: Get active broadcasts

#### `/src/handlers/presence/presence-handler.ts` (60 lines)
**Purpose**: Handle presence tracking

**Functions**:
- `startPresenceUpdates()`: Start periodic broadcast
- `stopPresenceUpdates()`: Stop updates
- `handlePresenceUpdate()`: Handle update event

**Features**:
- Online count every 10 seconds
- User status updates
- Presence interval management

### Documentation Files

#### `/README.md` (100+ lines)
**Purpose**: Project overview and documentation

**Sections**:
- Technology stack
- Project structure
- Setup instructions
- Running the server
- API events
- Constraints and limits

#### `/DEVELOPMENT.md` (350+ lines)
**Purpose**: Complete development guide

**Sections**:
- Quick start guide
- Environment setup
- Socket event flows
- Service architecture
- Error handling
- Broadcast types
- Plaza constraints
- Debugging tips
- Testing guide
- Production checklist
- Common issues
- Performance notes

#### `/DEPLOYMENT.md` (400+ lines)
**Purpose**: Production deployment guide

**Sections**:
- Pre-deployment checklist
- Environment setup
- Build process
- Deployment options (PM2, Docker, Systemd)
- Reverse proxy setup (Nginx, Apache)
- SSL/TLS setup
- Monitoring & logging
- Database persistence
- Backup strategy
- Performance tuning
- Security hardening
- Troubleshooting
- Rollback procedure
- Maintenance schedule

#### `/TEST_SCENARIOS.md` (500+ lines)
**Purpose**: Complete testing guide

**Test Scenarios**:
1. Basic connection & authentication
2. Plaza join & user list
3. Multiple users in plaza
4. Plaza chat
5. Plaza movement
6. Broadcast - NORMAL type
7. Broadcast - PREMIUM type
8. Cooldown enforcement
9. Presence tracking
10. Disconnect & leave
11. Plaza capacity limit
12. Error handling
- Stress testing (100 concurrent users)
- Monitoring & debugging
- Cleanup procedures

#### `/IMPLEMENTATION_SUMMARY.md` (300+ lines)
**Purpose**: High-level implementation overview

**Sections**:
- Overview
- Core features
- Technical architecture
- API events reference
- Error handling
- Configuration
- Running the server
- Key implementation details
- Scalability notes
- Production checklist
- Support & maintenance

### Example Code

#### `/example-client.ts` (250+ lines)
**Purpose**: Complete working example client

**Class**: `TaejaPlazaClient`

**Methods**:
- `connect()`: Connect to server
- `joinPlaza()`: Join plaza
- `leavePlaza()`: Leave plaza
- `moveInPlaza()`: Move to position
- `sendChat()`: Send message
- `sendBroadcast()`: Send announcement
- `getPlazaUsers()`: Get users list
- `disconnect()`: Close connection

**Usage Example**:
Shows how to use the client in a real application

## Statistics

| Category | Count | Lines |
|----------|-------|-------|
| Configuration | 4 | ~60 |
| Source Code | 15 | 618 |
| Documentation | 5 | 1500+ |
| Examples | 1 | 250+ |
| **Total** | **25** | **2400+** |

## How to Use This Manifest

### For Setup
1. Read: README.md
2. Read: DEVELOPMENT.md (Quick Start section)
3. Create: .env file from .env.example
4. Run: npm install && npm run dev

### For Development
1. Reference: DEVELOPMENT.md
2. Use: TEST_SCENARIOS.md for testing
3. Check: TYPE definitions in src/types/index.ts

### For Deployment
1. Read: DEPLOYMENT.md completely
2. Choose deployment method
3. Follow pre-deployment checklist
4. Test production build

### For Debugging
1. Check: DEVELOPMENT.md (Debugging section)
2. Review: TEST_SCENARIOS.md for similar cases
3. Check server logs
4. Use socket.io-client to test events

## File Dependencies

```
index.ts
├── config.ts
├── middleware/auth.ts
├── handlers/plaza/*.ts
├── handlers/chat/*.ts
├── handlers/broadcast/*.ts
├── handlers/presence/*.ts
├── events/index.ts
└── services/*.ts
    └── types/index.ts

handlers/*/*.ts
├── services/*.ts
├── rooms/plaza-room.ts
└── events/index.ts
```

## Key Features by File

**Authentication & Security**
- middleware/auth.ts
- config.ts

**Real-Time Plaza**
- handlers/plaza/*.ts
- services/plaza-service.ts

**Messaging**
- handlers/chat/*.ts
- handlers/broadcast/*.ts

**User Tracking**
- handlers/presence/*.ts
- services/presence-service.ts

**Infrastructure**
- index.ts
- types/index.ts
- events/index.ts

## Environment Requirements

**Node.js**: 16+ (tested with 18+)
**npm**: 7+
**OS**: Linux, macOS, or Windows (WSL)

## Quick Reference Commands

```bash
# Development
npm install
cp .env.example .env
npm run dev

# Production
npm run build
npm run start

# Testing
npm run dev &
node example-client.ts

# Cleanup
rm -rf dist node_modules
npm cache clean --force
```

## Support & Maintenance

- Refer to README.md for project overview
- Check DEVELOPMENT.md for common issues
- Use TEST_SCENARIOS.md for validation
- Follow DEPLOYMENT.md for production
- Review IMPLEMENTATION_SUMMARY.md for architecture

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Status**: Production Ready
