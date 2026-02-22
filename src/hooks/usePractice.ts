import { useCallback, useEffect, useMemo, useState } from 'react'
import { db } from '@/db'
import {
  getChapters,
  getQuestions,
  getQuestionsByChapter,
  shuffleArray,
} from '@/lib/question-bank'
import type { Question, SubjectId } from '@/types/question'

type PracticeMode = 'sequential' | 'random' | 'chapter'

interface UsePracticeOptions {
  subject: SubjectId
  mode: PracticeMode
  chapterId?: string
}

const RANDOM_QUESTION_LIMIT = 50

export function usePractice({ subject, mode, chapterId }: UsePracticeOptions) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)

  const questions: Question[] = useMemo(() => {
    let qs: Question[]
    if (mode === 'chapter' && chapterId) {
      qs = getQuestionsByChapter(subject, chapterId)
    } else {
      qs = getQuestions(subject)
    }
    if (mode === 'random') {
      qs = shuffleArray(qs).slice(0, RANDOM_QUESTION_LIMIT)
    }
    return qs
  }, [subject, mode, chapterId])

  const currentQuestion = questions[currentIndex] ?? null
  const isFirst = currentIndex === 0
  const isLast = currentIndex === questions.length - 1

  // Restore progress on mount (sequential mode only)
  // 不用 useEffect 保存，避免初始 index=0 覆盖已保存进度的竞态问题
  useEffect(() => {
    if (mode !== 'sequential') return
    db.practiceProgress
      .where('[subject+mode+chapterId]')
      .equals([subject, mode, chapterId ?? ''])
      .first()
      .then((saved) => {
        if (saved && saved.currentIndex > 0 && saved.currentIndex < questions.length) {
          setCurrentIndex(saved.currentIndex)
        }
      })
  }, [subject, mode, chapterId, questions.length])

  // 仅在顺序模式下保存进度（由 goNext/goPrev 主动触发，避免竞态）
  const saveProgress = useCallback(
    async (index: number) => {
      if (mode !== 'sequential') return
      const existing = await db.practiceProgress
        .where('[subject+mode+chapterId]')
        .equals([subject, mode, chapterId ?? ''])
        .first()
      if (existing?.id) {
        await db.practiceProgress.update(existing.id, { currentIndex: index, updatedAt: new Date() })
      } else {
        await db.practiceProgress.add({
          subject,
          mode,
          chapterId: chapterId ?? '',
          currentIndex: index,
          questionIds: questions.map((q) => q.id),
          updatedAt: new Date(),
        })
      }
    },
    [subject, mode, chapterId, questions]
  )

  const selectAnswer = useCallback(
    async (key: string) => {
      if (isAnswered || !currentQuestion) return
      setSelectedAnswer(key)
      setIsAnswered(true)

      const isCorrect = key === currentQuestion.answer
      await db.practiceRecords.add({
        questionId: currentQuestion.id,
        subject,
        isCorrect,
        answeredAt: new Date(),
      })
    },
    [isAnswered, currentQuestion, subject]
  )

  const goNext = useCallback(() => {
    if (isLast) return
    const newIndex = currentIndex + 1
    setCurrentIndex(newIndex)
    setSelectedAnswer(null)
    setIsAnswered(false)
    saveProgress(newIndex)
  }, [isLast, currentIndex, saveProgress])

  const goPrev = useCallback(() => {
    if (isFirst) return
    const newIndex = currentIndex - 1
    setCurrentIndex(newIndex)
    setSelectedAnswer(null)
    setIsAnswered(false)
    saveProgress(newIndex)
  }, [isFirst, currentIndex, saveProgress])

  const resetProgress = useCallback(async () => {
    const existing = await db.practiceProgress
      .where('[subject+mode+chapterId]')
      .equals([subject, mode, chapterId ?? ''])
      .first()
    if (existing?.id) {
      await db.practiceProgress.update(existing.id, { currentIndex: 0, updatedAt: new Date() })
    }
    setCurrentIndex(0)
    setSelectedAnswer(null)
    setIsAnswered(false)
  }, [subject, mode, chapterId])

  const getChapterName = useCallback(() => {
    if (!chapterId) return undefined
    return getChapters(subject).find((c) => c.id === chapterId)?.name
  }, [subject, chapterId])

  return {
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
    resetProgress,
    chapterName: getChapterName(),
  }
}
