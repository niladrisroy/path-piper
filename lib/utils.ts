import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateAge(birthMonth: number, birthYear: number): number {
  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth() + 1 // Convert to 1-based month
  
  let totalMonths = (currentYear - birthYear) * 12
  totalMonths += (currentMonth - birthMonth)
  
  return totalMonths
}

export function calculateAgeInYears(birthMonth: string | number, birthYear: string | number): number {
  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth() + 1 // Convert to 1-based month
  
  const bMonth = typeof birthMonth === 'string' ? parseInt(birthMonth) : birthMonth
  const bYear = typeof birthYear === 'string' ? parseInt(birthYear) : birthYear
  
  let age = currentYear - bYear
  
  // If birthday hasn't occurred this year yet, subtract 1
  if (currentMonth < bMonth) {
    age--
  }
  
  return age
}

export function getAgeGroupFromAge(ageInYears: number): string {
  if (ageInYears < 5) {
    return "early_childhood"
  } else if (ageInYears >= 5 && ageInYears <= 10) {
    return "elementary"
  } else if (ageInYears >= 11 && ageInYears <= 13) {
    return "middle_school"
  } else if (ageInYears >= 14 && ageInYears <= 18) {
    return "high_school"
  } else {
    return "young_adult"
  }
}

export function getAgeGroupFromBirthDate(birthMonth: string | number, birthYear: string | number): string {
  const ageInYears = calculateAgeInYears(birthMonth, birthYear)
  return getAgeGroupFromAge(ageInYears)
}
