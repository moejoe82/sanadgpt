import OpenAI from "openai";
import { toFile } from "openai/uploads";

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error("Missing OPENAI_API_KEY environment variable");
}

export const openai = new OpenAI({ apiKey });

export async function createResponsesMessage(params: {
  input: string;
  model?: string;
  system?: string;
}): Promise<string> {
  const client = openai;
  const model = params.model ?? "gpt-4o-mini";

  const messages = [];
  if (params.system) {
    messages.push({ role: "system", content: params.system });
  }
  messages.push({ role: "user", content: params.input });

  const response = await client.chat.completions.create({
    model,
    messages: messages as any,
  });

  const text = response.choices[0]?.message?.content ?? "";
  return text;
}

export async function uploadFileToVectorStore(
  fileBuffer: Buffer,
  filename: string
): Promise<string> {
  const file = await openai.files.create({
    file: await toFile(fileBuffer, filename),
    purpose: "assistants",
  });

  // Note: Vector store integration will be added later
  // For now, just upload the file
  return file.id;
}

export async function deleteFileFromVectorStore(fileId: string): Promise<void> {
  // Note: Vector store integration will be added later
  // For now, just delete the file
  await openai.files.delete(fileId);
}
