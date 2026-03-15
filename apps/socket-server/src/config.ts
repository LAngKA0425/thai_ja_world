import dotenv from "dotenv";

dotenv.config();

export const config = {
  PORT: parseInt(process.env.PORT || "3001", 10),
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3000",
  JWT_SECRET: process.env.JWT_SECRET || "your-secret-key-change-in-production",
  NODE_ENV: process.env.NODE_ENV || "development",
} as const;

export default config;
