import { createRootRoute, Outlet, useLocation } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Toaster, toast } from 'sonner'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { BottomNav } from '@/components/BottomNav'

// 练习/考试页自带沉浸式布局，不显示 app 底部导航
const FULLSCREEN_RE = /\/(practice\/|exam$|mistakes$)/

function PWAUpdateToast() {
  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW()

  useEffect(() => {
    if (!needRefresh) return
    toast('发现新版本', {
      description: '刷新即可获得最新内容',
      action: {
        label: '立即刷新',
        onClick: () => updateServiceWorker(true),
      },
      duration: Infinity,
    })
  }, [needRefresh, updateServiceWorker])

  return null
}

function RootLayout() {
  const { pathname } = useLocation()
  const isFullscreen = FULLSCREEN_RE.test(pathname)

  return (
    <div className="flex flex-col h-svh max-w-lg mx-auto bg-background">
      <main className={
        isFullscreen
          ? 'flex-1 min-h-0 overflow-hidden'
          : 'flex-1 overflow-y-auto pb-[calc(3.5rem+env(safe-area-inset-bottom))]'
      }>
        <Outlet />
      </main>
      {!isFullscreen && <BottomNav />}
      <Toaster position="top-center" richColors />
      <PWAUpdateToast />
    </div>
  )
}

export const Route = createRootRoute({ component: RootLayout })
