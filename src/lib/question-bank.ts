import type { Chapter, Question, SubjectId } from '@/types/question'

// Static imports for bundling with Vite
import subject1Questions from '@/data/subject1/questions.json'
import subject1Chapters from '@/data/subject1/chapters.json'
import subject4Questions from '@/data/subject4/questions.json'
import subject4Chapters from '@/data/subject4/chapters.json'

// Keywords in question content that indicate an image is required
const IMAGE_KEYWORDS = /如图|图中|图示|下图|上图|看图/

function needsImage(question: Question): boolean {
  if (question.image) return true
  return IMAGE_KEYWORDS.test(question.content)
}

const questionsMap: Record<string, Question[]> = {
  subject1: (subject1Questions as Question[]).filter((q) => !needsImage(q)),
  subject4: (subject4Questions as Question[]).filter((q) => !needsImage(q)),
}

const chaptersMap: Record<string, Chapter[]> = {
  subject1: subject1Chapters as Chapter[],
  subject4: subject4Chapters as Chapter[],
}

export function getQuestions(subject: SubjectId): Question[] {
  return questionsMap[subject] ?? []
}

export function getChapters(subject: SubjectId): Chapter[] {
  return chaptersMap[subject] ?? []
}

export function getQuestionsByChapter(subject: SubjectId, chapterId: string): Question[] {
  return getQuestions(subject).filter((q) => q.chapterId === chapterId)
}

export function getQuestionById(questionId: string): Question | undefined {
  for (const questions of Object.values(questionsMap)) {
    const found = questions.find((q) => q.id === questionId)
    if (found) return found
  }
  return undefined
}

export function getQuestionsByIds(questionIds: string[]): Question[] {
  const idSet = new Set(questionIds)
  const result: Question[] = []
  for (const questions of Object.values(questionsMap)) {
    result.push(...questions.filter((q) => idSet.has(q.id)))
  }
  // Maintain the order of questionIds
  return questionIds.map((id) => result.find((q) => q.id === id)!).filter(Boolean)
}

export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function sampleQuestions(subject: SubjectId, count: number): Question[] {
  const questions = getQuestions(subject)
  const shuffled = shuffleArray(questions)
  return shuffled.slice(0, Math.min(count, shuffled.length))
}
