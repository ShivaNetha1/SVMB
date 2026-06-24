# Make.com Scenario Setup Guide — SVMB

> **Important update:** The original `make-com-blueprint.json` may import into
> Make.com with many **"Module Not Found"** blocks. If that happens, do not try
> to repair the imported scenario module by module. Use
> `make-com-v2-http-workflow.md` instead. The v2 guide rebuilds the workflow
> with Make built-ins plus HTTP requests to Supabase, OpenAI, and Telegram,
> avoiding the fragile Supabase/OpenAI/Telegram action modules that failed in
> the imported blueprint.

## Quick Start (3 Steps)

### Step 1: Import the Blueprint

1. Open [Make.com](https://www.make.com) → Go to **Scenarios**
2. Click **Create a new scenario**
3. Click the **⋯ (three dots)** menu at the bottom of the scenario editor
4. Select **Import Blueprint**
5. Upload the file: `make-com-blueprint.json`
6. The entire scenario with all 5 branches will appear

### Step 2: Assign Connections

After importing, every module will show a ⚠️ warning because connections aren't assigned yet. Fix them:

#### Telegram Bot Connection
1. Click any **Telegram** module (they have the Telegram icon)
2. Click **Add** next to the Connection field
3. Enter your **Bot Token** (get it from [@BotFather](https://t.me/BotFather) on Telegram)
4. Save → it will auto-apply to all Telegram modules

#### Supabase Connection
1. Click any **Supabase** module
2. Click **Add** next to Connection
3. Enter:
   - **API URL**: Your Supabase project URL (e.g. `https://abcdefg.supabase.co`)
   - **API Key**: Your **service_role** key (found in Supabase → Settings → API → service_role)
   - ⚠️ Use the **service_role** key (NOT the anon key) — this bypasses RLS for server-side operations
4. Save → apply to all Supabase modules

#### OpenAI Connection
1. Click any **OpenAI** module
2. Click **Add** next to Connection
3. Enter your **OpenAI API Key** (from [platform.openai.com/api-keys](https://platform.openai.com/api-keys))
4. Save → apply to all OpenAI modules

### Step 3: Test Each Branch

1. **Turn on** the scenario (toggle at bottom-left)
2. Click **Run once** to start listening
3. Send test messages to your bot:

| Test | What to Send | Expected Result |
|------|-------------|-----------------|
| Branch 3 (Text) | Send the sample biodata text (see below) | Bot replies with ✅ Profile Saved |
| Branch 4 (Photo link) | Send a photo within 3 mins of Branch 3 | Bot replies ✅ Photo linked |
| Branch 2 (Photo+Caption) | Send a photo WITH biodata as caption | Bot replies with full profile card |
| Branch 1 (EDIT) | Send: `EDIT SVMB-F-101 religion Hindu` | Bot replies ✅ Updated |
| Branch 5 (PDF) | Send a PDF biodata file | Bot replies with profile saved |

---

## Sample Biodata for Testing

Copy-paste this as a message to your bot:

```
*PERSONAL DETAILS* 
Name : M.Aishwarya 
D.b.29-08-1998
Birth time: 1:13am 
Place of Birth : hyd
Rashi : Aries - thularashi
Height : 5.1
Education : M pharmacy, MBA
Religion : hindhu 
Caste: BC-b/Padmashali

CONTACT DETAILS* 
Address : MR VILLA ANNARAM VILLAGE GUMMADIDALA MANDAL SANGAREDDY DIST

FAMILY DETAILS:
Father name: M.srinivas
Occupation: Business 
Mother name: M.Anuradha
Occupation: Homemaker 
Brother: M. Abhinav (student)
```

---

## Architecture Overview

```
Telegram Message
       ↓
[Watch Updates] → [Router]
                     ├── Branch 1: EDIT command
                     │    └── Parse → Update Supabase → Log → Reply
                     ├── Branch 2: Photo + Caption
                     │    └── MB check → GPT extract → Download photo
                     │        → Upload to Storage → Generate ID → Insert → Log → Reply
                     ├── Branch 3: Text Only
                     │    └── MB check → GPT extract → Generate ID → Insert
                     │        → Create pending_photo → Log → Reply
                     ├── Branch 4: Photo Only
                     │    └── Check pending_photos → Download photo → Upload
                     │        ├── Found: Link to client → Delete pending → Reply ✅
                     │        └── Not found: Save as unlinked → Reply ⚠️
                     └── Branch 5: PDF
                          └── Download PDF → GPT extract → Generate ID → Insert
                              → Create pending_photo → Log → Reply
```

---

## Troubleshooting

### "No data was returned"
- The Supabase query returned no rows. Check that your table names match exactly.
- Make sure you ran the SQL schema in Supabase SQL Editor first.

### "Invalid API key"
- Double-check your Supabase **service_role** key (not the anon key)
- Check your OpenAI API key has credits available

### Bot not responding
- Ensure the scenario is **turned ON** and in **immediate** mode (not scheduled)
- Check that the Telegram Watch Updates module shows "Listening"
- Verify your bot token is correct

### Photo upload fails
- Ensure the `profile-photos` storage bucket exists in Supabase
- Check that storage policies are created (run the SQL schema)
- The bucket must be set to **public** for photos to be viewable

### EDIT command not working
- Format must be exactly: `EDIT [CODE] [field] [value]`
- Field names must match database column names (e.g. `payment_status`, `profile_status`, `height`, `education`)
- The unique_code must exist in the database

---

## Error Handling

Each branch should have an error handler that sends a Telegram message:

1. Right-click any module in a branch
2. Select **Add error handler**
3. Add a **Telegram → Send a Message** module
4. Set the text to: `❌ Error: {{error.message}}. Please retry or add manually from dashboard.`
5. Set chat_id to: `{{1.message.chat.id}}`

---

## Important Notes

- The scenario uses **GPT-4o mini** by default. You can switch to **Claude** by replacing OpenAI modules with Anthropic modules (same prompt works).
- Partner bureau detection looks for any word containing `mb` (case-insensitive) in the message text.
- The pending photo window is **3 minutes** — after that, photos sent will be stored as "unlinked".
- All photos are stored permanently in Supabase Storage, not as Telegram file URLs.
- The `service_role` key is needed because Make.com needs to bypass RLS. Never expose this key in frontend code.
