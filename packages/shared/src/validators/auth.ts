export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateEmail(email: string): ValidationResult {
  const errors: string[] = [];

  if (!email || email.trim().length === 0) {
    errors.push("Email is required");
    return { isValid: false, errors };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errors.push("Invalid email format");
  }

  if (email.length > 254) {
    errors.push("Email is too long");
  }

  return { isValid: errors.length === 0, errors };
}

export function validatePassword(password: string): ValidationResult {
  const errors: string[] = [];

  if (!password || password.length === 0) {
    errors.push("Password is required");
    return { isValid: false, errors };
  }

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (password.length > 128) {
    errors.push("Password is too long");
  }

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
    errors.push(
      "Password must contain uppercase, lowercase letters and numbers"
    );
  }

  if (!hasSpecialChar) {
    errors.push("Password must contain at least one special character");
  }

  return { isValid: errors.length === 0, errors };
}

export function validateNickname(nickname: string): ValidationResult {
  const errors: string[] = [];

  if (!nickname || nickname.trim().length === 0) {
    errors.push("Nickname is required");
    return { isValid: false, errors };
  }

  const trimmedNickname = nickname.trim();

  if (trimmedNickname.length < 2) {
    errors.push("Nickname must be at least 2 characters long");
  }

  if (trimmedNickname.length > 12) {
    errors.push("Nickname must not exceed 12 characters");
  }

  const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/g;
  if (specialCharRegex.test(trimmedNickname)) {
    errors.push("Nickname cannot contain special characters");
  }

  const whitespaceRegex = /\s{2,}/;
  if (whitespaceRegex.test(trimmedNickname)) {
    errors.push("Nickname cannot contain consecutive spaces");
  }

  const reservedNames = ["admin", "system", "moderator", "bot"];
  if (reservedNames.includes(trimmedNickname.toLowerCase())) {
    errors.push("This nickname is reserved and cannot be used");
  }

  return { isValid: errors.length === 0, errors };
}

export function validateInput(
  email: string,
  password: string,
  nickname?: string
): ValidationResult {
  const emailValidation = validateEmail(email);
  const passwordValidation = validatePassword(password);
  const errors = [...emailValidation.errors, ...passwordValidation.errors];

  if (nickname) {
    const nicknameValidation = validateNickname(nickname);
    errors.push(...nicknameValidation.errors);
  }

  return { isValid: errors.length === 0, errors };
}

export function normalizeNickname(nickname: string): string {
  return nickname.trim().toLowerCase();
}

export function createChosung(text: string): string {
  const chosungList = [
    "ㄱ",
    "ㄲ",
    "ㄴ",
    "ㄷ",
    "ㄸ",
    "ㄹ",
    "ㅁ",
    "ㅂ",
    "ㅃ",
    "ㅅ",
    "ㅆ",
    "ㅇ",
    "ㅈ",
    "ㅉ",
    "ㅊ",
    "ㅋ",
    "ㅌ",
    "ㅍ",
    "ㅎ",
  ];
  const hangulBase = 0xac00;
  const jungsung = 21;
  const jongsung = 28;

  let result = "";

  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    const hangulOffset = charCode - hangulBase;

    if (hangulOffset >= 0 && hangulOffset < 11172) {
      const chosungIndex = Math.floor(hangulOffset / (jungsung * jongsung));
      if (chosungIndex >= 0 && chosungIndex < chosungList.length) {
        result += chosungList[chosungIndex];
      }
    } else {
      result += text[i];
    }
  }

  return result;
}
