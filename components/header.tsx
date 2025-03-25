import Link from "next/link"
import { Brain, Plus } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/40 backdrop-blur px-4">
      <div className="container mx-auto flex items-center justify-between py-3">
        <Link href="/" className="flex items-center gap-x-2.5">
          <Brain className="h-5 w-5 text-primary" />
          <span className="text-lg font-semibold">Tạo Prompt AI</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/create">
            <Button size="sm" className="h-8 gap-1.5">
              <Plus className="h-4 w-4" />
              Tạo mới
            </Button>
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

