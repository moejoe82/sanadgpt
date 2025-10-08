# 🚀 DiwanGPT - Complete Build Guide

**AI-Powered Audit Document Q&A System for Emirates National Schools**

Budget: $5/month | Users: 3 | Stack: Next.js + Supabase + OpenAI

---

## 📋 TABLE OF CONTENTS

1. [Architecture Overview](#architecture)
2. [Phase 1: Setup Your Mac (30 min)](#phase-1)
3. [Phase 2: Setup Online Services (30 min)](#phase-2)
4. [Phase 3: Create Project Locally (20 min)](#phase-3)
5. [Phase 4: Build with Cursor AI (2-3 hours)](#phase-4)
6. [Phase 5: Test Locally (30 min)](#phase-5)
7. [Phase 6: Deploy to Production (20 min)](#phase-6)
8. [Phase 7: Connect Custom Domain (15 min)](#phase-7)
9. [Troubleshooting](#troubleshooting)

---

<a name="architecture"></a>

## 🎯 ARCHITECTURE OVERVIEW

**System Flow:**

```
User uploads PDF → Supabase Storage + OpenAI Vector Store
User asks question → OpenAI Responses API with File Search → Answer with citations
```

**Architecture Diagram:**

USER → Next.js (Vercel) → Supabase (Auth + Storage) ↔ OpenAI (Vector Store + Responses API)

**Technology Stack:**

- **Frontend:** Next.js 14 (React, TypeScript, Tailwind CSS)
- **Authentication & Storage:** Supabase (PostgreSQL + File Storage)
- **AI & RAG:** OpenAI (Responses API + File Search + Vector Store)
- **Hosting:** Vercel (Frontend + API Routes)
- **Domain:** GoDaddy (diwangpt.com)

**Key Features:**

- Automatic document indexing by OpenAI
- Bilingual support (Arabic + English)
- File Search with automatic citations
- Role-based access (Admin + User)
- Document deduplication
- Real-time streaming responses

**Monthly Cost:** ~$5 for 3 users

---

<a name="phase-1"></a>

## 📋 PHASE 1: SETUP YOUR MAC (30 minutes)

### Step 1.1: Install Homebrew

Open **Terminal** (Press `Command + Space`, type "Terminal", press Enter):

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Enter your Mac password when prompted. After installation, run these commands:

```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

---

### Step 1.2: Install Node.js and Git

```bash
brew install node git

# Verify installations
node --version
npm --version
git --version
```

Expected output: Node v20.x, npm 10.x, git 2.x

---

### Step 1.3: Configure Git

```bash
git config --global user.name "Your Full Name"
git config --global user.email "your.email@gmail.com"

# Verify
git config --global --list
```

---

### Step 1.4: Install Cursor IDE

1. Visit: **https://cursor.sh**
2. Download for Mac
3. Open the `.dmg` file
4. Drag Cursor to Applications
5. Open Cursor from Applications
6. Sign in with GitHub

---

<a name="phase-2"></a>

## 📋 PHASE 2: SETUP ONLINE SERVICES (30 minutes)

### Step 2.1: Create GitHub Account

1. Visit: **https://github.com**
2. Click **"Sign up"**
3. Complete registration
4. Verify email

---

### Step 2.2: Create Supabase Project

1. Visit: **https://supabase.com**
2. Sign in with GitHub
3. Click **"New Project"**
4. Fill in:
   - **Name:** `diwangpt`
   - **Database Password:** Create strong password (save in Notes!)
   - **Region:** Singapore or Mumbai
   - **Plan:** FREE
5. Click **"Create new project"**
6. Wait 3-5 minutes for provisioning

---

### Step 2.3: Save Supabase Credentials

1. Open Notes app on Mac
2. Create note: "DiwanGPT Credentials"
3. In Supabase, go to **"Project Settings"** → **"API"**
4. Copy and save:
   - **Project URL:** `https://xxxxx.supabase.co`
   - **Anon Key:** `eyJhbGc...` (under "anon public")

---

### Step 2.4: Setup Supabase Database

1. In Supabase, click **"SQL Editor"** → **"New query"**
2. Copy and paste this complete script:

```sql
-- Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Documents table
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_hash TEXT NOT NULL UNIQUE,
  emirate_scope TEXT DEFAULT 'UAE',
  authority_name TEXT,
  openai_file_id TEXT,
  openai_vector_store_id TEXT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'ready', 'error'))
);

-- User roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Chat history table
CREATE TABLE IF NOT EXISTS public.chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sources JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS documents_user_idx ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS documents_status_idx ON public.documents(status);
CREATE INDEX IF NOT EXISTS chat_history_user_idx ON public.chat_history(user_id);

-- Enable RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;

-- Documents policies
DROP POLICY IF EXISTS doc_select ON public.documents;
CREATE POLICY doc_select ON public.documents
  FOR SELECT USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin')
  );

DROP POLICY IF EXISTS doc_insert ON public.documents;
CREATE POLICY doc_insert ON public.documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS doc_update ON public.documents;
CREATE POLICY doc_update ON public.documents
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS doc_delete ON public.documents;
CREATE POLICY doc_delete ON public.documents
  FOR DELETE USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin')
  );

-- User roles policies
DROP POLICY IF EXISTS roles_select ON public.user_roles;
CREATE POLICY roles_select ON public.user_roles
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin')
  );

DROP POLICY IF EXISTS roles_insert ON public.user_roles;
CREATE POLICY roles_insert ON public.user_roles
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin')
  );

DROP POLICY IF EXISTS roles_update ON public.user_roles;
CREATE POLICY roles_update ON public.user_roles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin')
  );

-- Chat history policies
DROP POLICY IF EXISTS chat_select ON public.chat_history;
CREATE POLICY chat_select ON public.chat_history
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS chat_insert ON public.chat_history;
CREATE POLICY chat_insert ON public.chat_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

3. Click **"Run"**
4. Should see: "Success. No rows returned"

---

### Step 2.5: Create Storage Bucket

**Option A - Using UI:**

1. Click **"Storage"** → **"Create a new bucket"**
2. Name: `documents`
3. Public: OFF
4. Click **"Create bucket"**

**Option B - Using SQL (if UI doesn't load):**

1. Go to **"SQL Editor"** → **"New query"**
2. Paste:

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;
```

3. Click **"Run"**

---

### Step 2.6: Configure Storage Policies

In **"SQL Editor"**, run this:

```sql
DROP POLICY IF EXISTS "Users can read own objects" ON storage.objects;
CREATE POLICY "Users can read own objects"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'documents'
    AND (split_part(name, '/', 1))::uuid = auth.uid()
  );

DROP POLICY IF EXISTS "Users can upload own objects" ON storage.objects;
CREATE POLICY "Users can upload own objects"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documents'
    AND (split_part(name, '/', 1))::uuid = auth.uid()
  );

DROP POLICY IF EXISTS "Users can update own objects" ON storage.objects;
CREATE POLICY "Users can update own objects"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'documents'
    AND (split_part(name, '/', 1))::uuid = auth.uid()
  );

DROP POLICY IF EXISTS "Users can delete own objects" ON storage.objects;
CREATE POLICY "Users can delete own objects"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'documents'
    AND (split_part(name, '/', 1))::uuid = auth.uid()
  );
```

---

### Step 2.7: Get Supabase Service Role Key

1. In Supabase, go to **"Project Settings"** → **"API"**
2. Scroll to **"Project API keys"**
3. Find **"service_role"** key
4. Click **"Reveal"** and copy
5. Save in Notes as: `SUPABASE_SERVICE_ROLE_KEY`

**⚠️ Never expose this key in browser code!**

---

### Step 2.8: Create OpenAI Account

1. Visit: **https://platform.openai.com**
2. Sign up and verify email
3. Add credit card under **"Billing"**
4. Add $10 credit
5. Set monthly limit: $20

---

### Step 2.9: Create OpenAI API Key

1. Click **"API keys"** in sidebar
2. Click **"+ Create new secret key"**
3. Name: `diwangpt`
4. Copy the key (starts with `sk-proj-...`)
5. Save in Notes

---

### Step 2.10: Create Vercel Account

1. Visit: **https://vercel.com**
2. Sign in with GitHub
3. Authorize Vercel
4. Keep tab open

---

<a name="phase-3"></a>

## 📋 PHASE 3: CREATE PROJECT LOCALLY (20 minutes)

### Step 3.1: Create Project Folder

```bash
cd ~/Documents
mkdir diwangpt && cd diwangpt
cursor .
```

If `cursor .` doesn't work, drag folder to Cursor icon.

---

### Step 3.2: Initialize Next.js

In Cursor terminal (`Control + ~`):

```bash
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"
```

Accept all defaults (press Enter).

---

### Step 3.3: Install Dependencies

```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs openai ai pdf-parse mammoth
```

---

### Step 3.4: Create Environment File

Create `.env.local` (Press `Command + N`):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# OpenAI
OPENAI_API_KEY=your_openai_api_key_here

# Will add Vector Store ID in Step 3.6
```

Replace with your actual values from Notes. Save as `.env.local`.

---

### Step 3.5: Create Vector Store Script

1. Create folder: `scripts/`
2. Create file: `scripts/createVectorStore.js`
3. Paste:

```javascript
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
```

---

### Step 3.6: Run Vector Store Script

```bash
npm install dotenv
node scripts/createVectorStore.js
```

Copy the Vector Store ID and add to `.env.local`:

```env
OPENAI_VECTOR_STORE_ID=vs_xxxxxxxxxxxxx
```

Save the file.

---

### Step 3.7: Verify Environment File

Your complete `.env.local` should have:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
OPENAI_API_KEY=sk-proj-...
OPENAI_VECTOR_STORE_ID=vs_...
```

**Verify all 5 values are present.**

---

<a name="phase-4"></a>

## 📋 PHASE 4: BUILD WITH CURSOR AI (2-3 hours)

Use Cursor Composer (`Command + I`) for each step.

### Step 4.1: Project Structure

Paste in Composer:

```
Create folder structure for a Next.js 14 bilingual audit Q&A app using OpenAI Responses API:

1. Create folders:
   - lib/ (utilities)
   - components/ (React components)
   - types/ (TypeScript types)

2. Create files:
   - lib/supabase.ts (browser client)
   - lib/supabaseAdmin.ts (server client with service role)
   - lib/openai.ts (OpenAI client)
   - lib/documentProcessor.ts (PDF/DOCX/TXT extraction + SHA-256)
   - types/index.ts (Document, ChatMessage types)

3. Update app/layout.tsx:
   - Import Tajawal font from Google Fonts
   - Set dir="rtl" and lang="ar"
   - Metadata title: "DiwanGPT – نظام إدارة وثائق التدقيق"
```

---

### Step 4.2: Implement Supabase Clients

Paste in Composer:

```
Implement Supabase clients:

1. lib/supabase.ts (browser client):
   - Use createClient from @supabase/supabase-js
   - Use NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
   - Export as 'supabase'

2. lib/supabaseAdmin.ts (server client):
   - Add comment: "// SERVER-SIDE ONLY - DO NOT import in browser code!"
   - Use createClient with SUPABASE_SERVICE_ROLE_KEY
   - Set auth: { persistSession: false }
   - Export as 'supabaseAdmin'
```

---

### Step 4.3: Implement OpenAI Client

Paste in Composer:

```
Implement lib/openai.ts with an OpenAI client and vector store helpers:

1. Create OpenAI client instance using OPENAI_API_KEY
2. Export helper: uploadFileToVectorStore(fileBuffer: Buffer, filename: string): Promise<string>
   - Upload file to OpenAI using openai.files.create
   - Add file to vector store using openai.beta.vectorStores.files.create
   - Use OPENAI_VECTOR_STORE_ID from environment
   - Return file ID
3. Export helper: deleteFileFromVectorStore(fileId: string): Promise<void>
```

---

### Step 4.4: Implement Document Processor

Paste in Composer:

```
Implement lib/documentProcessor.ts:

1. Function extractTextFromFile(file: File): Promise<string>
   - PDF: use pdf-parse
   - DOCX: use mammoth.extractRawText
   - TXT: use TextDecoder
   - Throw error for unsupported types

2. Function sha256Hex(file: File): Promise<string>
   - Read file as ArrayBuffer
   - Use crypto.subtle.digest('SHA-256')
   - Convert to hex string

3. Function getFileExtension(filename: string, mimeType: string): string
```

---

### Step 4.5: Create Authentication Pages

Paste in Composer:

```
Create bilingual authentication pages:

1. app/(auth)/login/page.tsx:
   - Email and password fields
   - Labels: "البريد الإلكتروني / Email", "كلمة المرور / Password"
   - Use Supabase auth.signInWithPassword
   - Redirect to /dashboard on success
   - Link to register: "إنشاء حساب جديد / Create Account"
   - Tailwind CSS, RTL layout

2. app/(auth)/register/page.tsx:
   - Email, password, confirm password
   - Bilingual labels
   - Use Supabase auth.signUp
   - Success message in Arabic
   - Link to login
   - Tailwind CSS, RTL layout

3. app/(auth)/layout.tsx:
   - Centered card layout
   - DiwanGPT logo
   - Gradient background
```

---

### Step 4.6: Create Document Upload API

Paste in Composer:

```
Create app/api/documents/upload/route.ts (POST):

1. Add: export const runtime = 'nodejs';

2. Import supabaseAdmin (not regular supabase) and OpenAI client

3. Parse FormData:
   - file (field name: "document")
   - title, emirate_scope, authority_name

4. Use stub user_id for now:
   const user_id = "00000000-0000-0000-0000-000000000000";

5. Calculate SHA-256 hash

6. Check duplicate with supabaseAdmin

7. Upload to Supabase Storage:
   - Path: `${user_id}/${hash}.${ext}`
   - Use: supabaseAdmin.storage.from('documents').upload(path, buffer)

8. Upload to OpenAI Vector Store:
   - Create file
   - Add to store using openai.beta.vectorStores.files.create

9. Insert to documents table with supabaseAdmin:
   - file_path should be: `${user_id}/${hash}.${ext}` (no bucket prefix)

10. Return {id, title}
```

“Note: The database file_path column stores only the object key <user_id>/<hash>.<ext>, not the bucket prefix documents/.”

---

### Step 4.7: Create Chat API

Paste in Composer:

```
Create app/api/chat/route.ts (POST) using OpenAI Responses API:

1. Add: export const runtime = 'nodejs';

2. Parse body: { question }

3. Create bilingual system prompt about DiwanGPT audit assistant

4. Call OpenAI:
   - Model: "gpt-4o"
   - Tools: [{ type: "file_search", vector_store_ids: [process.env.OPENAI_VECTOR_STORE_ID] }]
   - Input: [system_prompt, user_question]
   - Stream: true

5. Return: new Response(resp.body, { headers: { "Content-Type": "text/event-stream" } })
```

---

### Step 4.8: Create Document Upload Component

Paste in Composer:

```
Create components/DocumentUpload.tsx:

1. Features:
   - Drag-and-drop zone
   - File picker (PDF, DOCX, TXT)
   - Inputs: Title, Emirate Scope select, Authority Name
   - Calculate SHA-256 hash client-side
   - Upload button
   - Progress indicator
   - Success/error messages (bilingual)
   - Checks:
      • Max file size (e.g., 25–50 MB)
	   • MIME allow-list (PDF/DOCX/TXT)
	   • Friendly 409 on duplicate by file_hash (you already say “check duplicate”—spell out the error shape so the UI can surface it).

2. POST FormData to /api/documents/upload

3. Tailwind CSS, Arabic labels, RTL, responsive
```

---

### Step 4.9: Create Chat Interface

Paste in Composer:

```
Create components/ChatInterface.tsx:

1. Features:
   - Message list (user right, AI left for RTL)
   - Streaming text
   - Citations from File Search
   - Input: "اطرح سؤالك هنا / Ask your question..."
   - Send button
   - "جاري التفكير... / Thinking..." while loading
   - Auto-scroll

2. Implementation:
   - useState for messages
   - POST to /api/chat with { question }
   - Parse streaming response
   - Display in bubbles
   - Show citations

3. Tailwind CSS, bilingual, RTL, smooth animations
```

---

### Step 4.10: Create Documents List

Paste in Composer:

```
Create components/DocumentsList.tsx:

1. Features:
   - Fetch user documents from Supabase
   - Display as cards: title, filename, emirate, authority, date
   - Delete button with confirm
   - Empty state: "لم يتم رفع أي مستندات / No documents"
   - Loading skeleton

2. Grid layout, Tailwind CSS, bilingual, responsive
```

---

### Step 4.11: Create Document Delete API

Paste in Composer:

```
Create app/api/documents/delete/route.ts (POST):

1. Get user from Supabase auth
2. Parse: { documentId }
3. Verify document belongs to user
4. Get openai_file_id and file_path
5. Delete from documents table
6. Delete from Supabase Storage: supabaseAdmin.storage.from('documents').remove([file_path])
7. Delete from OpenAI Vector Store
8. Return success
```

---

### Step 4.12: Create Dashboard Page

Paste in Composer:

```
Create app/dashboard/page.tsx:

1. Check auth, redirect to /login if not authenticated

2. Layout:
   - Top bar: Logo, user email, logout
   - Right sidebar (RTL): Chat, Upload, Documents, Admin (if admin) tabs
   - Main content area shows active tab

3. Fetch user role from user_roles table

4. Render components based on tab

5. Tailwind CSS, bilingual, RTL, responsive
```

---

### Step 4.13: Create Landing Page

Paste in Composer:

```
Update app/page.tsx:

1. Hero:
   - Title: "DiwanGPT"
   - Subtitle: "نظام ذكي لإدارة وثائق التدقيق / Intelligent Audit System"
   - CTA: "ابدأ الآن / Get Started" → /login

2. Features (3 cards):
   - رفع المستندات / Easy Upload
   - بحث ذكي / Smart Search
   - إجابات دقيقة / Accurate Answers

3. Gradient background, Tailwind CSS, bilingual, responsive
```

---

### Step 4.14: Add Middleware

Paste in Composer:

```
Create middleware.ts:

1. Use createMiddlewareClient from @supabase/auth-helpers-nextjs
2. Protected routes: /dashboard/* → redirect to /login
3. Auth routes: /login, /register → redirect to /dashboard if authenticated
4. Export config matcher
```

---

### Step 4.15: Add Loading & Error Pages

Paste in Composer:

```
Create:

1. app/loading.tsx:
   - Centered spinner
   - "جاري التحميل... / Loading..."

2. app/error.tsx:
   - Display error
   - "حدث خطأ / Error occurred"
   - Retry button

3. app/dashboard/loading.tsx: Same as above
4. app/dashboard/error.tsx: Same as above

All RTL, bilingual
```

---

<a name="phase-5"></a>

## 📋 PHASE 5: TEST LOCALLY (30 minutes)

### Step 5.1: Run Dev Server

```bash
npm run dev
```

Open: **http://localhost:3000**

---

### Step 5.2: Register & Login

1. Go to landing page
2. Click "ابدأ الآن"
3. Register: `admin@diwangpt.com` / `Admin123!@#`
4. Check email, verify
5. Login

---

### Step 5.3: Make User Admin

In Supabase SQL Editor:

```sql
-- Get your user ID first
SELECT id, email FROM auth.users WHERE email = 'admin@diwangpt.com';

-- Insert admin role (replace with your actual user ID)
INSERT INTO public.user_roles (user_id, role)
VALUES ('YOUR_USER_ID_HERE', 'admin');
```

---

### Step 5.4: Upload Test Document

1. Create `test-policy.txt`:

```
سياسة المراجعة الداخلية رقم 1

يجب الحصول على موافقة المدير المالي لجميع المصروفات
التي تتجاوز 10,000 درهم حسب معايير KHDA.
```

2. Upload via dashboard
3. Title: "سياسة الموافقات المالية"
4. Emirate: Dubai
5. Authority: KHDA
6. Wait for success

---

### Step 5.5: Test Chat

1. Go to Chat tab
2. Ask: "ما هي سياسة الموافقات المالية؟"
3. Should get answer with citation
4. Try in English: "What is the approval policy?"

---

<a name="phase-6"></a>

## 📋 PHASE 6: DEPLOY TO PRODUCTION (20 minutes)

### Step 6.1: Commit to Git

```bash
git init
echo "node_modules
.next
.env.local
.DS_Store" > .gitignore
git add .
git commit -m "Initial commit"
```

---

### Step 6.2: Create GitHub Repository

1. Visit: **https://github.com**
2. Click **"+"** → **"New repository"**
3. Name: `diwangpt`
4. Private
5. Don't initialize
6. Click **"Create"**

---

### Step 6.3: Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/diwangpt.git
git branch -M main
git push -u origin main
```

---

### Step 6.4: Deploy to Vercel

1. Go to: **https://vercel.com/dashboard**
2. Click **"Add New..."** → **"Project"**
3. Import `diwangpt` repository
4. Framework: Next.js (auto-detected)
5. Add environment variables:

```
NEXT_PUBLIC_SUPABASE_URL = your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY = your_key
SUPABASE_SERVICE_ROLE_KEY = your_service_key
OPENAI_API_KEY = your_openai_key
OPENAI_VECTOR_STORE_ID = your_vector_store_id
```

6. Click **"Deploy"**
7. Wait 2-3 minutes

---

<a name="phase-7"></a>

## 📋 PHASE 7: CONNECT CUSTOM DOMAIN (15 minutes)

### Step 7.1: Add Domain in Vercel

1. Go to project **"Settings"** → **"Domains"**
2. Enter: `diwangpt.com`
3. Click **"Add"**
4. Copy DNS records shown

---

### Step 7.2: Configure DNS in GoDaddy

1. Visit: **https://dcc.godaddy.com**
2. Find `diwangpt.com` → **"DNS"**
3. Update A record:
   - Type: A
   - Name: @
   - Value: `76.76.21.21`
   - TTL: 600
4. Update CNAME:
   - Type: CNAME
   - Name: www
   - Value: `cname.vercel-dns.com`
5. Save

---

### Step 7.3: Wait for DNS

DNS propagation: 10-60 minutes

Check: https://www.whatsmydns.net/

When ready, Vercel shows "Valid Configuration"

---

### Step 7.4: Update Supabase URLs

1. In Supabase: **"Authentication"** → **"URL Configuration"**
2. Site URL: `https://diwangpt.com`
3. Redirect URLs:
   - `https://diwangpt.com/**`
   - `https://diwangpt-*.vercel.app/**`
4. Save

---

<a name="troubleshooting"></a>

## 🔧 TROUBLESHOOTING

### Issue: "Vector Store not found"

**Solution:**

- Verify `OPENAI_VECTOR_STORE_ID` in `.env.local`
- Check: https://platform.openai.com/storage
- Verify script ran successfully
- Restart dev server

---

### Issue: Upload fails with RLS error

**Solution:**

- Verify using `supabaseAdmin` in upload API
- Check `SUPABASE_SERVICE_ROLE_KEY` is set
- Verify service role key is correct

---

### Issue: File Search returns no results

**Solution:**

- Wait 1-2 minutes after upload for indexing
- Verify files in Vector Store UI
- Check file uploaded successfully (status: 'completed')
- Check that you’re using the correct OPENAI_VECTOR_STORE_ID (same as used during upload).

---

### Issue: Chat responses slow

This is normal. OpenAI File Search takes 2-5 seconds for first token while searching documents.

---

## ✅ CHECKLIST

### Phase 1: Mac Setup

- [ ] Homebrew installed
- [ ] Node.js and Git installed
- [ ] Git configured
- [ ] Cursor IDE installed

### Phase 2: Online Services

- [ ] GitHub account created
- [ ] Supabase project created
- [ ] Database schema executed
- [ ] Storage bucket created
- [ ] Storage RLS policies configured
- [ ] Supabase service role key obtained
- [ ] OpenAI account created
- [ ] OpenAI API key obtained
- [ ] Vercel account created

### Phase 3: Local Setup

- [ ] Project folder created
- [ ] Next.js initialized
- [ ] Dependencies installed
- [ ] Partial `.env.local` created (4 vars)
- [ ] Vector Store script created
- [ ] Vector Store created via script
- [ ] OPENAI_VECTOR_STORE_ID added to env
- [ ] Complete `.env.local` verified (5 vars)

### Phase 4: Development

- [ ] Project structure created
- [ ] Supabase clients implemented
- [ ] OpenAI client implemented
- [ ] Document processor implemented
- [ ] Auth pages created
- [ ] Upload API created
- [ ] Chat API created
- [ ] Upload component created
- [ ] Chat component created
- [ ] Documents list created
- [ ] Delete API created
- [ ] Dashboard page created
- [ ] Landing page created
- [ ] Middleware added
- [ ] Loading/error pages added

### Phase 5: Testing

- [ ] Dev server running
- [ ] Registration works
- [ ] Login works
- [ ] Admin role assigned
- [ ] Document upload works
- [ ] File in Supabase Storage
- [ ] File in OpenAI Vector Store
- [ ] Chat works with citations
- [ ] Bilingual support works
- [ ] Document deletion works

### Phase 6: Deployment

- [ ] Code committed to Git
- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] All 5 env vars set in Vercel
- [ ] Vercel deployment successful
- [ ] Production app tested

### Phase 7: Domain

- [ ] Domain added in Vercel
- [ ] DNS configured in GoDaddy
- [ ] DNS propagated
- [ ] SSL certificate issued
- [ ] Supabase URLs updated
- [ ] Production domain working

---

## 📊 COST BREAKDOWN

**Monthly Costs (3 users, 50 documents):**

| Service             | Cost           |
| ------------------- | -------------- |
| OpenAI Vector Store | $0.30          |
| OpenAI API calls    | $3-4           |
| Supabase            | $0 (free tier) |
| Vercel              | $0 (free tier) |
| Domain              | $1             |
| **Total**           | **~$5/month**  |

---

## 🚀 WHAT YOU BUILT

**Features:**

- ✅ Bilingual audit document Q&A (Arabic + English)
- ✅ Automatic document indexing with OpenAI
- ✅ Smart search with citations
- ✅ User authentication and roles
- ✅ Document management (upload, view, delete)
- ✅ Real-time streaming responses
- ✅ Duplicate detection
- ✅ Secure file storage
- ✅ Custom domain with HTTPS

**Technology Stack:**

- Next.js 14 with TypeScript
- Supabase (Auth + Storage + PostgreSQL)
- OpenAI (Responses API + File Search + Vector Store)
- Vercel (Hosting)
- Tailwind CSS (Styling)

**Estimated Build Time:** 4-5 hours

**Monthly Operational Cost:** $5

---

## 📚 RESOURCES

**Documentation:**

- OpenAI Responses API: https://platform.openai.com/docs/api-reference/responses
- Supabase Docs: https://supabase.com/docs
- Next.js Docs: https://nextjs.org/docs
- Vercel Docs: https://vercel.com/docs

- “OpenAI File Search (under Assistants docs): https://platform.openai.com/docs/assistants/tools/file-search”
- We’re using File Search with the Responses API

**Useful Tools:**

- OpenAI Platform: https://platform.openai.com
- Supabase Studio: Your project dashboard
- Vercel Dashboard: Monitor deployments

---

## 🎯 NEXT STEPS

**After Completion:**

1. **Add Real Authentication**

   - Replace stub `user_id` in upload API
   - Use `supabase.auth.getUser()` for real users

2. **Upload Audit Documents**

   - MOE policies
   - KHDA guidelines
   - ADEK standards
   - SPEA frameworks

3. **Train Your Team**

   - How to upload documents
   - How to ask questions
   - How to interpret citations

4. **Monitor Usage**
   - Check OpenAI costs: https://platform.openai.com/usage
   - Monitor Supabase usage: Project dashboard
   - Review Vercel analytics

---

## 🆘 SUPPORT

**If you encounter issues:**

1. Check the Troubleshooting section
2. Verify all 5 environment variables are set
3. Confirm Vector Store ID is correct
4. Check OpenAI logs: https://platform.openai.com/logs
5. Check Supabase logs: Project → Logs
6. Check Vercel logs: Deployments → View logs

**Common Quick Fixes:**

- Restart dev server: `npm run dev`
- Clear browser cache
- Redeploy on Vercel
- Verify service role key is server-side only

---

## 🎉 CONGRATULATIONS!

You've successfully built **DiwanGPT** - a production-ready AI-powered audit document Q&A system!

**What You Achieved:**

- Full-stack Next.js application
- OpenAI integration with automatic RAG
- Secure authentication and authorization
- Bilingual support (Arabic + English)
- Production deployment with custom domain
- Cost-optimized architecture ($5/month)

**Your app is now live at:** https://diwangpt.com

---

**Built with Cursor AI, Supabase, and OpenAI Responses API**

**Version:** 2.2 (Production Ready)

**Last Updated:** October 2025

**Total Build Time:** 4-5 hours

**Monthly Cost:** $5
