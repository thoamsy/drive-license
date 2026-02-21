import { useCallback, useEffect, useRef, useState } from 'react'
import { db } from '@/db'
import { sampleQuestions } from '@/lib/question-bank'
import type { Question, SubjectId } from '@/types/question'

export type ExamStatus = 'idle' | 'ongoing' | 'submitted'

interface UseExamOptions {
  subject: SubjectId
  totalCount: number
  durationMinutes: number
  passScore: number
}

export function useExam({ subject, totalCount, durationMinutes, passScore }: UseExamOptions) {
  const [status, setStatus] = useState<ExamStatus>('idle')
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60)
  const [score, setScore] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startExam = useCallback(() => {
    const qs = sampleQuestions(subject, totalCount)
    setQuestions(qs)
    setAnswers({})
    setCurrentIndex(0)
    setTimeLeft(durationMinutes * 60)
    setScore(0)
    setStatus('ongoing')
  }, [subject, totalCount, durationMinutes])

  useEffect(() => {
    if (status !== 'ongoing') return
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          submitExam()
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  const submitExam = useCallback(async () => {
    if (status !== 'ongoing') return
    if (timerRef.current) clearInterval(timerRef.current)
    setStatus('submitted')

    // Calculate score
    let correct = 0
    for (const q of questions) {
      if (answers[q.id] === q.answer) correct++
    }
    setScore(correct)

    const durationSeconds = durationMinutes * 60 - timeLeft
    await db.examRecords.add({
      subject,
      score: correct,
      totalScore: questions.length,
      passed: correct >= passScore,
      durationSeconds,
      answers: { ...answers },
      completedAt: new Date(),
    })

    // Record individual answers for mistake tracking
    for (const q of questions) {
      const userAnswer = answers[q.id]
      if (userAnswer) {
        await db.practiceRecords.add({
          questionId: q.id,
          subject,
          isCorrect: userAnswer === q.answer,
          answeredAt: new Date(),
        })
      }
    }
  }, [status, questions, answers, durationMinutes, timeLeft, subject, passScore])

  const selectAnswer = useCallback((questionId: string, key: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: key }))
  }, [])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  return {
    status,
    questions,
    answers,
    currentIndex,
    setCurrentIndex,
    timeLeft,
    formattedTime: formatTime(timeLeft),
    score,
    passed: score >= passScore,
    startExam,
    submitExam,
    selectAnswer,
  }
}
