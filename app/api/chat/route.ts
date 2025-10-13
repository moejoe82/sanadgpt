export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { fileSearchTool, Agent, AgentInputItem, Runner } from "@openai/agents";

// Tool definitions - File search with vector store
const fileSearch = fileSearchTool(["vs_68eb60e012988191be5a60558a1f1de6"]);

const sanadgptAgent = new Agent({
  name: "SanadGPT Agent",
  instructions: `You are SanadGPT, a bilingual (Arabic/English) audit assistant designed for use by professional internal auditors.

Key Guidelines:
- Answer in Arabic if the question is asked in Arabic, and in English if the question is asked in English.
- Provide concise, accurate answers based only on information from the provided documents.
- Always cite sources with specific page numbers or document references when available.
- If you lack sufficient context to answer accurately, request additional documents or clarifications.
- Maintain professional tone appropriate for internal audit work.
- Focus on factual information and avoid speculation.`,
  model: "gpt-4o", // Using verified available model
  tools: [fileSearch],
  // Simplified settings - removing potentially unsupported options
});

// Read workflow id from environment (no hardcoding)
const workflowId = process.env.OPENAI_CHATKIT_WORKFLOW_ID;
if (!workflowId) {
  throw new Error("Missing OPENAI_CHATKIT_WORKFLOW_ID environment variable");
}

type WorkflowInput = { input_as_text: string };

// Main code entrypoint
export const runWorkflow = async (workflow: WorkflowInput) => {
  const items: AgentInputItem[] = [
    {
      role: "user",
      content: [
        {
          type: "input_text",
          text: workflow.input_as_text,
        },
      ],
    },
  ];

  const runner = new Runner({
    traceMetadata: {
      __trace_source__: "agent-builder",
      workflow_id: workflowId,
    },
  });

  const result = await runner.run(sanadgptAgent, items);

  if (!result.finalOutput) {
    throw new Error("Agent result is undefined");
  }

  return { output_text: result.finalOutput ?? "" };
};

export async function POST(req: NextRequest) {
  try {
    const {
      question,
      threadId,
    }: { question?: unknown; threadId?: string | null } = await req.json();

    if (!question || typeof question !== "string") {
      return new Response(JSON.stringify({ error: "Missing 'question'" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const items: AgentInputItem[] = [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: question,
          },
        ],
      },
    ];

    const runnerOptions = {
      traceMetadata: {
        __trace_source__: "agent-builder",
        workflow_id: workflowId,
      },
      ...(threadId ? { threadId } : {}),
    } as unknown as ConstructorParameters<typeof Runner>[0];

    const runner = new Runner(runnerOptions);

    type AgentRunResultMinimal = { finalOutput?: string; threadId?: string };
    const result = (await runner.run(sanadgptAgent, items)) as unknown as AgentRunResultMinimal;

    if (!result.finalOutput) {
      throw new Error("Agent result is undefined");
    }

    const content = result.finalOutput;
    const returnedThreadId: string | null = result.threadId ?? threadId ?? null;

    return new Response(
      JSON.stringify({
        content,
        threadId: returnedThreadId,
        // Citations will be handled by the agent automatically
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("[Chat API] Error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
