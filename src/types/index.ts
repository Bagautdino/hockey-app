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
  email?: string;
  hockeyStartDate?: string;
  photoKey?: string;
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
  videoUrl?: string;
  rating?: number;
  assessmentDate?: string;
  comment?: string;
  trainingPlan?: string;
  isAssessment?: boolean;
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

export interface AnthroSnapshot {
  id: string;
  playerId: string;
  recordedAt: string;
  height?: number;
  weight?: number;
  bodyFatPct?: number;
}

export interface Injury {
  id: string;
  playerId: string;
  name: string;
  description?: string;
  injuryDate: string;
  recoveryDays?: number;
  status: "in_progress" | "recovered";
  notes?: string;
  createdAt: string;
}

export interface GameStat {
  id: string;
  playerId: string;
  season: string;
  competitionName?: string;
  gamesPlayed: number;
  goals?: number;
  assists?: number;
  points?: number;
  plusMinus?: number;
  penaltyMinutes?: number;
  goalsAgainstAvg?: number;
  savePct?: number;
  shutouts?: number;
  recordedAt: string;
}

export interface TechAssessment {
  id: string;
  playerId: string;
  title: string;
  videoUrl?: string;
  thumbnail: string;
  duration: string;
  rating?: number;
  assessmentDate?: string;
  comment?: string;
  trainingPlan?: string;
  uploadedAt: string;
}

export interface VideoClip {
  id: string;
  playerId: string;
  uploaderId: string;
  title: string;
  videoUrl?: string;
  category: string;
  positionType: "field" | "goalkeeper";
  notes?: string;
  uploadedAt: string;
}

export interface Review {
  id: string;
  playerId: string;
  authorId: string;
  content: string;
  authorRole: "coach" | "expert" | "parent";
  createdAt: string;
}

export interface DataEntry {
  id: string;
  playerId: string;
  enteredById: string;
  entryType: string;
  entryId: string;
  enteredByRole: string;
  verifiedById?: string;
  verifiedAt?: string;
  createdAt: string;
}
