require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");
const OpenAI = require("openai");

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
const openai = new OpenAI({ apiKey: openaiApiKey });

async function addFileToVectorStore(fileId) {
  try {
    console.log(`   🔄 Adding file ${fileId} to vector store...`);

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
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log(`   ✅ Successfully added to vector store (ID: ${result.id})`);
    return result;
  } catch (error) {
    console.log(`   ❌ Failed to add to vector store: ${error.message}`);
    throw error;
  }
}

async function fixProcessingDocuments() {
  try {
    console.log(
      "🔍 Finding documents with processed files but missing from vector store...\n"
    );

    // Get all documents with processing status
    const { data: documents, error } = await supabase
      .from("documents")
      .select("id, title, openai_file_id, status")
      .eq("status", "processing");

    if (error) {
      console.error("❌ Error fetching documents:", error);
      return;
    }

    console.log(
      `📄 Found ${documents.length} documents in processing status\n`
    );

    if (documents.length === 0) {
      console.log("✅ No documents need processing");
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    // Process each document
    for (const doc of documents) {
      console.log(`\n📋 Processing: ${doc.title}`);
      console.log(`   Document ID: ${doc.id}`);
      console.log(`   OpenAI File ID: ${doc.openai_file_id}`);

      if (!doc.openai_file_id) {
        console.log("   ❌ No OpenAI file ID found, skipping...");
        errorCount++;
        continue;
      }

      try {
        // Check if file is processed in OpenAI
        const file = await openai.files.retrieve(doc.openai_file_id);

        if (file.status !== "processed") {
          console.log(
            `   ⏳ File not yet processed (status: ${file.status}), skipping...`
          );
          continue;
        }

        console.log(`   ✅ File is processed in OpenAI`);

        // Add to vector store
        await addFileToVectorStore(doc.openai_file_id);

        // Update status to ready
        const { error: updateError } = await supabase
          .from("documents")
          .update({ status: "ready" })
          .eq("id", doc.id);

        if (updateError) {
          console.log(`   ❌ Failed to update status: ${updateError.message}`);
          errorCount++;
        } else {
          console.log(`   ✅ Status updated to 'ready'`);
          successCount++;
        }

        // Add delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (docError) {
        console.log(`   ❌ Error processing ${doc.title}: ${docError.message}`);
        errorCount++;
      }
    }

    console.log("\n🎉 Fix completed!");
    console.log(`   ✅ Successfully processed: ${successCount}`);
    console.log(`   ❌ Failed: ${errorCount}`);

    // Show final status summary
    const { data: finalDocs } = await supabase
      .from("documents")
      .select("status")
      .in("status", ["processing", "ready", "failed"]);

    const statusCounts = finalDocs.reduce((acc, doc) => {
      acc[doc.status] = (acc[doc.status] || 0) + 1;
      return acc;
    }, {});

    console.log("\n📊 Final Status Summary:");
    console.log(`   Ready: ${statusCounts.ready || 0}`);
    console.log(`   Processing: ${statusCounts.processing || 0}`);
    console.log(`   Failed: ${statusCounts.failed || 0}`);
  } catch (error) {
    console.error("💥 Script failed:", error);
  }
}

// Run the script
fixProcessingDocuments();
