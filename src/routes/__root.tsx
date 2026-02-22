import { createRootRoute, Outlet, useLocation } from '@tanstack/react-router'
import { BottomNav } from '@/components/BottomNav'

// 练习/考试页自带沉浸式布局，不显示 app 底部导航
const FULLSCREEN_RE = /\/(practice\/|exam$|mistakes$)/

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
    </div>
  )
}

export const Route = createRootRoute({ component: RootLayout })
