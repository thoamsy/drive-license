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
    <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto border-t border-border bg-background z-50">
      <div className="flex">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.to

          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'flex flex-col items-center justify-center flex-1 py-2 gap-0.5 text-xs transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
      {/* Safe area bottom */}
      <div className="h-safe-area-inset-bottom" />
    </nav>
  )
}
