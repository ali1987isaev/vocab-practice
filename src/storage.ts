import { vocabulary } from './data/index'
import type { VocabularyCard } from './types'

const PROGRESS_STORAGE_KEY = 'vocab-practice-progress-v1'
const LEGACY_CARDS_STORAGE_KEY = 'vocab-practice-cards-v1'

type ReviewProgress = Pick<
  VocabularyCard,
  | 'status'
  | 'lastReviewedAt'
  | 'nextReviewAt'
  | 'reviewCount'
  | 'correctCount'
  | 'incorrectCount'
  | 'intervalDays'
>

type StoredProgress = Record<string, ReviewProgress>

function readProgress(): Partial<StoredProgress> {
  const storedProgress = localStorage.getItem(PROGRESS_STORAGE_KEY)
  if (storedProgress) {
    const parsed = JSON.parse(storedProgress) as unknown
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as Partial<StoredProgress>) : {}
  }

  const legacyCards = localStorage.getItem(LEGACY_CARDS_STORAGE_KEY)
  if (!legacyCards) return {}

  const parsed = JSON.parse(legacyCards) as unknown
  if (!Array.isArray(parsed)) return {}

  return Object.fromEntries(
    (parsed as VocabularyCard[]).map((card) => [card.id, card]),
  )
}

export function loadCards(): VocabularyCard[] {
  try {
    const progress = readProgress()

    return vocabulary.map((card) => {
      const saved = progress[card.id]
      if (!saved) return card

      return {
        ...card,
        status: saved.status ?? card.status,
        lastReviewedAt: saved.lastReviewedAt ?? card.lastReviewedAt,
        nextReviewAt: saved.nextReviewAt ?? card.nextReviewAt,
        reviewCount: saved.reviewCount ?? card.reviewCount,
        correctCount: saved.correctCount ?? card.correctCount,
        incorrectCount: saved.incorrectCount ?? card.incorrectCount,
        intervalDays: saved.intervalDays ?? card.intervalDays,
      }
    })
  } catch {
    return vocabulary
  }
}

export function saveProgress(cards: VocabularyCard[]): void {
  const progress: StoredProgress = Object.fromEntries(
    cards.map((card) => [
      card.id,
      {
        status: card.status,
        lastReviewedAt: card.lastReviewedAt,
        nextReviewAt: card.nextReviewAt,
        reviewCount: card.reviewCount,
        correctCount: card.correctCount,
        incorrectCount: card.incorrectCount,
        intervalDays: card.intervalDays,
      },
    ]),
  )

  localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress))
  localStorage.removeItem(LEGACY_CARDS_STORAGE_KEY)
}

export function resetProgress(): void {
  localStorage.removeItem(PROGRESS_STORAGE_KEY)
  localStorage.removeItem(LEGACY_CARDS_STORAGE_KEY)
}
