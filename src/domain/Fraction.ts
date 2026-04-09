/** Value Object: an immutable fraction a/b */
export interface Fraction {
  readonly numerator: number
  readonly denominator: number
}

export function createFraction(numerator: number, denominator: number): Fraction {
  if (denominator === 0) throw new Error('Denominator cannot be zero')
  return { numerator, denominator }
}

export function fractionToString(f: Fraction): string {
  return `${f.numerator}/${f.denominator}`
}
