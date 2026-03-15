export interface SignupDTO {
  email: string;
  password: string;
  nickname: string;
  locale?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  userId?: string;
  email?: string;
  nickname?: string;
  token?: string;
  refreshToken?: string;
  expiresIn?: number;
  role?: string;
  avatar?: {
    id: string;
    imageUrl: string;
  };
  error?: string;
}

export interface RefreshTokenDTO {
  refreshToken: string;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordRequestDTO {
  email: string;
}

export interface ResetPasswordDTO {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface LogoutDTO {
  userId: string;
  token: string;
}

export interface UserSession {
  userId: string;
  email: string;
  nickname: string;
  role: string;
  avatar: {
    id: string;
    imageUrl: string;
  };
  loginAt: Date;
  expiresAt: Date;
}
