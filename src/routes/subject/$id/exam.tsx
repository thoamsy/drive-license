import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, ChevronLeft, ChevronRight, Clock, Grid3X3 } from 'lucide-react'
import { useState } from 'react'
import { AnswerSheet } from '@/components/AnswerSheet'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-2 pt-2">
          <Link to="/subject/$id" params={{ id: subjectId }}>
            <Button variant="ghost" size="icon" className="-ml-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">模拟考试</h1>
        </div>

        <Card>
          <CardContent className="pt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-lg bg-muted">
                <div className="text-xl font-bold">{subject.examCount}</div>
                <div className="text-xs text-muted-foreground">题目数量</div>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <div className="text-xl font-bold">{subject.examMinutes}分钟</div>
                <div className="text-xs text-muted-foreground">考试时间</div>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <div className="text-xl font-bold">{subject.passScore}分</div>
                <div className="text-xs text-muted-foreground">及格分数</div>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <div className="text-xl font-bold">{subject.totalScore}分</div>
                <div className="text-xs text-muted-foreground">满分</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              题目将从题库中随机抽取，每次考试题目不同
            </p>
            <Button className="w-full" size="lg" onClick={startExam}>
              开始考试
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === 'submitted') {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-2 pt-2">
          <Link to="/subject/$id" params={{ id: subjectId }}>
            <Button variant="ghost" size="icon" className="-ml-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">考试结果</h1>
        </div>

        <Card>
          <CardContent className="pt-6 pb-6 text-center space-y-4">
            <div
              className={cn(
                'text-6xl font-bold',
                passed ? 'text-green-600' : 'text-destructive'
              )}
            >
              {score}
            </div>
            <div className="text-muted-foreground">满分 {subject.totalScore} 分</div>
            <div
              className={cn(
                'text-xl font-semibold px-4 py-2 rounded-full inline-block',
                passed
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-destructive'
              )}
            >
              {passed ? '恭喜通过！' : '未通过，继续努力'}
            </div>
            <p className="text-sm text-muted-foreground">
              及格线：{subject.passScore} 分
            </p>
          </CardContent>
        </Card>

        {/* Answer review */}
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-muted-foreground">答题详情</h2>
          {questions.map((q, i) => {
            const userAnswer = answers[q.id]
            const isCorrect = userAnswer === q.answer
            return (
              <Card key={q.id} className={cn('border', isCorrect ? 'border-green-200' : 'border-red-200')}>
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-start gap-2">
                    <span className="text-xs text-muted-foreground flex-shrink-0 mt-0.5">
                      {i + 1}.
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm line-clamp-2">{q.content}</p>
                      <div className="flex gap-3 mt-1 text-xs">
                        <span className={isCorrect ? 'text-green-600' : 'text-destructive'}>
                          我的答案：{userAnswer ?? '未作答'}
                        </span>
                        {!isCorrect && (
                          <span className="text-green-600">正确答案：{q.answer}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  // Ongoing exam
  const currentQuestion = questions[currentIndex]

  return (
    <div className="flex flex-col h-svh">
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
                <div className="space-y-2">
                  {currentQuestion.options.map((option) => {
                    const isSelected = answers[currentQuestion.id] === option.key
                    return (
                      <button
                        key={option.key}
                        onClick={() => selectAnswer(currentQuestion.id, option.key)}
                        className={cn(
                          'w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors',
                          isSelected
                            ? 'border-primary bg-primary/5 font-medium'
                            : 'border-border bg-background'
                        )}
                      >
                        <span className="font-bold text-sm w-5 flex-shrink-0">{option.key}</span>
                        <span className="text-sm">{option.text}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between p-4 border-t border-border bg-background flex-shrink-0">
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
