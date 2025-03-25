import Link from "next/link"
import { Github } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-background/40 backdrop-blur">
      <div className="container mx-auto py-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-4">
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Điều khoản
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Chính sách bảo mật
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 TaoPrompt.com
            </p>
            <Link
              href="https://github.com/yourusername/promptmaster"
              target="_blank"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

