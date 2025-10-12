export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { openai } from "@/lib/openai";

const VECTOR_STORE_ID = "vs_68eb60e012988191be5a60558a1f1de6";

export async function POST() {
  try {
    console.log('🔄 Testing OpenAI API access...');
    console.log(`📁 Vector Store ID: ${VECTOR_STORE_ID}`);

    // Test 1: Try to access vector store using different API methods
    let vectorStoreInfo = null;
    let filesList = [];

    try {
      // Method 1: Try beta.vectorStores
      console.log('🔍 Trying beta.vectorStores.retrieve...');
      vectorStoreInfo = await openai.beta.vectorStores.retrieve(VECTOR_STORE_ID);
      console.log('✅ beta.vectorStores.retrieve worked!');
      console.log(`📊 Vector Store: ${vectorStoreInfo.name}`);
      
      // Try to list files
      console.log('🔍 Trying beta.vectorStores.files.list...');
      const filesResponse = await openai.beta.vectorStores.files.list(VECTOR_STORE_ID);
      filesList = filesResponse.data;
      console.log(`✅ Found ${filesList.length} files via beta.vectorStores.files.list`);
      
    } catch (betaError) {
      console.log('❌ beta.vectorStores failed:', betaError.message);
      
      try {
        // Method 2: Try direct API call
        console.log('🔍 Trying direct fetch to OpenAI API...');
        const response = await fetch(`https://api.openai.com/v1/vector_stores/${VECTOR_STORE_ID}`, {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          vectorStoreInfo = await response.json();
          console.log('✅ Direct API call worked!');
          console.log(`📊 Vector Store: ${vectorStoreInfo.name}`);
          
          // Try to get files
          const filesResponse = await fetch(`https://api.openai.com/v1/vector_stores/${VECTOR_STORE_ID}/files`, {
            headers: {
              'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (filesResponse.ok) {
            const filesData = await filesResponse.json();
            filesList = filesData.data || [];
            console.log(`✅ Found ${filesList.length} files via direct API`);
          }
        }
      } catch (directError) {
        console.log('❌ Direct API call failed:', directError.message);
      }
    }

    // If we have files, create documents in database
    if (filesList.length > 0) {
      console.log(`📄 Processing ${filesList.length} files...`);
      
      const documentsToInsert = [];
      
      for (const file of filesList) {
        try {
          // Get file details
          const fileInfo = await openai.files.retrieve(file.id);
          
          documentsToInsert.push({
            openai_file_id: file.id,
            openai_vector_store_id: VECTOR_STORE_ID,
            title: fileInfo.filename,
            status: file.status === 'completed' ? 'ready' : 'processing',
            file_path: `openai/${file.id}`,
            file_hash: `openai_${file.id}`,
            emirate_scope: null,
            authority_name: null,
            uploaded_at: new Date(fileInfo.created_at * 1000).toISOString(),
            user_id: '00000000-0000-0000-0000-000000000000',
          });
          
          console.log(`✅ Processed: ${fileInfo.filename} (${file.status})`);
        } catch (fileError) {
          console.error(`❌ Error processing file ${file.id}:`, fileError.message);
        }
      }

      // Insert into database
      if (documentsToInsert.length > 0) {
        console.log(`💾 Inserting ${documentsToInsert.length} documents into Supabase...`);
        
        const { data, error } = await supabaseAdmin
          .from('documents')
          .insert(documentsToInsert)
          .select();

        if (error) {
          console.error('❌ Database insert error:', error);
          return NextResponse.json({ 
            success: false, 
            error: `Database error: ${error.message}`,
            debug: {
              vectorStoreInfo,
              filesCount: filesList.length,
              documentsToInsert: documentsToInsert.length
            }
          }, { status: 500 });
        }

        console.log(`✅ Successfully inserted ${data.length} documents!`);
        
        return NextResponse.json({ 
          success: true, 
          message: `Successfully synced ${data.length} documents from OpenAI`,
          documents: data,
          debug: {
            vectorStoreInfo,
            filesCount: filesList.length,
            insertedCount: data.length
          }
        });
      }
    }

    // If no files found, return debug info
    return NextResponse.json({ 
      success: true, 
      message: "No files found in vector store",
      documents: [],
      debug: {
        vectorStoreInfo,
        filesCount: filesList.length,
        vectorStoreId: VECTOR_STORE_ID
      }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error('❌ Sync failed:', errorMessage);
    return NextResponse.json({ 
      success: false, 
      error: errorMessage,
      debug: {
        vectorStoreId: VECTOR_STORE_ID,
        errorType: error instanceof Error ? error.constructor.name : 'Unknown'
      }
    }, { status: 500 });
  }
}