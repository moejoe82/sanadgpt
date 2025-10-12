export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const VECTOR_STORE_ID = "vs_68eb60e012988191be5a60558a1f1de6";

export async function POST() {
  try {
    console.log('🔄 Testing OpenAI API access...');
    console.log(`📁 Vector Store ID: ${VECTOR_STORE_ID}`);

    // Use direct API calls to OpenAI since beta.vectorStores is not available
    let vectorStoreInfo = null;
    let filesList = [];

    try {
      console.log('🔍 Fetching vector store info via direct API...');
      const response = await fetch(`https://api.openai.com/v1/vector_stores/${VECTOR_STORE_ID}`, {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        vectorStoreInfo = await response.json();
        console.log('✅ Vector store info retrieved!');
        console.log(`📊 Vector Store: ${vectorStoreInfo.name || 'Unknown'}`);
        
        // Get files from vector store
        console.log('🔍 Fetching files from vector store...');
        const filesResponse = await fetch(`https://api.openai.com/v1/vector_stores/${VECTOR_STORE_ID}/files`, {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (filesResponse.ok) {
          const filesData = await filesResponse.json();
          filesList = filesData.data || [];
          console.log(`✅ Found ${filesList.length} files in vector store`);
        } else {
          console.log(`❌ Failed to fetch files: ${filesResponse.status} ${filesResponse.statusText}`);
        }
      } else {
        console.log(`❌ Failed to fetch vector store: ${response.status} ${response.statusText}`);
      }
    } catch (apiError) {
      const errorMessage = apiError instanceof Error ? apiError.message : "Unknown API error";
      console.log('❌ API call failed:', errorMessage);
    }

    // If we have files, create documents in database
    if (filesList.length > 0) {
      console.log(`📄 Processing ${filesList.length} files...`);
      
      const documentsToInsert = [];
      
      for (const file of filesList) {
        try {
          // Get file details via direct API
          const fileResponse = await fetch(`https://api.openai.com/v1/files/${file.id}`, {
            headers: {
              'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (fileResponse.ok) {
            const fileInfo = await fileResponse.json();
            
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
          } else {
            console.error(`❌ Failed to fetch file details for ${file.id}: ${fileResponse.status}`);
          }
        } catch (fileError) {
          const errorMessage = fileError instanceof Error ? fileError.message : "Unknown file error";
          console.error(`❌ Error processing file ${file.id}:`, errorMessage);
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