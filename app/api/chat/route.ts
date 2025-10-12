export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { fileSearchTool, Agent, AgentInputItem, Runner } from "@openai/agents";

// Tool definitions
const fileSearch = fileSearchTool([
  "vs_68eb60e012988191be5a60558a1f1de6"
]);

const sanadgptAgent = new Agent({
  name: "SanadGPT Agent",
  instructions: `You are SanadGPT, a bilingual (Arabic/English) audit assistant designed for use by professional internal auditors.
- Answer in Arabic if the question is asked in Arabic, and in English if the question is asked in English.
- Answer concisely and accurately, using only information from the provided documents.
- Cite sources or page numbers when relevant.
- If you lack sufficient context, request additional documents or clarifications.`,
  model: "gpt-5",
  tools: [
    fileSearch
  ],
  modelSettings: {
    reasoning: {
      effort: "low",
      summary: "auto"
    },
    store: true
  }
});

type WorkflowInput = { input_as_text: string };

// Main code entrypoint
export const runWorkflow = async (workflow: WorkflowInput) => {
  const conversationHistory: AgentInputItem[] = [
    {
      role: "user",
      content: [
        {
          type: "input_text",
          text: workflow.input_as_text
        }
      ]
    }
  ];
  
  const runner = new Runner({
    traceMetadata: {
      __trace_source__: "agent-builder",
      workflow_id: "wf_68eb60b897a88190a7ea0f20a6eefa8f04fea11a9486fa43"
    }
  });
  
  const sanadgptAgentResultTemp = await runner.run(
    sanadgptAgent,
    [
      ...conversationHistory
    ]
  );
  
  conversationHistory.push(...sanadgptAgentResultTemp.newItems.map((item) => item.rawItem));

  if (!sanadgptAgentResultTemp.finalOutput) {
      throw new Error("Agent result is undefined");
  }

  const sanadgptAgentResult = {
    output_text: sanadgptAgentResultTemp.finalOutput ?? ""
  };

  return sanadgptAgentResult;
};

export async function POST(req: NextRequest) {
  try {
    const { question, conversationHistory = [] } = await req.json();
    
    if (!question || typeof question !== "string") {
      return new Response(JSON.stringify({ error: "Missing 'question'" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Convert conversation history to AgentInputItem format
    const agentHistory: AgentInputItem[] = conversationHistory.map((msg: { role: string; content: string }) => ({
      role: msg.role as "user" | "assistant" | "system",
      content: [
        {
          type: "input_text",
          text: msg.content
        }
      ]
    }));

    // Add current question to history
    agentHistory.push({
      role: "user",
      content: [
        {
          type: "input_text",
          text: question
        }
      ]
    });

    const runner = new Runner({
      traceMetadata: {
        __trace_source__: "agent-builder",
        workflow_id: "wf_68eb60b897a88190a7ea0f20a6eefa8f04fea11a9486fa43"
      }
    });

    const result = await runner.run(sanadgptAgent, agentHistory);

    if (!result.finalOutput) {
      throw new Error("Agent result is undefined");
    }

    const content = result.finalOutput;

    return new Response(JSON.stringify({ 
      content,
      // Citations will be handled by the agent automatically
    }), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("[Chat API] Error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}