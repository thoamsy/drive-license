import { createFileRoute } from '@tanstack/react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { TrendingUp } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { db } from '@/db'
import { getQuestions } from '@/lib/question-bank'
import { SUBJECTS } from '@/types/question'
import type { SubjectId } from '@/types/question'

export const Route = createFileRoute('/stats')({
  component: StatsPage,
})

const subjectGradients: Record<SubjectId, string> = {
  subject1: 'from-blue-500 to-indigo-600',
  subject2: 'from-amber-400 to-orange-500',
  subject3: 'from-emerald-400 to-teal-600',
  subject4: 'from-violet-500 to-purple-600',
}

function StatsPage() {
  const allRecords = useLiveQuery(() => db.practiceRecords.toArray())
  const examRecords = useLiveQuery(() =>
    db.examRecords.orderBy('completedAt').reverse().limit(10).toArray()
  )

  function getSubjectStats(subjectId: SubjectId) {
    const questions = getQuestions(subjectId)
    const records = allRecords?.filter((r) => r.subject === subjectId) ?? []
    const attempted = new Set(records.map((r) => r.questionId))
    const correct = new Set(records.filter((r) => r.isCorrect).map((r) => r.questionId))
    return {
      total: questions.length,
      attempted: attempted.size,
      correct: correct.size,
      accuracy: attempted.size > 0 ? Math.round((correct.size / attempted.size) * 100) : 0,
      progress: questions.length > 0 ? Math.round((attempted.size / questions.length) * 100) : 0,
    }
  }

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-indigo-600 text-primary-foreground px-5 pt-12 pb-8">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-5 h-5 opacity-80" />
          <span className="text-sm font-medium opacity-80">学习报告</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">学习统计</h1>
        <p className="text-sm opacity-75 mt-1">追踪学习进度，发现薄弱环节</p>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Per-subject stats */}
        <div className="space-y-2">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">
            科目详情
          </h2>
          <div className="space-y-3">
            {SUBJECTS.filter((s) => s.hasQuestions).map((subject) => {
              const stats = getSubjectStats(subject.id)
              return (
                <div
                  key={subject.id}
                  className="bg-card rounded-2xl border border-border/40 shadow-sm overflow-hidden"
                >
                  {/* Card header with gradient */}
                  <div
                    className={cn(
                      'bg-gradient-to-r px-4 py-3 flex items-center justify-between',
                      subjectGradients[subject.id]
                    )}
                  >
                    <span className="font-semibold text-white">{subject.name}</span>
                    <span className="text-sm text-white/80">
                      {stats.attempted}/{stats.total} 题
                    </span>
                  </div>

                  <div className="p-4 space-y-3">
                    {/* Metrics */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-muted/50 rounded-xl p-2.5">
                        <div className="text-xl font-bold text-foreground">{stats.attempted}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">已做题</div>
                      </div>
                      <div className="bg-green-50 dark:bg-green-950/30 rounded-xl p-2.5">
                        <div className="text-xl font-bold text-green-600">{stats.correct}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">答对数</div>
                      </div>
                      <div className="bg-primary/5 rounded-xl p-2.5">
                        <div className="text-xl font-bold text-primary">{stats.accuracy}%</div>
                        <div className="text-xs text-muted-foreground mt-0.5">正确率</div>
                      </div>
                    </div>

                    {/* Progress */}
                    <div>
                      <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                        <span>学习进度</span>
                        <span className="font-medium text-foreground">{stats.progress}%</span>
                      </div>
                      <Progress value={stats.progress} className="h-2" />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Exam history */}
        {examRecords && examRecords.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">
              模拟考试记录
            </h2>
            <div className="space-y-2">
              {examRecords.map((record) => (
                <div
                  key={record.id}
                  className="bg-card rounded-2xl border border-border/40 shadow-sm p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-2 h-10 rounded-full flex-shrink-0',
                        record.passed ? 'bg-green-500' : 'bg-red-400'
                      )}
                    />
                    <div>
                      <div className="font-medium text-sm">
                        {SUBJECTS.find((s) => s.id === record.subject)?.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(record.completedAt).toLocaleDateString('zh-CN')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={cn(
                        'text-2xl font-bold tabular-nums',
                        record.passed ? 'text-green-600' : 'text-red-500'
                      )}
                    >
                      {record.score}
                    </div>
                    <div
                      className={cn(
                        'text-xs font-medium',
                        record.passed ? 'text-green-600' : 'text-red-500'
                      )}
                    >
                      {record.passed ? '通过' : '未通过'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
