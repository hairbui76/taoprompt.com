"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Copy, Check } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"

interface VersionComparisonProps {
  versions: { number: number; prompt: string }[]
}

export function VersionComparison({ versions }: VersionComparisonProps) {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto scroll to bottom when content changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight
    }
  }, [versions])

  const handleCopy = () => {
    if (versions.length > 0) {
      navigator.clipboard.writeText(versions[0].prompt)
      setCopied(true)

      toast({
        title: "Đã sao chép",
        description: "Đã sao chép prompt",
      })

      setTimeout(() => {
        setCopied(false)
      }, 2000)
    }
  }

  return (
    <Card className="relative overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Prompt cuối cùng
        </CardTitle>
        <CardDescription>Prompt đã được tối ưu theo yêu cầu của bạn</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <Button variant="ghost" size="icon" className="absolute top-2 right-2 z-10" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={versions.length > 0 ? versions[0].prompt : ""}
              readOnly
              className="min-h-[400px] resize-none bg-transparent font-mono text-sm leading-relaxed"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'var(--scrollbar-thumb) var(--scrollbar-track)',
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

