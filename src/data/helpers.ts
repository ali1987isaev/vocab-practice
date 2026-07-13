import type { VocabularyCard } from '../types'

type VocabularyCardInput = Omit<VocabularyCard, 'createdAt' | 'status'> &
  Partial<Pick<VocabularyCard, 'status'>>

export const createCard = (card: VocabularyCardInput): VocabularyCard => ({
  status: 'new',
  ...card,
  createdAt: new Date().toISOString(),
})
