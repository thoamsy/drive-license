import { Link, useLocation } from '@tanstack/react-router'
import { BarChart3, BookOpen, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', label: '首页', icon: Home },
  { to: '/subject/subject1', label: '科一', icon: BookOpen },
  { to: '/stats', label: '统计', icon: BarChart3 },
]

export function BottomNav() {
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-card/85 backdrop-blur-xl border-t border-border/60 z-50 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-stretch justify-around px-2 pt-1 pb-1.5">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.to

          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'flex flex-col items-center gap-0.5 flex-1 py-1.5 px-2 rounded-xl transition-all text-xs',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <div
                className={cn(
                  'p-1.5 rounded-xl transition-all',
                  isActive && 'bg-primary/12'
                )}
              >
                <Icon className={cn('w-5 h-5', isActive && 'stroke-[2.2]')} />
              </div>
              <span className={cn('text-[11px] leading-none', isActive && 'font-semibold')}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
