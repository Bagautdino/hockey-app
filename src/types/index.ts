export type Position = "forward" | "defender" | "goalkeeper";

export interface Player {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  position: Position;
  region: string;
  height: number;
  weight: number;
  armSpan: number;
  legLength: number;
  avatar: string;
  rating: number;
  parentId: string;
}

export interface SkillScores {
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
  standingJump: number;
  agility: number;
  flexibility: number;
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
