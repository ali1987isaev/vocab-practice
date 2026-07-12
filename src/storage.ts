import { starterCards } from './data'
import type { VocabularyCard } from './types'

const STORAGE_KEY = 'vocab-practice-cards-v1'

export function loadCards(): VocabularyCard[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return starterCards

    const parsed = JSON.parse(stored) as VocabularyCard[]
    return Array.isArray(parsed) ? parsed : starterCards
  } catch {
    return starterCards
  }
}

export function saveCards(cards: VocabularyCard[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards))
}

export function exportCards(cards: VocabularyCard[]): void {
  const blob = new Blob([JSON.stringify(cards, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `vocab-practice-${new Date().toISOString().slice(0, 10)}.json`
  link.click()
  URL.revokeObjectURL(url)
}

export async function importCards(file: File): Promise<VocabularyCard[]> {
  const text = await file.text()
  const parsed = JSON.parse(text) as VocabularyCard[]
  if (!Array.isArray(parsed)) throw new Error('Invalid backup file.')
  return parsed
}
