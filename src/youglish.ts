import type { VocabularyCard } from './types'

export type YouglishAccent = 'us' | 'uk' | 'au' | 'ca' | 'ie'

export const DEFAULT_YOUGLISH_ACCENT: YouglishAccent = 'ie'

type YouglishCard = Pick<VocabularyCard, 'term' | 'youglishQuery'>

function getSearchTerm(card: YouglishCard): string {
  if (card.youglishQuery) return card.youglishQuery

  return card.term
    .split('/')[0]
    .replace(/\s*\([^)]*\)\s*/g, ' ')
}

export function getYouglishUrl(
  card: YouglishCard,
  accent: YouglishAccent = DEFAULT_YOUGLISH_ACCENT,
): string {
  const query = getSearchTerm(card)
    .trim()
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/\s+/g, '_')

  return `https://youglish.com/pronounce/${encodeURIComponent(query)}/english/${accent}`
}
