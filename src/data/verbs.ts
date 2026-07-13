import type { VocabularyCard } from '../types'
import { createCard } from './helpers'

export const verbs: VocabularyCard[] = [
  createCard({
    id: 'suppose',
    term: 'suppose',
    translation: 'предполагать; полагать',
    definition: 'To think that something is probably true.',
    pronunciation: '/səˈpəʊz/',
    examples: [
      'I suppose you are right.',
      'What do you suppose happened?',
      'We were supposed to meet at six.',
    ],
    context: 'I suppose we should wait until Monday.',
    category: 'Verbs',
    tags: ['common', 'opinions'],
    reviewCount: 0,
    correctCount: 0,
    incorrectCount: 0,
    intervalDays: 0,
  }),
  createCard({
    id: 'quit',
    term: 'quit',
    translation: 'бросить; прекратить; уйти',
    definition: 'To stop doing something or leave a job.',
    pronunciation: '/kwɪt/',
    examples: [
      'He quit his job.',
      'I want to quit smoking.',
      'She decided to quit.',
    ],
    context: 'He quit because he found a better opportunity.',
    category: 'Verbs',
    tags: ['work', 'decisions'],
    reviewCount: 0,
    correctCount: 0,
    incorrectCount: 0,
    intervalDays: 0,
  }),
]
