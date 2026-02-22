import Dexie, { type Table } from 'dexie'
import type { SubjectId } from '@/types/question'

export interface PracticeRecord {
  id?: number
  questionId: string
  subject: SubjectId
  isCorrect: boolean
  answeredAt: Date
}

export interface FavoriteRecord {
  id?: number
  questionId: string
  subject: SubjectId
  createdAt: Date
}

export interface ExamRecord {
  id?: number
  subject: SubjectId
  score: number
  totalScore: number
  passed: boolean
  durationSeconds: number
  answers: Record<string, string> // questionId -> chosen key
  completedAt: Date
}

export interface PracticeProgress {
  id?: number
  subject: SubjectId
  mode: 'sequential' | 'random' | 'chapter'
  chapterId?: string
  currentIndex: number
  questionIds: string[]
  updatedAt: Date
}

class DrivingDB extends Dexie {
  practiceRecords!: Table<PracticeRecord>
  favorites!: Table<FavoriteRecord>
  examRecords!: Table<ExamRecord>
  practiceProgress!: Table<PracticeProgress>

  constructor() {
    super('DrivingLicenseDB')
    this.version(1).stores({
      practiceRecords: '++id, questionId, subject, isCorrect, answeredAt',
      favorites: '++id, questionId, subject, createdAt',
      examRecords: '++id, subject, passed, completedAt',
      practiceProgress: '++id, subject, mode, [subject+mode+chapterId]',
    })
    // v2: 清除旧的 practiceProgress 记录（chapterId 存的是 undefined 导致复合索引失效）
    this.version(2).stores({
      practiceRecords: '++id, questionId, subject, isCorrect, answeredAt',
      favorites: '++id, questionId, subject, createdAt',
      examRecords: '++id, subject, passed, completedAt',
      practiceProgress: '++id, subject, mode, [subject+mode+chapterId]',
    }).upgrade((tx) => tx.table('practiceProgress').clear())
  }
}

export const db = new DrivingDB()
