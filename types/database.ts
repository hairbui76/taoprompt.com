export interface Prompt {
  id: string
  client_id: string
  user_id?: string
  title?: string
  user_request: string
  analysis_result: string
  final_prompt: string
  metadata: {
    categories?: string[]
  }
  model_used: string
  settings: ModelSettings
  status: "private" | "public"
  created_at: string
  updated_at: string
}

export interface ModelSettings {
  temperature: number
  maxTokens: number
  topP: number
  frequencyPenalty: number
}

