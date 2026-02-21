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
      qs = shuffleArray(qs)
    }
    return qs
  }, [subject, mode, chapterId])

  const currentQuestion = questions[currentIndex] ?? null
  const isFirst = currentIndex === 0
  const isLast = currentIndex === questions.length - 1

  // Save progress to DB when index changes
  useEffect(() => {
    if (questions.length === 0) return
    db.practiceProgress
      .where('[subject+mode+chapterId]')
      .equals([subject, mode, chapterId ?? ''])
      .first()
      .then((existing) => {
        if (existing?.id) {
          db.practiceProgress.update(existing.id, {
            currentIndex,
            updatedAt: new Date(),
          })
        } else {
          db.practiceProgress.add({
            subject,
            mode,
            chapterId,
            currentIndex,
            questionIds: questions.map((q) => q.id),
            updatedAt: new Date(),
          })
        }
      })
  }, [currentIndex, subject, mode, chapterId, questions])

  // Restore progress on mount (sequential mode)
  useEffect(() => {
    if (mode !== 'sequential') return
    db.practiceProgress
      .where('[subject+mode+chapterId]')
      .equals([subject, mode, chapterId ?? ''])
      .first()
      .then((saved) => {
        if (saved && saved.currentIndex < questions.length) {
          setCurrentIndex(saved.currentIndex)
        }
      })
  }, [subject, mode, chapterId, questions.length])

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
    setCurrentIndex((i) => i + 1)
    setSelectedAnswer(null)
    setIsAnswered(false)
  }, [isLast])

  const goPrev = useCallback(() => {
    if (isFirst) return
    setCurrentIndex((i) => i - 1)
    setSelectedAnswer(null)
    setIsAnswered(false)
  }, [isFirst])

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
    chapterName: getChapterName(),
  }
}
