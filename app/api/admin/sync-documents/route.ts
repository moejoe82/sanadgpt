export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { openai } from "@/lib/openai";

const VECTOR_STORE_ID = "vs_68eb60e012988191be5a60558a1f1de6";

export async function POST(req: NextRequest) {
  try {
    console.log('🔄 Starting document sync from OpenAI Vector Store...');
    console.log(`📁 Vector Store ID: ${VECTOR_STORE_ID}`);

    // Get vector store details
    const vectorStore = await openai.beta.vectorStores.retrieve(VECTOR_STORE_ID);
    console.log(`📊 Vector Store: ${vectorStore.name}`);
    console.log(`📈 File count: ${vectorStore.file_counts?.total || 'Unknown'}`);

    // List all files in the vector store
    const files = await openai.beta.vectorStores.files.list(VECTOR_STORE_ID);
    console.log(`📄 Found ${files.data.length} files in vector store`);

    if (files.data.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: "No files found in vector store",
        documents: []
      });
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
          user_id: '00000000-0000-0000-0000-000000000000', // Placeholder user ID
        });
        console.log(`✅ Processed file: ${fileInfo.filename} (${file.status})`);
      } catch (error) {
        console.error(`❌ Error processing file ${file.id}:`, error.message);
      }
    }

    // Insert documents into Supabase
    console.log(`💾 Inserting ${fileDetails.length} documents into Supabase...`);
    
    const { data, error } = await supabaseAdmin
      .from('documents')
      .insert(fileDetails)
      .select();

    if (error) {
      console.error('❌ Error inserting documents:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 });
    }

    console.log(`✅ Successfully synced ${data.length} documents to Supabase!`);
    
    // Display summary
    const readyCount = data.filter(doc => doc.status === 'ready').length;
    const processingCount = data.filter(doc => doc.status === 'processing').length;
    
    console.log(`📊 Sync Summary: Ready: ${readyCount}, Processing: ${processingCount}, Total: ${data.length}`);

    return NextResponse.json({ 
      success: true, 
      message: `Successfully synced ${data.length} documents`,
      documents: data,
      summary: {
        ready: readyCount,
        processing: processingCount,
        total: data.length
      }
    });

  } catch (error) {
    console.error('❌ Sync failed:', error.message);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
