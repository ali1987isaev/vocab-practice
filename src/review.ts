import type { ReviewRating, VocabularyCard } from './types'

const DAY = 86_400_000

export function isDue(card: VocabularyCard): boolean {
  if (card.status === 'paused') return false
  if (!card.nextReviewAt) return true
  return new Date(card.nextReviewAt).getTime() <= Date.now()
}

export function applyReview(card: VocabularyCard, rating: ReviewRating): VocabularyCard {
  const now = new Date()
  let intervalDays = card.intervalDays

  if (rating === 'again') intervalDays = 0
  if (rating === 'hard') intervalDays = Math.max(1, Math.round(intervalDays * 1.2) || 1)
  if (rating === 'good') intervalDays = Math.max(3, Math.round(intervalDays * 2) || 3)
  if (rating === 'easy') intervalDays = Math.max(7, Math.round(intervalDays * 3) || 7)

  const nextReviewAt = new Date(now.getTime() + (rating === 'again' ? 10 * 60_000 : intervalDays * DAY))
  const reviewCount = card.reviewCount + 1
  const correct = rating !== 'again'
  const status = reviewCount >= 8 && intervalDays >= 30 ? 'mastered' : reviewCount > 1 ? 'review' : 'learning'

  return {
    ...card,
    status,
    lastReviewedAt: now.toISOString(),
    nextReviewAt: nextReviewAt.toISOString(),
    reviewCount,
    correctCount: card.correctCount + (correct ? 1 : 0),
    incorrectCount: card.incorrectCount + (correct ? 0 : 1),
    intervalDays,
  }
}
