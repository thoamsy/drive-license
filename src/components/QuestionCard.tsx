import { CheckCircle2, Heart, XCircle } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { db } from '@/db'
import type { Question } from '@/types/question'

interface QuestionCardProps {
  question: Question
  selectedAnswer: string | null
  isAnswered: boolean
  onSelect: (key: string) => void
  currentIndex: number
  total: number
}

export function QuestionCard({
  question,
  selectedAnswer,
  isAnswered,
  onSelect,
  currentIndex,
  total,
}: QuestionCardProps) {
  const isFavorite = useLiveQuery(async () => {
    const fav = await db.favorites
      .where('questionId')
      .equals(question.id)
      .first()
    return !!fav
  }, [question.id])

  const toggleFavorite = async () => {
    const existing = await db.favorites.where('questionId').equals(question.id).first()
    if (existing?.id) {
      await db.favorites.delete(existing.id)
    } else {
      await db.favorites.add({
        questionId: question.id,
        subject: question.subject,
        createdAt: new Date(),
      })
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold tabular-nums text-primary">
            {currentIndex + 1}
          </span>
          <span className="text-sm text-muted-foreground">/ {total}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground font-medium">
            {question.type === 'judge' ? '判断题' : '单选题'}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 rounded-full"
            onClick={toggleFavorite}
          >
            <Heart
              className={cn(
                'w-4 h-4 transition-colors',
                isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
              )}
            />
          </Button>
        </div>
      </div>

      {/* Question content */}
      <div className="p-4 flex-1 overflow-y-auto space-y-3">
        <p className="text-base leading-relaxed font-medium">{question.content}</p>

        {question.image && (
          <img
            src={question.image}
            alt="题目图片"
            className="w-full rounded-xl mb-4 object-contain max-h-48"
          />
        )}

        {/* Options */}
        <div className="space-y-2.5">
          {question.options.map((option) => {
            const isSelected = selectedAnswer === option.key
            const isCorrect = option.key === question.answer
            const showCorrect = isAnswered && isCorrect
            const showWrong = isAnswered && isSelected && !isCorrect

            return (
              <button
                key={option.key}
                onClick={() => onSelect(option.key)}
                disabled={isAnswered}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-3 rounded-xl border-2 text-left transition-all',
                  showCorrect
                    ? 'border-green-400 bg-green-50 dark:bg-green-950/30'
                    : showWrong
                      ? 'border-red-400 bg-red-50 dark:bg-red-950/30'
                      : isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-transparent bg-muted/60',
                  !isAnswered && 'hover:bg-muted active:scale-[0.99]'
                )}
              >
                <span
                  className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors',
                    showCorrect
                      ? 'bg-green-500 text-white'
                      : showWrong
                        ? 'bg-red-500 text-white'
                        : isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-border text-muted-foreground'
                  )}
                >
                  {option.key}
                </span>
                <span className="text-sm flex-1 leading-snug">{option.text}</span>
                {showCorrect && (
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                )}
                {showWrong && (
                  <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                )}
              </button>
            )
          })}
        </div>

        {/* Explanation */}
        {isAnswered && question.explanation && (
          <div className="mt-1 p-3.5 rounded-xl bg-primary/5 border border-primary/15">
            <p className="text-xs font-semibold text-primary mb-1.5">解析</p>
            <p
              className="text-sm leading-relaxed text-foreground/80"
              dangerouslySetInnerHTML={{ __html: question.explanation }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
