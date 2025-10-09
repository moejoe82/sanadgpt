const { createClient } = require("@supabase/supabase-js");

// Initialize clients
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;
const vectorStoreId = process.env.OPENAI_VECTOR_STORE_ID;

if (!supabaseUrl || !supabaseKey || !openaiApiKey || !vectorStoreId) {
  console.error("Missing required environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addFileToVectorStore(fileId) {
  const response = await fetch(
    `https://api.openai.com/v1/vector_stores/${vectorStoreId}/files`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        file_id: fileId,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error: ${response.status} - ${error}`);
  }

  return await response.json();
}

async function fixVectorStore() {
  try {
    console.log("🔍 Fetching documents with processing status...");

    // Get all documents with processing status
    const { data: documents, error } = await supabase
      .from("documents")
      .select("id, title, openai_file_id, status")
      .eq("status", "processing");

    if (error) {
      console.error("Error fetching documents:", error);
      return;
    }

    console.log(`📄 Found ${documents.length} documents in processing status`);

    if (documents.length === 0) {
      console.log("✅ No documents need processing");
      return;
    }

    // Process each document
    for (const doc of documents) {
      try {
        console.log(`\n🔄 Processing: ${doc.title} (${doc.openai_file_id})`);

        // Add file to vector store using REST API
        await addFileToVectorStore(doc.openai_file_id);

        // Update status to ready
        const { error: updateError } = await supabase
          .from("documents")
          .update({ status: "ready" })
          .eq("id", doc.id);

        if (updateError) {
          console.error(
            `❌ Error updating status for ${doc.title}:`,
            updateError
          );
        } else {
          console.log(`✅ Successfully processed: ${doc.title}`);
        }

        // Add a small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (docError) {
        console.error(`❌ Error processing ${doc.title}:`, docError.message);

        // Update status to error
        await supabase
          .from("documents")
          .update({ status: "error" })
          .eq("id", doc.id);
      }
    }

    console.log("\n🎉 Vector store fix completed!");

    // Show final status
    const { data: finalDocs } = await supabase
      .from("documents")
      .select("status")
      .in("status", ["processing", "ready", "error"]);

    const statusCounts = finalDocs.reduce((acc, doc) => {
      acc[doc.status] = (acc[doc.status] || 0) + 1;
      return acc;
    }, {});

    console.log("\n📊 Final Status:");
    console.log(`Ready: ${statusCounts.ready || 0}`);
    console.log(`Processing: ${statusCounts.processing || 0}`);
    console.log(`Error: ${statusCounts.error || 0}`);
  } catch (error) {
    console.error("💥 Script failed:", error);
  }
}

// Run the script
fixVectorStore();
