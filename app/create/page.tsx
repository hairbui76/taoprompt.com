"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Copy, Sparkles, Brain, MessageSquare, Clock, Lock, Globe } from "lucide-react"
import { getDefaultModel } from "@/lib/models"
import { defaultModelSettings } from "@/types/models"
import { useToast } from "@/components/ui/use-toast"
import { ModelSelector } from "@/components/model-selector"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"
import { Pagination } from "@/components/pagination"
import type { Prompt } from "@/types/database"
import { Badge } from "@/components/ui/badge"

export default function CreatePromptPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [userRequest, setUserRequest] = useState("")
  const [selectedModelId, setSelectedModelId] = useState(getDefaultModel().id)
  const [settings] = useState({ ...defaultModelSettings })
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState("")
  const [showModelAlert, setShowModelAlert] = useState(false)
  const [isAnalysisExpanded, setIsAnalysisExpanded] = useState(true)
  const [finalPrompt, setFinalPrompt] = useState("")
  const [activeTab, setActiveTab] = useState<"thinking" | "prompt">("thinking")
  const [charCount, setCharCount] = useState(0)
  const MAX_CHARS = 1000
  const [isAnalysisComplete, setIsAnalysisComplete] = useState(false)

  // States for history
  const [history, setHistory] = useState<Prompt[]>([])
  const [isHistoryLoading, setIsHistoryLoading] = useState(true)
  const [historyPagination, setHistoryPagination] = useState({
    total: 0,
    page: 1,
    limit: 5,
    pages: 1,
  })

  // Add new state to track prompt creation completion
  const [promptId, setPromptId] = useState<string | null>(null)

  // Fetch history
  const fetchHistory = async (page = 1) => {
    try {
      setIsHistoryLoading(true)
      const response = await fetch(`/api/prompts?page=${page}&limit=${historyPagination.limit}`)

      if (!response.ok) {
        throw new Error("Failed to fetch history")
      }

      const data = await response.json()
      setHistory(data.prompts)
      setHistoryPagination(data.pagination)
    } catch (error) {
      console.error("Error fetching history:", error)
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi tải lịch sử",
        variant: "destructive",
      })
    } finally {
      setIsHistoryLoading(false)
    }
  }

  // Handle history page change
  const handleHistoryPageChange = (page: number) => {
    fetchHistory(page)
  }

  // Initial fetch history
  useEffect(() => {
    fetchHistory()
  }, [])

  // Add useEffect for auto-switching tab
  useEffect(() => {
    if (isAnalysisComplete && finalPrompt) {
      const timer = setTimeout(() => {
        setActiveTab("prompt")
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [isAnalysisComplete, finalPrompt])

  // Add useEffect to reload history when prompt creation is complete
  useEffect(() => {
    if (isAnalysisComplete && promptId) {
      fetchHistory(1) // Reset to first page and reload
      setPromptId(null) // Reset promptId
    }
  }, [isAnalysisComplete, promptId])

  const handleModelChange = (modelId: string) => {
    if (modelId !== "claude-3-5-haiku-latest") {
      setShowModelAlert(true)
      setSelectedModelId("claude-3-5-haiku-latest")
    } else {
      setSelectedModelId(modelId)
    }
  }

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result)
      toast({
        description: "Đã sao chép vào clipboard",
      })
    }
  }

  const extractPrompt = (text: string) => {
    const match = text.match(/<prompt_built>[\s\S]*?<\/prompt_built>/)
    return match ? match[0].replace(/<\/?prompt_built>/g, '').trim() : ""
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    if (text.length <= MAX_CHARS) {
      setUserRequest(text)
      setCharCount(text.length)
    }
  }

  const handleProcess = async () => {
    if (!userRequest.trim()) {
      toast({
        description: "Vui lòng nhập yêu cầu của bạn",
        variant: "destructive",
      })
      return
    }

    setResult("")
    setFinalPrompt("")
    setIsProcessing(true)
    setIsAnalysisComplete(false)
    setPromptId(null) // Reset promptId at start

    try {
      const response = await fetch("/api/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userRequest,
          modelId: selectedModelId,
          settings,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to process request")
      }

      // Get promptId from response headers
      const newPromptId = response.headers.get("X-Prompt-Id")
      if (newPromptId) {
        setPromptId(newPromptId)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error("No reader available")
      }

      let accumulatedText = ""
      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          setIsAnalysisComplete(true)
          break
        }
        const chunk = new TextDecoder().decode(value)
        accumulatedText += chunk
        setResult(accumulatedText)

        // Extract and update prompt if found
        const prompt = extractPrompt(accumulatedText)
        if (prompt) {
          setFinalPrompt(prompt)
        }
      }
    } catch (error) {
      console.error("Error processing request:", error)
      toast({
        description: "Có lỗi xảy ra khi xử lý yêu cầu",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle toggle public/private
  const handleToggleStatus = async (id: string, currentStatus: "public" | "private") => {
    try {
      // Nếu đang chuyển từ private sang public, kiểm tra prompt trước
      if (currentStatus === "private") {
        // Tìm prompt trong history
        const prompt = history.find(p => p.id === id)

        // Kiểm tra nếu không có final_prompt
        if (!prompt?.final_prompt?.trim()) {
          toast({
            title: "Không thể công khai",
            description: "Prompt này không có nội dung hoàn chỉnh",
            variant: "destructive",
          })
          return
        }
      }

      const newStatus = currentStatus === "public" ? "private" : "public"

      const response = await fetch("/api/prompts", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          status: newStatus,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update prompt status")
      }

      // Update local state
      setHistory(history.map((prompt) => (prompt.id === id ? { ...prompt, status: newStatus } : prompt)))

      toast({
        title: "Cập nhật thành công",
        description: `Prompt đã được chuyển sang ${newStatus === "public" ? "công khai" : "riêng tư"}`,
      })
    } catch (error) {
      console.error("Error updating prompt status:", error)
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi cập nhật trạng thái prompt",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <h1 className="text-4xl font-bold">Tạo Prompt</h1>
          </div>
          <p className="text-muted-foreground text-center max-w-[600px]">
            Nhập yêu cầu của bạn, AI sẽ phân tích và tạo ra prompt phù hợp nhất
          </p>
        </div>

        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Input Column */}
              <div className="flex flex-col space-y-4">
                <div className="border rounded-lg overflow-hidden">
                  <div className="relative flex flex-col">
                    <Textarea
                      placeholder="Ví dụ: Tạo email marketing cho [sản phẩm]"
                      className={cn(
                        "min-h-[200px] text-base resize-none",
                        "border-0 focus-visible:ring-0 rounded-none",
                        "placeholder:text-muted-foreground/60"
                      )}
                      value={userRequest}
                      onChange={handleInputChange}
                      disabled={isProcessing}
                    />
                  </div>

                  <div className="relative z-10 flex items-center justify-between gap-4 p-3 bg-background border-t">
                    <div className="flex items-center gap-4">
                      <ModelSelector
                        value={selectedModelId}
                        onValueChange={handleModelChange}
                      />
                      <div className="text-xs text-muted-foreground">
                        {charCount}/{MAX_CHARS} ký tự
                      </div>
                    </div>
                    <Button
                      className={cn(
                        "gap-2 transition-all",
                        isProcessing && "bg-muted-foreground/20"
                      )}
                      onClick={handleProcess}
                      disabled={isProcessing || !userRequest.trim()}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          Tạo prompt
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Lịch sử yêu cầu
                    </CardTitle>
                  </CardHeader>
                  <ScrollArea className="h-[280px]">
                    <CardContent className="p-0">
                      <div className="space-y-0">
                        {isHistoryLoading ? (
                          <div className="flex justify-center items-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin" />
                          </div>
                        ) : history.length === 0 ? (
                          <div className="text-center py-8 text-sm text-muted-foreground">
                            Chưa có lịch sử yêu cầu
                          </div>
                        ) : (
                          <>
                            <div className="space-y-0">
                              {history.map((item) => (
                                <div
                                  key={item.id}
                                  className="flex flex-col p-4 text-sm hover:bg-muted/50 space-y-1 border-b last:border-0"
                                >
                                  <button
                                    onClick={() => {
                                      setUserRequest(item.user_request)
                                      setResult(item.analysis_result)
                                      setFinalPrompt(item.final_prompt)
                                      setIsAnalysisComplete(true)
                                      setActiveTab("prompt")
                                    }}
                                    className="text-left w-full"
                                  >
                                    <div className="line-clamp-1">
                                      {item.title || (
                                        item.user_request.length > 100
                                          ? item.user_request.substring(0, 100) + "..."
                                          : item.user_request
                                      )}
                                    </div>
                                  </button>
                                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>
                                      {formatDistanceToNow(new Date(item.created_at), {
                                        addSuffix: true,
                                        locale: vi,
                                      })}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <Badge variant={item.status === "public" ? "default" : "outline"}>
                                        {item.status === "public" ? "Công khai" : "Riêng tư"}
                                      </Badge>
                                      {item.final_prompt?.trim() && (
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6"
                                          onClick={(e) => {
                                            handleToggleStatus(item.id, item.status)
                                          }}
                                        >
                                          {item.status === "public" ? (
                                            <Lock className="h-3 w-3" />
                                          ) : (
                                            <Globe className="h-3 w-3" />
                                          )}
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            {historyPagination.pages > 1 && (
                              <div className="p-4 border-t">
                                <Pagination
                                  currentPage={historyPagination.page}
                                  totalPages={historyPagination.pages}
                                  onPageChange={handleHistoryPageChange}
                                />
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </CardContent>
                  </ScrollArea>
                </Card>
              </div>

              {/* Result Column */}
              <div className="border rounded-lg min-h-[calc(100vh-400px)]">
                {(result || isProcessing) ? (
                  <Tabs
                    defaultValue="thinking"
                    value={activeTab}
                    onValueChange={(value) => setActiveTab(value as "thinking" | "prompt")}
                    className="h-full"
                  >
                    <TabsList className="w-full">
                      <TabsTrigger value="thinking" className="flex-1 gap-2">
                        <Brain className="h-4 w-4" />
                        Quá trình phân tích
                      </TabsTrigger>
                      <TabsTrigger value="prompt" className="flex-1 gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Prompt
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="thinking" className="p-4">
                      <ScrollArea className="h-[500px]">
                        <div className="space-y-4 font-mono text-sm">
                          {result.split('\n').map((line, index) => (
                            !line.includes('<prompt_built>') && !line.includes('</prompt_built>') && (
                              <div key={index} className={cn(
                                "transition-opacity whitespace-pre-wrap",
                                isProcessing && index === result.split('\n').length - 1 ? "animate-pulse" : ""
                              )}>
                                {line}
                              </div>
                            )
                          ))}
                          {isProcessing && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Đang suy nghĩ...
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </TabsContent>

                    <TabsContent value="prompt" className="relative p-6">
                      <ScrollArea className="h-[500px]">
                        <div className="prose prose-sm max-w-none">
                          <pre className="whitespace-pre-wrap font-sans text-base bg-transparent p-0 border-0">
                            {finalPrompt}
                          </pre>
                        </div>
                      </ScrollArea>
                      {finalPrompt && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(finalPrompt)
                            toast({
                              description: "Đã sao chép vào clipboard",
                            })
                          }}
                          className="absolute top-4 right-4"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Kết quả sẽ xuất hiện tại đây
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Dialog open={showModelAlert} onOpenChange={setShowModelAlert}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thông báo</DialogTitle>
            <DialogDescription>
              Phiên bản demo chỉ được dùng Claude 3.5 Haiku
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}

