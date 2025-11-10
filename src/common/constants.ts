// ============================================================================
// GAME CONSTANTS
// ============================================================================
export const PHASE_DURATION_SECONDS: number = 1.5;
export const BASE_NUM_HEARTS = 26;

// ============================================================================
// BRAND CONSTANTS
// ============================================================================
export const BRAND_NAME = "Eventfully";
export const BRAND_TAGLINE = "Test Your History Knowledge";
export const BRAND_DESCRIPTION = "Eventfully is an engaging educational game that tests your knowledge of historical events";

// ============================================================================
// URL CONSTANTS
// ============================================================================
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://earlierorlater.netlify.app";
export const SITE_NAME = BRAND_NAME;

// ============================================================================
// METADATA CONSTANTS
// ============================================================================
export const DEFAULT_TITLE = `${BRAND_NAME} - ${BRAND_TAGLINE} | Timeline Game`;
export const DEFAULT_DESCRIPTION = 
  "Challenge yourself with Eventfully! Guess which historical events, births, or deaths happened earlier or later. Educational and fun timeline game for history enthusiasts.";

// ============================================================================
// STORAGE KEYS
// ============================================================================
export const STREAK_STORAGE_KEY = 'daily_game_streak';
export const SCORE_STORAGE_KEY = 'daily_game_scores';