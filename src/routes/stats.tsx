import { createFileRoute } from '@tanstack/react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { db } from '@/db'
import { getQuestions } from '@/lib/question-bank'
import { SUBJECTS } from '@/types/question'
import type { SubjectId } from '@/types/question'

export const Route = createFileRoute('/stats')({
  component: StatsPage,
})

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
    <div className="p-4 space-y-4">
      <div className="pt-4 pb-2 flex items-center gap-2">
        <BarChart3 className="w-6 h-6" />
        <h1 className="text-xl font-bold">学习统计</h1>
      </div>

      {/* Per-subject stats */}
      <div className="space-y-3">
        {SUBJECTS.filter((s) => s.hasQuestions).map((subject) => {
          const stats = getSubjectStats(subject.id)
          return (
            <Card key={subject.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{subject.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div>
                    <div className="font-semibold">{stats.attempted}</div>
                    <div className="text-xs text-muted-foreground">已做</div>
                  </div>
                  <div>
                    <div className="font-semibold text-green-600">{stats.correct}</div>
                    <div className="text-xs text-muted-foreground">答对</div>
                  </div>
                  <div>
                    <div className="font-semibold">{stats.accuracy}%</div>
                    <div className="text-xs text-muted-foreground">正确率</div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>学习进度</span>
                    <span>
                      {stats.attempted}/{stats.total}
                    </span>
                  </div>
                  <Progress value={stats.progress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Exam history */}
      {examRecords && examRecords.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-muted-foreground">模拟考试记录</h2>
          {examRecords.map((record) => (
            <Card key={record.id}>
              <CardContent className="pt-3 pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">
                      {SUBJECTS.find((s) => s.id === record.subject)?.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(record.completedAt).toLocaleDateString('zh-CN')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-xl font-bold ${record.passed ? 'text-green-600' : 'text-destructive'}`}
                    >
                      {record.score}/{record.totalScore}
                    </div>
                    <div
                      className={`text-xs ${record.passed ? 'text-green-600' : 'text-destructive'}`}
                    >
                      {record.passed ? '通过' : '未通过'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
