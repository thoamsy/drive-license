import { createFileRoute, Link } from '@tanstack/react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { ArrowLeft, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { QuestionCard } from '@/components/QuestionCard'
import { Button } from '@/components/ui/button'
import { db } from '@/db'
import { getQuestionsByIds } from '@/lib/question-bank'
import type { SubjectId } from '@/types/question'

export const Route = createFileRoute('/subject/$id/mistakes')({
  component: MistakesPage,
})

function MistakesPage() {
  const { id } = Route.useParams()
  const subjectId = id as SubjectId

  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)

  const mistakeIds = useLiveQuery(async () => {
    const records = await db.practiceRecords.where('subject').equals(subjectId).toArray()
    const wrongIds = new Set(records.filter((r) => !r.isCorrect).map((r) => r.questionId))
    const correctIds = new Set(records.filter((r) => r.isCorrect).map((r) => r.questionId))
    return [...wrongIds].filter((id) => !correctIds.has(id))
  }, [subjectId])

  const questions = mistakeIds ? getQuestionsByIds(mistakeIds) : []
  const currentQuestion = questions[currentIndex] ?? null

  const handleSelect = async (key: string) => {
    if (isAnswered || !currentQuestion) return
    setSelectedAnswer(key)
    setIsAnswered(true)
    const isCorrect = key === currentQuestion.answer
    await db.practiceRecords.add({
      questionId: currentQuestion.id,
      subject: subjectId,
      isCorrect,
      answeredAt: new Date(),
    })
  }

  const goNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1)
      setSelectedAnswer(null)
      setIsAnswered(false)
    }
  }

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1)
      setSelectedAnswer(null)
      setIsAnswered(false)
    }
  }

  const clearMistakes = async () => {
    const records = await db.practiceRecords.where('subject').equals(subjectId).toArray()
    const wrongIds = [...new Set(records.filter((r) => !r.isCorrect).map((r) => r.questionId))]
    await db.practiceRecords.where('subject').equals(subjectId).delete()
    // Re-add correct records only
    const correctRecords = records.filter((r) => r.isCorrect && !wrongIds.includes(r.questionId))
    await db.practiceRecords.bulkAdd(correctRecords)
  }

  if (!mistakeIds) {
    return <div className="p-4 text-center text-muted-foreground">加载中...</div>
  }

  return (
    <div className="flex flex-col h-svh">
      <div className="flex items-center justify-between p-3 border-b border-border bg-background flex-shrink-0">
        <div className="flex items-center gap-2">
          <Link to="/subject/$id" params={{ id: subjectId }}>
            <Button variant="ghost" size="icon" className="-ml-1">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <span className="font-medium">错题本</span>
        </div>
        {questions.length > 0 && (
          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => void clearMistakes()}>
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      {questions.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-4">
          <div className="text-4xl">🎉</div>
          <p className="font-medium">没有错题</p>
          <p className="text-sm text-muted-foreground">继续保持，做到全部答对！</p>
          <Link to="/subject/$id" params={{ id: subjectId }}>
            <Button variant="outline">返回练习</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-hidden">
            {currentQuestion && (
              <QuestionCard
                question={currentQuestion}
                selectedAnswer={selectedAnswer}
                isAnswered={isAnswered}
                onSelect={handleSelect}
                currentIndex={currentIndex}
                total={questions.length}
              />
            )}
          </div>

          <div className="flex items-center justify-between p-4 border-t border-border bg-background flex-shrink-0">
            <Button variant="outline" onClick={goPrev} disabled={currentIndex === 0}>
              <ChevronLeft className="w-4 h-4 mr-1" />
              上一题
            </Button>
            <Button onClick={goNext} disabled={currentIndex === questions.length - 1}>
              下一题
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
