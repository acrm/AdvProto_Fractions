import { Fraction } from '../domain/Fraction'

const STORAGE_KEY = 'fractions'

export function saveFractions(fractions: Fraction[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fractions))
}

export function loadFractions(): Fraction[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as Fraction[]
  } catch {
    return []
  }
}
