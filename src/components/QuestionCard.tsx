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
      <div className="flex items-center justify-between p-4 border-b border-border">
        <span className="text-sm text-muted-foreground">
          {currentIndex + 1} / {total}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
            {question.type === 'judge' ? '判断题' : '单选题'}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8"
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
      <div className="p-4 flex-1 overflow-y-auto">
        <p className="text-base leading-relaxed mb-4">{question.content}</p>

        {question.image && (
          <img
            src={question.image}
            alt="题目图片"
            className="w-full rounded-lg mb-4 object-contain max-h-48"
          />
        )}

        {/* Options */}
        <div className="space-y-2">
          {question.options.map((option) => {
            const isSelected = selectedAnswer === option.key
            const isCorrect = option.key === question.answer
            let optionStyle = 'border-border bg-background'

            if (isAnswered) {
              if (isCorrect) {
                optionStyle = 'border-green-500 bg-green-50 text-green-700'
              } else if (isSelected && !isCorrect) {
                optionStyle = 'border-destructive bg-red-50 text-destructive'
              }
            } else if (isSelected) {
              optionStyle = 'border-primary bg-primary/5'
            }

            return (
              <button
                key={option.key}
                onClick={() => onSelect(option.key)}
                disabled={isAnswered}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors',
                  optionStyle,
                  !isAnswered && 'active:scale-[0.99]'
                )}
              >
                <span className="font-bold text-sm w-5 flex-shrink-0">{option.key}</span>
                <span className="text-sm flex-1">{option.text}</span>
                {isAnswered && isCorrect && (
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                )}
                {isAnswered && isSelected && !isCorrect && (
                  <XCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                )}
              </button>
            )
          })}
        </div>

        {/* Explanation */}
        {isAnswered && question.explanation && (
          <div className="mt-4 p-3 rounded-lg bg-muted">
            <p className="text-xs font-medium text-muted-foreground mb-1">解析</p>
            <p
              className="text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: question.explanation }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
