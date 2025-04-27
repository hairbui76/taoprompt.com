"use client"

import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Settings2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { ModelSettings as ModelSettingsType } from "@/types/models"

interface ModelSettingsProps {
  settings: ModelSettingsType
  onSettingsChange: (settings: ModelSettingsType) => void
  autoVersion: boolean
  onAutoVersionChange: (value: boolean) => void
}

export function ModelSettings({ settings, onSettingsChange, autoVersion, onAutoVersionChange }: ModelSettingsProps) {
  const handleMaxTokensChange = (value: string) => {
    const tokens = Math.min(Math.max(parseInt(value) || 1, 1), 4096)
    onSettingsChange({ ...settings, maxTokens: tokens })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="h-10 w-10">
          <Settings2 className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64">
        <DropdownMenuLabel className="font-semibold">Cài đặt Model AI</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <div className="p-3">
          <div className="space-y-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Temperature</Label>
                <span className="text-sm text-muted-foreground">{settings.temperature}</span>
              </div>
              <Slider
                className="mt-2"
                min={0}
                max={1}
                step={0.1}
                value={[settings.temperature]}
                onValueChange={(value) => onSettingsChange({ ...settings, temperature: value[0] })}
              />
              <p className="text-xs text-muted-foreground">Điều chỉnh độ sáng tạo của model</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Max Tokens</Label>
                <Input
                  type="number"
                  min={1}
                  max={4096}
                  value={settings.maxTokens}
                  onChange={(e) => handleMaxTokensChange(e.target.value)}
                  className="w-24 h-8 text-sm"
                />
              </div>
              <p className="text-xs text-muted-foreground">Giới hạn độ dài tối đa của kết quả</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Top P</Label>
                <span className="text-sm text-muted-foreground">{settings.topP}</span>
              </div>
              <Slider
                className="mt-2"
                min={0}
                max={1}
                step={0.05}
                value={[settings.topP]}
                onValueChange={(value) => onSettingsChange({ ...settings, topP: value[0] })}
              />
              <p className="text-xs text-muted-foreground">Kiểm soát độ đa dạng của kết quả</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Frequency Penalty</Label>
                <span className="text-sm text-muted-foreground">{settings.frequencyPenalty}</span>
              </div>
              <Slider
                className="mt-2"
                min={0}
                max={2}
                step={0.1}
                value={[settings.frequencyPenalty]}
                onValueChange={(value) => onSettingsChange({ ...settings, frequencyPenalty: value[0] })}
              />
              <p className="text-xs text-muted-foreground">Giảm sự lặp lại trong kết quả</p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="space-y-1">
                <Label htmlFor="autoVersion" className="text-sm font-medium">Tạo nhiều phiên bản</Label>
                <p className="text-xs text-muted-foreground">Tự động tạo nhiều biến thể</p>
              </div>
              <Switch
                id="autoVersion"
                checked={autoVersion}
                onCheckedChange={onAutoVersionChange}
              />
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

