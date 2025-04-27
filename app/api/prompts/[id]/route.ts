import { type NextRequest, NextResponse } from "next/server"
import { createServerClient, getOrCreateClientId } from "@/lib/db"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const promptId = params.id

    if (!promptId) {
      return NextResponse.json({ error: "Missing prompt ID" }, { status: 400 })
    }

    const clientId = await getOrCreateClientId()
    const supabase = createServerClient()

    // Get the prompt
    const { data, error } = await supabase
      .from("prompts")
      .select("*")
      .eq("id", promptId)
      .eq("client_id", clientId)
      .single()

    if (error) {
      console.error("Error fetching prompt:", error)
      return NextResponse.json({ error: "Prompt not found or access denied" }, { status: 404 })
    }

    return NextResponse.json({ prompt: data })
  } catch (error) {
    console.error("Error in prompt route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

