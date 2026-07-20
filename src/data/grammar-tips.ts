export interface GrammarTip {
  topic: string
  definition: string
  examples: string[]
  highlights?: Record<string, string>
}

export const grammarTips: GrammarTip[] = [
  {
    topic: 'Noun',
    definition: 'A word that names a person, place, thing, or idea.',
    examples: ['teacher', 'London', 'book', 'freedom'],
  },
  {
    topic: 'Countable and uncountable nouns',
    definition:
      'Countable nouns can be numbered; uncountable nouns are treated as a mass or idea.',
    examples: ['two books', 'some information'],
  },
  {
    topic: 'Verb',
    definition: 'A word that describes an action, event, or state.',
    examples: ['run', 'think', 'be', 'survive'],
  },
  {
    topic: 'Adjective',
    definition: 'A word that describes or gives more information about a noun.',
    examples: ['beautiful', 'relevant', 'difficult'],
  },
  {
    topic: 'Adverb',
    definition:
      'A word that describes a verb, adjective, or another adverb, often explaining how, when, where, or to what degree.',
    examples: ['quickly', 'intentionally', 'especially'],
  },
  {
    topic: 'Pronoun',
    definition: 'A word used instead of a noun.',
    examples: ['I', 'you', 'he', 'she', 'it', 'they'],
  },
  {
    topic: 'Preposition',
    definition:
      'A word that shows the relationship between things, often related to place, time, or direction.',
    examples: ['in', 'on', 'at', 'under', 'between'],
  },
  {
    topic: 'Conjunction',
    definition: 'A word used to connect words, phrases, or clauses.',
    examples: ['and', 'but', 'because', 'although'],
  },
  {
    topic: 'Article',
    definition:
      'Words used before nouns to show whether we mean something specific or general.',
    examples: ['a', 'an', 'the'],
  },
  {
    topic: 'Gerund',
    definition: 'The -ing form of a verb used as a noun.',
    examples: ['Learning English takes time.'],
    highlights: {
      'Learning English takes time.': 'Learning',
    },
  },
  {
    topic: 'Infinitive',
    definition: 'The base form of a verb usually used with "to".',
    examples: ['I want to learn English.'],
    highlights: {
      'I want to learn English.': 'to learn',
    },
  },
  {
    topic: 'Present Perfect',
    definition:
      'A tense using have or has with a past participle for past actions connected to now.',
    examples: ['I have finished my work.', 'She has lived here for five years.'],
    highlights: {
      'I have finished my work.': 'have finished',
      'She has lived here for five years.': 'has lived',
    },
  },
  {
    topic: 'Conditionals',
    definition:
      'Sentences with "if" that describe a condition and its result.',
    examples: [
      'If it rains, we will stay home.',
      'If I had more time, I would travel.',
    ],
    highlights: {
      'If it rains, we will stay home.': 'If it rains',
      'If I had more time, I would travel.': 'If I had more time',
    },
  },
  {
    topic: 'Modal verbs',
    definition:
      'Helping verbs that express ability, possibility, permission, or obligation.',
    examples: ['You should practise every day.', 'She can speak French.'],
    highlights: {
      'You should practise every day.': 'should',
      'She can speak French.': 'can',
    },
  },
  {
    topic: 'Word order',
    definition:
      'English statements usually follow subject + verb + object.',
    examples: ['She reads books.', 'They speak English at work.'],
  },
  {
    topic: 'Collocations',
    definition:
      'Words that native speakers commonly use together.',
    examples: ['make an effort', 'heavy rain', 'express concern'],
  },
  {
    topic: 'Prefixes and suffixes',
    definition:
      'Letters added to the beginning or end of a word to change its meaning or form.',
    examples: ['unhappy', 'careful'],
    highlights: {
      unhappy: 'un',
      careful: 'ful',
    },
  },
  {
    topic: 'Phrasal verb',
    definition:
      'A verb combined with another word that creates a new meaning.',
    examples: ['give up', 'figure out', 'put up with'],
  },
  {
    topic: 'Idiom',
    definition:
      'A fixed expression whose meaning is different from the literal meaning of its individual words.',
    examples: ['break the ice'],
  },
]

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000

export function getDailyGrammarTip(date = new Date()): GrammarTip {
  const localCalendarDay = Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  )
  const dayNumber = Math.floor(localCalendarDay / MILLISECONDS_PER_DAY)

  return grammarTips[dayNumber % grammarTips.length]
}
