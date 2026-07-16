import type { VocabularyCard } from '../types'
import { adjectives } from './adjectives'
import { adverbs } from './adverbs'
import { expressions } from './expressions'
import { idioms } from './idioms'
import { nouns } from './nouns'
import { phrasalVerbs } from './phrasal-verbs'
import { verbs } from './verbs'

export const vocabulary: VocabularyCard[] = [
  ...verbs,
  ...nouns,
  ...adjectives,
  ...adverbs,
  ...phrasalVerbs,
  ...idioms,
  ...expressions,
]
