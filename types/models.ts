export interface AIModel {
  id: string
  name: string
  description: string
  contextWindow: number
  trainingCutoff: string
  maxOutputTokens: number
  inputCostPer1KTokens: number
  outputCostPer1KTokens: number
  providerId?: string
}

export interface ModelProvider {
  id: string
  name: string
  models: AIModel[]
}

export interface ModelSettings {
  temperature: number
  maxTokens: number
  topP: number
  frequencyPenalty: number
}

export const defaultModelSettings: ModelSettings = {
  temperature: 0.7,
  maxTokens: 4096,
  topP: 0.95,
  frequencyPenalty: 0,
}

