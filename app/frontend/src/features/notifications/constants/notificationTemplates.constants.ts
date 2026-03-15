import type { NotificationItem } from "../types/notifications.types";

// ─── 잠금화면 / 앱 내 알림 카피 템플릿 ───
// 태자 브랜드 톤: 짧고, 생활감 있고, 눌러보고 싶은 문구
// 실제 push 서버 연동 전 미리보기 / scaffold용
export const NOTIFICATION_TEMPLATES: Omit<NotificationItem, "id" | "isRead" | "createdAt">[] = [
  // ── community ──
  {
    type: "hot_issue",
    category: "community",
    title: "태자 핫이슈 1건 올라왔어요",
    body: "방콕 아속 근처에서 화제인 소식, 지금 확인해보세요.",
    icon: "🔥",
    deepLink: "/search?type=tip",
    ctaLabel: "확인하기",
  },
  {
    type: "new_post",
    category: "community",
    title: "오늘의 생활정보가 도착했어요",
    body: "비자 연장, 은행 정보 등 새 정보가 업데이트됐어요.",
    icon: "📋",
    deepLink: "/search?type=tip",
    ctaLabel: "읽어보기",
  },
  {
    type: "life_info_update",
    category: "community",
    title: "회원님이 좋아할 글이 올라왔어요",
    body: "관심 지역에 새 게시글이 등록됐어요.",
    icon: "💡",
    deepLink: "/search",
    ctaLabel: "보러가기",
  },
  {
    type: "market_update",
    category: "community",
    title: "번개장터에 새 물건이 올라왔어요",
    body: "방콕 실롬에서 좋은 거래가 기다리고 있어요.",
    icon: "🛒",
    deepLink: "/search?type=market",
    ctaLabel: "구경하기",
  },

  // ── social ──
  {
    type: "comment_received",
    category: "social",
    title: "회원님의 글에 댓글이 달렸어요",
    body: "새 댓글을 확인해보세요. 대화가 이어지고 있어요!",
    icon: "💬",
    deepLink: "/posts",
    ctaLabel: "댓글 보기",
  },
  {
    type: "guestbook_message",
    category: "social",
    title: "방명록에 새 메시지가 남았어요",
    body: "미니홈피 방명록에 따뜻한 인사가 도착했어요.",
    icon: "📝",
    deepLink: "/minihome",
    ctaLabel: "방명록 보기",
  },
  {
    type: "minihome_visitor",
    category: "social",
    title: "미니홈피에 방문자가 다녀갔어요",
    body: "누군가 회원님의 미니홈피를 구경하고 갔어요.",
    icon: "👣",
    deepLink: "/minihome",
    ctaLabel: "확인하기",
  },
  {
    type: "post_liked",
    category: "social",
    title: "회원님의 글에 좋아요가 눌렸어요",
    body: "작성하신 글이 인기를 얻고 있어요!",
    icon: "❤️",
    deepLink: "/posts",
    ctaLabel: "보러가기",
  },

  // ── quest ──
  {
    type: "daily_quest_open",
    category: "quest",
    title: "오늘의 퀘스트가 열렸어요",
    body: "매일 도전하고 포인트를 모아보세요!",
    icon: "⚡",
    deepLink: "/quests",
    ctaLabel: "퀘스트 보기",
  },
  {
    type: "points_available",
    category: "quest",
    title: "오늘 받을 포인트가 남아 있어요",
    body: "아직 완료하지 않은 활동이 있어요. 지금 도전!",
    icon: "🪙",
    deepLink: "/quests",
    ctaLabel: "포인트 받기",
  },
  {
    type: "quest_reminder",
    category: "quest",
    title: "지금 들어오면 3TP 더 받을 수 있어요",
    body: "오늘 자정 전에 퀘스트를 완료해보세요.",
    icon: "⏰",
    deepLink: "/quests",
    ctaLabel: "도전하기",
  },
  {
    type: "quest_completed",
    category: "quest",
    title: "퀘스트 완료! 보상을 받으세요",
    body: "축하해요! 오늘의 퀘스트를 모두 클리어했어요.",
    icon: "🎉",
    deepLink: "/quests",
    ctaLabel: "보상 받기",
  },

  // ── reservation ──
  {
    type: "reservation_request",
    category: "reservation",
    title: "마사지 예약 요청이 접수됐어요",
    body: "곧 확인 결과를 알려드릴게요.",
    icon: "💆",
    deepLink: "/reservations",
    ctaLabel: "상태 보기",
  },
  {
    type: "reservation_confirmed",
    category: "reservation",
    title: "예약 확인이 필요해요",
    body: "예약이 확정되었어요. 일정을 확인해주세요.",
    icon: "✅",
    deepLink: "/reservations",
    ctaLabel: "예약 확인",
  },
  {
    type: "benefit_available",
    category: "reservation",
    title: "오늘 사용할 수 있는 혜택이 있어요",
    body: "포인트로 받을 수 있는 할인을 확인해보세요.",
    icon: "🎁",
    deepLink: "/shop",
    ctaLabel: "혜택 보기",
  },
  {
    type: "reservation_reminder",
    category: "reservation",
    title: "내일 예약이 잡혀 있어요",
    body: "예약 시간과 장소를 미리 확인해두세요.",
    icon: "📅",
    deepLink: "/reservations",
    ctaLabel: "일정 확인",
  },
];

// ─── 잠금화면용 축약 카피 (iOS/Android 푸시 미리보기) ───
export const LOCKSCREEN_COPY_SAMPLES = [
  { title: "태자", body: "🔥 핫이슈 1건 올라왔어요", category: "community" as const },
  { title: "태자", body: "📋 오늘의 생활정보가 도착했어요", category: "community" as const },
  { title: "태자", body: "💬 회원님의 글에 댓글이 달렸어요", category: "social" as const },
  { title: "태자", body: "👣 미니홈피에 방문자가 다녀갔어요", category: "social" as const },
  { title: "태자", body: "⚡ 오늘의 퀘스트가 열렸어요", category: "quest" as const },
  { title: "태자", body: "🪙 지금 들어오면 3TP 더 받을 수 있어요", category: "quest" as const },
  { title: "태자", body: "💆 마사지 예약 요청이 접수됐어요", category: "reservation" as const },
  { title: "태자", body: "🎁 오늘 사용할 수 있는 혜택이 있어요", category: "reservation" as const },
];

// ─── Mock 알림 데이터 (scaffold / 미리보기용) ───
export const MOCK_NOTIFICATIONS: NotificationItem[] = NOTIFICATION_TEMPLATES.slice(0, 6).map(
  (tpl, i) => ({
    ...tpl,
    id: `mock-notif-${i + 1}`,
    isRead: i > 1,
    createdAt: new Date(Date.now() - i * 1800000).toISOString(),
  })
);
