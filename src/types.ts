export type CardStatus = 'new' | 'learning' | 'review' | 'mastered' | 'paused'
export type ReviewRating = 'again' | 'hard' | 'good' | 'easy'

export interface VocabularyCard {
  id: string
  term: string
  translation: string
  definition: string
  pronunciation?: string
  examples: string[]
  collocations?: string[]
  synonyms?: string[]
  antonyms?: string[]
  wordFamily?: {
    noun?: string[]
    verb?: string[]
    adjective?: string[]
    adverb?: string[]
  }
  register?: (
    | 'spoken'
    | 'written'
    | 'formal'
    | 'informal'
    | 'academic'
    | 'business'
    | 'slang'
  )[]
  commonMistakes?: string[]
  context?: string
  notes?: string
  level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
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
