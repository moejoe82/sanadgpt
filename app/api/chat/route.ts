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

// Read workflow id from environment (no hardcoding) with proper type narrowing
const workflowIdEnv = process.env.OPENAI_CHATKIT_WORKFLOW_ID;
if (!workflowIdEnv) {
  throw new Error("Missing OPENAI_CHATKIT_WORKFLOW_ID environment variable");
}
const workflowId: string = workflowIdEnv;

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
      conversationHistory = [],
    }: { question?: unknown; conversationHistory?: Array<{ role: string; content: string }> } = await req.json();

    if (!question || typeof question !== "string") {
      return new Response(JSON.stringify({ error: "Missing 'question'" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Convert conversation history to AgentInputItem format
    const agentHistory: AgentInputItem[] = conversationHistory.map((msg: { role: string; content: string }) => {
      if (msg.role === "assistant") {
        // Assistant messages must include a status for Agents SDK
        return {
          status: "completed",
          role: "assistant",
          content: [
            {
              type: "output_text",
              text: msg.content,
            },
          ],
        } as AgentInputItem;
      } else {
        // User and system messages use input_text type
        return {
          role: msg.role as "user" | "system",
          content: [
            {
              type: "input_text",
              text: msg.content,
            },
          ],
        } as AgentInputItem;
      }
    });

    // Add current question to history
    agentHistory.push({
      role: "user",
      content: [
        {
          type: "input_text",
          text: question,
        },
      ],
    });

    const runner = new Runner({
      traceMetadata: {
        __trace_source__: "agent-builder",
        workflow_id: workflowId,
      },
    });

    const result = await runner.run(sanadgptAgent, agentHistory);

    if (!result.finalOutput) {
      throw new Error("Agent result is undefined");
    }

    const content = result.finalOutput;

    return new Response(
      JSON.stringify({
        content,
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
