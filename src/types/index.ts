export type Position = "forward" | "defender" | "goalkeeper";

export type Hand = "left" | "right";

export interface Anthropometrics {
  height: number;
  weight: number;
  armSpan: number;
  legLength: number;
  torsoLength: number;
  sittingHeight: number;
  shoulderWidth: number;
  shoeSize: number;
  bodyFatPct?: number;
}

export interface Player {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  birthDate: string;
  position: Position;
  shootingHand: Hand;
  region: string;
  city: string;
  team?: string;
  jerseyNumber?: number;
  anthropometrics: Anthropometrics;
  avatar: string;
  rating: number;
  parentId: string;
}

export interface SkillScores {
  [key: string]: number;
  skating: number;
  shooting: number;
  passing: number;
  defense: number;
  physical: number;
  vision: number;
}

export interface HistoryPoint {
  date: string;
  score: number;
}

export interface PhysicalTests {
  sprint20mFwd: number;
  sprint20mBwd: number;
  sprint60m?: number;
  standingJump: number;
  longJump?: number;
  agility: number;
  flexibility: number;
  pushUps?: number;
  pullUps?: number;
  plankSec?: number;
  balanceTestSec?: number;
}

export interface PlayerRating {
  playerId: string;
  skills: SkillScores;
  history: HistoryPoint[];
  tests: PhysicalTests;
}

export interface Video {
  id: string;
  playerId: string;
  title: string;
  thumbnail: string;
  duration: string;
  uploadedAt: string;
}

export type UserRole = "parent" | "scout";

export interface AgeNormPercentiles {
  p25: number;
  p50: number;
  p75: number;
}

export type AgeNormFields = Record<string, AgeNormPercentiles>;
export type AgeNormsMap = Record<string, AgeNormFields>;

export interface ProgressPoint {
  month: string;
  rating: number;
}
