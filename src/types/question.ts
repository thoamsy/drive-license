export type QuestionType = 'single' | 'judge'

export interface Option {
  key: string // A, B, C, D
  text: string
}

export interface Question {
  id: string
  subject: SubjectId
  chapterId: string
  type: QuestionType
  content: string
  image?: string
  options: Option[]
  answer: string // correct option key, e.g. 'A' or 'C'
  explanation?: string
}

export interface Chapter {
  id: string
  subject: SubjectId
  name: string
  order: number
}

export type SubjectId = 'subject1' | 'subject2' | 'subject3' | 'subject4'

export interface Subject {
  id: SubjectId
  name: string
  shortName: string
  description: string
  hasQuestions: boolean // subject1 & subject4
  examMinutes: number
  examCount: number
  passScore: number
  totalScore: number
}

export const SUBJECTS: Subject[] = [
  {
    id: 'subject1',
    name: '科目一',
    shortName: '科一',
    description: '道路交通安全法规、交通标志标线',
    hasQuestions: true,
    examMinutes: 45,
    examCount: 100,
    passScore: 90,
    totalScore: 100,
  },
  {
    id: 'subject2',
    name: '科目二',
    shortName: '科二',
    description: '场地驾驶技能（倒车入库、坡道、直角等）',
    hasQuestions: false,
    examMinutes: 0,
    examCount: 0,
    passScore: 0,
    totalScore: 0,
  },
  {
    id: 'subject3',
    name: '科目三',
    shortName: '科三',
    description: '道路驾驶技能及安全文明驾驶',
    hasQuestions: false,
    examMinutes: 0,
    examCount: 0,
    passScore: 0,
    totalScore: 0,
  },
  {
    id: 'subject4',
    name: '科目四',
    shortName: '科四',
    description: '安全文明驾驶知识',
    hasQuestions: true,
    examMinutes: 45,
    examCount: 50,
    passScore: 45,
    totalScore: 50,
  },
]
