import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SUBJECTS } from '@/types/question'
import type { SubjectId } from '@/types/question'

export const Route = createFileRoute('/subject/$id/guide')({
  component: GuidePage,
})

const subject2Guide = [
  {
    title: '倒车入库',
    content:
      '进入车库前，先对准左后角，当左后角对准左后库角时，向右打满方向盘。当车辆进入约2/3时，回正方向盘。右侧车门对准右边库角时，停车完成。',
  },
  {
    title: '侧方位停车',
    content:
      '与前车并排，当后视镜与前车后端对齐时，向右打满方向盘。车前端超过前车后端时，向左打满方向盘。当车身与路边平行时，停车。',
  },
  {
    title: '坡道定点停车起步',
    content:
      '上坡时减速，在停车线前缓慢停车。起步时，踩离合踏板至半联动位置，松手刹，缓慢抬离合，确保车辆不后溜后完全起步。',
  },
  {
    title: '直角转弯',
    content:
      '进入直角弯时减速，当前轮到达转弯点时，迅速打满方向盘。车头通过后，根据前方道路情况适当回方向，确保后轮不碾压路牙。',
  },
  {
    title: '曲线行驶',
    content:
      '进入曲线前减速，保持匀速行驶。通过S形弯道时，注意观察前方道路走向，及时调整方向盘，保持车辆在车道内平稳行驶。',
  },
]

const subject3Guide = [
  {
    title: '上车准备',
    content:
      '绕车检查车辆状况，调整座椅至合适位置，调整后视镜，系好安全带。确认各操控件正常后，方可发动车辆。',
  },
  {
    title: '起步',
    content:
      '观察周围环境，确认安全后打左转向灯，挂一挡，缓慢抬离合至半联动位置，配合油门平稳起步。',
  },
  {
    title: '变更车道',
    content:
      '提前打转向灯，通过后视镜确认目标车道安全，缓慢转动方向盘变道，变道完成后关闭转向灯。全程保持稳定车速。',
  },
  {
    title: '超车',
    content:
      '确认前方无来车，打左转向灯，加速从被超车辆左侧超越。超越后，确认被超车辆在后视镜中完整出现后，打右转向灯，返回原车道。',
  },
  {
    title: '靠边停车',
    content:
      '提前减速，打右转向灯，缓慢靠近路边。车轮距路边约30cm时，停车拉手刹，熄火，关闭转向灯。',
  },
  {
    title: '灯光使用',
    content:
      '夜间行驶使用近光灯，会车时提前关闭远光灯。雨、雾、雪天气使用雾灯。通过隧道时开启近光灯。弯道超车使用远光灯闪烁提示。',
  },
]

function GuidePage() {
  const { id } = Route.useParams()
  const subjectId = id as SubjectId
  const subject = SUBJECTS.find((s) => s.id === subjectId)

  const guide = subjectId === 'subject2' ? subject2Guide : subject3Guide

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2 pt-2">
        <Link to="/subject/$id" params={{ id: subjectId }}>
          <Button variant="ghost" size="icon" className="-ml-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">{subject?.name}技巧指南</h1>
          <p className="text-xs text-muted-foreground">实用通关技巧</p>
        </div>
      </div>

      <div className="space-y-3">
        {guide.map((item, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">{item.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
