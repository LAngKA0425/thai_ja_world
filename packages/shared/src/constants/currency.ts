export const DEFAULT_GEMS = 0;
export const DEFAULT_POINTS = 5000;

/** @deprecated Use DEFAULT_STYLE_POINTS instead */
export const DEFAULT_STYLE_POINTS = DEFAULT_GEMS;

export const STARTER_PACK_PRICE = 0;
export const STARTER_PACK_GEMS = 100;
/** @deprecated Use STARTER_PACK_STYLE_POINTS instead */
export const STARTER_PACK_STYLE_POINTS = STARTER_PACK_GEMS;

export const STARTER_PACK_ITEMS = [
  "basic_avatar_1",
  "basic_avatar_2",
  "basic_background_1",
];

export const STYLE_POINT_PACKAGES = [
  {
    id: "sp_pack_small",
    name: "Small",
    stylePoints: 500,
    price: 4.99,
    currency: "USD",
    bonus: 0,
  },
  {
    id: "sp_pack_medium",
    name: "Medium",
    stylePoints: 1200,
    price: 9.99,
    currency: "USD",
    bonus: 200,
    isPopular: true,
  },
  {
    id: "sp_pack_large",
    name: "Large",
    stylePoints: 2500,
    price: 19.99,
    currency: "USD",
    bonus: 500,
  },
  {
    id: "sp_pack_mega",
    name: "Mega",
    stylePoints: 5500,
    price: 39.99,
    currency: "USD",
    bonus: 1500,
  },
  {
    id: "sp_pack_ultimate",
    name: "Ultimate",
    stylePoints: 12000,
    price: 79.99,
    currency: "USD",
    bonus: 4000,
  },
] as const;

/** @deprecated Use STYLE_POINT_PACKAGES instead */
export const GEM_PACKAGES = STYLE_POINT_PACKAGES;

export const DECORATION_DURATION_DAYS = {
  STANDARD: 90,
  PREMIUM: 180,
  PERMANENT: null,
} as const;

export const CURRENCY_CONFIG = {
  defaultGems: DEFAULT_GEMS,
  defaultPoints: DEFAULT_POINTS,
  defaultStylePoints: DEFAULT_STYLE_POINTS,
  starterPackPrice: STARTER_PACK_PRICE,
  starterPackGems: STARTER_PACK_GEMS,
  starterPackStylePoints: STARTER_PACK_STYLE_POINTS,
  stylePointPackages: STYLE_POINT_PACKAGES,
  /** @deprecated */
  gemPackages: STYLE_POINT_PACKAGES,
  maxGemsPerTransaction: 100000,
  maxStylePointsPerTransaction: 100000,
  maxPointsPerTransaction: 1000000,
  minPurchaseAmount: 0.99,
  decorationDurationDays: DECORATION_DURATION_DAYS,
} as const;
