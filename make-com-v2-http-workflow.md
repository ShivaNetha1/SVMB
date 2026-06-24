# SVMB Make.com Workflow v2 - HTTP-First Build Guide

> Use this guide instead of importing `make-com-blueprint.json`.
> The old blueprint is useful as a reference, but the imported scenario shows
> "Module Not Found" for Supabase, OpenAI, and Telegram action modules.
> This version avoids those fragile app modules and uses HTTP requests instead.

## Why Rebuild This Way

The imported scenario failed because Make could not resolve module IDs such as:

- `supabase:ActionCreateARecord`
- `supabase:ActionSelectRows`
- `openai:createChatCompletion`
- `telegram:sendMessage`
- `telegram:downloadFile`

The reliable replacement is:

```text
Telegram Watch Updates
  -> Router
  -> OpenAI via HTTP
  -> Parse JSON
  -> Supabase via HTTP
  -> Telegram reply via HTTP
```

Use only these Make modules where possible:

- Telegram Bot > Watch Updates
- Flow Control > Router
- Tools > Set variable
- JSON > Parse JSON
- HTTP > Make a request

## Required Secrets

Keep these only inside Make.com. Never paste them into frontend code or GitHub.

```text
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=your-openai-api-key
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
```

## Build In Phases

Do not build all branches at once. Build and test in this order:

1. Text/caption biodata -> create client
2. Telegram success/error replies
3. Photo upload and linking
4. EDIT command
5. PDF handling

## Phase 1 - Text Or Caption Biodata To Supabase

### Module 1: Telegram Bot - Watch Updates

Create a new scenario and add:

```text
Telegram Bot > Watch Updates
```

Connect the bot token from BotFather.

### Module 2: Router

Add a router after the Telegram trigger.

For phase 1, create only one route:

```text
Biodata text or caption
```

Suggested filter logic:

```text
message text exists and does not start with EDIT
OR
photo caption exists
```

In Make's filter UI this usually means:

```text
text is not empty AND text does not match ^EDIT\s
OR caption is not empty
```

### Module 3: Tools - Set Variable `raw_biodata`

Set one variable that chooses caption first, otherwise text:

```text
raw_biodata =
if(caption exists; caption; text)
```

Use Make's variable picker for the exact Telegram fields.

### Module 4: HTTP - OpenAI Extraction

Add:

```text
HTTP > Make a request
```

Request:

```text
Method: POST
URL: https://api.openai.com/v1/chat/completions
```

Headers:

```text
Authorization: Bearer OPENAI_API_KEY
Content-Type: application/json
```

Body type:

```text
Raw / JSON
```

Body:

```json
{
  "model": "gpt-4o-mini",
  "temperature": 0,
  "response_format": { "type": "json_object" },
  "messages": [
    {
      "role": "system",
      "content": "You extract marriage bureau biodata into strict JSON. Return only JSON. Do not invent missing facts."
    },
    {
      "role": "user",
      "content": "Extract this biodata for Sri Venkateshwara Marriage Bureau. Return JSON with exactly these keys: first_name, last_name, dob, birth_time, place_of_birth, rashi, height, education, religion, caste, gender, address, phone, father_name, father_occupation, mother_name, mother_occupation, siblings, bureau_type, source_bureau, notes. Rules: dob must be YYYY-MM-DD or null. gender must be Male, Female, or null. bureau_type must be own or partner. If partner bureau is mentioned, set bureau_type partner and source_bureau to that bureau code/name. Otherwise bureau_type own and source_bureau SVMB. If a value is missing, use null. Text: {{raw_biodata}}"
    }
  ]
}
```

### Module 5: JSON - Parse JSON

Parse:

```text
choices[1].message.content
```

Expected data structure:

```json
{
  "first_name": "string",
  "last_name": "string or null",
  "dob": "YYYY-MM-DD or null",
  "birth_time": "string or null",
  "place_of_birth": "string or null",
  "rashi": "string or null",
  "height": "string or null",
  "education": "string or null",
  "religion": "string or null",
  "caste": "string or null",
  "gender": "Male, Female, or null",
  "address": "string or null",
  "phone": "string or null",
  "father_name": "string or null",
  "father_occupation": "string or null",
  "mother_name": "string or null",
  "mother_occupation": "string or null",
  "siblings": "string or null",
  "bureau_type": "own or partner",
  "source_bureau": "string",
  "notes": "string or null"
}
```

### Module 6: Router - Validation

Add a small validation router.

Route A: valid profile

Required fields:

```text
first_name is not empty
dob is not empty
height is not empty
education is not empty
address is not empty
gender is Male or Female
```

Route B: invalid profile

If any required field is missing, send a Telegram reply via HTTP:

```text
Cannot save profile. Missing: name/DOB/height/education/address/gender.
Please resend biodata with the missing field.
```

Important: do not insert missing-gender records from Make.com right now.
The current DB has `unique_code` as unique, and the old design used `PENDING`.
That can break after the first missing-gender insert.

### Module 7: HTTP - Fetch Current Max ID

Add:

```text
HTTP > Make a request
```

Method:

```text
GET
```

For own bureau:

```text
{{SUPABASE_URL}}/rest/v1/clients?select=id_number&gender=eq.{{gender}}&bureau_type=eq.own&order=id_number.desc&limit=1
```

For partner bureau:

```text
{{SUPABASE_URL}}/rest/v1/clients?select=id_number&gender=eq.{{gender}}&source_bureau=eq.{{source_bureau}}&order=id_number.desc&limit=1
```

Headers:

```text
apikey: SUPABASE_SERVICE_ROLE_KEY
Authorization: Bearer SUPABASE_SERVICE_ROLE_KEY
Content-Type: application/json
```

Parse response as JSON.

### Module 8: Tools - Generate Code Variables

Set:

```text
start_number = if(bureau_type = own; 100; 600)
last_number = if(max-id response has row; first row id_number; start_number)
next_number = last_number + 1
gender_prefix = if(gender = Male; M; F)
bureau_code = if(bureau_type = own; SVMB; source_bureau)
unique_code = bureau_code + "-" + gender_prefix + "-" + next_number
```

This produces:

```text
SVMB-M-101
SVMB-F-101
PARTNER-M-601
PARTNER-F-601
```

### Module 9: HTTP - Insert Client

Add:

```text
HTTP > Make a request
```

Request:

```text
Method: POST
URL: {{SUPABASE_URL}}/rest/v1/clients
```

Headers:

```text
apikey: SUPABASE_SERVICE_ROLE_KEY
Authorization: Bearer SUPABASE_SERVICE_ROLE_KEY
Content-Type: application/json
Prefer: return=representation
```

Body:

```json
{
  "unique_code": "{{unique_code}}",
  "id_number": "{{next_number}}",
  "bureau_type": "{{bureau_type}}",
  "source_bureau": "{{bureau_code}}",
  "first_name": "{{first_name}}",
  "last_name": "{{last_name}}",
  "dob": "{{dob}}",
  "birth_time": "{{birth_time}}",
  "place_of_birth": "{{place_of_birth}}",
  "rashi": "{{rashi}}",
  "height": "{{height}}",
  "education": "{{education}}",
  "religion": "{{religion}}",
  "caste": "{{caste}}",
  "gender": "{{gender}}",
  "address": "{{address}}",
  "phone": "{{phone}}",
  "father_name": "{{father_name}}",
  "father_occupation": "{{father_occupation}}",
  "mother_name": "{{mother_name}}",
  "mother_occupation": "{{mother_occupation}}",
  "siblings": "{{siblings}}",
  "payment_status": "Not Paid",
  "profile_status": "Active",
  "match_status": "Unmatched",
  "notes": "{{notes}}"
}
```

### Module 10: HTTP - Create Activity Log

Request:

```text
Method: POST
URL: {{SUPABASE_URL}}/rest/v1/activity_log
```

Headers:

```text
apikey: SUPABASE_SERVICE_ROLE_KEY
Authorization: Bearer SUPABASE_SERVICE_ROLE_KEY
Content-Type: application/json
Prefer: return=minimal
```

Body:

```json
{
  "event_type": "profile_created",
  "client_id": "{{inserted_client_id}}",
  "telegram_message": "{{raw_biodata}}",
  "details": "Profile created from Telegram: {{unique_code}}"
}
```

### Module 11: HTTP - Telegram Success Reply

Request:

```text
Method: POST
URL: https://api.telegram.org/bot{{TELEGRAM_BOT_TOKEN}}/sendMessage
```

Headers:

```text
Content-Type: application/json
```

Body:

```json
{
  "chat_id": "{{telegram_chat_id}}",
  "text": "Profile saved: {{unique_code}}\nName: {{first_name}} {{last_name}}\nGender: {{gender}}\nDOB: {{dob}}\nPayment: Not Paid"
}
```

## Phase 2 - Photo With Caption

Use the same extraction and insert flow as Phase 1, but add photo upload before
or after client insert.

### Pick Telegram Photo File ID

Telegram sends multiple photo sizes. Use the last/largest photo item.

```text
photo_file_id = last(message.photo[]).file_id
```

### HTTP - Telegram Get File Path

```text
GET https://api.telegram.org/bot{{TELEGRAM_BOT_TOKEN}}/getFile?file_id={{photo_file_id}}
```

The response contains:

```text
result.file_path
```

### HTTP - Download Telegram File

```text
GET https://api.telegram.org/file/bot{{TELEGRAM_BOT_TOKEN}}/{{file_path}}
```

Set the HTTP module to download the response as a file/binary.

### HTTP - Upload To Supabase Storage

```text
POST {{SUPABASE_URL}}/storage/v1/object/profile-photos/{{unique_code}}-{{telegram_message_id}}.jpg
```

Headers:

```text
apikey: SUPABASE_SERVICE_ROLE_KEY
Authorization: Bearer SUPABASE_SERVICE_ROLE_KEY
Content-Type: image/jpeg
x-upsert: true
```

Body:

```text
Raw binary file from Telegram download
```

The public URL is:

```text
{{SUPABASE_URL}}/storage/v1/object/public/profile-photos/{{unique_code}}-{{telegram_message_id}}.jpg
```

Include this as `photo_url` in the client insert body.

## Phase 3 - Text First, Photo Later

After creating a text-only client, insert a pending photo row:

```text
POST {{SUPABASE_URL}}/rest/v1/pending_photos
```

Body:

```json
{
  "chat_id": "{{telegram_chat_id}}",
  "client_id": "{{inserted_client_id}}",
  "expires_at": "{{now + 3 minutes}}"
}
```

For a photo-only message:

1. Select latest pending row for the same `chat_id`.
2. If found and `expires_at` is in the future, upload photo.
3. Update `clients.photo_url`.
4. Delete the pending row.
5. Send "photo linked" reply.

Pending select:

```text
GET {{SUPABASE_URL}}/rest/v1/pending_photos?select=*&chat_id=eq.{{telegram_chat_id}}&expires_at=gt.{{now}}&order=created_at.desc&limit=1
```

Client photo update:

```text
PATCH {{SUPABASE_URL}}/rest/v1/clients?id=eq.{{client_id}}
```

Body:

```json
{
  "photo_url": "{{public_photo_url}}"
}
```

Delete pending:

```text
DELETE {{SUPABASE_URL}}/rest/v1/pending_photos?id=eq.{{pending_photo_id}}
```

## Phase 4 - EDIT Command

Message format:

```text
EDIT SVMB-F-101 religion Hindu
```

Parsing target:

```text
code = second word
field = third word
value = everything after third word
```

Allow only safe editable fields:

```text
first_name
last_name
dob
birth_time
place_of_birth
rashi
height
education
religion
caste
gender
address
phone
father_name
father_occupation
mother_name
mother_occupation
siblings
payment_status
profile_status
match_status
notes
```

Do not allow Telegram EDIT to update:

```text
id
unique_code
id_number
created_at
updated_at
photo_url
```

Update request:

```text
PATCH {{SUPABASE_URL}}/rest/v1/clients?unique_code=eq.{{code}}
```

Headers:

```text
apikey: SUPABASE_SERVICE_ROLE_KEY
Authorization: Bearer SUPABASE_SERVICE_ROLE_KEY
Content-Type: application/json
Prefer: return=representation
```

Body:

```json
{
  "{{field}}": "{{value}}"
}
```

Then insert `activity_log` and send a Telegram success reply.

## Phase 5 - PDF Handling

Do this last.

The old blueprint tries to pass a PDF into OpenAI directly. That is not a
reliable Make.com flow.

Safer options:

1. Add a PDF text extraction/OCR module before OpenAI.
2. Ask the admin to copy-paste PDF text into Telegram for MVP.
3. Build PDF support later using a separate parser service.

Recommended MVP behavior:

```text
If document mime type is application/pdf:
  Reply: "PDF received. For now, please copy-paste the biodata text or send photo with caption."
```

## Error Handling

Add an error handler on every HTTP request module.

Telegram error reply:

```json
{
  "chat_id": "{{telegram_chat_id}}",
  "text": "Could not save this profile. Please check the biodata and try again, or add manually from dashboard."
}
```

Also log failures into `activity_log` when possible:

```json
{
  "event_type": "extraction_error",
  "telegram_message": "{{raw_biodata}}",
  "details": "{{error.message}}"
}
```

## Testing Checklist

Test in this order:

1. Send plain text biodata with all required fields.
2. Confirm `clients` row is created.
3. Confirm Telegram success reply is sent.
4. Confirm dashboard shows the new client.
5. Send text with missing gender and confirm it is rejected.
6. Send photo with caption and confirm `photo_url` is saved.
7. Send text first, photo second, and confirm pending photo linking works.
8. Send `EDIT SVMB-F-101 religion Hindu` and confirm the field updates.

## What To Do With The Old Blueprint

Keep `make-com-blueprint.json` only as a logic reference.

Do not use the imported broken scenario in production. Disable it in Make.com
and create a new scenario using this guide.
