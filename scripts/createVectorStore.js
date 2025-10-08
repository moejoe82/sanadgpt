require("dotenv").config({ path: ".env.local" });

async function main() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.error("❌ Error: OPENAI_API_KEY not found in .env.local");
    process.exit(1);
  }

  console.log("Creating OpenAI Vector Store via API...");

  try {
    const response = await fetch("https://api.openai.com/v1/vector_stores", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "OpenAI-Beta": "assistants=v2",
      },
      body: JSON.stringify({
        name: "ENS Audit Documents - DiwanGPT",
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`API Error: ${JSON.stringify(error)}`);
    }

    const store = await response.json();

    console.log("\n✅ Vector Store Created!");
    console.log(`Vector Store ID: ${store.id}`);
    console.log("\nAdd this to .env.local:");
    console.log(`OPENAI_VECTOR_STORE_ID=${store.id}`);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

main();
