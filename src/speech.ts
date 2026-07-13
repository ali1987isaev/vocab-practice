export interface SpeechSettings {
  voiceURI: string
  lang: string
  rate: number
  pitch: number
  volume: number
}

export const DEFAULT_SPEECH_SETTINGS: SpeechSettings = {
  voiceURI: '',
  lang: 'en-GB',
  rate: 0.9,
  pitch: 1,
  volume: 1,
}

const SPEECH_SETTINGS_STORAGE_KEY = 'vocab-practice:speech-settings'

function clamp(value: unknown, fallback: number, min: number, max: number): number {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.min(max, Math.max(min, value))
    : fallback
}

function normalizeSpeechSettings(settings: Partial<SpeechSettings>): SpeechSettings {
  return {
    voiceURI: typeof settings.voiceURI === 'string' ? settings.voiceURI : DEFAULT_SPEECH_SETTINGS.voiceURI,
    lang: typeof settings.lang === 'string' && settings.lang ? settings.lang : DEFAULT_SPEECH_SETTINGS.lang,
    rate: clamp(settings.rate, DEFAULT_SPEECH_SETTINGS.rate, 0.5, 1.5),
    pitch: clamp(settings.pitch, DEFAULT_SPEECH_SETTINGS.pitch, 0.5, 1.5),
    volume: clamp(settings.volume, DEFAULT_SPEECH_SETTINGS.volume, 0, 1),
  }
}

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined'
    && 'speechSynthesis' in window
    && 'SpeechSynthesisUtterance' in window
}

export function loadSpeechSettings(): SpeechSettings {
  try {
    const stored = localStorage.getItem(SPEECH_SETTINGS_STORAGE_KEY)
    if (!stored) return { ...DEFAULT_SPEECH_SETTINGS }

    const parsed = JSON.parse(stored) as unknown
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { ...DEFAULT_SPEECH_SETTINGS }
    }

    return normalizeSpeechSettings({
      ...DEFAULT_SPEECH_SETTINGS,
      ...(parsed as Partial<SpeechSettings>),
    })
  } catch {
    return { ...DEFAULT_SPEECH_SETTINGS }
  }
}

export function saveSpeechSettings(settings: SpeechSettings): void {
  try {
    localStorage.setItem(SPEECH_SETTINGS_STORAGE_KEY, JSON.stringify(normalizeSpeechSettings(settings)))
  } catch {
    // The app remains usable when browser storage is unavailable.
  }
}

function resolveVoice(
  settings: SpeechSettings,
  voices: SpeechSynthesisVoice[],
): SpeechSynthesisVoice | undefined {
  const selectedVoice = voices.find((voice) => voice.voiceURI === settings.voiceURI)
  if (selectedVoice) return selectedVoice

  const selectedLanguage = settings.lang.toLowerCase()
  return voices.find((voice) => voice.lang.toLowerCase() === selectedLanguage)
    ?? voices.find((voice) => voice.lang.toLowerCase() === 'en-gb')
    ?? voices.find((voice) => voice.lang.toLowerCase().startsWith('en'))
}

export function speak(
  text: string,
  settings: SpeechSettings,
  voices: SpeechSynthesisVoice[],
): void {
  if (!isSpeechSupported()) return

  const normalizedSettings = normalizeSpeechSettings(settings)
  const resolvedVoice = resolveVoice(normalizedSettings, voices)
  const utterance = new SpeechSynthesisUtterance(text)

  utterance.voice = resolvedVoice ?? null
  utterance.lang = resolvedVoice?.lang ?? normalizedSettings.lang
  utterance.rate = normalizedSettings.rate
  utterance.pitch = normalizedSettings.pitch
  utterance.volume = normalizedSettings.volume

  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(utterance)
}
