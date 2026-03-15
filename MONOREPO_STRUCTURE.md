# 태자월드 모노레포 폴더 구조

> 생성일: 2026-03-09
> 목적: 권장 모노레포 구조 정의 및 각 영역 역할 안내

---

## 1. 전체 폴더 트리

```
taeja-world/
│
├── app/                          # [기존] 현재 백엔드/프론트엔드 코드
│   ├── backend/                  # [기존] FastAPI 백엔드
│   └── frontend/                 # [기존] Next.js 프론트엔드
│
├── frontend-patch/               # [기존] 프론트엔드 패치 파일
├── ops/                          # [기존] nginx 등 운영 설정
│
├── apps/                         # [신규] 모노레포 앱 영역
│   ├── web/                      #   사용자용 Next.js 웹앱
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── (auth)/       #     로그인, 회원가입
│   │   │   │   │   ├── login/
│   │   │   │   │   └── signup/
│   │   │   │   ├── (main)/       #     메인 서비스 페이지
│   │   │   │   │   ├── plaza/         # 태자 센트럴 광장
│   │   │   │   │   ├── minihome/      # 미니홈피
│   │   │   │   │   ├── shop/          # 상점
│   │   │   │   │   ├── friendship/    # 친구 (일촌)
│   │   │   │   │   ├── message/       # 메시지
│   │   │   │   │   └── settings/      # 설정
│   │   │   │   └── (marketing)/  #     마케팅 랜딩
│   │   │   │       └── landing/
│   │   │   ├── features/         #     도메인별 피처 모듈
│   │   │   │   ├── plaza/             # 광장 (이동, 렌더링)
│   │   │   │   ├── minihome/          # 미니홈피
│   │   │   │   ├── shop/              # 상점
│   │   │   │   ├── friendship/        # 친구/일촌
│   │   │   │   ├── message/           # 메시지/쪽지
│   │   │   │   ├── authentication/    # 인증 (로그인/회원가입)
│   │   │   │   ├── avatar/            # 아바타
│   │   │   │   ├── guestbook/         # 방명록
│   │   │   │   ├── miniroom/          # 미니룸
│   │   │   │   ├── points/            # 포인트
│   │   │   │   ├── quests/            # 퀘스트
│   │   │   │   ├── notifications/     # 알림
│   │   │   │   ├── broadcast/         # 확성기
│   │   │   │   ├── profile/           # 프로필
│   │   │   │   ├── inventory/         # 인벤토리 (보유 아이템)
│   │   │   │   ├── payment/           # 결제
│   │   │   │   ├── membership/        # 멤버십/등급
│   │   │   │   └── presence/          # 접속 상태
│   │   │   │   (각 피처: components/ hooks/ types/ api/ constants/)
│   │   │   ├── components/       #     앱 공통 컴포넌트
│   │   │   │   ├── layout/
│   │   │   │   ├── navigation/
│   │   │   │   └── feedback/
│   │   │   ├── hooks/            #     앱 공통 훅
│   │   │   ├── lib/              #     앱 유틸리티
│   │   │   └── styles/           #     앱 스타일
│   │   └── public/
│   │       ├── images/
│   │       └── icons/
│   │
│   ├── socket-server/            #   실시간 소켓 서버
│   │   └── src/
│   │       ├── events/                # 이벤트 정의
│   │       ├── services/              # 비즈니스 로직
│   │       ├── rooms/                 # 룸 관리
│   │       ├── middleware/            # 미들웨어
│   │       ├── types/                 # 타입
│   │       └── handlers/             # 도메인 핸들러
│   │           ├── presence/          #   접속/퇴장
│   │           ├── movement/          #   광장 이동
│   │           ├── chat/              #   채팅
│   │           └── broadcast/         #   확성기
│   │
│   └── admin/                    #   운영 관리 대시보드
│       └── src/
│           ├── app/
│           │   └── (dashboard)/
│           │       ├── overview/           # 대시보드 메인
│           │       ├── user-management/    # 유저 관리
│           │       ├── report-management/  # 신고 관리
│           │       ├── broadcast-log/      # 확성기 로그
│           │       └── notice-management/  # 공지 관리
│           ├── features/
│           │   ├── moderation/        # 신고/제재
│           │   ├── user-management/   # 유저 관리
│           │   ├── broadcast-log/     # 확성기 로그
│           │   ├── notice-management/ # 공지 관리
│           │   └── dashboard/         # 대시보드 통계
│           ├── components/
│           │   ├── layout/
│           │   └── navigation/
│           ├── hooks/
│           └── lib/
│
├── packages/                     # [신규] 공유 패키지
│   ├── ui/                       #   공통 UI 컴포넌트
│   │   └── src/
│   │       ├── components/
│   │       │   ├── buttons/
│   │       │   ├── cards/
│   │       │   ├── forms/
│   │       │   ├── modals/
│   │       │   ├── badges/
│   │       │   ├── avatars/
│   │       │   ├── navigation/
│   │       │   └── feedback/
│   │       ├── styles/
│   │       └── hooks/
│   │
│   ├── shared/                   #   공통 타입, DTO, 상수, 이벤트
│   │   └── src/
│   │       ├── types/
│   │       ├── dto/
│   │       ├── constants/
│   │       ├── events/
│   │       └── validators/
│   │
│   ├── db/                       #   DB 스키마, 마이그레이션
│   │   ├── prisma/
│   │   │   ├── migrations/
│   │   │   └── seed/
│   │   └── docs/
│   │
│   ├── config/                   #   공통 설정 (ESLint, TS, Tailwind)
│   │   ├── eslint/
│   │   ├── typescript/
│   │   └── tailwind/
│   │
│   └── locales/                  #   다국어 리소스
│       ├── ko/
│       ├── en/
│       └── th/
│
├── docs/                         # [신규] 프로젝트 문서
│   ├── prd/                      #   제품 요구사항 (PRD)
│   ├── architecture/             #   아키텍처 설계
│   ├── ops/                      #   운영/인프라 문서
│   └── marketing/                #   마케팅 문서
│
├── .github/                      # [신규] GitHub 설정
│   └── workflows/                #   CI/CD 워크플로우
│
├── .claude/                      # [기존] Claude 설정
├── .env                          # [기존] 환경변수
├── .env.example                  # [기존] 환경변수 예시
├── .env.production.example       # [기존] 프로덕션 환경변수 예시
├── README.md                     # [기존] 프로젝트 루트 README
├── SPEC_PLATFORM.md              # [기존] 플랫폼 스펙 문서
├── DEPLOY.md                     # [기존] 배포 가이드
├── docker-compose.yml            # [기존] Docker 설정
├── sync-test.txt                 # [기존]
├── package.json                  # [신규] 모노레포 루트 package.json
├── pnpm-workspace.yaml           # [신규] pnpm 워크스페이스 설정
├── turbo.json                    # [신규] Turborepo 설정
└── MONOREPO_STRUCTURE.md         # [신규] 이 문서
```

---

## 2. 최상위 폴더 목적 설명

| 폴더 | 역할 |
|---|---|
| `app/` | **[기존]** 현재 운영 중인 백엔드(FastAPI) + 프론트엔드(Next.js) 코드. 이번 작업에서 건드리지 않음. |
| `apps/` | **[신규]** 모노레포 앱 영역. 사용자 웹(`web`), 실시간 소켓(`socket-server`), 운영 대시보드(`admin`) 분리. |
| `packages/` | **[신규]** 앱 간 공유 패키지. UI 컴포넌트, 타입/DTO, DB 스키마, 설정, 다국어. |
| `docs/` | **[신규]** PRD, 아키텍처, 운영, 마케팅 문서 집합. |
| `.github/` | **[신규]** GitHub Actions CI/CD 워크플로우. |
| `ops/` | **[기존]** nginx 등 운영 인프라 설정. |
| `frontend-patch/` | **[기존]** 프론트엔드 긴급 패치 파일. |

---

## 3. 이 구조가 유지보수/검색/확장에 유리한 이유

**검색성**: 모든 폴더명이 도메인 명사 중심(plaza, minihome, friendship, broadcast, moderation 등)으로 되어 있어, 파일 탐색기나 IDE에서 키워드 검색 시 즉시 위치를 찾을 수 있다.

**유지보수성**: 각 피처가 독립된 폴더(components, hooks, types, api, constants)로 캡슐화되어 있어, 특정 도메인 수정 시 다른 도메인에 영향을 주지 않는다.

**확장성**: 새 도메인 추가 시 `apps/web/src/features/새도메인/` 폴더만 추가하면 된다. 기존 구조를 건드릴 필요가 없다. 새 앱 추가 시 `apps/새앱/`만 추가하면 된다.

**재사용성**: `packages/` 하위의 ui, shared, db, config, locales는 모든 앱에서 import하여 사용 가능. 중복 코드 없이 타입과 UI를 공유한다.

**분리 원칙**: 사용자 서비스(web), 실시간 처리(socket-server), 운영 도구(admin)가 물리적으로 분리되어 독립 배포/개발이 가능하다.

---

## 4. 충돌 가능성 및 애매한 지점 메모

| 항목 | 설명 |
|---|---|
| `app/` vs `apps/` | 기존 `app/` 폴더(현재 코드)와 신규 `apps/` 폴더(모노레포 권장 구조)가 루트에 공존한다. 향후 마이그레이션 시 `app/` 내부 코드를 `apps/web` 등으로 이전하는 작업이 필요하나, 이번 작업에서는 수행하지 않았다. |
| `ops/` vs `docs/ops/` | 기존 `ops/`는 실제 nginx 설정이 있는 폴더이고, `docs/ops/`는 운영 문서용이다. 역할이 다르므로 충돌은 없으나 혼동 가능성이 있어 각 README에 용도를 명시했다. |
| `app/frontend/src/features/` vs `apps/web/src/features/` | 기존 프론트엔드에 이미 features 구조가 있다. 모노레포 전환 시 해당 코드를 `apps/web`으로 이전하는 별도 작업이 필요하다. |
| `app/frontend/src/messages/` vs `packages/locales/` | 기존 다국어 파일이 프론트엔드 내부에 있다. 향후 `packages/locales`로 통합하는 작업이 필요하다. |

---

## 5. 이번 작업에서 의도적으로 하지 않은 것

- 기존 `app/`, `ops/`, `frontend-patch/` 내부 파일 이동 또는 수정
- 기존 `README.md`, `.env.example`, `.env.production.example` 덮어쓰기
- 실제 비즈니스 로직 코드 작성
- 패키지 설치 (`npm install`, `pnpm install` 등)
- 빌드/테스트 실행
- 환경변수 실값 입력
- 외부 API 키 입력
- DB 연결, 결제 연동, 도메인 연결
- 배포 설정 실행
- 기존 코드를 새 구조로 마이그레이션 (별도 작업 필요)
- Prisma schema 파일 실제 작성
- CI/CD 워크플로우 YAML 실제 작성
- ESLint/TypeScript/Tailwind 설정 파일 실제 작성
