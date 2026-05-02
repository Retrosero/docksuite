export type CollectionClosureStatus = 'Tam Kapandi' | 'Kismi Tahsilat'

export function calculateRemainingBalance(outstandingAmount: number, paidAmount: number): number {
  return Math.max(outstandingAmount - paidAmount, 0)
}

export function calculateClosureStatus(outstandingAmount: number, paidAmount: number): CollectionClosureStatus {
  return calculateRemainingBalance(outstandingAmount, paidAmount) === 0 ? 'Tam Kapandi' : 'Kismi Tahsilat'
}
