# apps/socket-server

실시간 소켓 서버 (Socket.IO / WebSocket) - 태자월드 (Taeja World)

이 서버는 사용자의 실시간 상호작용을 처리합니다:
- 중앙 광장의 사용자 위치 및 이동
- 광장 내 채팅 및 시스템 메시지
- 플랫폼 전체 확성기(Broadcast)
- 사용자 온라인 상태 추적

## 기술 스택
- **Runtime**: Node.js
- **언어**: TypeScript
- **실시간 통신**: Socket.io 4.7
- **인증**: JWT (JSON Web Token)
- **CORS**: 크로스 오리진 지원

## 구조

### `/src`
- **`index.ts`** — 메인 서버, 이벤트 리스너 등록
- **`config.ts`** — 환경 설정 (PORT, CORS_ORIGIN, JWT_SECRET)
- **`events/`** — 소켓 이벤트 정의
- **`services/`** — 비즈니스 로직 서비스
  - `plaza-service.ts` — 광장 사용자 및 위치 관리
  - `broadcast-service.ts` — 확성기 메시지 및 쿨다운 관리
  - `presence-service.ts` — 온라인 사용자 추적
- **`rooms/`** — 룸 관리
  - `plaza-room.ts` — 광장 룸 (`taeja-central-plaza`)
- **`middleware/`** — 인증 및 검증
  - `auth.ts` — JWT 토큰 검증
- **`types/`** — TypeScript 타입 정의
  - `index.ts` — SocketUser, PlazaUserState, ChatMessage 등
- **`handlers/`** — 도메인별 이벤트 핸들러
  - **`plaza/`**
    - `join-handler.ts` — 광장 입장 처리
    - `leave-handler.ts` — 광장 퇴장 및 연결 해제
    - `movement-handler.ts` — 사용자 이동 처리
  - **`chat/`**
    - `chat-handler.ts` — 광장 채팅 메시지
    - `system-message-handler.ts` — 시스템 메시지 발송
  - **`broadcast/`**
    - `broadcast-handler.ts` — 확성기 메시지 발송
  - **`presence/`**
    - `presence-handler.ts` — 온라인 상태 관리 및 정기 업데이트

## 설정

### 환경 변수
`.env` 파일을 생성하여 다음을 설정합니다:

```bash
PORT=3001
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=development
```

## 실행

### 개발 모드
```bash
npm run dev
```

### 빌드
```bash
npm run build
```

### 프로덕션 실행
```bash
npm run start
```

## API 이벤트

### Plaza (광장)
- **`plaza:join`** — 광장에 입장
- **`plaza:leave`** — 광장에서 퇴장
- **`plaza:move`** — 위치 변경
- **`plaza:chat`** — 메시지 전송
- **`plaza:user_list`** — 광장 사용자 목록 수신
- **`plaza:system_message`** — 시스템 메시지 수신

### Broadcast (확성기)
- **`broadcast:send`** — 확성기 메시지 전송
- **`broadcast:receive`** — 확성기 메시지 수신

### Presence (온라인 상태)
- **`presence:update`** — 상태 업데이트
- **`presence:online_count`** — 온라인 사용자 수 (10초마다)
- **`presence:user_status`** — 사용자 상태 변경

## 제약사항

### 광장 (Plaza)
- 최대 사용자: 100명
- 크기: 1000 x 800px
- 채팅 메시지 최대 길이: 200자

### 확성기 (Broadcast)
- **NORMAL**: 최대 50자, 2분 지속, 60초 쿨다운
- **PREMIUM**: 최대 100자, 5분 지속, 30초 쿨다운
