import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Copy, Sparkles, ChevronDown, ChevronUp } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"
import { useToast } from "@/components/ui/use-toast"
import { useState } from "react"
import type { Prompt } from "@/types/database"

interface PromptDetailModalProps {
    prompt: Prompt | null
    isOpen: boolean
    onClose: () => void
}

export function PromptDetailModal({ prompt, isOpen, onClose }: PromptDetailModalProps) {
    const { toast } = useToast()
    const [isRequestExpanded, setIsRequestExpanded] = useState(false)

    if (!prompt) return null

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text)
        toast({
            description: "Đã sao chép vào clipboard",
        })
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl h-[90vh] flex flex-col overflow-hidden">
                <DialogHeader className="space-y-2 flex-shrink-0">
                    <DialogTitle className="text-lg font-medium">
                        {prompt.title || "Untitled Prompt"}
                    </DialogTitle>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>
                            {formatDistanceToNow(new Date(prompt.created_at), {
                                addSuffix: true,
                                locale: vi
                            })}
                        </span>
                    </div>
                </DialogHeader>

                <div className="flex flex-col gap-6 py-4 flex-1 overflow-hidden">
                    {/* Yêu cầu người dùng - Có thể thu gọn */}
                    <div className="rounded-lg border bg-muted/30 flex-shrink-0">
                        <button
                            className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                            onClick={() => setIsRequestExpanded(!isRequestExpanded)}
                        >
                            <div className="flex items-center gap-2">
                                <h3 className="font-medium text-sm">Yêu cầu gốc</h3>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleCopy(prompt.user_request)
                                    }}
                                >
                                    <Copy className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                            {isRequestExpanded ? (
                                <ChevronUp className="h-4 w-4 text-muted-foreground" />
                            ) : (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            )}
                        </button>
                        {isRequestExpanded && (
                            <div className="px-4 pb-4">
                                <ScrollArea className="max-h-[200px] pt-2">
                                    <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                                        {prompt.user_request}
                                    </p>
                                </ScrollArea>
                            </div>
                        )}
                    </div>

                    {/* Prompt cuối cùng */}
                    <div className="flex flex-col min-h-0 flex-1">
                        <div className="flex items-center justify-between mb-3 flex-shrink-0">
                            <h3 className="font-semibold">Prompt chuyên nghiệp</h3>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8"
                                onClick={() => handleCopy(prompt.final_prompt)}
                            >
                                <Copy className="h-4 w-4 mr-2" />
                                Sao chép
                            </Button>
                        </div>
                        <div className="flex-1 min-h-0 rounded-lg border bg-muted/30">
                            <ScrollArea className="h-full p-4">
                                <div className="prose prose-sm max-w-none">
                                    <pre className="whitespace-pre-wrap font-sans text-base bg-transparent p-0 border-0">
                                        {prompt.final_prompt}
                                    </pre>
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
} 