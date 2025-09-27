// frontend/src/lib/contracts.ts
export const CONTRACT_ADDRESSES = {
  PLATFORM_CORE: "0x88be409BaD965786B38CDe89587A750338800FD3",
  CAMPAIGN_MANAGER: "0x72dE7047B87EC45cC1e3871E39467bC1AF69D65d",
  PAYMENT_ESCROW: "0xC01aEC49bA01EDD3d65BB7B12df2176F1D098819",
  USER_REGISTRY: "0xA3406227A5523e79f3956a025CEb8a7c280d647e",
  AI_VERIFICATION: "0xFDDa2A840CAe089f046B94E9E6A7A4299B3b9260",
} as const;

export const CHAIN_CONFIG = {
  chainId: 11155111, // Sepolia
  name: "Sepolia",
  blockExplorer: "https://sepolia.etherscan.io",
} as const;

// Platform Constants
export const PLATFORM_CONFIG = {
  MIN_CAMPAIGN_DURATION: 24 * 60 * 60, // 1 day in seconds
  MAX_CAMPAIGN_DURATION: 365 * 24 * 60 * 60, // 1 year in seconds
  PLATFORM_FEE_RATE: 250, // 2.5% in basis points
} as const;

// User Types
export enum UserType {
  None = 0,
  Brand = 1,
  Creator = 2,
}

// Campaign Status
export enum CampaignStatus {
  Active = 0,
  Paused = 1,
  Completed = 2,
  Cancelled = 3,
}

// Verification Status
export enum VerificationStatus {
  Pending = 0,
  Verified = 1,
  Rejected = 2,
}

// Verification Levels
export enum VerificationLevel {
  Unverified = 0,
  BasicVerified = 1,
  PremiumVerified = 2,
  EnterpriseVerified = 3,
}

export const CATEGORY_OPTIONS = [
  "Fashion & Beauty",
  "Technology",
  "Travel & Lifestyle",
  "Food & Cooking",
  "Fitness & Health",
  "Gaming",
  "Education",
  "Entertainment",
  "Business",
  "Art & Design",
];

export const PLATFORM_OPTIONS = [
  "Instagram",
  "TikTok",
  "YouTube",
  "Twitter",
  "Pinterest",
  "Snapchat",
];

export const CONTENT_TYPE_OPTIONS = [
  "Photo",
  "Video",
  "Story",
  "Reel",
  "Review",
  "Unboxing",
  "Tutorial",
];
