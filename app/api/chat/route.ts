export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { openai } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const { question, conversationHistory = [] } = await req.json();
    if (!question || typeof question !== "string") {
      return new Response(JSON.stringify({ error: "Missing 'question'" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const vectorStoreId = process.env.OPENAI_VECTOR_STORE_ID;
    if (!vectorStoreId) {
      return new Response(
        JSON.stringify({ error: "Missing OPENAI_VECTOR_STORE_ID" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const systemPrompt = `أنت SanadGPT، مساعد تدقيق ثنائي اللغة (العربية/الإنجليزية).
- قدّم إجابات دقيقة ومقتضبة مع مبررات مستندة إلى الوثائق.
- اذكر الاقتباسات أو الصفحات عند الضرورة.
- إذا لم تتوفر معلومات كافية، اطلب تحميل وثائق إضافية أو وضّح ما يلزم.

You are SanadGPT, a bilingual (Arabic/English) audit assistant.
- Provide concise, accurate answers grounded in the indexed documents.
- Cite sources or page numbers when appropriate.
- If context is insufficient, ask for additional documents or clarifications.`;

    // Build input array with conversation history (limit to last 10 messages to control token usage)
    const limitedHistory = conversationHistory.slice(-10);
    const input = [
      { role: "system", content: systemPrompt },
      ...limitedHistory,
      { role: "user", content: question },
    ];

    const response = await openai.responses.create({
      model: "gpt-4o",
      tools: [
        {
          type: "file_search",
          vector_store_ids: [vectorStoreId],
          max_num_results: 5, // Limit results for better performance and relevance
        },
      ],
      input,
      // Include search results for better debugging and transparency
      include: ["file_search_call.results"],
    });

    // Extract the content and citations from the response
    const messageOutput = response.output?.find(
      (item: { type: string }) => item.type === "message"
    );
    
    const content = messageOutput?.content?.[0]?.text || 
      (response as { output_text?: string }).output_text ||
      "I couldn't process your request. Please try again.";

    // Extract citations from annotations
    const citations = messageOutput?.content?.[0]?.annotations
      ?.filter((annotation: { type: string }) => annotation.type === "file_citation")
      ?.map((citation: { file_id: string; filename: string; index: number }) => ({
        file_id: citation.file_id,
        filename: citation.filename,
        index: citation.index,
      })) || [];

    return new Response(JSON.stringify({ 
      content,
      citations: citations.length > 0 ? citations : undefined,
    }), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
