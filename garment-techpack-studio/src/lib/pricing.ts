export const SIZE_MULTIPLIERS: Record<string, number> = {
  'XS': 0.95,
  'S': 0.97,
  'M': 1.0,
  'L': 1.03,
  'XL': 1.06,
  '2XL': 1.10,
  '3XL': 1.15,
}

export function calculateSizeGrading(baseCost: number): { size: string; cost: number }[] {
  return Object.entries(SIZE_MULTIPLIERS).map(([size, mult]) => ({
    size,
    cost: Math.round(baseCost * mult),
  }))
}
