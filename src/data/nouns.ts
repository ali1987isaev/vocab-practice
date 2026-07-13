import type { VocabularyCard } from '../types'
import { createCard } from './helpers'

export const nouns: VocabularyCard[] = [
  createCard({
    id: 'hardship',
    term: 'hardship',
    translation: 'трудность; лишения',
    definition: 'Difficult conditions that make life hard.',
    pronunciation: '/ˈhɑːdʃɪp/',
    examples: [
      'They went through many hardships.',
      'Hardship can make people stronger.',
      'The family survived years of hardship.',
    ],
    context: 'Many successful people experienced hardship before achieving success.',
    category: 'Nouns',
    tags: ['life', 'difficulties'],
    reviewCount: 0,
    correctCount: 0,
    incorrectCount: 0,
    intervalDays: 0,
  }),
]
