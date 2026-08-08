import type { VocabularyCard } from '../types'
import { createCard } from './helpers'

export const expressions: VocabularyCard[] = [
  createCard({
    id: 'take-into-consideration',
    term: 'take something into consideration',
    translation: 'принимать что-либо во внимание; учитывать',
    definition:
      'To think carefully about a fact or circumstance when making a decision or forming an opinion.',
    pronunciation: '/teɪk ˈsʌmθɪŋ ˌɪntə kənˌsɪdəˈreɪʃən/',
    youglishQuery: 'taking into consideration',
    level: 'B2',
    examples: [
      'They are taking the cost into consideration.',
      'We will take your experience into consideration.',
      'Taking all the evidence into consideration, the court reached a decision.',
      'Several factors must be taken into consideration.',
    ],
    collocations: [
      'take something into consideration',
      'take all factors into consideration',
      'be taken into consideration',
      'taking everything into consideration',
    ],
    synonyms: ['consider', 'take into account', 'bear in mind'],
    antonyms: ['ignore', 'disregard', 'overlook'],
    wordFamily: {
      noun: ['consideration'],
      verb: ['consider'],
      adjective: ['considerate', 'considered'],
    },
    register: ['spoken', 'written', 'formal'],
    commonMistakes: [
      'Name the thing being considered: "They are taking the cost into consideration."',
      '"Take into consideration" and "take into account" have the same basic meaning.',
      'Do not confuse "considerate" (thoughtful toward others) with "considerable" (large or important).',
    ],
    context: 'They are taking public safety into consideration before approving the event.',
    category: 'Expressions',
    tags: ['decisions', 'thinking', 'formal', 'common'],
    reviewCount: 0,
    correctCount: 0,
    incorrectCount: 0,
    intervalDays: 0,
  }),
]
