import { createFileRoute, Link } from '@tanstack/react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { BookOpen, Car, CheckCircle2, Target } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { db } from '@/db'
import { getQuestions } from '@/lib/question-bank'
import { SUBJECTS } from '@/types/question'
import type { SubjectId } from '@/types/question'

export const Route = createFileRoute('/')({
  component: HomePage,
})

const subjectIcons: Record<SubjectId, React.ReactNode> = {
  subject1: <BookOpen className="w-6 h-6" />,
  subject2: <Car className="w-6 h-6" />,
  subject3: <Car className="w-6 h-6" />,
  subject4: <Target className="w-6 h-6" />,
}

function HomePage() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const todayRecords = useLiveQuery(() =>
    db.practiceRecords.where('answeredAt').aboveOrEqual(today).toArray()
  )

  const todayCount = todayRecords?.length ?? 0
  const todayCorrect = todayRecords?.filter((r) => r.isCorrect).length ?? 0
  const todayAccuracy = todayCount > 0 ? Math.round((todayCorrect / todayCount) * 100) : 0

  const allRecords = useLiveQuery(() => db.practiceRecords.toArray())

  function getSubjectProgress(subjectId: SubjectId) {
    const questions = getQuestions(subjectId)
    if (questions.length === 0) return 0
    const attempted = new Set(
      allRecords?.filter((r) => r.subject === subjectId).map((r) => r.questionId)
    )
    return Math.round((attempted.size / questions.length) * 100)
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="pt-4 pb-2">
        <h1 className="text-2xl font-bold">驾考准备</h1>
        <p className="text-sm text-muted-foreground">科学刷题，轻松通关</p>
      </div>

      {/* Today stats */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">今日学习</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{todayCount}</div>
              <div className="text-xs text-muted-foreground">做题数</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{todayCorrect}</div>
              <div className="text-xs text-muted-foreground">答对数</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{todayAccuracy}%</div>
              <div className="text-xs text-muted-foreground">正确率</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subject cards */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">科目选择</h2>
        {SUBJECTS.map((subject) => {
          const progress = getSubjectProgress(subject.id)
          return (
            <Link
              key={subject.id}
              to="/subject/$id"
              params={{ id: subject.id }}
              className="block"
            >
              <Card className="transition-shadow hover:shadow-md active:scale-[0.99]">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary text-primary-foreground">
                      {subjectIcons[subject.id]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{subject.name}</span>
                        {subject.hasQuestions && (
                          <span className="text-xs text-muted-foreground">{progress}%</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {subject.description}
                      </p>
                      {subject.hasQuestions && (
                        <Progress value={progress} className="mt-2 h-1.5" />
                      )}
                    </div>
                    {subject.hasQuestions && progress === 100 && (
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
