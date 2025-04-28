import { streamText } from "ai";
import { getModelClient, getModelById } from "@/lib/models";
import { type NextRequest, NextResponse } from "next/server";
import { getOrCreateClientId, createServerClient } from "@/lib/db";
import { ANALYSIS_PROMPT } from "@/lib/prompts/analysis-prompt";
import { GENERATE_PROMPT } from "@/lib/prompts/generate-prompt";

export async function POST(req: NextRequest) {
	try {
		const { userRequest, modelId, settings } = await req.json();

		if (!userRequest || !modelId) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 }
			);
		}

		const clientId = await getOrCreateClientId();
		const model = getModelById(modelId);

		if (!model) {
			return NextResponse.json({ error: "Invalid model ID" }, { status: 400 });
		}

		let modelClient;
		try {
			modelClient = getModelClient(modelId);
		} catch (error) {
			console.error("Error getting model client:", error);
			return NextResponse.json(
				{
					error: "Failed to initialize AI model. Please try a different model.",
				},
				{ status: 500 }
			);
		}

		// Save initial record to database
		const supabase = createServerClient();
		const { data, error: insertError } = await supabase
			.from("prompts")
			.insert({
				client_id: clientId,
				user_request: userRequest,
				model_used: modelId,
				settings: settings,
				status: "private",
			})
			.select();

		if (insertError) {
			console.error("Error saving to database:", insertError);
			return NextResponse.json(
				{ error: "Failed to save analysis" },
				{ status: 500 }
			);
		}

		const promptId = data[0].id;

		// Create a new TransformStream to process the chunks
		const { readable, writable } = new TransformStream();
		const writer = writable.getWriter();
		let analysisResult = "";
		let finalPrompt = "";
		let promptTitle = "";

		// Helper function to extract content between tags
		const extractContent = (text: string, tag: string) => {
			const regex = new RegExp(`<${tag}>([\\s\\S]*?)<\/${tag}>`);
			const match = text.match(regex);
			return match ? match[1].trim() : "";
		};

		// Helper function to extract categories
		const extractCategories = (text: string): string[] => {
			const categoriesContent = extractContent(text, "prompt_categories");
			if (!categoriesContent) return [];

			return categoriesContent
				.split("\n")
				.filter((line) => line.startsWith("-"))
				.map((line) => line.replace("-", "").trim())
				.filter((category) => category.length > 0);
		};

		// Process analyze and generate in sequence
		const processStream = async () => {
			try {
				// Step 1: Analyze
				const analyzeResult = streamText({
					model: modelClient,
					prompt: ANALYSIS_PROMPT(userRequest),
					temperature: settings?.temperature || 0.7,
					maxTokens: settings?.maxTokens || 2048,
					topP: settings?.topP || 0.95,
					frequencyPenalty: settings?.frequencyPenalty || 0,
				});

				const analyzeStream = analyzeResult.toDataStreamResponse();
				const analyzeReader = analyzeStream.body?.getReader();

				if (analyzeReader) {
					while (true) {
						const { done, value } = await analyzeReader.read();
						if (done) break;

						const chunk = new TextDecoder().decode(value);
						const lines = chunk.split("\n");

						for (const line of lines) {
							if (line.startsWith("0:")) {
								const cleanChunk = line
									.slice(2)
									.trim()
									.replace(/^"|"$/g, "")
									.replace(/\\n/g, "\n");

								if (cleanChunk) {
									analysisResult += cleanChunk;
									await writer.write(new TextEncoder().encode(cleanChunk));
								}
							}
						}
					}
				}

				// Write transition message
				const transitionMessage =
					"\n Đang tiến hành lập kế hoạch xây dựng prompt. \n";
				await writer.write(new TextEncoder().encode(transitionMessage));
				analysisResult += transitionMessage;

				// Step 2: Generate
				const generateResult = streamText({
					model: modelClient,
					prompt: GENERATE_PROMPT(userRequest, analysisResult),
					temperature: settings?.temperature || 0.7,
					maxTokens: settings?.maxTokens || 4096,
					topP: settings?.topP || 0.95,
					frequencyPenalty: settings?.frequencyPenalty || 0,
				});

				const generateStream = generateResult.toDataStreamResponse();
				const generateReader = generateStream.body?.getReader();

				if (generateReader) {
					while (true) {
						const { done, value } = await generateReader.read();
						if (done) break;

						const chunk = new TextDecoder().decode(value);
						const lines = chunk.split("\n");

						for (const line of lines) {
							if (line.startsWith("0:")) {
								const cleanChunk = line
									.slice(2)
									.trim()
									.replace(/^"|"$/g, "")
									.replace(/\\n/g, "\n");

								if (cleanChunk) {
									analysisResult += cleanChunk;
									await writer.write(new TextEncoder().encode(cleanChunk));
								}
							}
						}
					}
				}

				await writer.close();

				console.log("analysisResult", analysisResult);
				// Extract finalPrompt, promptTitle and categories from analysisResult
				finalPrompt = extractContent(analysisResult, "prompt_built");
				promptTitle = extractContent(analysisResult, "prompt_title");
				const categories = extractCategories(analysisResult);
				const metadata = { categories };

				// Save final results to database
				const { error: updateError } = await supabase
					.from("prompts")
					.update({
						analysis_result: analysisResult,
						final_prompt: finalPrompt,
						title: promptTitle,
						metadata,
						created_at: new Date().toISOString(),
					})
					.eq("id", promptId);

				if (updateError) {
					console.error("Error updating prompt:", updateError);
				}
			} catch (error) {
				console.error("Error processing stream:", error);
				await writer.abort(error);
			}
		};

		// Start processing in the background
		processStream();

		// Return the stream with the promptId in headers
		return new Response(readable, {
			headers: {
				"Content-Type": "text/event-stream",
				"Cache-Control": "no-cache",
				Connection: "keep-alive",
				"X-Prompt-Id": promptId,
			},
		});
	} catch (error) {
		console.error("Error in process route:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
