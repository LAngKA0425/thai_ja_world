export enum PaymentStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
  REFUNDED = "REFUNDED",
}

export interface GemPackage {
  id: string;
  name: string;
  gems: number;
  price: number;
  currency: "USD" | "KRW" | "THB" | "EUR";
  bonus?: number;
  isPopular?: boolean;
  description?: string;
}

export interface PaymentIntent {
  id: string;
  userId: string;
  packageId: string;
  package?: GemPackage;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: "CREDIT_CARD" | "PAYPAL" | "STRIPE" | "LOCAL_PAYMENT";
  transactionId?: string;
  failureReason?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface PaymentGatewayResponse {
  success: boolean;
  transactionId?: string;
  message: string;
  errorCode?: string;
}
