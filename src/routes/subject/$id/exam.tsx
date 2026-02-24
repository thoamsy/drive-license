import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, ChevronLeft, ChevronRight, Clock, Grid3X3 } from 'lucide-react'
import { useState } from 'react'
import { AnswerSheet } from '@/components/AnswerSheet'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useExam } from '@/hooks/useExam'
import { SUBJECTS } from '@/types/question'
import type { SubjectId } from '@/types/question'

export const Route = createFileRoute('/subject/$id/exam')({
  component: ExamPage,
})

function ExamPage() {
  const { id } = Route.useParams()
  const subjectId = id as SubjectId
  const subject = SUBJECTS.find((s) => s.id === subjectId)!

  const { status, questions, answers, currentIndex, setCurrentIndex, formattedTime, score, passed, startExam, submitExam, selectAnswer } =
    useExam({
      subject: subjectId,
      totalCount: subject.examCount,
      durationMinutes: subject.examMinutes,
      passScore: subject.passScore,
    })

  const [showSheet, setShowSheet] = useState(false)

  if (status === 'idle') {
    return (
      <div className="h-full overflow-y-auto">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white px-5 pt-10 pb-8">
          <Link to="/subject/$id" params={{ id: subjectId }}>
            <button className="flex items-center gap-1 text-white/80 hover:text-white mb-4 transition-colors text-sm">
              <ArrowLeft className="w-4 h-4" />
              返回
            </button>
          </Link>
          <h1 className="text-2xl font-bold">模拟考试</h1>
          <p className="text-sm opacity-75 mt-1">严格模拟真实考试环境</p>
        </div>

        <div className="px-4 py-4 space-y-4">
          <div className="bg-card rounded-2xl border border-border/40 shadow-sm p-4 space-y-4">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-xl bg-muted/50">
                <div className="text-2xl font-bold text-primary">{subject.examCount}</div>
                <div className="text-xs text-muted-foreground mt-0.5">题目数量</div>
              </div>
              <div className="p-3 rounded-xl bg-muted/50">
                <div className="text-2xl font-bold text-primary">{subject.examMinutes}<span className="text-sm font-normal ml-0.5">分钟</span></div>
                <div className="text-xs text-muted-foreground mt-0.5">考试时间</div>
              </div>
              <div className="p-3 rounded-xl bg-muted/50">
                <div className="text-2xl font-bold text-amber-500">{subject.passScore}<span className="text-sm font-normal ml-0.5">分</span></div>
                <div className="text-xs text-muted-foreground mt-0.5">及格分数</div>
              </div>
              <div className="p-3 rounded-xl bg-muted/50">
                <div className="text-2xl font-bold">{subject.totalScore}<span className="text-sm font-normal ml-0.5">分</span></div>
                <div className="text-xs text-muted-foreground mt-0.5">满分</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              题目将从题库中随机抽取，每次考试题目不同
            </p>
            <Button className="w-full rounded-xl" size="lg" onClick={startExam}>
              开始考试
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'submitted') {
    return (
      <div className="h-full overflow-y-auto">
        {/* Result header */}
        <div
          className={cn(
            'px-5 pt-10 pb-8 text-white',
            passed
              ? 'bg-gradient-to-br from-green-500 to-emerald-600'
              : 'bg-gradient-to-br from-red-500 to-rose-600'
          )}
        >
          <Link to="/subject/$id" params={{ id: subjectId }}>
            <button className="flex items-center gap-1 text-white/80 hover:text-white mb-4 transition-colors text-sm">
              <ArrowLeft className="w-4 h-4" />
              返回
            </button>
          </Link>
          <div className="text-6xl font-black tabular-nums">{score}</div>
          <div className="text-white/70 mt-1">满分 {subject.totalScore} 分 · 及格线 {subject.passScore} 分</div>
          <div className="mt-3 inline-block bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-semibold">
            {passed ? '恭喜通过！' : '未通过，继续努力'}
          </div>
        </div>

        <div className="px-4 py-4 space-y-4">
          {/* Answer review */}
          <div className="space-y-2">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">
              答题详情
            </h2>
            <div className="space-y-2">
              {questions.map((q, i) => {
                const userAnswer = answers[q.id]
                const isCorrect = userAnswer === q.answer
                return (
                  <div
                    key={q.id}
                    className={cn(
                      'bg-card rounded-2xl border shadow-sm p-4',
                      isCorrect ? 'border-green-200' : 'border-red-200'
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <span
                        className={cn(
                          'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5',
                          isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                        )}
                      >
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm line-clamp-2 leading-snug">{q.content}</p>
                        <div className="flex gap-3 mt-1.5 text-xs">
                          <span className={isCorrect ? 'text-green-600 font-medium' : 'text-red-500 font-medium'}>
                            我：{userAnswer ?? '未作答'}
                          </span>
                          {!isCorrect && (
                            <span className="text-green-600 font-medium">正确：{q.answer}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Ongoing exam
  const currentQuestion = questions[currentIndex]

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-background flex-shrink-0">
        <div className="flex items-center gap-1 text-sm font-medium">
          <Clock className="w-4 h-4 text-primary" />
          <span className="tabular-nums">{formattedTime}</span>
        </div>
        <span className="text-sm text-muted-foreground">
          {currentIndex + 1}/{questions.length}
        </span>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8"
            onClick={() => setShowSheet(!showSheet)}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="destructive" onClick={() => void submitExam()}>
            交卷
          </Button>
        </div>
      </div>

      {showSheet ? (
        <div className="flex-1 overflow-y-auto">
          <AnswerSheet
            questions={questions}
            answers={answers}
            currentIndex={currentIndex}
            onSelect={(i) => {
              setCurrentIndex(i)
              setShowSheet(false)
            }}
          />
        </div>
      ) : (
        <>
          {/* Question */}
          <div className="flex-1 overflow-y-auto p-4">
            {currentQuestion && (
              <div className="space-y-3">
                <p className="text-base leading-relaxed">{currentQuestion.content}</p>
                {currentQuestion.image && (
                  <img
                    src={currentQuestion.image}
                    alt="题目图片"
                    className="w-full rounded-lg object-contain max-h-48"
                  />
                )}
                <div className="space-y-2.5">
                  {currentQuestion.options.map((option) => {
                    const isSelected = answers[currentQuestion.id] === option.key
                    return (
                      <button
                        key={option.key}
                        onClick={() => selectAnswer(currentQuestion.id, option.key)}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-3 rounded-xl border-2 text-left transition-all active:scale-[0.99]',
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-transparent bg-muted/60 hover:bg-muted'
                        )}
                      >
                        <span
                          className={cn(
                            'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors',
                            isSelected
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-border text-muted-foreground'
                          )}
                        >
                          {option.key}
                        </span>
                        <span className="text-sm leading-snug">{option.text}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] border-t border-border bg-background flex-shrink-0">
            <Button
              variant="outline"
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              上一题
            </Button>
            <Button
              onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
              disabled={currentIndex === questions.length - 1}
            >
              下一题
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
