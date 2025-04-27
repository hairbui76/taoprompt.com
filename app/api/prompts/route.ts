import { type NextRequest, NextResponse } from "next/server"
import { createServerClient, getOrCreateClientId } from "@/lib/db"
import type { Prompt } from "@/types/database"

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerClient()

    // Get query parameters
    const url = new URL(req.url)
    const status = url.searchParams.get("status")
    const limit = Number.parseInt(url.searchParams.get("limit") || "10")
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const offset = (page - 1) * limit

    // Build base query
    let baseQuery = supabase
      .from("prompts")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })

    // Add status filter if provided
    if (status === "public") {
      baseQuery = baseQuery.eq("status", "public")
    } else if (status === "private") {
      // For private prompts, we need client_id
      const clientId = await getOrCreateClientId()
      baseQuery = baseQuery
        .eq("client_id", clientId)
    }

    // Execute query with pagination
    const { data, error, count } = await baseQuery.range(offset, offset + limit - 1)

    if (error) {
      console.error("Error fetching prompts:", error)
      return NextResponse.json({ error: "Failed to fetch prompts" }, { status: 500 })
    }

    // Default to 0 if count is null
    const totalCount = count || 0

    // Remove client_id from public prompts
    const sanitizedData = data?.map((prompt: Prompt) => {
      if (status === "public") {
        const { client_id, ...promptWithoutClientId } = prompt
        return promptWithoutClientId
      }
      return prompt
    })

    return NextResponse.json({
      prompts: sanitizedData,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error) {
    console.error("Error in prompts route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, status } = await req.json()

    if (!id || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const clientId = await getOrCreateClientId()
    const supabase = createServerClient()

    // Update prompt status
    const { error } = await supabase.from("prompts").update({ status }).eq("id", id).eq("client_id", clientId)

    if (error) {
      console.error("Error updating prompt:", error)
      return NextResponse.json({ error: "Failed to update prompt" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in prompts route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

