export type CollectionClosureStatus = 'Tam Kapandı' | 'Kısmi Tahsilat'

export function calculateRemainingBalance(outstandingAmount: number, paidAmount: number): number {
  return Math.max(outstandingAmount - paidAmount, 0)
}

export function calculateClosureStatus(outstandingAmount: number, paidAmount: number): CollectionClosureStatus {
  return calculateRemainingBalance(outstandingAmount, paidAmount) === 0 ? 'Tam Kapandı' : 'Kısmi Tahsilat'
}
