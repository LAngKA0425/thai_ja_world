// Ilchon (일촌) 타입 정의
export type IlchonStatus = "pending" | "accepted" | "rejected";

export interface IlchonRelation {
  id: string;
  requesterId: string;
  requesterNickname: string;
  receiverId: string;
  receiverNickname: string;
  status: IlchonStatus;
  ilchonComment?: string;
  createdAt: string;
}

export interface IlchonListResponse {
  relations: IlchonRelation[];
  total: number;
}

export interface IlchonRequestPayload {
  receiverId: string;
  ilchonComment?: string;
}

export interface IlchonAcceptPayload {
  relationId: string;
}
