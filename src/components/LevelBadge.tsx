import type { VocabularyCard } from '../types'

interface LevelBadgeProps {
  level: VocabularyCard['level']
}

export function LevelBadge({ level }: LevelBadgeProps) {
  return <span className="level-badge">{level}</span>
}
