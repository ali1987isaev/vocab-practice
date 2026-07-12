import { useEffect, useMemo, useRef, useState } from 'react'
import { applyReview, isDue } from './review'
import { speak } from './speech'
import { exportCards, importCards, loadCards, saveCards } from './storage'
import type { ReviewRating, VocabularyCard } from './types'

type View = 'today' | 'practice' | 'words' | 'settings'

type CardDraft = Pick<VocabularyCard, 'term' | 'translation' | 'definition' | 'pronunciation' | 'examples' | 'context' | 'notes' | 'category'>

const emptyDraft: CardDraft = {
  term: '',
  translation: '',
  definition: '',
  pronunciation: '',
  examples: [''],
  context: '',
  notes: '',
  category: 'Phrasal verbs',
}

function createCard(draft: CardDraft): VocabularyCard {
  const id = `${draft.term.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${Date.now()}`

  return {
    ...draft,
    id,
    examples: draft.examples.map((example) => example.trim()).filter(Boolean),
    status: 'new',
    createdAt: new Date().toISOString(),
    reviewCount: 0,
    correctCount: 0,
    incorrectCount: 0,
    intervalDays: 0,
  }
}

function IconButton({ label, children, onClick }: { label: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <button className="icon-button" type="button" aria-label={label} onClick={onClick}>
      {children}
    </button>
  )
}

export default function App() {
  const [cards, setCards] = useState<VocabularyCard[]>(loadCards)
  const [view, setView] = useState<View>('today')
  const [sessionIds, setSessionIds] = useState<string[]>([])
  const [sessionIndex, setSessionIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<CardDraft>(emptyDraft)
  const [query, setQuery] = useState('')
  const [message, setMessage] = useState('')
  const importInput = useRef<HTMLInputElement>(null)

  useEffect(() => saveCards(cards), [cards])

  const dueCards = useMemo(() => cards.filter(isDue), [cards])
  const currentCard = cards.find((card) => card.id === sessionIds[sessionIndex])
  const progress = sessionIds.length ? Math.round((sessionIndex / sessionIds.length) * 100) : 0

  const filteredCards = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return cards
    return cards.filter((card) =>
      [card.term, card.translation, card.definition, card.category, ...(card.tags ?? [])]
        .join(' ')
        .toLowerCase()
        .includes(normalized),
    )
  }, [cards, query])

  function startPractice() {
    const due = dueCards.length ? dueCards : cards.filter((card) => card.status !== 'paused')
    setSessionIds(due.map((card) => card.id))
    setSessionIndex(0)
    setRevealed(false)
    setView('practice')
  }

  function rateCard(rating: ReviewRating) {
    if (!currentCard) return
    setCards((current) => current.map((card) => (card.id === currentCard.id ? applyReview(card, rating) : card)))

    if (rating === 'again') {
      setSessionIds((current) => [...current, currentCard.id])
    }

    setRevealed(false)
    setSessionIndex((current) => current + 1)
  }

  function openAddForm() {
    setEditingId(null)
    setDraft(emptyDraft)
    setShowForm(true)
  }

  function openEditForm(card: VocabularyCard) {
    setEditingId(card.id)
    setDraft({
      term: card.term,
      translation: card.translation,
      definition: card.definition,
      pronunciation: card.pronunciation ?? '',
      examples: card.examples.length ? card.examples : [''],
      context: card.context ?? '',
      notes: card.notes ?? '',
      category: card.category ?? '',
    })
    setShowForm(true)
  }

  function saveDraft(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!draft.term.trim() || !draft.translation.trim()) return

    if (editingId) {
      setCards((current) =>
        current.map((card) =>
          card.id === editingId
            ? { ...card, ...draft, examples: draft.examples.map((example) => example.trim()).filter(Boolean) }
            : card,
        ),
      )
    } else {
      setCards((current) => [createCard(draft), ...current])
    }

    setShowForm(false)
    setEditingId(null)
    setDraft(emptyDraft)
    setMessage(editingId ? 'Card updated.' : 'New card added.')
  }

  function removeCard(id: string) {
    if (!window.confirm('Delete this card?')) return
    setCards((current) => current.filter((card) => card.id !== id))
  }

  async function handleImport(file: File | undefined) {
    if (!file) return
    try {
      const imported = await importCards(file)
      setCards(imported)
      setMessage(`Imported ${imported.length} cards.`)
    } catch {
      setMessage('Could not import this file.')
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">VOCAB PRACTICE</p>
          <h1>{view === 'today' ? 'Today' : view === 'practice' ? 'Practice' : view === 'words' ? 'Learning words' : 'Settings'}</h1>
        </div>
        {view !== 'practice' && <IconButton label="Add a new word" onClick={openAddForm}>＋</IconButton>}
      </header>

      <main>
        {message && (
          <button className="toast" type="button" onClick={() => setMessage('')}>
            {message}
          </button>
        )}

        {view === 'today' && (
          <section className="stack">
            <article className="hero-card">
              <div className="hero-ring">
                <strong>{dueCards.length}</strong>
                <span>due</span>
              </div>
              <div>
                <p className="eyebrow light">DAILY SESSION</p>
                <h2>Keep your active vocabulary moving.</h2>
                <p>{cards.filter((card) => card.status === 'new').length} new · {cards.filter((card) => card.status !== 'new').length} in review</p>
              </div>
              <button className="primary-button light-button" type="button" onClick={startPractice} disabled={!cards.length}>
                Start practice →
              </button>
            </article>

            <div className="section-heading">
              <div>
                <p className="eyebrow">QUICK REVIEW</p>
                <h2>Words you are learning</h2>
              </div>
              <button className="text-button" type="button" onClick={() => setView('words')}>See all</button>
            </div>

            <div className="preview-list">
              {cards.slice(0, 4).map((card) => (
                <button className="preview-card" type="button" key={card.id} onClick={() => openEditForm(card)}>
                  <span className={`status-dot status-${card.status}`} />
                  <span>
                    <strong>{card.term}</strong>
                    <small>{card.translation}</small>
                  </span>
                  <span aria-hidden="true">›</span>
                </button>
              ))}
            </div>

            <article className="context-card">
              <p className="eyebrow light">CONTEXT PRACTICE</p>
              <p>
                Yesterday I had to <mark>push back</mark> a meeting because I was trying to <mark>figure out</mark> why my computer wasn’t working. I couldn’t <mark>put up with</mark> it anymore, so I <mark>went along with</mark> another idea.
              </p>
              <IconButton label="Listen to the context" onClick={() => speak("Yesterday I had to push back a meeting because I was trying to figure out why my computer wasn't working. I couldn't put up with it anymore, so I went along with another idea.")}>🔊</IconButton>
            </article>
          </section>
        )}

        {view === 'practice' && (
          <section className="practice-screen">
            {!currentCard ? (
              <article className="complete-card">
                <div className="complete-icon">✓</div>
                <p className="eyebrow">SESSION COMPLETE</p>
                <h2>Good work.</h2>
                <p>You reviewed {sessionIds.length} cards. Come back when more cards are due.</p>
                <button className="primary-button" type="button" onClick={() => setView('today')}>Back to today</button>
              </article>
            ) : (
              <>
                <div className="progress-row">
                  <button className="close-button" type="button" onClick={() => setView('today')}>×</button>
                  <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
                  <span>{sessionIndex + 1}/{sessionIds.length}</span>
                </div>

                <article className={`practice-card ${revealed ? 'is-revealed' : ''}`} onClick={() => setRevealed(true)}>
                  <p className="eyebrow">{currentCard.category ?? 'VOCABULARY'}</p>
                  <div className="word-heading">
                    <h2>{currentCard.term}</h2>
                    <IconButton label="Listen to pronunciation" onClick={() => speak(currentCard.term)}>🔊</IconButton>
                  </div>
                  {currentCard.pronunciation && <p className="pronunciation">{currentCard.pronunciation}</p>}

                  {!revealed ? (
                    <div className="reveal-hint">
                      <span>Think of the meaning and an example.</span>
                      <button className="primary-button" type="button" onClick={() => setRevealed(true)}>Reveal answer</button>
                    </div>
                  ) : (
                    <div className="answer-content">
                      <p className="translation">{currentCard.translation}</p>
                      <p className="definition">{currentCard.definition}</p>
                      <div className="examples">
                        {currentCard.examples.map((example) => (
                          <button key={example} type="button" onClick={(event) => { event.stopPropagation(); speak(example) }}>
                            <span>{example}</span><span>🔊</span>
                          </button>
                        ))}
                      </div>
                      {currentCard.context && (
                        <blockquote>{currentCard.context}</blockquote>
                      )}
                    </div>
                  )}
                </article>

                {revealed && (
                  <div className="rating-grid">
                    <button type="button" className="rating again" onClick={() => rateCard('again')}><strong>Again</strong><small>10 min</small></button>
                    <button type="button" className="rating hard" onClick={() => rateCard('hard')}><strong>Hard</strong><small>1 day</small></button>
                    <button type="button" className="rating good" onClick={() => rateCard('good')}><strong>Good</strong><small>3 days</small></button>
                    <button type="button" className="rating easy" onClick={() => rateCard('easy')}><strong>Easy</strong><small>7 days</small></button>
                  </div>
                )}
              </>
            )}
          </section>
        )}

        {view === 'words' && (
          <section className="stack">
            <label className="search-box">
              <span>⌕</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search your learning words" />
            </label>

            <div className="stats-row">
              <div><strong>{cards.length}</strong><span>Total</span></div>
              <div><strong>{cards.filter((card) => card.status === 'new').length}</strong><span>New</span></div>
              <div><strong>{cards.filter((card) => card.status === 'mastered').length}</strong><span>Mastered</span></div>
            </div>

            <div className="word-list">
              {filteredCards.map((card) => (
                <article className="word-row" key={card.id}>
                  <button className="word-main" type="button" onClick={() => openEditForm(card)}>
                    <span>
                      <strong>{card.term}</strong>
                      <small>{card.translation}</small>
                    </span>
                    <span className={`status-pill status-${card.status}`}>{card.status}</span>
                  </button>
                  <IconButton label={`Listen to ${card.term}`} onClick={() => speak(card.term)}>🔊</IconButton>
                  <IconButton label={`Delete ${card.term}`} onClick={() => removeCard(card.id)}>⋯</IconButton>
                </article>
              ))}
            </div>
          </section>
        )}

        {view === 'settings' && (
          <section className="stack">
            <article className="settings-card">
              <h2>Backup</h2>
              <p>Your progress is stored on this device. Export a JSON backup before clearing browser data or changing phones.</p>
              <div className="button-row">
                <button className="primary-button" type="button" onClick={() => exportCards(cards)}>Export JSON</button>
                <button className="secondary-button" type="button" onClick={() => importInput.current?.click()}>Import JSON</button>
                <input ref={importInput} type="file" accept="application/json" hidden onChange={(event) => handleImport(event.target.files?.[0])} />
              </div>
            </article>

            <article className="settings-card">
              <h2>Pronunciation</h2>
              <p>The app uses the English voice installed on your phone through the browser Web Speech API.</p>
              <button className="secondary-button" type="button" onClick={() => speak('Figure out. I finally figured out how to use this app.')}>Test voice</button>
            </article>

            <article className="settings-card warning-card">
              <h2>Reset progress</h2>
              <p>This restores the original five starter cards.</p>
              <button className="danger-button" type="button" onClick={() => {
                localStorage.clear()
                window.location.reload()
              }}>Reset application</button>
            </article>
          </section>
        )}
      </main>

      {view !== 'practice' && (
        <nav className="bottom-nav" aria-label="Main navigation">
          <button className={view === 'today' ? 'active' : ''} type="button" onClick={() => setView('today')}><span>⌂</span><small>Today</small></button>
          <button type="button" onClick={startPractice}><span>▶</span><small>Practice</small></button>
          <button className={view === 'words' ? 'active' : ''} type="button" onClick={() => setView('words')}><span>▤</span><small>Words</small></button>
          <button className={view === 'settings' ? 'active' : ''} type="button" onClick={() => setView('settings')}><span>⚙</span><small>Settings</small></button>
        </nav>
      )}

      {showForm && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setShowForm(false)}>
          <form className="word-form" onSubmit={saveDraft} onMouseDown={(event) => event.stopPropagation()}>
            <div className="form-heading">
              <div><p className="eyebrow">VOCABULARY CARD</p><h2>{editingId ? 'Edit word' : 'Add a word'}</h2></div>
              <button type="button" className="close-button" onClick={() => setShowForm(false)}>×</button>
            </div>

            <label>Phrase<input required value={draft.term} onChange={(event) => setDraft({ ...draft, term: event.target.value })} placeholder="figure out" /></label>
            <label>Translation<input required value={draft.translation} onChange={(event) => setDraft({ ...draft, translation: event.target.value })} placeholder="разобраться; понять" /></label>
            <label>Simple English definition<textarea value={draft.definition} onChange={(event) => setDraft({ ...draft, definition: event.target.value })} placeholder="To understand something or find the answer." /></label>
            <label>Pronunciation<input value={draft.pronunciation} onChange={(event) => setDraft({ ...draft, pronunciation: event.target.value })} placeholder="/ˈfɪɡər aʊt/" /></label>
            <label>Examples<textarea value={draft.examples.join('\n')} onChange={(event) => setDraft({ ...draft, examples: event.target.value.split('\n') })} placeholder={'One example per line\nCan you figure out what is wrong?'} /></label>
            <label>Personal context<textarea value={draft.context} onChange={(event) => setDraft({ ...draft, context: event.target.value })} placeholder="Use the phrase in a sentence connected to your life." /></label>
            <label>Notes<textarea value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} placeholder="Usage notes, grammar, common combinations..." /></label>
            <label>Category<input value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })} /></label>

            <button className="primary-button full-width" type="submit">Save card</button>
          </form>
        </div>
      )}
    </div>
  )
}
