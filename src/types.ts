export type CardStatus = 'new' | 'learning' | 'review' | 'mastered' | 'paused'
export type ReviewRating = 'again' | 'hard' | 'good' | 'easy'

export interface VocabularyCard {
  id: string
  term: string
  translation: string
  definition: string
  examples: string[]
  context?: string
  notes?: string
  pronunciation?: string
  category?: string
  tags?: string[]
  status: CardStatus
  createdAt: string
  lastReviewedAt?: string
  nextReviewAt?: string
  reviewCount: number
  correctCount: number
  incorrectCount: number
  intervalDays: number
}
