import { createRootRoute, Outlet } from '@tanstack/react-router'
import { BottomNav } from '@/components/BottomNav'

export const Route = createRootRoute({
  component: () => (
    <div className="flex flex-col min-h-svh max-w-lg mx-auto bg-background">
      <main className="flex-1 overflow-y-auto pb-[calc(4rem+env(safe-area-inset-bottom))]">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  ),
})
