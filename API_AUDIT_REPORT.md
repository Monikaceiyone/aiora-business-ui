# API Consumption Audit Report — AIORA Frontend

> Read-only analysis. No code was modified.
> Date: March 25, 2026

---

## A. Executive Summary

| Metric | Count |
|---|---|
| Total unique API endpoints identified | 34 |
| Direct Supabase calls (frontend → DB) | 18 call sites across 8 tables |
| Backend-routed API calls (via `/api/*`) | 16 internal Next.js routes |
| External backend calls (hardcoded IP) | 3 call sites |
| Third-party SDK integrations | 3 (Razorpay, Meta/Facebook, Supabase Auth) |

### Key Architectural Concerns

1. **Hardcoded private IP** `http://192.168.3.125:4000` appears in `src/lib/api-client.ts`, `src/lib/dashboard-fetch.ts`, and `src/app/dashboard/layout.tsx` — this is a local dev server address leaking into production paths.
2. **Unreachable code block** in `dashboard/layout.tsx` — the seller-context auth flow after the magic-session check is commented out with `// }` but the code below it still exists, flagged by the TypeScript compiler.
3. **Massive direct Supabase surface** — 8 tables are queried directly from the browser using the anon key, bypassing any backend authorization layer.
4. **`api-client.ts` is entirely unused** — it defines 20+ methods against the hardcoded IP but no page or component imports it. All actual calls go through `dashboardFetch` or raw `fetch`.
5. **Dev auth bypass** (`NEXT_PUBLIC_SKIP_AUTH=true`) sets seller context from env vars and skips all real auth — if accidentally enabled in production, any user gets full dashboard access.
6. **Duplicate availability management** — `src/app/dashboard/availability/page.tsx` and `src/components/dashboard/availability-manager.tsx` both independently implement the same three API calls to `/api/availability/manage`.


---

## B. API Inventory Table

### B1. Internal Next.js API Routes (`/api/*`)

| File | Approx. Line | Method | Endpoint | Payload / Params | Layer | Used In |
|---|---|---|---|---|---|---|
| `dashboard/layout.tsx` | 42 | GET | `${NEXT_PUBLIC_API_URL}/api/auth/magic-session` | none | Auth | Layout auth check |
| `dashboard/layout.tsx` | 99 | GET | `${NEXT_PUBLIC_API_URL}/api/auth/magic-session` | none | Auth | Duplicate debug call |
| `dashboard/layout.tsx` | 56 | GET | `http://192.168.3.125:4000/api/auth/seller-context` | `Authorization: Bearer <token>` | Auth | **Unreachable** (dead code) |
| `(auth)/login/page.tsx` | 61 | POST | `${NEXT_PUBLIC_API_URL}/api/auth/link-seller` | `{ phoneNumber: "9999999999" }` hardcoded | Auth | Google login handler (dev stub) |
| `(auth)/login/page.tsx` | 93 | POST | `${NEXT_PUBLIC_API_URL}/api/auth/link-seller` | `{ phoneNumber }` + `Authorization: Bearer <token>` | Auth | Phone link form |
| `dashboard/settings/page.tsx` | 115 | DELETE | `/api/auth/magic-session` | none | Auth | Logout handler |
| `dashboard/inquiries/page.tsx` | 28 | GET | `/api/inquiries` | `?status=<filter>` | Inquiries | Inquiries list |
| `dashboard/inquiries/page.tsx` | 47 | PATCH | `/api/inquiries` | `{ id, status }` | Inquiries | Status update |
| `components/website/InquirySection.tsx` | 164 | POST | `/api/inquiries` | `{ name, email, phone, company, field, message, voice_url, image_url }` | Inquiries | Public website form |
| `dashboard/availability/page.tsx` | 45 | GET | `/api/availability/manage` | `?sellerId=<id>` | Availability | Slot list |
| `dashboard/availability/page.tsx` | 83 | POST | `/api/availability/manage` | `{ sellerId, startTime, endTime }` | Availability | Add slot |
| `dashboard/availability/page.tsx` | 105 | DELETE | `/api/availability/manage` | `?id=<slotId>` | Availability | Delete slot |
| `components/dashboard/availability-manager.tsx` | 37 | GET | `/api/availability/manage` | `?sellerId=<id>` | Availability | Duplicate of above |
| `components/dashboard/availability-manager.tsx` | 75 | POST | `/api/availability/manage` | `{ sellerId, startTime, endTime }` | Availability | Duplicate of above |
| `components/dashboard/availability-manager.tsx` | 97 | DELETE | `/api/availability/manage` | `?id=<slotId>` | Availability | Duplicate of above |
| `dashboard/appointments/page.tsx` | 130 | POST | `/api/vapi/book` | `{ appointment_id }` | Appointments | Confirm appointment |
| `dashboard/usage/page.tsx` | 122 | GET | `/api/usage/${sellerId}` | none | Usage/Billing | Usage overview |
| `dashboard/usage/page.tsx` | 161 | POST | `/api/topup/create-order` | `{ seller_id, minutes, subscription_id }` | Billing | Razorpay order creation |
| `dashboard/usage/page.tsx` | 187 | POST | `/api/topup/verify` | `{ razorpay_order_id, razorpay_payment_id, razorpay_signature }` | Billing | Payment verification |
| `dashboard/catalog/page.tsx` | 179 | POST | `/api/catalog/upload-image` | `FormData { file, seller_id, sku }` | Catalog | Image upload |
| `dashboard/catalog/page.tsx` | 232 | POST | `/api/catalog/sync` | `{ seller_id }` | Catalog | Sync to WhatsApp |
| `dashboard/catalog/page.tsx` | 301 | POST | `/api/catalog/delete-all` | `{ seller_id }` | Catalog | Bulk delete |
| `components/catalog/invoice-scanner.tsx` | 75 | POST | `/api/catalog/parse-invoice` | `FormData { invoice }` | Catalog | OCR invoice parsing |
| `hooks/useVerificationStatus.ts` | 86 | GET | `/api/verification/status` | `?seller_id=<id>` | Verification | Status fetch |
| `hooks/useVerificationStatus.ts` | 87 | GET | `/api/catalog/products` | `?seller_id=<id>&limit=1` | Catalog | Catalog check in verification |
| `hooks/useVerificationStatus.ts` | 133 | PATCH | `/api/verification/status` | `{ seller_id, case_id?, opened_security_center?, docs_prepared?, case_submitted? }` | Verification | Save checklist state |
| `hooks/useVerificationStatus.ts` | 157 | POST | `/api/verification/poll` | `{ seller_id }` | Verification | Poll Meta Graph API |
| `dashboard/whatsapp/setup/page.tsx` | 91 | POST | `/api/whatsapp/embedded-signup` | `{ code, accessToken, seller_id, waba_id?, phone_number_id?, selected_business_id?, redirect_uri }` | WhatsApp | Meta embedded signup |
| `dashboard/whatsapp/setup/page.tsx` | 158 | POST | `/api/whatsapp/embedded-signup` | same as above with `waba_id` override | WhatsApp | WABA selection retry |
| `dashboard/whatsapp/setup/page.tsx` | 204 | POST | `/api/whatsapp/manual-config` | `{ seller_id, waba_id }` | WhatsApp | Manual WABA config |
| `dashboard/whatsapp/page.tsx` | 108 | GET | `/api/debug/whatsapp-status` | `?seller_id=<id>` | WhatsApp | Debug troubleshoot |
| `dashboard/admin/usage/page.tsx` | 65 | POST | `/api/admin/auth` | `{ password }` | Admin | Admin password auth |
| `dashboard/admin/usage/page.tsx` | 87 | GET | `/api/admin/usage` | `x-admin-key: <password>` header | Admin | Pool + seller usage |
| `dashboard/admin/usage/page.tsx` | 109 | PATCH | `/api/admin/usage` | `{ total_purchased, price_per_minute_paise }` + `x-admin-key` | Admin | Update pool settings |
| `dashboard/admin/approvals/page.tsx` | 53 | POST | `/api/admin/auth` | `{ password }` | Admin | Admin password auth |
| `(website)/configurations/page.tsx` | 72 | POST | `/api/configurations` | `{ ... config fields }` | Config | Save configurations |


### B2. Direct Supabase Calls (Frontend → Database)

| File | Operation | Table | Filter / Payload | Used In |
|---|---|---|---|---|
| `lib/supabase/queries.ts` | SELECT | `sellers` | `.eq('seller_id', id).single()` | Dashboard home, Orders page |
| `lib/supabase/queries.ts` | SELECT | `orders` | `.eq('seller_id', id).order('created_at')` | Dashboard home, Orders page |
| `lib/supabase/queries.ts` | SELECT | `products` | `.eq('seller_id', id)` | Dashboard home |
| `lib/supabase/queries.ts` | SELECT | `categories` | `.eq('seller_id', id)` | Dashboard home |
| `dashboard/service/page.tsx` | SELECT | `service_orders` | `.eq('seller_id', id).order('created_at')` | Service page |
| `dashboard/settings/page.tsx` | SELECT | `sellers` | `.eq('seller_id', id).single()` | Settings page |
| `dashboard/settings/page.tsx` | UPDATE | `sellers` | `.eq('seller_id', id)` — updates name, phone, email, business_type, city, gst_number | Settings save |
| `dashboard/conversations/page.tsx` | SELECT | `conversations` | `.eq('seller_id', id).order('started_at')` | Conversations page |
| `dashboard/appointments/page.tsx` | SELECT | `appointments` | `.eq('seller_id').gte/lte start_time.neq('CANCELLED')` | Appointments (day view) |
| `dashboard/appointments/page.tsx` | SELECT | `appointments` | `.eq('seller_id').gte/lte 30-day range` | Appointments (upcoming) |
| `dashboard/appointments/page.tsx` | SELECT | `conversations` | `.in('appointment_id', [...ids])` | Appointment recordings |
| `dashboard/catalog/page.tsx` | SELECT | `catalog` | `.eq('seller_id', id).order('created_at')` | Catalog load |
| `dashboard/catalog/page.tsx` | INSERT | `catalog` | Full catalog item object | Catalog save (new) |
| `dashboard/catalog/page.tsx` | UPDATE | `catalog` | `.eq('id', item.id)` — full item | Catalog save (edit) |
| `dashboard/catalog/page.tsx` | DELETE | `catalog` | `.eq('id', item.id)` | Catalog row delete |
| `dashboard/whatsapp/page.tsx` | SELECT | `whatsapp_config` | `.eq('seller_id', id).single()` | WhatsApp status |
| `dashboard/website/page.tsx` | SELECT | `seller_websites` | `.eq('seller_id', id).order('website_number')` | Website builder load |
| `dashboard/website/page.tsx` | INSERT | `seller_websites` | Full website config object | Website save (new) |
| `dashboard/website/page.tsx` | UPDATE | `seller_websites` | `.eq('id', website.id)` — full config | Website save (edit) |
| `dashboard/website/page.tsx` | UPDATE | `seller_websites` | `.eq('id', id)` — `{ approval_status: 'pending_approval', submitted_at }` | Submit for review |
| `dashboard/website/page.tsx` | DELETE | `seller_websites` | `.eq('id', id)` | Delete website |
| `dashboard/admin/approvals/page.tsx` | SELECT | `seller_websites` | `.order('created_at')` — all records | Admin approvals |
| `dashboard/admin/approvals/page.tsx` | UPDATE | `seller_websites` | `.eq('id', id)` — `{ approval_status: 'approved', is_published: true }` | Approve website |
| `dashboard/admin/approvals/page.tsx` | UPDATE | `seller_websites` | `.eq('id', id)` — `{ approval_status: 'rejected', admin_notes }` | Reject website |
| `dashboard/page.tsx` | SELECT | `service_orders` | `.eq('seller_id', id)` — order_status, created_at, technician_cost | Dashboard home stats |
| `components/website/InquirySection.tsx` | STORAGE upload | `inquiries` bucket | `voice/<timestamp>.webm` or `images/<timestamp>.<ext>` | Public inquiry form |
| `components/website/InquirySection.tsx` | STORAGE getPublicUrl | `inquiries` bucket | path from upload | Public inquiry form |

### B3. Supabase Auth Calls

| File | Method | Description |
|---|---|---|
| `(auth)/login/page.tsx` | `supabase.auth.getSession()` | Check existing session on page load |
| `(auth)/login/page.tsx` | `supabase.auth.signOut()` | Sign out current Google account |
| `(auth)/login/page.tsx` | `supabase.auth.getSession()` | Get access token for link-seller call |
| `dashboard/layout.tsx` | `supabase.auth.getSession()` | Auth guard check |
| `dashboard/layout.tsx` | `supabase.auth.signOut()` | Sign out on auth failure (dead code path) |
| `dashboard/settings/page.tsx` | `supabase.auth.signOut()` | Logout handler |
| `auth/callback/route.ts` | `supabase.auth.exchangeCodeForSession(code)` | OAuth callback code exchange |


---

## C. Screen-wise API Flow

### C1. Login Page (`/login`)

**Lifecycle trigger:** `useEffect` on mount

```
1. supabase.auth.getSession()
   → if session exists AND no ?error=not_mapped → router.push('/dashboard')

2. handleGoogleLogin() [onClick]
   → POST ${NEXT_PUBLIC_API_URL}/api/auth/link-seller
     payload: { phoneNumber: "9999999999" }  ← HARDCODED dev stub, real OAuth is commented out
     headers: { Authorization: Bearer "dev-test-token-12345" }

3. handleLinkByPhone() [form submit — only shown when ?error=not_mapped]
   → supabase.auth.getSession() → get access_token
   → POST ${NEXT_PUBLIC_API_URL}/api/auth/link-seller
     payload: { phoneNumber }
     headers: { Authorization: Bearer <access_token> }
   → on success: localStorage.setItem(seller_id, seller_name, phone_number, isLoggedIn)
   → router.push('/dashboard')
```

**State stored:** `localStorage` — `isLoggedIn`, `seller_id`, `seller_name`, `phone_number`

---

### C2. Dashboard Layout Auth Guard (`/dashboard/*`)

**Lifecycle trigger:** `useEffect` on mount

```
1. [DEV MODE] if NEXT_PUBLIC_SKIP_AUTH=true
   → skip all auth, inject DEV_SELLER from env vars into localStorage

2. supabase.auth.getSession() → get access_token

3. GET ${NEXT_PUBLIC_API_URL}/api/auth/magic-session
   → if ok: set localStorage from magic.seller → setIsAuthenticated(true)
   → if not ok: router.push('/login')

4. [DEAD CODE — unreachable due to early return above]
   GET http://192.168.3.125:4000/api/auth/seller-context
   headers: { Authorization: Bearer <access_token> }

5. Duplicate useEffect (debug artifact):
   GET ${NEXT_PUBLIC_API_URL}/api/auth/magic-session  ← fires on every mount, result unused
```

---

### C3. Dashboard Home (`/dashboard`)

**Lifecycle trigger:** `useEffect` → reads `seller_id` from localStorage → `loadStats()`

```
Parallel via getSellerDashboard():
  supabase.from('sellers').select('*').eq('seller_id', id).single()
  supabase.from('orders').select('*').eq('seller_id', id).order('created_at')
  supabase.from('products').select('product_id').eq('seller_id', id)
  supabase.from('categories').select('category_id').eq('seller_id', id)

Sequential after:
  supabase.from('service_orders').select('order_status, created_at, technician_cost').eq('seller_id', id)

Transformation:
  → stats computed in-memory from raw arrays (filter by status_code, date, etc.)
  → stored in useState<DashboardStats>
  → rendered in StatCards
```

---

### C4. Orders Page (`/dashboard/orders`)

**Lifecycle trigger:** `useEffect` → `sellerId` from localStorage → `loadData()`

```
getSellerDashboard(sellerId) [same parallel Supabase calls as Dashboard Home]
  → data.stats, data.recent_orders, data.charts all computed in lib/supabase/queries.ts
  → stored in useState<DashboardData>
  → rendered in StatCards, PieChart, LineChart, BarChart, orders table
```

---

### C5. Catalog Page (`/dashboard/catalog`)

**Lifecycle trigger:** `useEffect` → `loadCatalog(sellerId)`

```
Load:
  supabase.from('catalog').select('*').eq('seller_id', id).order('created_at')

Save (per-item loop):
  supabase.from('catalog').update(catalogData).eq('id', item.id)   [existing]
  supabase.from('catalog').insert(catalogData)                      [new]

Delete row:
  supabase.from('catalog').delete().eq('id', item.id)

Upload image:
  POST /api/catalog/upload-image  FormData { file, seller_id, sku }
  → response.url stored in item.image_link

Sync to WhatsApp:
  [saves unsaved items first via Supabase]
  POST /api/catalog/sync  { seller_id }

Parse invoice (InvoiceScanner component):
  POST /api/catalog/parse-invoice  FormData { invoice }
  → returns array of parsed items → merged into catalog state

Delete all:
  POST /api/catalog/delete-all  { seller_id }
  → then reloads catalog via Supabase
```

---

### C6. Appointments Page (`/dashboard/appointments`)

**Lifecycle trigger:** `useEffect` on `sellerId` + `selectedDate`

```
fetchAppointments():
  supabase.from('appointments').select('*')
    .eq('seller_id').gte/lte(startOfDay, endOfDay).neq('CANCELLED').order('start_time')

fetchUpcomingAppointments():
  supabase.from('appointments').select('*')
    .eq('seller_id').gte(now).lte(+30days).neq('CANCELLED')
  → extract appointment_ids
  supabase.from('conversations').select('*').in('appointment_id', [...ids])
  → build map: appointment_id → Conversation[]

handleConfirm():
  POST /api/vapi/book  { appointment_id }
  → refetch appointments
```

---

### C7. Usage / Billing Page (`/dashboard/usage`)

**Lifecycle trigger:** `useEffect` → `fetchUsage()`

```
fetchUsage():
  GET /api/usage/${sellerId}
  → response: UsageData { has_subscription, base_minutes, topup_minutes, used_minutes,
               remaining_minutes, percentage_used, cycle_start, cycle_end,
               subscription_id, price_per_minute_paise, recent_calls[], topup_history[] }
  → stored in useState<UsageData>

handleTopup():
  POST /api/topup/create-order
    { seller_id, minutes, subscription_id }
  → response: { key_id, amount, currency, razorpay_order_id, minutes }
  → window.Razorpay({ ...options }) opened

  Razorpay handler callback:
    POST /api/topup/verify
      { razorpay_order_id, razorpay_payment_id, razorpay_signature }
    → on success: fetchUsage() to refresh

Razorpay script loaded dynamically:
  <script src="https://checkout.razorpay.com/v1/checkout.js">
```

---

### C8. Verification Page (`/dashboard/verification`)

**Lifecycle trigger:** `useVerificationStatus(sellerId)` hook → `fetchStatus()`

```
Parallel:
  GET /api/verification/status?seller_id=<id>
  GET /api/catalog/products?seller_id=<id>&limit=1

  → VerificationAssistantState stored in hook state
  → VerificationStatus flags derived from assistant data

Auto-poll every 60s:
  POST /api/verification/poll  { seller_id }

saveAssistantState():
  PATCH /api/verification/status  { seller_id, case_id?, opened_security_center?, docs_prepared?, case_submitted? }

EmbeddedSignupButton:
  → Meta Facebook SDK loaded via <script>
  → triggers OAuth popup → returns WhatsAppSignupData { code, accessToken, wabaId, phoneNumberId }
  → POST /api/whatsapp/embedded-signup (see WhatsApp Setup flow)
```

---

### C9. WhatsApp Setup Wizard (`/dashboard/whatsapp/setup`)

```
completeSignup():
  POST /api/whatsapp/embedded-signup
    { code, accessToken, seller_id, waba_id?, phone_number_id?,
      selected_business_id?, strict_selection: true, redirect_uri }
  → success: setCurrentStep(3)
  → business_selection_required: show business picker
  → waba_selection_required: show WABA picker

handleWabaSelection():
  POST /api/whatsapp/embedded-signup  (same, with explicit waba_id)

handleManualSubmit():
  POST /api/whatsapp/manual-config  { seller_id, waba_id }
```

---

### C10. Admin Pages

**Admin Usage (`/dashboard/admin/usage`):**
```
checkAuth():
  POST /api/admin/auth  { password }
  → stores password as adminKey in state

fetchData():
  GET /api/admin/usage  headers: { x-admin-key: <password> }
  → AdminUsageData { pool, sellers[], recent_topups[] }

savePool():
  PATCH /api/admin/usage  { total_purchased, price_per_minute_paise }  headers: { x-admin-key }
```

**Admin Approvals (`/dashboard/admin/approvals`):**
```
checkAuth():
  POST /api/admin/auth  { password }

loadPendingWebsites():
  supabase.from('seller_websites').select('*').order('created_at')
  → filtered client-side by approval_status

approveWebsite():
  supabase.from('seller_websites').update({ approval_status: 'approved', is_published: true }).eq('id')

rejectWebsite():
  supabase.from('seller_websites').update({ approval_status: 'rejected', admin_notes }).eq('id')
```


---

## D. Direct Supabase Access Report

### D1. Tables Accessed Directly from Frontend

| Table | Operations | Files | Risk |
|---|---|---|---|
| `sellers` | SELECT, UPDATE | `queries.ts`, `settings/page.tsx` | HIGH — PII exposed, no row-level auth enforced at app layer |
| `orders` | SELECT | `queries.ts` | HIGH — full order data including payment fields fetched client-side |
| `products` | SELECT | `queries.ts` | LOW — read-only, non-sensitive |
| `categories` | SELECT | `queries.ts` | LOW — read-only, non-sensitive |
| `catalog` | SELECT, INSERT, UPDATE, DELETE | `catalog/page.tsx` | MEDIUM — full CRUD from browser |
| `service_orders` | SELECT | `service/page.tsx`, `dashboard/page.tsx` | MEDIUM — business data |
| `conversations` | SELECT | `conversations/page.tsx`, `appointments/page.tsx` | MEDIUM — call recordings, phone numbers |
| `appointments` | SELECT | `appointments/page.tsx` | MEDIUM — customer PII (name, phone) |
| `whatsapp_config` | SELECT | `whatsapp/page.tsx` | HIGH — phone_number_id, catalog_id |
| `seller_websites` | SELECT, INSERT, UPDATE, DELETE | `website/page.tsx`, `admin/approvals/page.tsx` | MEDIUM — full CRUD |
| `inquiries` storage | UPLOAD, GET_PUBLIC_URL | `InquirySection.tsx` | MEDIUM — public bucket, voice/image uploads |

### D2. Supabase Client Configuration

```
File: src/lib/supabase/client.ts
Key: NEXT_PUBLIC_SUPABASE_ANON_KEY (browser-exposed)
URL: NEXT_PUBLIC_SUPABASE_URL (browser-exposed)
```

The anon key is used for ALL direct database operations. Row Level Security (RLS) policies in Supabase are the only protection — these were not audited as part of this frontend analysis but are critical.

### D3. Risk Classification

| Risk | Description |
|---|---|
| HIGH | `sellers` table UPDATE from browser — a malicious actor with a valid seller session could update any seller's data if RLS is misconfigured |
| HIGH | `whatsapp_config` SELECT — exposes phone_number_id and catalog_id to browser |
| HIGH | `orders` SELECT — full order records including payment_id, razorpay_link_id fetched to browser |
| MEDIUM | `catalog` full CRUD — no server-side validation of catalog data before DB write |
| MEDIUM | `seller_websites` full CRUD — approval workflow partially enforced client-side only |
| MEDIUM | Admin approval actions (`approveWebsite`, `rejectWebsite`) go directly to Supabase — no backend authorization layer |

---

## E. Data Flow Diagrams (Text-based)

### E1. Authentication Flow

```
Login Page
  └─ supabase.auth.getSession()
       └─ [no session] → show login button
  └─ handleGoogleLogin() [STUB — real OAuth commented out]
       └─ POST /api/auth/link-seller
            └─ response.seller → localStorage (seller_id, seller_name, phone_number)
                 └─ router.push('/dashboard')

Dashboard Layout (every page load)
  └─ GET /api/auth/magic-session
       └─ [ok] → localStorage ← magic.seller → render dashboard
       └─ [fail] → router.push('/login')
```

### E2. Dashboard Stats Flow

```
localStorage.seller_id
  └─ getSellerDashboard(sellerId)  [lib/supabase/queries.ts]
       └─ Promise.all([
            supabase.from('sellers').select(),
            supabase.from('orders').select(),
            supabase.from('products').select(),
            supabase.from('categories').select()
          ])
       └─ in-memory computation:
            stats = { total_orders, total_revenue, payment_pending, in_transit, ... }
            charts = { status_distribution[], orders_by_date[], top_products[] }
       └─ useState<DashboardData>
            └─ StatCards, PieChart, LineChart, BarChart, Orders Table
```

### E3. Catalog Sync Flow

```
localStorage.seller_id
  └─ supabase.from('catalog').select()  → useState<CatalogItem[]>
       └─ UI: spreadsheet-style table

  [User edits] → item.isEdited = true → useState update

  [Save All]
    └─ for each isNew/isEdited item:
         supabase.from('catalog').insert/update()
    └─ reload from Supabase

  [Sync to WhatsApp]
    └─ save unsaved items (same loop)
    └─ POST /api/catalog/sync { seller_id }
         └─ backend pushes to Meta Commerce API
         └─ response: { created, updated, errors[] }

  [Upload Image]
    └─ POST /api/catalog/upload-image  FormData
         └─ response.url → item.image_link → useState
```

### E4. Payment (Top-up) Flow

```
GET /api/usage/${sellerId}
  └─ UsageData.subscription_id, price_per_minute_paise
       └─ UI: usage meter, top-up form

[User selects minutes] → effectiveMinutes, priceRupees computed in-memory

[Pay with Razorpay]
  └─ POST /api/topup/create-order { seller_id, minutes, subscription_id }
       └─ { key_id, amount, currency, razorpay_order_id }
            └─ window.Razorpay(options).open()
                 └─ [User pays in Razorpay popup]
                      └─ handler({ razorpay_order_id, razorpay_payment_id, razorpay_signature })
                           └─ POST /api/topup/verify { ...razorpay fields }
                                └─ { success, minutes_added }
                                     └─ GET /api/usage/${sellerId}  [refresh]
```

### E5. Verification Flow

```
useVerificationStatus(sellerId)
  └─ Promise.all([
       GET /api/verification/status?seller_id=
       GET /api/catalog/products?seller_id=&limit=1
     ])
  └─ VerificationAssistantState → derive VerificationStatus flags
  └─ setInterval(60s) → POST /api/verification/poll { seller_id }

[Step 2: Connect WhatsApp]
  └─ EmbeddedSignupButton → Meta SDK popup
       └─ WhatsAppSignupData { code, accessToken, wabaId, phoneNumberId }
            └─ POST /api/whatsapp/embedded-signup
                 └─ [success] → step 3
                 └─ [business_selection_required] → show picker → retry
                 └─ [waba_selection_required] → show picker → retry

[Step 4: Save Case ID]
  └─ PATCH /api/verification/status { seller_id, case_id, case_submitted: true }

[Refresh Status]
  └─ POST /api/verification/poll { seller_id }
       └─ polls Meta Graph API server-side
       └─ updates assistant state
       └─ re-fetches GET /api/verification/status
```

---

## F. Critical Issues

### F1. Broken / Incomplete Flows

| Issue | File | Details |
|---|---|---|
| Google OAuth is commented out | `login/page.tsx` lines 54–58 | `supabase.auth.signInWithOAuth` is commented out. `handleGoogleLogin` sends a hardcoded dev token and phone number. Real Google login is non-functional. |
| Dead code in auth guard | `dashboard/layout.tsx` lines 56–80 | The seller-context fetch at `http://192.168.3.125:4000` is unreachable — the function always returns early at line 50 due to the magic-session check. |
| Duplicate magic-session fetch | `dashboard/layout.tsx` lines 98–103 | A second `useEffect` fires on every mount, fetches `/api/auth/magic-session`, logs the response, and discards it. |
| `api-client.ts` never imported | `src/lib/api-client.ts` | Defines 20+ methods but zero imports exist in the codebase. Entirely dead code. |

### F2. Missing Backend APIs

| Frontend Expects | Status |
|---|---|
| `GET /api/configurations` | No route file found in `src/app/api/` — only POST exists in `configurations/page.tsx` |
| `GET /api/catalog/products` | Called in `useVerificationStatus` but no route file found in `src/app/api/catalog/` |
| `GET /api/debug/whatsapp-status` | Debug endpoint — no route file found |
| `GET /api/admin/usage` | No route file found in `src/app/api/admin/` |
| `POST /api/admin/auth` | No route file found |
| `POST /api/vapi/book` | No route file found |
| `GET /api/availability/manage` | No route file found |
| `GET /api/usage/${sellerId}` | No route file found |
| `POST /api/topup/create-order` | No route file found |
| `POST /api/topup/verify` | No route file found |
| `POST /api/catalog/sync` | No route file found |
| `POST /api/catalog/upload-image` | No route file found |
| `POST /api/catalog/parse-invoice` | No route file found |
| `POST /api/catalog/delete-all` | No route file found |
| `GET/PATCH/POST /api/verification/status` | No route file found |
| `POST /api/verification/poll` | No route file found |
| `POST /api/whatsapp/embedded-signup` | No route file found |
| `POST /api/whatsapp/manual-config` | No route file found |

> Note: These routes may exist in an external backend server (the `http://192.168.3.125:4000` instance) and be proxied via `dashboardFetch`. The `NEXT_PUBLIC_APP_URL` env var controls where `dashboardFetch` resolves on the server side.

### F3. Security Concerns

| Severity | Issue |
|---|---|
| CRITICAL | Admin authentication uses a plain password sent in POST body and stored in component state. No session token, no expiry, no CSRF protection. |
| CRITICAL | Admin approval/rejection of websites calls Supabase directly from the browser — no server-side authorization. Any authenticated seller could call these if they know the table name. |
| HIGH | `NEXT_PUBLIC_SKIP_AUTH=true` bypasses all authentication. If set in a production build, any visitor gets full dashboard access as the dev seller. |
| HIGH | `seller_id` is read from `localStorage` and passed directly to Supabase queries. If a user modifies localStorage, they can query another seller's data (depends entirely on Supabase RLS). |
| HIGH | `orders` table is fetched in full to the browser — includes `payment_id`, `razorpay_link_id`, `payment_captured_at`. |
| MEDIUM | `whatsapp_config` fetched directly — exposes `phone_number_id` and `catalog_id` to browser. |
| MEDIUM | Razorpay `key_id` is returned from `/api/topup/create-order` and used client-side — this is the publishable key, which is acceptable, but should be confirmed it's not the secret key. |
| LOW | `http://192.168.3.125:4000` hardcoded in `api-client.ts` and `dashboard/layout.tsx` — private LAN IP in source code. |

---

## G. Observations

### G1. Patterns

- **`localStorage` as session store** — `seller_id`, `seller_name`, `phone_number`, `isLoggedIn` are stored in localStorage and read on every page load. No server-side session validation per request.
- **`dashboardFetch` wrapper** — used consistently for all internal `/api/*` calls. Handles server-side absolute URL resolution. Good pattern, but the fallback URL `http://192.168.3.125:4000` is a dev LAN address.
- **`getSellerDashboard()` shared query** — `lib/supabase/queries.ts` is reused across `dashboard/page.tsx` and `orders/page.tsx`, which is good. However it fetches ALL orders to the client and computes stats in-memory — this will not scale.
- **Toast notifications** — consistent use of `useToast()` for error/success feedback across all pages.
- **Loading states** — all async operations use `useState<boolean>` loading flags with `Loader2` spinners.

### G2. Duplication

- `availability/page.tsx` and `components/dashboard/availability-manager.tsx` implement identical API calls to `/api/availability/manage` (GET, POST, DELETE). The page uses the component in one tab but also has its own independent implementation.
- `dashboard/page.tsx` and `orders/page.tsx` both call `getSellerDashboard()` — the home page also separately fetches `service_orders` which the orders page does not need.

### G3. Third-Party Integrations

| Integration | How Used | Files |
|---|---|---|
| Razorpay | `window.Razorpay` loaded via dynamic `<script>` tag. Order created server-side, payment opened client-side, verification done server-side. | `usage/page.tsx` |
| Meta / Facebook SDK | `EmbeddedSignupButton` component triggers Meta's OAuth popup. Returns auth code + access token. | `whatsapp/setup/page.tsx`, `verification/page.tsx` |
| Supabase | Auth (OAuth + session), PostgreSQL (direct queries), Storage (file uploads) | Throughout |

---

## H. Priority Risk List

### HIGH Priority

| # | Risk | File(s) | Recommendation |
|---|---|---|---|
| H1 | Google OAuth is non-functional — login uses hardcoded dev credentials | `login/page.tsx` | Restore `supabase.auth.signInWithOAuth` flow |
| H2 | Admin auth is password-in-state with no session — direct Supabase writes | `admin/approvals/page.tsx`, `admin/usage/page.tsx` | Move admin operations behind a proper server-side auth middleware |
| H3 | `NEXT_PUBLIC_SKIP_AUTH=true` bypasses all auth | `dashboard/layout.tsx`, `lib/dev-auth.ts` | Ensure this env var is never set in production deployments |
| H4 | Full `orders` table (including payment fields) fetched to browser | `lib/supabase/queries.ts` | Move to a backend API that returns only needed fields; verify Supabase RLS |
| H5 | `seller_id` from localStorage used as DB filter — no server validation | All dashboard pages | Validate seller identity server-side on each request |

### MEDIUM Priority

| # | Risk | File(s) | Recommendation |
|---|---|---|---|
| M1 | Hardcoded LAN IP `192.168.3.125:4000` in source | `api-client.ts`, `dashboard-fetch.ts`, `layout.tsx` | Replace with `NEXT_PUBLIC_API_URL` env var consistently |
| M2 | `api-client.ts` is dead code | `src/lib/api-client.ts` | Remove or integrate — currently creates confusion about which client to use |
| M3 | Duplicate availability API calls | `availability/page.tsx`, `availability-manager.tsx` | Consolidate into the component only |
| M4 | `getSellerDashboard()` fetches all orders to browser for in-memory stats | `lib/supabase/queries.ts` | Move aggregation to a backend API or Supabase RPC function |
| M5 | Unreachable auth code in layout | `dashboard/layout.tsx` lines 56–80 | Remove dead code block |
| M6 | Duplicate magic-session fetch on every mount | `dashboard/layout.tsx` lines 98–103 | Remove the second `useEffect` |

### LOW Priority

| # | Risk | File(s) | Recommendation |
|---|---|---|---|
| L1 | `whatsapp_config` phone_number_id exposed to browser | `whatsapp/page.tsx` | Mask sensitive IDs in the UI |
| L2 | `catalog` full CRUD from browser with no server validation | `catalog/page.tsx` | Add server-side validation in the catalog API routes |
| L3 | `seller_websites` approval status enforced client-side only | `website/page.tsx` | Enforce status transitions server-side |
| L4 | No error boundary or retry logic on Supabase failures | All pages | Add error boundaries and retry mechanisms |

---

*End of Report*
