export interface SeededRandom {
  next: () => number
  nextInt: (min: number, max: number) => number
  pick: <T>(items: T[]) => T
}

export function createSeededRandom(seed: number): SeededRandom {
  let state = seed >>> 0

  const next = () => {
    state = (1664525 * state + 1013904223) >>> 0
    return state / 0x100000000
  }

  const nextInt = (min: number, max: number) => {
    if (max < min) throw new Error('Invalid range for nextInt')
    return Math.floor(next() * (max - min + 1)) + min
  }

  const pick = <T>(items: T[]): T => {
    if (items.length === 0) throw new Error('Cannot pick from empty list')
    return items[nextInt(0, items.length - 1)]
  }

  return { next, nextInt, pick }
}
