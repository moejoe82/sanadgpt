// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');

// Initialize clients
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const VECTOR_STORE_ID = "vs_68eb60e012988191be5a60558a1f1de6";

async function syncDocumentsFromOpenAI() {
  try {
    console.log('🔄 Starting document sync from OpenAI Vector Store...');
    console.log(`📁 Vector Store ID: ${VECTOR_STORE_ID}`);

    // Check if OpenAI client is properly initialized
    if (!openai.beta?.vectorStores) {
      throw new Error('OpenAI client not properly initialized. Check API key.');
    }

    // Get vector store details
    const vectorStore = await openai.beta.vectorStores.retrieve(VECTOR_STORE_ID);
    console.log(`📊 Vector Store: ${vectorStore.name}`);
    console.log(`📈 File count: ${vectorStore.file_counts?.total || 'Unknown'}`);

    // List all files in the vector store
    const files = await openai.beta.vectorStores.files.list(VECTOR_STORE_ID);
    console.log(`📄 Found ${files.data.length} files in vector store`);

    if (files.data.length === 0) {
      console.log('❌ No files found in vector store');
      return;
    }

    // Get detailed file information
    const fileDetails = [];
    for (const file of files.data) {
      try {
        const fileInfo = await openai.files.retrieve(file.id);
        fileDetails.push({
          openai_file_id: file.id,
          openai_vector_store_id: VECTOR_STORE_ID,
          title: fileInfo.filename,
          status: file.status === 'completed' ? 'ready' : 'processing',
          file_path: `openai/${file.id}`, // Placeholder path since file is in OpenAI
          file_hash: `openai_${file.id}`, // Placeholder hash
          emirate_scope: null,
          authority_name: null,
          uploaded_at: new Date(fileInfo.created_at * 1000).toISOString(),
        });
        console.log(`✅ Processed file: ${fileInfo.filename} (${file.status})`);
      } catch (error) {
        console.error(`❌ Error processing file ${file.id}:`, error.message);
      }
    }

    // Insert documents into Supabase
    console.log(`\n💾 Inserting ${fileDetails.length} documents into Supabase...`);
    
    // For now, we'll use a placeholder user_id since we don't have user context
    // In production, you might want to associate these with a specific admin user
    const placeholderUserId = '00000000-0000-0000-0000-000000000000';
    
    const documentsToInsert = fileDetails.map(doc => ({
      ...doc,
      user_id: placeholderUserId,
    }));

    const { data, error } = await supabase
      .from('documents')
      .insert(documentsToInsert)
      .select();

    if (error) {
      console.error('❌ Error inserting documents:', error);
      return;
    }

    console.log(`✅ Successfully synced ${data.length} documents to Supabase!`);
    
    // Display summary
    const readyCount = data.filter(doc => doc.status === 'ready').length;
    const processingCount = data.filter(doc => doc.status === 'processing').length;
    
    console.log('\n📊 Sync Summary:');
    console.log(`   Ready: ${readyCount}`);
    console.log(`   Processing: ${processingCount}`);
    console.log(`   Total: ${data.length}`);

    // List synced documents
    console.log('\n📋 Synced Documents:');
    data.forEach((doc, index) => {
      console.log(`   ${index + 1}. ${doc.title} (${doc.status})`);
    });

  } catch (error) {
    console.error('❌ Sync failed:', error.message);
  }
}

// Run the sync
syncDocumentsFromOpenAI()
  .then(() => {
    console.log('\n🎉 Document sync completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Sync failed:', error);
    process.exit(1);
  });
