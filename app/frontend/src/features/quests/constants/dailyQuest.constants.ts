"use client";

import type { QuestDefinition } from "../types/quests.types";

export const DAILY_QUEST_TYPES: Record<
  QuestDefinition["questType"],
  {
    label: string;
    icon: string;
    description: string;
  }
> = {
  daily_login: {
    label: "일일 로그인",
    icon: "✓",
    description: "매일 로그인하기",
  },
  write_post: {
    label: "글 작성",
    icon: "📝",
    description: "새로운 글 작성하기",
  },
  visit_minihome: {
    label: "미니홈 방문",
    icon: "🏠",
    description: "다른 사람의 미니홈 방문하기",
  },
  write_comment: {
    label: "댓글 달기",
    icon: "💬",
    description: "글에 댓글 작성하기",
  },
  like_post: {
    label: "게시물 공감",
    icon: "❤️",
    description: "게시물에 공감 표시하기",
  },
  guestbook_write: {
    label: "방명록 작성",
    icon: "📕",
    description: "미니홈 방명록 작성하기",
  },
  miniroom_trash: {
    label: "쓰레기통 청소",
    icon: "🗑️",
    description: "미니룸의 쓰레기통 청소하기",
  },
};

export const DAILY_MAX_POINTS = 500;

export const QUEST_REWARD_ANIMATION_DURATION = 1500;
