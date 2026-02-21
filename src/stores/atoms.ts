import { atom } from 'jotai'
import type { SubjectId } from '@/types/question'

export const currentSubjectAtom = atom<SubjectId>('subject1')

export const practiceIndexAtom = atom<number>(0)

export const examTimerActiveAtom = atom<boolean>(false)
