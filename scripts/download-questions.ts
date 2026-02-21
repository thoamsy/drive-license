/**
 * 从 MXNZP API 下载完整驾考题库
 * 用法: bun run scripts/download-questions.ts
 *
 * API 文档: https://www.mxnzp.com
 * - question/list: 获取题目列表（无答案）
 * - answer/list:   批量获取答案和解析
 */

const APP_ID = 'ktulnlifpgdbitln'
const APP_SECRET = 'YOw9wTgePR4ibLWGaUg1WBJYaWCviiyN'
const BASE_URL = 'https://www.mxnzp.com/api/driver_exam'

// rank: 1=小车 2=摩托车 3=客车 4=货车
// type: 1=科目一 4=科目四
const TARGETS = [
  { rank: 1, type: 1, label: '小车科目一', outFile: 'subject1' },
  { rank: 1, type: 4, label: '小车科目四', outFile: 'subject4' },
]

interface RawQuestion {
  type: number       // 题型: 1=单选 2=多选 3=判断
  id: number
  rank: number       // 车型
  title: string
  op1: string
  op2: string
  op3: string
  op4: string
  titleType: number  // 1=文字题 2=图片题
  titlePic: string   // 图片 URL
}

interface RawAnswer {
  id: number
  titleType: number
  explain: string
  answer: string     // 'A' | 'B' | 'C' | 'D'
}

interface ListResponse {
  code: number
  msg: string
  data: {
    page: number
    totalCount: number
    totalPage: number
    limit: number
    list: RawQuestion[]
  }
}

interface AnswerResponse {
  code: number
  msg: string
  data: RawAnswer[]
}

// 最终输出的题目格式（与项目现有类型兼容）
interface OutputQuestion {
  id: string
  subject: string
  chapterId: string
  type: 'single' | 'judge'
  content: string
  image?: string
  options: { key: string; text: string }[]
  answer: string
  explanation?: string
}

async function fetchPage(rank: number, type: number, page: number): Promise<ListResponse> {
  const url = `${BASE_URL}/question/list?page=${page}&rank=${rank}&type=${type}&app_id=${APP_ID}&app_secret=${APP_SECRET}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching page ${page}`)
  return res.json() as Promise<ListResponse>
}

async function fetchAnswers(ids: number[]): Promise<RawAnswer[]> {
  const url = `${BASE_URL}/answer/list?ids=${ids.join(',')}&app_id=${APP_ID}&app_secret=${APP_SECRET}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching answers`)
  const json = (await res.json()) as AnswerResponse
  if (json.code !== 1) throw new Error(`Answer API error: ${json.msg}`)
  return json.data
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function buildQuestion(q: RawQuestion, a: RawAnswer, subjectKey: string): OutputQuestion {
  const options: { key: string; text: string }[] = []

  const rawOps = [q.op1, q.op2, q.op3, q.op4]
  const keys = ['A', 'B', 'C', 'D']

  // 判断题只有两个选项（正确/错误），选项 op3/op4 为空
  for (let i = 0; i < rawOps.length; i++) {
    const text = rawOps[i]?.trim()
    if (!text) break
    // 去掉选项前面可能自带的 "A、" 前缀
    const cleaned = text.replace(/^[A-D][、．.]\s*/u, '')
    options.push({ key: keys[i], text: cleaned })
  }

  const isJudge = options.length === 2
  const hasImage = q.titlePic && q.titlePic.trim() !== ''

  const out: OutputQuestion = {
    id: `q_${q.id}`,
    subject: subjectKey,
    chapterId: `${subjectKey}_default`,
    type: isJudge ? 'judge' : 'single',
    content: q.title.trim(),
    options,
    answer: a.answer,
    explanation: a.explain?.trim() || undefined,
  }

  if (hasImage) out.image = q.titlePic.trim()

  return out
}

async function downloadSubject(rank: number, type: number, label: string, subjectKey: string) {
  console.log(`\n📥 开始下载：${label}`)

  // 1. 获取第一页，确认总页数
  const first = await fetchPage(rank, type, 1)
  if (first.code !== 1) throw new Error(`API 错误: ${first.msg}`)

  const { totalPage, totalCount } = first.data
  // 免费账号最多获取 50 页（500 题）
  const FREE_PAGE_LIMIT = 50
  const maxPage = Math.min(totalPage, FREE_PAGE_LIMIT)
  const fetchableCount = maxPage * first.data.limit
  console.log(`   总题数: ${totalCount}，共 ${totalPage} 页（免费账号限制 ${maxPage} 页，可获取约 ${fetchableCount} 题）`)

  const allQuestions: RawQuestion[] = [...first.data.list]

  // 2. 获取剩余页（sleep 放在请求前，确保两次请求之间至少间隔 1.2s）
  for (let page = 2; page <= maxPage; page++) {
    await sleep(1200)
    process.stdout.write(`\r   抓取题目: ${page}/${totalPage} 页`)
    const resp = await fetchPage(rank, type, page)
    if (resp.code !== 1) throw new Error(`第 ${page} 页错误: ${resp.msg}`)
    allQuestions.push(...resp.data.list)
  }
  console.log(`\r   ✅ 抓取完成，共 ${allQuestions.length} 道题`)

  // 3. 批量获取答案（每批 20 个 id）
  const BATCH = 20
  const answerMap = new Map<number, RawAnswer>()

  for (let i = 0; i < allQuestions.length; i += BATCH) {
    await sleep(1200)  // 每次请求前都等待，包括第一次
    const batch = allQuestions.slice(i, i + BATCH)
    const ids = batch.map((q) => q.id)
    process.stdout.write(`\r   获取答案: ${Math.min(i + BATCH, allQuestions.length)}/${allQuestions.length}`)
    const answers = await fetchAnswers(ids)
    for (const a of answers) answerMap.set(a.id, a)
  }
  console.log(`\r   ✅ 答案获取完成，共 ${answerMap.size} 条`)

  // 4. 组合数据
  const missing: number[] = []
  const output: OutputQuestion[] = []

  for (const q of allQuestions) {
    const a = answerMap.get(q.id)
    if (!a) {
      missing.push(q.id)
      continue
    }
    output.push(buildQuestion(q, a, subjectKey))
  }

  if (missing.length > 0) {
    console.warn(`   ⚠️  ${missing.length} 道题缺少答案，已跳过`)
  }

  return output
}

async function main() {
  console.log('🚗 驾考题库下载器')
  console.log('==================')

  const { mkdir, writeFile } = await import('node:fs/promises')

  for (let t = 0; t < TARGETS.length; t++) {
    if (t > 0) {
      console.log('   等待 2 秒后开始下一个科目...')
      await sleep(2000)
    }
    const target = TARGETS[t]
    const questions = await downloadSubject(target.rank, target.type, target.label, target.outFile)

    const dir = `src/data/${target.outFile}`
    await mkdir(dir, { recursive: true })

    const outPath = `${dir}/questions.json`
    await writeFile(outPath, JSON.stringify(questions, null, 2), 'utf-8')

    console.log(`   💾 已保存到 ${outPath}（${questions.length} 题）`)
  }

  console.log('\n✅ 全部下载完成！')
}

main().catch((err) => {
  console.error('❌ 下载失败:', err)
  process.exit(1)
})
