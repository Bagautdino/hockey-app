import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Position, Hand } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("ru-RU").format(new Date(dateString));
}

export function getAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export function positionLabel(position: Position): string {
  const map: Record<Position, string> = {
    forward: "Нападающий",
    defender: "Защитник",
    goalkeeper: "Вратарь",
  };
  return map[position];
}

export function handLabel(hand: Hand): string {
  return hand === "left" ? "Левый" : "Правый";
}

export function ratingColor(rating: number): string {
  if (rating >= 85) return "text-green-600";
  if (rating >= 70) return "text-amber-500";
  return "text-red-500";
}

export function ratingBadgeVariant(
  rating: number
): "default" | "secondary" | "destructive" {
  if (rating >= 85) return "default";
  if (rating >= 70) return "secondary";
  return "destructive";
}
