export const PLAZA_NAME = "태자 센트럴 광장";
export const MAX_PLAZA_USERS = 100;
export const PLAZA_WIDTH = 1000;
export const PLAZA_HEIGHT = 800;

export const PLAZA_CONFIG = {
  name: PLAZA_NAME,
  maxUsers: MAX_PLAZA_USERS,
  width: PLAZA_WIDTH,
  height: PLAZA_HEIGHT,
  gridSize: 50,
  chatMessageLimit: 200,
  messageRetentionMs: 1800000,
  userInactivityTimeoutMs: 300000,
  presenceUpdateIntervalMs: 5000,
} as const;

export const PLAZA_BOUNDARIES = {
  minX: 0,
  maxX: PLAZA_WIDTH,
  minY: 0,
  maxY: PLAZA_HEIGHT,
} as const;

export const PLAZA_MOVEMENT = {
  maxSpeed: 10,
  acceleration: 2,
  friction: 0.95,
} as const;
