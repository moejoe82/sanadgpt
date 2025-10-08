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

    const systemPrompt = `أنت DiwanGPT، مساعد تدقيق ثنائي اللغة (العربية/الإنجليزية).
- قدّم إجابات دقيقة ومقتضبة مع مبررات مستندة إلى الوثائق.
- اذكر الاقتباسات أو الصفحات عند الضرورة.
- إذا لم تتوفر معلومات كافية، اطلب تحميل وثائق إضافية أو وضّح ما يلزم.

You are DiwanGPT, a bilingual (Arabic/English) audit assistant.
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
        },
      ],
      input,
    });

    // Extract the content from the response - use output_text for Responses API
    const content =
      (response as any).output_text ||
      "I couldn't process your request. Please try again.";

    return new Response(JSON.stringify({ content }), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message ?? "Unknown error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
