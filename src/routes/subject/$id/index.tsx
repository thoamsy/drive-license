import { createFileRoute, Link } from '@tanstack/react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  AlarmClock,
  ArrowLeft,
  BookMarked,
  ChevronRight,
  ListOrdered,
  Shuffle,
  XCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { db } from '@/db'
import { getChapters, getQuestions } from '@/lib/question-bank'
import { SUBJECTS } from '@/types/question'
import type { SubjectId } from '@/types/question'

export const Route = createFileRoute('/subject/$id/')({
  component: SubjectPage,
})

const subjectGradients: Record<SubjectId, string> = {
  subject1: 'from-blue-500 to-indigo-600',
  subject2: 'from-amber-400 to-orange-500',
  subject3: 'from-emerald-400 to-teal-600',
  subject4: 'from-violet-500 to-purple-600',
}

function SubjectPage() {
  const { id } = Route.useParams()
  const subjectId = id as SubjectId
  const subject = SUBJECTS.find((s) => s.id === subjectId)

  const allRecords = useLiveQuery(() =>
    db.practiceRecords.where('subject').equals(subjectId).toArray()
  )

  const mistakeCount = useLiveQuery(async () => {
    const records = await db.practiceRecords.where('subject').equals(subjectId).toArray()
    const wrongIds = new Set(records.filter((r) => !r.isCorrect).map((r) => r.questionId))
    const correctIds = new Set(records.filter((r) => r.isCorrect).map((r) => r.questionId))
    return [...wrongIds].filter((id) => !correctIds.has(id)).length
  })

  if (!subject) return <div className="p-4">科目不存在</div>

  const questions = getQuestions(subjectId)
  const chapters = getChapters(subjectId)
  const attempted = new Set(allRecords?.map((r) => r.questionId) ?? [])
  const progress = questions.length > 0 ? Math.round((attempted.size / questions.length) * 100) : 0

  return (
    <div className="min-h-full">
      {/* Header */}
      <div
        className={cn(
          'bg-gradient-to-br text-white px-5 pt-10 pb-8',
          subjectGradients[subjectId]
        )}
      >
        <Link to="/">
          <button className="flex items-center gap-1 text-white/80 hover:text-white mb-4 transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" />
            返回
          </button>
        </Link>
        <h1 className="text-2xl font-bold">{subject.name}</h1>
        <p className="text-sm opacity-75 mt-1">{subject.description}</p>

        {subject.hasQuestions && (
          <div className="mt-5">
            <div className="flex justify-between text-sm mb-2 opacity-90">
              <span>学习进度</span>
              <span className="tabular-nums">{attempted.size}/{questions.length} 题</span>
            </div>
            <div className="h-2 bg-white/25 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-1.5 text-xs opacity-70">{progress}% 已完成</div>
          </div>
        )}
      </div>

      <div className="px-4 py-4 space-y-4">
        {subject.hasQuestions ? (
          <>
            {/* Practice modes */}
            <div className="space-y-2">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">
                练习模式
              </h2>
              <div className="bg-card rounded-2xl border border-border/40 shadow-sm overflow-hidden divide-y divide-border/60">
                <Link
                  to="/subject/$id/practice/sequential"
                  params={{ id: subjectId }}
                  className="flex items-center gap-3 px-4 py-3.5 active:bg-muted/60 transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <ListOrdered className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">顺序练习</div>
                    <div className="text-xs text-muted-foreground">按顺序逐题练习，支持断点续练</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </Link>

                <Link
                  to="/subject/$id/practice/random"
                  params={{ id: subjectId }}
                  className="flex items-center gap-3 px-4 py-3.5 active:bg-muted/60 transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
                    <Shuffle className="w-5 h-5 text-violet-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">随机练习</div>
                    <div className="text-xs text-muted-foreground">随机抽取题目，强化记忆</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </Link>

                {chapters.length > 0 && (
                  <div className="px-4 py-3.5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                        <BookMarked className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="font-medium text-sm">章节练习</div>
                    </div>
                    <div className="space-y-1 pl-12">
                      {chapters.map((chapter) => (
                        <Link
                          key={chapter.id}
                          to="/subject/$id/practice/chapter/$chapterId"
                          params={{ id: subjectId, chapterId: chapter.id }}
                          className="flex items-center justify-between py-1.5"
                        >
                          <span className="text-sm text-muted-foreground">{chapter.name}</span>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Exam & mistakes */}
            <div className="space-y-2">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">
                考试与错题
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <Link to="/subject/$id/exam" params={{ id: subjectId }}>
                  <div className="bg-card rounded-2xl border border-border/40 shadow-sm p-4 text-center active:scale-[0.97] transition-transform">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-3">
                      <AlarmClock className="w-6 h-6 text-white" />
                    </div>
                    <div className="font-semibold text-sm">模拟考试</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {subject.examCount}题 / {subject.examMinutes}分钟
                    </div>
                  </div>
                </Link>

                <Link to="/subject/$id/mistakes" params={{ id: subjectId }}>
                  <div className="bg-card rounded-2xl border border-border/40 shadow-sm p-4 text-center active:scale-[0.97] transition-transform">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-400 to-rose-600 flex items-center justify-center mx-auto mb-3">
                      <XCircle className="w-6 h-6 text-white" />
                    </div>
                    <div className="font-semibold text-sm">错题本</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {mistakeCount ?? 0} 道错题
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </>
        ) : (
          /* Guide for subject2/3 */
          <div className="space-y-2">
            <Link to="/subject/$id/guide" params={{ id: subjectId }}>
              <div className="bg-card rounded-2xl border border-border/40 shadow-sm p-4 flex items-center justify-between active:scale-[0.98] transition-transform">
                <div>
                  <div className="font-semibold">技巧指南</div>
                  <div className="text-xs text-muted-foreground">图文讲解通关技巧</div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
