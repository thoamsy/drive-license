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
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { db } from '@/db'
import { getChapters, getQuestions } from '@/lib/question-bank'
import { SUBJECTS } from '@/types/question'
import type { SubjectId } from '@/types/question'

export const Route = createFileRoute('/subject/$id/')({
  component: SubjectPage,
})

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
    // A mistake is a question answered wrong that has never been answered correctly
    return [...wrongIds].filter((id) => !correctIds.has(id)).length
  })

  if (!subject) return <div className="p-4">科目不存在</div>

  const questions = getQuestions(subjectId)
  const chapters = getChapters(subjectId)
  const attempted = new Set(allRecords?.map((r) => r.questionId) ?? [])
  const progress = questions.length > 0 ? Math.round((attempted.size / questions.length) * 100) : 0

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 pt-2">
        <Link to="/">
          <Button variant="ghost" size="icon" className="-ml-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">{subject.name}</h1>
          <p className="text-xs text-muted-foreground">{subject.description}</p>
        </div>
      </div>

      {subject.hasQuestions ? (
        <>
          {/* Progress */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>学习进度</span>
                <span>
                  {attempted.size}/{questions.length} 题
                </span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="mt-2 text-xs text-muted-foreground">{progress}% 已完成</div>
            </CardContent>
          </Card>

          {/* Practice modes */}
          <div className="space-y-2">
            <h2 className="text-sm font-medium text-muted-foreground">练习模式</h2>
            <Card>
              <CardContent className="pt-2 pb-2 divide-y">
                <Link
                  to="/subject/$id/practice/sequential"
                  params={{ id: subjectId }}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex items-center gap-3">
                    <ListOrdered className="w-5 h-5 text-primary" />
                    <div>
                      <div className="font-medium">顺序练习</div>
                      <div className="text-xs text-muted-foreground">按顺序逐题练习</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Link>

                <Separator />

                <Link
                  to="/subject/$id/practice/random"
                  params={{ id: subjectId }}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex items-center gap-3">
                    <Shuffle className="w-5 h-5 text-primary" />
                    <div>
                      <div className="font-medium">随机练习</div>
                      <div className="text-xs text-muted-foreground">随机打乱题目顺序</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Link>

                {chapters.length > 0 && (
                  <>
                    <Separator />
                    <div className="py-3">
                      <div className="flex items-center gap-3 mb-2">
                        <BookMarked className="w-5 h-5 text-primary" />
                        <div className="font-medium">章节练习</div>
                      </div>
                      <div className="space-y-1 pl-8">
                        {chapters.map((chapter) => (
                          <Link
                            key={chapter.id}
                            to="/subject/$id/practice/chapter/$chapterId"
                            params={{ id: subjectId, chapterId: chapter.id }}
                            className="flex items-center justify-between py-1.5"
                          >
                            <span className="text-sm">{chapter.name}</span>
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Exam & mistakes */}
          <div className="space-y-2">
            <h2 className="text-sm font-medium text-muted-foreground">考试与错题</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/subject/$id/exam" params={{ id: subjectId }}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardContent className="pt-4 pb-4 text-center">
                    <AlarmClock className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <div className="font-medium">模拟考试</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {subject.examCount}题 / {subject.examMinutes}分钟
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/subject/$id/mistakes" params={{ id: subjectId }}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardContent className="pt-4 pb-4 text-center">
                    <XCircle className="w-8 h-8 mx-auto mb-2 text-destructive" />
                    <div className="font-medium">错题本</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {mistakeCount ?? 0} 道错题
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </>
      ) : (
        /* Guide for subject2/3 */
        <div className="space-y-2">
          <Link to="/subject/$id/guide" params={{ id: subjectId }}>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="pt-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">技巧指南</div>
                  <div className="text-xs text-muted-foreground">图文讲解通关技巧</div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        </div>
      )}
    </div>
  )
}
