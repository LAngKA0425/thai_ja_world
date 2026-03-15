import type { MinihomeTab } from "../types/minihome.types";

// TODO: 스킨/테마 데이터는 백엔드에서 관리 — 여기는 프론트 미리보기용 상수
export const MINIHOME_TABS: { id: MinihomeTab; label: string; emoji: string }[] = [
  { id: "home", label: "홈", emoji: "🏠" },
  { id: "guestbook", label: "방명록", emoji: "📝" },
  { id: "album", label: "사진첩", emoji: "📸" },
  { id: "miniroom", label: "미니룸", emoji: "🛋️" },
  { id: "bgm", label: "BGM", emoji: "🎵" },
];

export const DEFAULT_SKINS = [
  { id: "skin-default", name: "기본", previewColor: "from-sky-100 to-blue-50" },
  { id: "skin-sunset", name: "선셋", previewColor: "from-orange-100 to-pink-50" },
  { id: "skin-forest", name: "포레스트", previewColor: "from-emerald-100 to-green-50" },
  { id: "skin-night", name: "나이트", previewColor: "from-indigo-200 to-slate-100" },
  { id: "skin-thai", name: "태국감성", previewColor: "from-amber-100 to-yellow-50" },
];

export const MINIROOM_ITEM_CATEGORIES = [
  { id: "furniture", label: "가구", emoji: "🪑" },
  { id: "decoration", label: "장식", emoji: "🖼️" },
  { id: "pet", label: "펫", emoji: "🐕" },
  { id: "background", label: "배경", emoji: "🌅" },
] as const;
