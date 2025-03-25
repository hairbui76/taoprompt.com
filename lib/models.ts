import { createAnthropic } from "@ai-sdk/anthropic"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { createMistral } from "@ai-sdk/mistral"
import { createOpenAI } from "@ai-sdk/openai"
import modelsData from "./models.json"

export type LLMModel = {
  id: string
  name: string
  provider: string
  providerId: string
  multiModal?: boolean
}

export type LLMModelConfig = {
  model?: string
  apiKey?: string
  baseURL?: string
  temperature?: number
  topP?: number
  topK?: number
  frequencyPenalty?: number
  presencePenalty?: number
  maxTokens?: number
}

// Filter out Vertex models to prevent the error
export const models: LLMModel[] = modelsData.models.filter((model) => model.providerId !== "vertex")

export function getModelById(modelId: string): LLMModel | undefined {
  return models.find((model) => model.id === modelId)
}

export function getDefaultModel(): LLMModel {
  // Default to Claude 3.5 Haiku or the first available model
  return models.find((model) => model.id === "claude-3-5-haiku-latest") || models[0]
}

export function getModelClient(modelId: string, config: LLMModelConfig = {}) {
  const model = getModelById(modelId)

  if (!model) {
    throw new Error(`Model ${modelId} not found`)
  }

  const { providerId } = model
  const { apiKey, baseURL } = config

  try {
    const providerConfigs: Record<string, () => any> = {
      anthropic: () => createAnthropic({ apiKey, baseURL })(modelId),
      openai: () => createOpenAI({ apiKey, baseURL })(modelId),
      google: () => createGoogleGenerativeAI({ apiKey, baseURL })(modelId),
      mistral: () => createMistral({ apiKey, baseURL })(modelId),
      groq: () =>
        createOpenAI({
          apiKey: apiKey || process.env.GROQ_API_KEY,
          baseURL: baseURL || "https://api.groq.com/openai/v1",
        })(modelId),
      togetherai: () =>
        createOpenAI({
          apiKey: apiKey || process.env.TOGETHER_API_KEY,
          baseURL: baseURL || "https://api.together.xyz/v1",
        })(modelId),
      fireworks: () =>
        createOpenAI({
          apiKey: apiKey || process.env.FIREWORKS_API_KEY,
          baseURL: baseURL || "https://api.fireworks.ai/inference/v1",
        })(modelId),
      xai: () =>
        createOpenAI({
          apiKey: apiKey || process.env.XAI_API_KEY,
          baseURL: baseURL || "https://api.x.ai/v1",
        })(modelId),
      deepseek: () =>
        createOpenAI({
          apiKey: apiKey || process.env.DEEPSEEK_API_KEY,
          baseURL: baseURL || "https://api.deepseek.com/v1",
        })(modelId),
    }

    const createClient = providerConfigs[providerId]

    if (!createClient) {
      throw new Error(`Unsupported provider: ${providerId}`)
    }

    return createClient()
  } catch (error) {
    console.error(`Error creating model client for ${modelId}:`, error)
    // Fallback to OpenAI if available
    if (providerId !== "openai") {
      const fallbackModel = models.find((m) => m.providerId === "openai")
      if (fallbackModel) {
        console.warn(`Falling back to ${fallbackModel.id}`)
        return getModelClient(fallbackModel.id, config)
      }
    }
    throw error
  }
}

export function getDefaultMode(modelId: string) {
  const model = getModelById(modelId)

  if (!model) {
    return "auto"
  }

  // monkey patch fireworks
  if (model.providerId === "fireworks") {
    return "json"
  }

  return "auto"
}

export interface ModelSettings {
  temperature: number
  maxTokens: number
  topP: number
  frequencyPenalty: number
}

export const defaultModelSettings: ModelSettings = {
  temperature: 0.7,
  maxTokens: 2048,
  topP: 0.95,
  frequencyPenalty: 0,
}

