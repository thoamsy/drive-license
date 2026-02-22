import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { QuestionCard } from '@/components/QuestionCard'
import { usePractice } from '@/hooks/usePractice'
import type { SubjectId } from '@/types/question'

export const Route = createFileRoute('/subject/$id/practice/chapter/$chapterId')({
  component: ChapterPracticePage,
})

function ChapterPracticePage() {
  const { id, chapterId } = Route.useParams()
  const subjectId = id as SubjectId

  const {
    questions,
    currentIndex,
    currentQuestion,
    selectedAnswer,
    isAnswered,
    isFirst,
    isLast,
    selectAnswer,
    goNext,
    goPrev,
    chapterName,
  } = usePractice({ subject: subjectId, mode: 'chapter', chapterId })

  if (!currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground">本章暂无题目</p>
        <Link to="/subject/$id" params={{ id: subjectId }}>
          <Button variant="outline">返回</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-3 border-b border-border bg-background flex-shrink-0">
        <Link to="/subject/$id" params={{ id: subjectId }}>
          <Button variant="ghost" size="icon" className="-ml-1">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="min-w-0">
          <div className="font-medium text-sm truncate">{chapterName ?? '章节练习'}</div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <QuestionCard
          question={currentQuestion}
          selectedAnswer={selectedAnswer}
          isAnswered={isAnswered}
          onSelect={selectAnswer}
          currentIndex={currentIndex}
          total={questions.length}
        />
      </div>

      <div className="flex items-center justify-between px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] border-t border-border bg-background flex-shrink-0">
        <Button variant="outline" onClick={goPrev} disabled={isFirst}>
          <ChevronLeft className="w-4 h-4 mr-1" />
          上一题
        </Button>
        <Button onClick={goNext} disabled={isLast}>
          下一题
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  )
}
