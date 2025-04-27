"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

interface AIStreamProps {
  prompt: string
  modelId: string
  settings?: {
    temperature?: number
    maxTokens?: number
    topP?: number
    frequencyPenalty?: number
  }
  onComplete?: (text: string) => void
}

export function AIStream({ prompt, modelId, settings, onComplete }: AIStreamProps) {
  const [text, setText] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const fetchStream = async () => {
      try {
        setIsLoading(true)
        setError(null)
        setText("")

        const response = await fetch("/api/stream", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt,
            modelId,
            settings,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to stream response")
        }

        if (!response.body) {
          throw new Error("Response body is null")
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let done = false
        let accumulated = ""

        while (!done) {
          const { value, done: doneReading } = await reader.read()
          done = doneReading

          if (done) {
            break
          }

          const chunk = decoder.decode(value)
          accumulated += chunk

          if (isMounted) {
            setText(accumulated)
          }
        }

        if (isMounted) {
          setIsLoading(false)
          if (onComplete) {
            onComplete(accumulated)
          }
        }
      } catch (err) {
        console.error("Error streaming response:", err)
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Unknown error")
          setIsLoading(false)
        }
      }
    }

    fetchStream()

    return () => {
      isMounted = false
    }
  }, [prompt, modelId, settings, onComplete])

  if (error) {
    return (
      <div className="p-4 bg-destructive/10 text-destructive rounded-md">
        <p>Error: {error}</p>
      </div>
    )
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute top-0 right-0 p-2">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      )}
      <div className="prose dark:prose-invert max-w-none">
        {text || (
          <div className="flex items-center justify-center p-4 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Generating response...</span>
          </div>
        )}
      </div>
    </div>
  )
}

