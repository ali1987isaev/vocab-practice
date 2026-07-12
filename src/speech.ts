export function speak(text: string, rate = 0.9): void {
  if (!('speechSynthesis' in window)) return

  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-GB'
  utterance.rate = rate
  window.speechSynthesis.speak(utterance)
}
