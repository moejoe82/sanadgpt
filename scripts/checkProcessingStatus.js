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

async function checkFileStatus(fileId) {
  try {
    const file = await openai.files.retrieve(fileId);
    return {
      id: file.id,
      status: file.status,
      filename: file.filename,
      purpose: file.purpose,
      created_at: file.created_at,
      bytes: file.bytes,
    };
  } catch (error) {
    return {
      id: fileId,
      status: "error",
      error: error.message,
    };
  }
}

async function checkVectorStoreFileStatus(fileId) {
  try {
    const response = await fetch(
      `https://api.openai.com/v1/vector_stores/${vectorStoreId}/files?limit=100`,
      {
        headers: {
          Authorization: `Bearer ${openaiApiKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    const vectorStoreFile = data.data.find((f) => f.file_id === fileId);

    return {
      found: !!vectorStoreFile,
      status: vectorStoreFile?.status || "not_found",
      vectorStoreFileId: vectorStoreFile?.id,
      created_at: vectorStoreFile?.created_at,
    };
  } catch (error) {
    return {
      found: false,
      status: "error",
      error: error.message,
    };
  }
}

async function checkProcessingStatus() {
  try {
    console.log("🔍 Checking documents with processing status...\n");

    // Get all documents with processing status
    const { data: documents, error } = await supabase
      .from("documents")
      .select(
        "id, title, openai_file_id, openai_vector_store_id, status, uploaded_at"
      )
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

    // Check each document
    for (const doc of documents) {
      console.log(`\n📋 Document: ${doc.title}`);
      console.log(`   ID: ${doc.id}`);
      console.log(`   OpenAI File ID: ${doc.openai_file_id}`);
      console.log(`   Uploaded: ${new Date(doc.uploaded_at).toLocaleString("en-US")}`);
      console.log(`   Status in DB: ${doc.status}`);

      if (!doc.openai_file_id) {
        console.log("   ❌ No OpenAI file ID found");
        continue;
      }

      // Check OpenAI file status
      console.log("   🔍 Checking OpenAI file status...");
      const fileStatus = await checkFileStatus(doc.openai_file_id);
      console.log(`   📁 OpenAI File Status: ${fileStatus.status}`);
      console.log(`   📁 Filename: ${fileStatus.filename || "N/A"}`);
      console.log(
        `   📁 Size: ${
          fileStatus.bytes
            ? (fileStatus.bytes / 1024).toFixed(2) + " KB"
            : "N/A"
        }`
      );

      if (fileStatus.error) {
        console.log(`   ❌ OpenAI File Error: ${fileStatus.error}`);
      }

      // Check vector store status
      console.log("   🔍 Checking vector store status...");
      const vectorStatus = await checkVectorStoreFileStatus(doc.openai_file_id);
      console.log(`   🗂️  Vector Store Found: ${vectorStatus.found}`);
      console.log(`   🗂️  Vector Store Status: ${vectorStatus.status}`);

      if (vectorStatus.error) {
        console.log(`   ❌ Vector Store Error: ${vectorStatus.error}`);
      }

      // Determine if document should be marked as ready
      const isFileReady =
        fileStatus.status === "processed" || fileStatus.status === "succeeded";
      const isVectorReady = vectorStatus.status === "completed";

      console.log(`   📊 Analysis:`);
      console.log(
        `      File Ready: ${isFileReady ? "✅" : "❌"} (${fileStatus.status})`
      );
      console.log(
        `      Vector Ready: ${isVectorReady ? "✅" : "❌"} (${
          vectorStatus.status
        })`
      );

      if (isFileReady && isVectorReady) {
        console.log("   🎉 Document is ready! Updating status...");

        const { error: updateError } = await supabase
          .from("documents")
          .update({ status: "ready" })
          .eq("id", doc.id);

        if (updateError) {
          console.log(`   ❌ Failed to update status: ${updateError.message}`);
        } else {
          console.log("   ✅ Status updated to 'ready'");
        }
      } else if (
        fileStatus.status === "error" ||
        vectorStatus.status === "failed"
      ) {
        console.log("   ❌ Document processing failed! Updating status...");

        const { error: updateError } = await supabase
          .from("documents")
          .update({ status: "failed" })
          .eq("id", doc.id);

        if (updateError) {
          console.log(`   ❌ Failed to update status: ${updateError.message}`);
        } else {
          console.log("   ✅ Status updated to 'failed'");
        }
      } else {
        console.log("   ⏳ Document still processing...");
      }

      // Add delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log("\n🎉 Status check completed!");

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
checkProcessingStatus();
