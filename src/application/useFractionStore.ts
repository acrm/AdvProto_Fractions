import { create } from 'zustand'
import { Fraction, createFraction } from '../domain/Fraction'

interface FractionState {
  fractions: Fraction[]
  addFraction: (numerator: number, denominator: number) => void
  reset: () => void
}

export const useFractionStore = create<FractionState>((set) => ({
  fractions: [],
  addFraction: (numerator, denominator) =>
    set((state) => ({
      fractions: [...state.fractions, createFraction(numerator, denominator)],
    })),
  reset: () => set({ fractions: [] }),
}))
