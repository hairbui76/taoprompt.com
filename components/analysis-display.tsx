"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Copy, Check, Loader2 } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useToast } from "@/components/ui/use-toast"

interface AnalysisDisplayProps {
  analysisResult: string
  title?: string
  description?: string
}

export function AnalysisDisplay({
  analysisResult,
  title = "Quá trình phân tích",
  description = "AI đang phân tích yêu cầu của bạn",
}: AnalysisDisplayProps) {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)
  const [displayTitle, setDisplayTitle] = useState(title)
  const [displayDescription, setDisplayDescription] = useState(description)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (analysisResult.includes("<analysis_result>")) {
      setDisplayTitle("Kết quả phân tích")
      setDisplayDescription("Phân tích chi tiết yêu cầu của bạn")
    } else if (analysisResult.includes("<analysis_process>")) {
      setDisplayTitle("Quá trình phân tích")
      setDisplayDescription("AI đang phân tích yêu cầu của bạn")
    }
  }, [analysisResult])

  // Auto scroll to bottom when content changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight
    }
  }, [analysisResult])

  const handleCopy = () => {
    navigator.clipboard.writeText(analysisResult)
    setCopied(true)

    toast({
      title: "Đã sao chép",
      description: "Đã sao chép kết quả phân tích",
    })

    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  return (
    <Card className="relative overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {displayTitle}
          {displayTitle === "Quá trình phân tích" && (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          )}
        </CardTitle>
        <CardDescription>{displayDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <Button variant="ghost" size="icon" className="absolute top-2 right-2 z-10" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={analysisResult}
              readOnly
              className="min-h-[400px] resize-none bg-transparent font-mono text-sm leading-relaxed"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'var(--scrollbar-thumb) var(--scrollbar-track)',
              }}
            />
            {displayTitle === "Quá trình phân tích" && (
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

