import type { VocabularyCard } from './types'

export type YouglishAccent = 'us' | 'uk' | 'au' | 'ca' | 'ie'

export const DEFAULT_YOUGLISH_ACCENT: YouglishAccent = 'ie'

type YouglishCard = Pick<VocabularyCard, 'term' | 'youglishQuery'>

export function getYouglishUrl(
  card: YouglishCard,
  accent: YouglishAccent = DEFAULT_YOUGLISH_ACCENT,
): string {
  const query =
    card.youglishQuery
    ?? card.term
      .trim()
      .toLowerCase()
      .replace(/[’']/g, '')
      .replace(/\s+/g, '_')

  return `https://youglish.com/pronounce/${encodeURIComponent(query)}/english/${accent}`
}
