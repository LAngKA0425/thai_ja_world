export interface MiniroomObject {
  id: string;
  userId: string;
  itemType: "furniture" | "decoration" | "pet" | "background" | "trash_quest";
  name: string;
  imageUrl: string;
  positionX: number;
  positionY: number;
  isInteractable: boolean;
  interactionType?: "click" | "drag" | "hover";
}

export interface MiniroomState {
  userId: string;
  objects: MiniroomObject[];
  trashQuestAvailable: boolean;
}

export interface TrashQuestResult {
  success: boolean;
  pointsEarned: number;
  message: string;
}

export interface MiniroomTheme {
  id: string;
  name: string;
  backgroundColor: string;
  previewUrl?: string;
}
