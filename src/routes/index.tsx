import { createFileRoute, Link } from '@tanstack/react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { BookOpen, Car, CheckCircle2, ChevronRight, Target, Zap } from 'lucide-react'
import { db } from '@/db'
import { getQuestions } from '@/lib/question-bank'
import { SUBJECTS } from '@/types/question'
import { cn } from '@/lib/utils'
import type { SubjectId } from '@/types/question'

export const Route = createFileRoute('/')({
  component: HomePage,
})

const subjectIcons: Record<SubjectId, React.ReactNode> = {
  subject1: <BookOpen className="w-5 h-5" />,
  subject2: <Car className="w-5 h-5" />,
  subject3: <Car className="w-5 h-5" />,
  subject4: <Target className="w-5 h-5" />,
}

const subjectGradients: Record<SubjectId, string> = {
  subject1: 'from-blue-500 to-indigo-600',
  subject2: 'from-amber-400 to-orange-500',
  subject3: 'from-emerald-400 to-teal-600',
  subject4: 'from-violet-500 to-purple-600',
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
    <div className="min-h-full">
      {/* Hero header */}
      <div className="bg-gradient-to-br from-primary to-indigo-600 text-primary-foreground px-5 pt-12 pb-10">
        <div className="flex items-center gap-2 mb-1">
          <Zap className="w-5 h-5 opacity-80" />
          <span className="text-sm font-medium opacity-80">驾考准备</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">科学刷题</h1>
        <p className="text-sm opacity-75 mt-1">轻松通关，稳拿驾照</p>

        {/* Today stats */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-3 text-center">
            <div className="text-2xl font-bold">{todayCount}</div>
            <div className="text-xs opacity-70 mt-0.5">今日做题</div>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-3 text-center">
            <div className="text-2xl font-bold">{todayCorrect}</div>
            <div className="text-xs opacity-70 mt-0.5">答对数量</div>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-3 text-center">
            <div className="text-2xl font-bold">{todayAccuracy}%</div>
            <div className="text-xs opacity-70 mt-0.5">正确率</div>
          </div>
        </div>
      </div>

      {/* Subject cards */}
      <div className="px-4 -mt-5 space-y-3 pb-4">
        <div className="space-y-2.5">
          {SUBJECTS.map((subject) => {
            const progress = getSubjectProgress(subject.id)
            return (
              <Link
                key={subject.id}
                to="/subject/$id"
                params={{ id: subject.id }}
                className="block"
              >
                <div className="bg-card rounded-2xl shadow-sm border border-border/40 p-4 flex items-center gap-4 active:scale-[0.98] transition-transform">
                  <div
                    className={cn(
                      'w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br text-white flex-shrink-0',
                      subjectGradients[subject.id]
                    )}
                  >
                    {subjectIcons[subject.id]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-base">{subject.name}</span>
                      {subject.hasQuestions && progress === 100 ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      ) : subject.hasQuestions ? (
                        <span className="text-xs text-muted-foreground tabular-nums flex-shrink-0">
                          {progress}%
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {subject.description}
                    </p>
                    {subject.hasQuestions && (
                      <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full bg-gradient-to-r transition-all',
                            subjectGradients[subject.id]
                          )}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
