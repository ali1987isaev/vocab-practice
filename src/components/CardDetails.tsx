import type { ReactNode } from 'react'
import type { VocabularyCard } from '../types'
import { getYouglishUrl } from '../youglish'

interface CardSectionProps {
  title: string
  children: ReactNode
}

export function CardSection({ title, children }: CardSectionProps) {
  return (
    <section className="card-section">
      <h3>{title}</h3>
      {children}
    </section>
  )
}

interface CardBadgeListProps {
  items: string[]
}

export function CardBadgeList({ items }: CardBadgeListProps) {
  return (
    <div className="card-badge-list">
      {items.map((item) => (
        <span key={item}>{item}</span>
      ))}
    </div>
  )
}

interface CardWordFamilyProps {
  wordFamily: NonNullable<VocabularyCard['wordFamily']>
}

const WORD_FAMILY_GROUPS = [
  ['verb', 'Verb'],
  ['noun', 'Noun'],
  ['adjective', 'Adjective'],
  ['adverb', 'Adverb'],
] as const

export function CardWordFamily({ wordFamily }: CardWordFamilyProps) {
  const groups = WORD_FAMILY_GROUPS.filter(([partOfSpeech]) => wordFamily[partOfSpeech]?.length)

  if (!groups.length) return null

  return (
    <CardSection title="Word family">
      <div className="word-family">
        {groups.map(([partOfSpeech, label]) => (
          <div key={partOfSpeech}>
            <h4>{label}</h4>
            <ul>
              {wordFamily[partOfSpeech]?.map((word) => <li key={word}>{word}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </CardSection>
  )
}

interface CardDetailsProps {
  card: VocabularyCard
  onSpeak: (text: string) => void
}

export function CardDetails({ card, onSpeak }: CardDetailsProps) {
  return (
    <div className="card-details">
      <CardSection title="Definition">
        <p className="definition">{card.definition}</p>
      </CardSection>

      {card.examples.length > 0 && (
        <CardSection title="Examples">
          <div className="examples">
            {card.examples.map((example) => (
              <button
                key={example}
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  onSpeak(example)
                }}
              >
                <span>{example}</span><span>🔊</span>
              </button>
            ))}
          </div>
          {card.context && <blockquote>{card.context}</blockquote>}
        </CardSection>
      )}

      {Boolean(card.collocations?.length) && (
        <CardSection title="Collocations">
          <ul className="card-value-list">
            {card.collocations?.map((collocation) => <li key={collocation}>{collocation}</li>)}
          </ul>
        </CardSection>
      )}

      {Boolean(card.synonyms?.length) && (
        <CardSection title="Synonyms">
          <ul className="card-value-list">
            {card.synonyms?.map((synonym) => <li key={synonym}>{synonym}</li>)}
          </ul>
        </CardSection>
      )}

      {Boolean(card.antonyms?.length) && (
        <CardSection title="Antonyms">
          <ul className="card-value-list">
            {card.antonyms?.map((antonym) => <li key={antonym}>{antonym}</li>)}
          </ul>
        </CardSection>
      )}

      {card.wordFamily && <CardWordFamily wordFamily={card.wordFamily} />}

      {Boolean(card.register?.length) && (
        <CardSection title="Register">
          <CardBadgeList items={card.register ?? []} />
        </CardSection>
      )}

      {Boolean(card.commonMistakes?.length) && (
        <CardSection title="Common mistakes">
          <div className="common-mistakes">
            {card.commonMistakes?.map((mistake) => <p key={mistake}>{mistake}</p>)}
          </div>
        </CardSection>
      )}

      {card.notes && (
        <CardSection title="Notes">
          <p className="card-notes">{card.notes}</p>
        </CardSection>
      )}

      <div className="youglish-action">
        <a
          href={getYouglishUrl(card)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Hear "${card.term}" on YouGlish`}
          onClick={(event) => event.stopPropagation()}
        >
          <span>Hear it on YouGlish</span>
          <span aria-hidden="true">↗</span>
        </a>
      </div>
    </div>
  )
}
