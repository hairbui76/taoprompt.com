"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles } from "lucide-react"
import { models } from "@/lib/models"

interface ModelSelectorProps {
  value: string
  onValueChange: (value: string) => void
}

export function ModelSelector({ value, onValueChange }: ModelSelectorProps) {
  const selectedModel = models.find(model => model.id === value)

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[180px] h-10">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <SelectValue placeholder="Chọn Model AI">
            {selectedModel?.name}
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent>
        {models.map((model) => (
          <SelectItem
            key={model.id}
            value={model.id}
            className="py-2.5"
          >
            <div className="flex items-center gap-2">
              <span className="font-medium">{model.name}</span>
              {model.badge && (
                <span className="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium">
                  {model.badge}
                </span>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

