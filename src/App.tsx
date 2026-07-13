import { useEffect, useMemo, useState } from 'react'
import { applyReview, isDue } from './review'
import {
  DEFAULT_SPEECH_SETTINGS,
  isSpeechSupported,
  loadSpeechSettings,
  saveSpeechSettings,
  speak,
} from './speech'
import { loadCards, resetProgress, saveProgress } from './storage'
import type { ReviewRating, VocabularyCard } from './types'
import { CardDetails } from './components/CardDetails'

type View = 'today' | 'practice' | 'words' | 'settings'

const LANGUAGE_OPTIONS = [
  { value: 'en-GB', label: 'English (UK)' },
  { value: 'en-US', label: 'English (US)' },
  { value: 'en-IE', label: 'English (Ireland)' },
  { value: 'en-AU', label: 'English (Australia)' },
  { value: 'en-CA', label: 'English (Canada)' },
]

function getVoiceLabel(voice: SpeechSynthesisVoice): string {
  const language = LANGUAGE_OPTIONS.find(
    (option) => option.value.toLowerCase() === voice.lang.toLowerCase(),
  )?.label ?? voice.lang
  const service = voice.localService ? 'local' : 'remote'
  const defaultLabel = voice.default ? ' — default' : ''

  return `${voice.name} — ${language} — ${voice.lang} — ${service}${defaultLabel}`
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
  const [query, setQuery] = useState('')
  const [speechSettings, setSpeechSettings] = useState(loadSpeechSettings)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const speechSupported = isSpeechSupported()

  useEffect(() => saveProgress(cards), [cards])
  useEffect(() => saveSpeechSettings(speechSettings), [speechSettings])

  useEffect(() => {
    if (!speechSupported) return

    const synthesis = window.speechSynthesis
    const loadVoices = () => {
      setVoices(
        synthesis.getVoices().filter((voice) => voice.lang.toLowerCase().startsWith('en')),
      )
    }

    loadVoices()
    synthesis.addEventListener('voiceschanged', loadVoices)
    return () => synthesis.removeEventListener('voiceschanged', loadVoices)
  }, [speechSupported])

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

  const localeVoices = useMemo(
    () => voices.filter((voice) => voice.lang.toLowerCase() === speechSettings.lang.toLowerCase()),
    [speechSettings.lang, voices],
  )
  const otherEnglishVoices = useMemo(
    () => voices.filter((voice) => voice.lang.toLowerCase() !== speechSettings.lang.toLowerCase()),
    [speechSettings.lang, voices],
  )
  const selectedVoiceIsUnavailable = Boolean(
    speechSettings.voiceURI && !voices.some((voice) => voice.voiceURI === speechSettings.voiceURI),
  )
  const selectedLanguageLabel = LANGUAGE_OPTIONS.find(
    (language) => language.value === speechSettings.lang,
  )?.label ?? speechSettings.lang

  function speakText(text: string) {
    speak(text, speechSettings, voices)
  }

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

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">VOCAB PRACTICE</p>
          <h1>{view === 'today' ? 'Today' : view === 'practice' ? 'Practice' : view === 'words' ? 'Learning words' : 'Settings'}</h1>
        </div>
      </header>

      <main>
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
                <article className="preview-card" key={card.id}>
                  <span className={`status-dot status-${card.status}`} />
                  <span>
                    <strong>{card.term}</strong>
                    <small>{card.translation}</small>
                  </span>
                </article>
              ))}
            </div>

            <article className="context-card">
              <p className="eyebrow light">CONTEXT PRACTICE</p>
              <p>
                Yesterday I had to <mark>push back</mark> a meeting because I was trying to <mark>figure out</mark> why my computer wasn’t working. I couldn’t <mark>put up with</mark> it anymore, so I <mark>went along with</mark> another idea.
              </p>
              <IconButton label="Listen to the context" onClick={() => speakText("Yesterday I had to push back a meeting because I was trying to figure out why my computer wasn't working. I couldn't put up with it anymore, so I went along with another idea.")}>🔊</IconButton>
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
                    <IconButton label="Listen to pronunciation" onClick={() => speakText(currentCard.term)}>🔊</IconButton>
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
                      <CardDetails card={currentCard} onSpeak={speakText} />
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
                  <div className="word-main">
                    <span>
                      <strong>{card.term}</strong>
                      <small>{card.translation}</small>
                    </span>
                    <span className={`status-pill status-${card.status}`}>{card.status}</span>
                  </div>
                  <IconButton label={`Listen to ${card.term}`} onClick={() => speakText(card.term)}>🔊</IconButton>
                </article>
              ))}
            </div>
          </section>
        )}

        {view === 'settings' && (
          <section className="stack">
            <article className="settings-card">
              <h2>Voice &amp; pronunciation</h2>
              <p>Choose how the browser reads words, examples, and context sentences.</p>

              {!speechSupported && (
                <p className="speech-warning">Speech synthesis is not supported by this browser.</p>
              )}

              <fieldset className="speech-controls" disabled={!speechSupported}>
                <label>
                  <span>Voice</span>
                  <select
                    value={speechSettings.voiceURI}
                    onChange={(event) => setSpeechSettings((current) => ({
                      ...current,
                      voiceURI: event.target.value,
                    }))}
                  >
                    <option value="">Automatic — {selectedLanguageLabel}</option>
                    {selectedVoiceIsUnavailable && (
                      <option value={speechSettings.voiceURI}>Unavailable voice — automatic fallback</option>
                    )}
                    {localeVoices.length > 0 && (
                      <optgroup label={`Selected accent — ${speechSettings.lang}`}>
                        {localeVoices.map((voice) => (
                          <option key={voice.voiceURI} value={voice.voiceURI}>{getVoiceLabel(voice)}</option>
                        ))}
                      </optgroup>
                    )}
                    {otherEnglishVoices.length > 0 && (
                      <optgroup label="Other English voices">
                        {otherEnglishVoices.map((voice) => (
                          <option key={voice.voiceURI} value={voice.voiceURI}>{getVoiceLabel(voice)}</option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </label>

                <label>
                  <span>Accent / language</span>
                  <select
                    value={speechSettings.lang}
                    onChange={(event) => setSpeechSettings((current) => ({
                      ...current,
                      lang: event.target.value,
                      voiceURI: '',
                    }))}
                  >
                    {LANGUAGE_OPTIONS.map((language) => (
                      <option key={language.value} value={language.value}>
                        {language.label} — {language.value}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span className="control-heading"><span>Speed</span><output>{speechSettings.rate.toFixed(2)}×</output></span>
                  <input
                    type="range"
                    min={0.5}
                    max={1.5}
                    step={0.05}
                    value={speechSettings.rate}
                    onChange={(event) => setSpeechSettings((current) => ({
                      ...current,
                      rate: Number(event.target.value),
                    }))}
                  />
                </label>

                <label>
                  <span className="control-heading"><span>Pitch / intonation</span><output>{speechSettings.pitch.toFixed(2)}</output></span>
                  <input
                    type="range"
                    min={0.5}
                    max={1.5}
                    step={0.05}
                    value={speechSettings.pitch}
                    onChange={(event) => setSpeechSettings((current) => ({
                      ...current,
                      pitch: Number(event.target.value),
                    }))}
                  />
                  <small>This adjusts voice pitch, not natural human emotional intonation.</small>
                </label>

                <label>
                  <span className="control-heading"><span>Volume</span><output>{Math.round(speechSettings.volume * 100)}%</output></span>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={speechSettings.volume}
                    onChange={(event) => setSpeechSettings((current) => ({
                      ...current,
                      volume: Number(event.target.value),
                    }))}
                  />
                </label>

                <div className="settings-actions">
                  <button className="primary-button" type="button" onClick={() => speakText('Suppose we try a different voice and speaking speed.')}>Test voice</button>
                  <button className="secondary-button" type="button" onClick={() => setSpeechSettings({ ...DEFAULT_SPEECH_SETTINGS })}>Reset voice settings</button>
                </div>
              </fieldset>
            </article>

            <article className="settings-card warning-card">
              <h2>Reset progress</h2>
              <p>This clears your local learning progress. The vocabulary in the source files is unchanged.</p>
              <button className="danger-button" type="button" onClick={() => {
                resetProgress()
                window.location.reload()
              }}>Reset progress</button>
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

    </div>
  )
}
