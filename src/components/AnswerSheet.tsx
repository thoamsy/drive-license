import { cn } from '@/lib/utils'
import type { Question } from '@/types/question'

interface AnswerSheetProps {
  questions: Question[]
  answers: Record<string, string>
  currentIndex: number
  onSelect: (index: number) => void
}

export function AnswerSheet({ questions, answers, currentIndex, onSelect }: AnswerSheetProps) {
  return (
    <div className="p-4">
      <h3 className="text-sm font-medium mb-3">
        答题卡 — 已答 {Object.keys(answers).length}/{questions.length}
      </h3>
      <div className="grid grid-cols-8 gap-2">
        {questions.map((q, index) => {
          const answered = !!answers[q.id]
          const isCurrent = index === currentIndex
          return (
            <button
              key={q.id}
              onClick={() => onSelect(index)}
              className={cn(
                'aspect-square flex items-center justify-center rounded text-xs font-medium border transition-colors',
                isCurrent && 'ring-2 ring-primary',
                answered
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-muted-foreground border-border'
              )}
            >
              {index + 1}
            </button>
          )
        })}
      </div>
    </div>
  )
}
