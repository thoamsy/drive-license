# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun dev          # 开发服务器
bun run build    # TypeScript 编译 + Vite 构建
bun run lint     # ESLint 检查
bun run preview  # 预览构建产物（PWA 需要此命令才能测试 Service Worker）
```

## Deployments

- **Vercel**: https://drving-license.vercel.app（main 分支自动部署）
- **Cloudflare Pages**: https://drive-license.pages.dev（main 分支自动部署）

## Architecture

### 数据层

**题库**（只读，编译时打包）：
- `src/data/subject1/` 和 `src/data/subject4/` — `questions.json` + `chapters.json`
- `src/lib/question-bank.ts` — 统一访问入口（`getQuestions`, `getChapters`, `sampleQuestions` 等）
- 科目二/三无题库，仅有指南页

**持久化**（运行时，IndexedDB via Dexie）：
- `src/db/index.ts` — 四张表：`practiceRecords`、`favorites`、`examRecords`、`practiceProgress`
- `practiceProgress` 用复合索引 `[subject+mode+chapterId]` 实现断点续练

**UI 状态**（`src/stores/atoms.ts`，Jotai）：
- `currentSubjectAtom`、`practiceIndexAtom`、`examTimerActiveAtom`

### 路由

TanStack Router 文件路由，`src/routeTree.gen.ts` **自动生成，不要手动修改**：

```
/                          → 首页
/stats                     → 学习统计
/subject/$id               → 科目详情
/subject/$id/practice/sequential
/subject/$id/practice/random
/subject/$id/practice/chapter/$chapterId
/subject/$id/exam
/subject/$id/mistakes
/subject/$id/guide         → 科二/三技巧指南
```

### 核心 Hooks

- `src/hooks/usePractice.ts` — 刷题逻辑（顺序/随机/章节模式，断点续练，收藏/错题过滤）
- `src/hooks/useExam.ts` — 考试逻辑（倒计时、自动提交、评分、保存 ExamRecord）

### 类型系统

- `SubjectId` = `'subject1' | 'subject2' | 'subject3' | 'subject4'`
- `QuestionType` = `'single' | 'judge'`（单选或判断题）
- `SUBJECTS` 常量数组定义了每科的考试规则（题数、及格分等）

### 部署配置

- `vercel.json` — SPA 路由重写（`/* → /index.html`）
- `public/_redirects` — Cloudflare Pages 同等配置
