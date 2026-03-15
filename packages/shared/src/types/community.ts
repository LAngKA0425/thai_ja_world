import type { CommunityCategory, ContentModerationStatus, IncidentSeverity } from '../constants/community';

export interface CommunityPost {
  id: string;
  authorId: string;
  authorNickname?: string;
  category: CommunityCategory;
  title: string;
  content: string;
  isAnonymous: boolean;
  moderationStatus: ContentModerationStatus;
  severity?: IncidentSeverity;
  viewCount: number;
  commentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface HomeSectionData {
  sectionType: string;
  title: string;
  items: CommunityPost[];
  totalCount: number;
}
