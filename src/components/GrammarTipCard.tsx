import type { GrammarTip } from '../data/grammar-tips'

interface GrammarTipCardProps {
  tip: GrammarTip
}

function GrammarTipExample({
  example,
  highlight,
}: {
  example: string
  highlight?: string
}) {
  const highlightIndex = highlight ? example.indexOf(highlight) : -1

  if (!highlight || highlightIndex < 0) {
    return <li className="is-key-term">{example}</li>
  }

  return (
    <li>
      {example.slice(0, highlightIndex)}
      <mark>{highlight}</mark>
      {example.slice(highlightIndex + highlight.length)}
    </li>
  )
}

export function GrammarTipCard({ tip }: GrammarTipCardProps) {
  return (
    <article className="grammar-tip-card">
      <p className="eyebrow light">ENGLISH BASICS</p>
      <h2>{tip.topic}</h2>
      <p className="grammar-tip-definition">{tip.definition}</p>
      <div className="grammar-tip-examples">
        <span>Examples</span>
        <ul>
          {tip.examples.map((example) => (
            <GrammarTipExample
              key={example}
              example={example}
              highlight={tip.highlights?.[example]}
            />
          ))}
        </ul>
      </div>
    </article>
  )
}
