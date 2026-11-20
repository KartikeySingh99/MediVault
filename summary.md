
# MediVault — Project Context & Development Summary

**Last updated:** 20 November 2026 (session 2: scaffold, dashboard, health profile, family profiles)  
**Project type:** AI-powered personal medical document management platform  
**Timeline:** 15 days  
**Target:** SDE-2 frontend interview portfolio project

---

# 1. Project Overview

## Project Name
MediVault

## Product Positioning
Emergency-first personal health information management.

MediVault helps individuals organize, manage, search, and securely access their personal medical information, especially during medical emergencies.

## Problem Statement

During a medical emergency, people and caregivers often struggle to find important health information quickly.

Examples include:
- Previous medical reports
- Prescriptions
- Blood test results
- Current medications and supplements
- Known allergies
- Existing medical conditions
- Doctor and hospital information
- Emergency contact details

MediVault aims to solve this problem by providing a centralized platform where users can securely store, organize, verify, and retrieve their health information.

## Product Philosophy

MediVault is a personal health-record management platform, not a medical diagnosis or treatment recommendation application.

The platform should:
- Help users organize their medical information.
- Make important documents easy to retrieve.
- Use AI to extract and organize information.
- Allow users to verify AI-extracted information.
- Make essential health information accessible during emergencies.
- Give users control over what information they share.

---

# 2. Project Goals

The primary objective is to build a production-style application suitable for SDE-2 frontend interviews.

The project should demonstrate:

- Next.js App Router architecture.
- React component architecture.
- Reusable UI components.
- Responsive design.
- State management.
- API integration.
- Authentication and authorization.
- Database design.
- File upload and storage.
- AI API integration.
- Asynchronous processing.
- Form validation.
- Error handling.
- Performance optimization.
- Security and privacy considerations.
- Deployment and documentation.

The target development timeline is 15 days.

**Important:** Prioritize a complete, working MVP over adding too many features.

---

# 3. Core MVP Modules

The MVP consists of three primary modules.

## Module 1: Personal Health Profile

Users can maintain their personal health information.

### Personal Information
- Full name
- Date of birth
- Age
- Optional gender
- Optional blood group

### Medical Information
- Known allergies
- Existing medical conditions
- Current medications
- Current supplements
- Important medical history

### Requirements
- Create and update personal health information.
- Validate form inputs.
- Display profile completion percentage.
- Allow users to edit their information.
- Keep user-provided information separate from AI-extracted information.

### Family Profiles (scope change, 20 Nov 2026)

One account can manage health profiles for family members (spouse, parent, sibling, child, other), so family members do not need their own login.

- **Account ≠ profile.** `auth.users` is *who logs in*; `profiles` is *whose health data it is*. Every health table references `profile_id`, not `user_id`.
- A "self" profile is created automatically for the account owner.
- Each profile has its own health profile, documents, emergency contacts and emergency card.
- A **profile switcher** in the header selects the active profile; a banner warns when viewing someone else's records.
- Adding a member requires a **consent checkbox** ("I have their permission, or I am their parent or legal guardian").
- Planned AI safety check: warn when the patient name extracted from a document does not match the active profile.

**Deferred (post-MVP): linking separate accounts.** If a family member has their own account, linking will use an `access_grants` table (`profile_id`, `grantee_user_id`, role `viewer`/`editor`, status `pending`/`accepted`/`revoked`), invitation by email, mandatory consent from the account holder, and ownership transfer of a managed profile. RLS extends from "owner" to "owner OR accepted grant". No rebuild needed.

---

## Module 2: AI Medical Document Vault

This is one of the most important modules.

Users can upload and manage their medical documents.

### Supported Documents

Initially support:

- Medical reports
- Blood test reports
- Prescriptions
- Discharge summaries
- Supplement-related documents
- Other medical documents

### Supported File Formats

- PDF
- JPG
- PNG

### Document Management

Users should be able to:

- Upload documents.
- Preview documents.
- Download documents.
- Delete documents.
- Update document information.
- Categorize documents.
- Search documents.
- Filter by category and date.
- View document upload and processing status.

### AI Document Extraction

After uploading a document, AI should extract useful metadata.

Examples:

| Field | Example |
|---|---|
| Patient Name | Rahul Sharma |
| Document Type | Blood Test Report |
| Report Date | 12 November 2026 |
| Doctor | Dr. Sharma |
| Hospital | City Hospital |
| Test Name | Thyroid Profile |
| TSH | 3.2 mIU/L |
| Medicine | Example medicine name |
| Dosage | As written in prescription |

These are illustrative values, not medical recommendations.

### AI Processing Workflow

The intended workflow:

1. User uploads a medical document.
2. File is stored securely.
3. Backend creates a document record.
4. AI processing begins.
5. Document content is analyzed.
6. Relevant metadata is extracted.
7. Extracted data is stored as unverified.
8. User reviews extracted information.
9. User edits incorrect information if required.
10. User confirms the extracted information.
11. Document becomes searchable.

### Document Processing Statuses

Each document should support these states:

- Uploading
- Processing
- Review Required
- Completed
- Failed

Include useful loading indicators, error messages, and retry functionality.

### AI-Powered Search

Users should be able to search using natural language.

Examples:

- Show my latest blood report.
- Find my prescription from Dr. Sharma.
- When was my last thyroid test?
- Show all medical reports from 2025.
- Find my latest uploaded prescription.

For the MVP, natural-language queries can be converted into structured metadata searches.

A vector database or advanced RAG implementation is not mandatory.

### Important AI Rules

- AI-extracted information must remain unverified until the user confirms it.
- Never assume a medicine in an old prescription is currently being taken.
- Never generate a diagnosis.
- Never recommend medication or treatment.
- Clearly identify the source document for extracted information.

---

## Module 2b: ID & Insurance + Hospital Kit (scope change, 20 Nov 2026)

Hospitals ask for non-medical documents at admission (photo ID, insurance card or policy, TPA details). Users keep these in one place and share them quickly when needed.

### Separate Section
A sidebar item **"ID & Insurance"**, separate from Medical Documents, because these documents follow different rules:

| | Medical documents | ID & insurance documents |
|---|---|---|
| Examples | Reports, prescriptions | Aadhaar, PAN, voter ID, passport, driving licence, insurance card/policy |
| AI extraction | Yes, with user review | **Insurance only.** Identity documents are never sent to AI |
| Natural-language search | Yes | Filter by type only |

It reuses the document upload pipeline (private storage, file-type checks, statuses), with a `kind` column on documents: `medical` | `identity` | `insurance`.

### Insurance Details
Stored with the file (AI can prefill these from a policy PDF, using the same review-and-confirm flow):
- Insurer, policy number, member/card ID, policy holder
- **TPA name and TPA helpline** (one-tap call)
- Sum insured, cover type (individual / family floater), valid until
- **A family floater policy can be linked to several family profiles** (a policy-to-members link table), so it is uploaded once.
- Optional insurance line on the emergency card: insurer + TPA helpline.
- An "Expires in N days" badge (no reminders; reminders are out of scope).

### Hospital Kit
A "Prepare Hospital Kit" action (for the active family profile) where the user picks items: emergency card, masked Aadhaar, insurance card/policy, recent reports. Two ways to share:
- **Secure link / QR (recommended):** expires (1 h / 24 h / 7 days), view-only, revocable, every opening logged. Built on emergency sharing.
- **Send files directly** through the phone's share sheet (Web Share API, e.g. WhatsApp). Shows a warning that files sent this way can't be revoked. Cut this first if time runs short.

### Security Rules for Identity Documents
- Prompt users to upload a **masked Aadhaar** (provided by UIDAI, shows only the last 4 digits). Store only the last 4 digits as data, never the full Aadhaar number.
- Identity documents are never sent to the AI provider.
- Short-lived signed URLs; blurred previews until the user taps to view.
- Never included in any share automatically; only added to a kit when the user ticks them.
- Collect the minimum, with consent, in line with India's DPDP Act principles (not legal advice).

### Deferred
- DigiLocker integration (fetch verified Aadhaar/PAN; needs partner onboarding)
- Watermarking shared copies ("Shared with City Hospital, 20 Nov 2026")
- Insurance renewal reminders

---

## Module 3: Emergency Center

The Emergency Center provides quick access to important health information.

### Emergency Health Card

The card should contain:

- Full name
- Optional blood group
- Known allergies
- Existing medical conditions
- Current medications
- Important medical history
- Emergency contacts

All information displayed should be user-provided or explicitly verified.

### Emergency Contacts

Users can save multiple emergency contacts.

Each contact should contain:

- Contact name
- Relationship
- Primary phone number
- Optional alternate phone number
- Priority (Primary / Secondary)

### Contact Management

Users should be able to:

- Add contacts.
- Edit contacts.
- Delete contacts.
- Select a primary contact.
- Call contacts directly using a one-tap call action.

### Emergency Sharing

An optional emergency sharing feature can provide:

- Read-only emergency health card.
- Shareable link.
- QR code.
- User-controlled information selection.
- Temporary access.
- Expiration date.
- Ability to revoke access.
- Access logging.

### Security Requirements

- Sharing must be explicitly enabled by the user.
- Only selected information should be shared.
- Links should expire.
- Users should be able to revoke access.
- Medical documents should not automatically be shared.
- Emergency contacts should not automatically receive access to the document vault.
- Avoid predictable public storage URLs.

---

# 4. Features Outside MVP Scope

To protect the 15-day deadline, the following features are deferred:

- Symptom tracking
- Lifestyle tracking
- Medicine reminders
- Appointment management
- Hospital discovery
- Doctor discovery
- Online pharmacy
- Linking separate family member accounts (managed family profiles ARE in scope; see Module 1)
- Advanced analytics
- Disease prediction
- AI diagnosis
- Treatment recommendations

These features can be considered in future versions.

---

# 5. Product Differentiation

A public reference website was reviewed:

https://www.medivault.app/

Its public-facing positioning includes health record organization, symptom tracking, personal insights, and privacy-related messaging.

Public marketing pages do not establish which features exist inside an authenticated application. Therefore, avoid claiming that a feature is missing without verifying it.

## MediVault's Intended Differentiation

1. Emergency-first access to personal health information.
2. AI-powered document extraction with user verification.
3. Fast retrieval of important medical records.
4. Emergency contacts and an emergency health card.
5. Secure and selective sharing.
6. Clear separation between verified user information and AI-extracted information.

---

# 6. Current Technology Stack

The repository at `D:\MediVault\MediVault` originally contained only `README.md`. The Next.js app was scaffolded into it with `create-next-app` on 20 Nov 2026 (JavaScript, App Router, `src/`, Tailwind, ESLint, `@/*` alias).

## Installed Dependencies (verified)

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16.4.6 | Framework |
| React / React DOM | 19.3.0 | UI |
| Tailwind CSS + @tailwindcss/turbopack | 4.3.3 | Styling |
| ESLint + eslint-config-next | 9 / 16.4.6 | Linting |
| lucide-react | latest | Icons |
| react-hook-form | 7.92.0 | Forms |
| zod | 4.6.7 | Validation |
| @hookform/resolvers | 7.0.7 | Zod ↔ React Hook Form |

## Current Configuration

- Next.js 16 App Router, `src/` directory, JavaScript, `@/*` import alias
- Tailwind CSS v4 with design tokens defined in `src/app/globals.css` via `@theme` (no tailwind.config file)
- Inter font via `next/font/google`
- `AGENTS.md` (generated by Next.js): read the bundled docs in `node_modules/next/dist/docs/` before using unfamiliar Next.js APIs

## Important Development Decisions

- Do not recreate the Next.js project.
- Do not install Next.js again.
- Continue using JavaScript initially.
- Use Tailwind CSS v4-compatible configuration and syntax.
- Inspect existing files before modifying them.
- Avoid unnecessary dependencies.

## Start Development Server

Run:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# 7. Proposed Technology Stack

The following technologies are planned, but not all have been installed.

| Area | Technology |
|---|---|
| Framework | Next.js 16 |
| Frontend | React 19 |
| Language | JavaScript initially |
| Styling | Tailwind CSS 4 |
| UI Components | shadcn/ui |
| Icons | lucide-react |
| Authentication | Supabase Auth |
| Database | Supabase PostgreSQL |
| File Storage | Supabase Storage |
| AI Integration | Google Gemini Flash (free tier via AI Studio) |
| Server State | TanStack Query (add together with Supabase) |
| Form Management | React Hook Form (installed) |
| Validation | Zod (installed) |
| Charts | Recharts, if required |
| Deployment | Vercel |
| Testing | Vitest / Playwright |

Install dependencies only when required by the implementation.

## Decision: State Management

No Redux Toolkit or Zustand. State is split by type:

| State | Tool |
|---|---|
| Server data (profiles, documents, extractions, contacts) | TanStack Query: polling processing status (`refetchInterval`), cache invalidation, optimistic deletes, built-in loading/error/retry |
| Form state | React Hook Form + Zod |
| Filters and search | URL search params |
| UI state (sidebar, dialogs) | `useState` |
| Active family profile id | React context (`ActiveProfileProvider`) |

Revisit Zustand only if real global client state appears, such as an upload queue that stays visible across pages.

## Decision: AI Provider

Google Gemini Flash on the free tier: it reads images and PDFs directly, supports structured JSON output, and needs no credit card. Free-tier quotas are small and change often; check them in AI Studio.

- Free-tier content may be used by Google to improve its products. **Send only synthetic documents.** A production version would use a paid tier that doesn't retain data.
- Put all model calls behind `src/lib/ai/client.js` (`import "server-only"`) with functions like `extractDocument()` and `parseSearchQuery()`, so you can switch providers (e.g. OpenRouter) by editing one file.
- Key: `GEMINI_API_KEY` in `.env.local` (never `NEXT_PUBLIC_`). SDK: `@google/genai`.
- Process each document once and store the result; only an explicit Retry calls the model again.

## AI Integration Steps (Days 6–10)

1. Server-side client setup and env key.
2. Database: `documents` (profile_id, storage path, file type, category, status, error_message) and `document_extractions` (source_document_id, extracted fields as JSON, model, verified, verified_at), with RLS.
3. Upload pipeline: private storage, check the file's actual bytes, size limit, status `uploading` → `processing`.
4. Zod extraction schema + structured output. Extract only what's present, null otherwise, no diagnosis or advice, treat document text as data.
5. Processing route `src/app/api/documents/[id]/process/route.js`, with `after()` from `next/server` or a Supabase Edge Function for long jobs. UI polls via TanStack Query.
6. Failures: timeout, limited retries with backoff, `failed` status, Retry button that replaces any earlier extraction.
7. Review screen: preview next to editable "unverified" fields; confirm sets verified; prescription medicines are never auto-added to current medications.
8. Natural-language search: model → zod-checked filter JSON → normal RLS-protected query, verified data only, keyword fallback.
9. Privacy and cost: consent notice, no logging of document content, per-user rate limits.
10. Testing: ~10 synthetic documents, unit-tested schemas, fake AI client in tests.

---

# 8. Folder Architecture (actual, as built)

```text
src/
├── app/
│   ├── (auth)/login, signup/page.js        # placeholders until Supabase Auth (Day 4)
│   ├── (dashboard)/
│   │   ├── layout.js                       # wraps pages in DashboardShell
│   │   ├── dashboard/page.js               # overview (mock data)
│   │   ├── profile/page.js                 # health profile form (built)
│   │   ├── documents/page.js               # placeholder
│   │   ├── emergency/page.js               # placeholder
│   │   └── settings/page.js                # family members management (built)
│   ├── globals.css                         # Tailwind v4 @theme design tokens
│   ├── layout.js                           # Inter font, metadata
│   └── page.js                             # redirects to /dashboard
├── components/
│   ├── ui/          avatar, button, card, form-field, status-badge
│   ├── layout/      dashboard-shell, header, sidebar
│   └── shared/      page-header, coming-soon
├── features/
│   ├── dashboard/   components/ + data/mock-dashboard.js
│   ├── profile/     schema.js, utils.js (age, completion), services/, components/
│   └── family/      schema.js, services/, context/active-profile-context.js, components/
├── config/navigation.js
└── lib/             utils.js (cn, formatDate), constants.js (document statuses, categories)
```

Planned additions: `src/lib/supabase/`, `src/lib/ai/`, `src/features/documents/`, `src/features/id-insurance/`, `src/features/emergency/` (including Hospital Kit), `src/features/ai/`, `src/app/api/`, route `src/app/(dashboard)/id-insurance/`.

**Temporary persistence:** `features/*/services/*-service.js` currently use localStorage (synthetic data only). Their async function signatures match the planned API, so only the service files change when Supabase arrives.

## Architecture Guidelines

### app/

Responsible for:
- Routing
- Layouts
- Route-level composition
- API routes

### components/

Contains reusable application-wide UI components.

### features/

Contains feature-specific components and business logic.

Examples:
- Document upload components
- Profile forms
- Emergency contact cards
- AI extraction review components

### lib/

Contains:
- Supabase clients
- API utilities
- Shared helper functions
- Constants

Avoid unnecessary abstractions. The goal is maintainable code, not maximum folder complexity.

---

# 9. UI/UX Design Direction

## Overall Design

Premium healthcare SaaS aesthetic.

The interface should feel:

- Modern
- Calm
- Clean
- Trustworthy
- Professional
- Easy to navigate

Avoid making the application look like a traditional hospital website.

## Design Tokens

| Element | Value |
|---|---|
| Primary | #0F766E |
| Background | #F8FAFC |
| Main Text | #0F172A |
| Card Background | #FFFFFF |
| Border | #E2E8F0 |
| Border Radius | 12px–16px |
| Font | Inter |

## Sidebar Navigation

1. Overview
2. My Health Profile
3. Medical Documents
4. ID & Insurance
5. Emergency Center
6. Settings

## Dashboard Layout

The dashboard should contain:

### Welcome Section
- Welcome message
- Short description
- Profile completion indicator

### Statistics Cards
- Total Medical Documents
- Current Medications
- Profile Completion
- Recent Uploads

### Recent Documents
Show:
- Document name
- Document category
- Upload date
- Processing status
- Quick action

### Quick Actions
- Upload Medical Document
- Update Health Profile
- View Emergency Card

### Emergency Shortcut
A prominent shortcut to the Emergency Center.

## Responsive Requirements

Desktop:
- Sidebar navigation
- Main dashboard content
- Responsive card grid

Tablet:
- Collapsible sidebar
- Adjusted card grid

Mobile:
- Compact navigation
- Single-column cards
- Accessible touch targets
- Easy emergency access

Use synthetic mock medical data during initial UI development.

---

# 10. Day 1 Development Plan (completed 20 Nov 2026)

The first day focuses on building the frontend dashboard.

## Step 1: Inspect Existing Project

Inspect:

```text
package.json
src/app/globals.css
src/app/layout.js
src/app/page.js
```

PowerShell command:

```powershell
Get-Content package.json
Get-Content src/app/globals.css
Get-Content src/app/layout.js
Get-Content src/app/page.js
```

## Step 2: Confirm Configuration

Verify:
- Next.js App Router
- Tailwind CSS v4
- Existing global styles
- Existing layout
- Existing page implementation

## Step 3: Finalize Folder Architecture

Create only the directories required for the first implementation.

## Step 4: Build Dashboard Shell

Implement:
- Sidebar
- Header
- Main content area
- Responsive layout

## Step 5: Build Dashboard Components

Implement:
- Welcome section
- Statistics cards
- Recent documents
- Quick actions
- Emergency shortcut

## Step 6: Use Mock Data

Keep mock data separate from UI components so it can later be replaced by API responses.

## Step 7: Responsive Testing

Verify:
- Desktop
- Tablet
- Mobile

## Step 8: Build Verification

Run:

```bash
npm run build
```

Fix errors before moving to backend development.

## Day 1 Acceptance Criteria

- Existing project runs successfully.
- Dashboard is responsive.
- Navigation works.
- Components are reusable where appropriate.
- Mock data is separated from components.
- No unnecessary dependencies are introduced.
- Existing configuration is not overwritten blindly.

---

# 11. 15-Day Development Roadmap

| Day | Focus | Expected Outcome |
|---|---|---|
| 1 | Project setup and dashboard | ✅ Done |
| 2 | Shared UI components | Consistent reusable design system |
| 3 | Supabase setup | Database (`profiles` + `profile_id` FKs, RLS) and environment configuration |
| 4 | Authentication | Login, signup, protected routes |
| 5 | Health profile + family profiles | UI ✅ done early (localStorage); connect to Supabase |
| 6 | Document upload | Secure upload and storage (medical, identity and insurance kinds) |
| 7 | Document management | Preview, download, filters, delete; ID & Insurance page with insurance details |
| 8 | AI extraction | Classification and metadata extraction |
| 9 | AI verification | Review and confirmation workflow |
| 10 | AI search | Natural-language metadata retrieval |
| 11 | Emergency center | Emergency profile and contacts CRUD |
| 12 | Emergency card + Hospital Kit | Read-only emergency information, secure sharing links/QR, Hospital Kit |
| 13 | Quality and security | Loading, errors, retries, responsive and security review |
| 14 | Testing and deployment | Deployed application |
| 15 | Documentation and interview preparation | README, architecture explanation, demo |

This roadmap is a target. Prioritize a reliable working core over incomplete advanced features.

---

# 12. Security and Privacy Requirements

Because MediVault handles sensitive personal health information, security must be considered from the beginning.

## Authentication and Authorization

- Use authenticated user sessions.
- Protect private dashboard routes.
- Enforce user ownership on the server.
- Use Supabase Row Level Security (RLS).
- Users must only access their own records.
- RLS rule for health data: the row's `profile_id` belongs to a profile where `owner_user_id = auth.uid()`.
- Adding a family member requires explicit consent (checkbox).

## File Storage

- Keep uploaded files private by default.
- Validate file size and type on the server.
- Do not trust only the browser-provided MIME type.
- Use short-lived signed URLs when necessary.
- Avoid predictable public storage URLs.

## API Security

- Keep OpenAI API keys on the server.
- Never expose Supabase service-role keys in frontend code.
- Validate all incoming requests.
- Apply authorization checks to document operations.

## AI Safety

- Treat extracted information as unverified.
- Require user confirmation.
- Preserve the source document reference.
- Do not generate medical diagnoses.
- Do not recommend medication or treatment.

## Emergency Sharing

- Explicit user consent.
- Minimum necessary information.
- Temporary links.
- Expiration.
- Revocation.
- Access logging.
- No automatic access to private documents.
- Hospital Kit links follow the same rules; identity documents are included only when explicitly selected.

## Identity Documents

- Masked Aadhaar only; store at most the last 4 digits as data.
- Never send identity documents to the AI provider.
- Blurred previews until the user taps to view; short-lived signed URLs.

## Development Data

Use synthetic data for:
- Mock dashboard records
- Screenshots
- Testing
- Portfolio demonstrations

Never use real personal medical information in public demos.

---

# 13. Current Project Status

## Completed (verified: `npm run build` and `npm run lint` pass)

- [x] Product direction, problem statement, MVP modules defined
- [x] Next.js 16 project scaffolded (JavaScript, App Router, `src/`, Tailwind v4)
- [x] Design tokens, Inter font, folder structure
- [x] Dashboard shell: sidebar (drawer below `lg`), header with Emergency button, all routes
- [x] Dashboard overview with mock data: welcome, stats, recent documents, quick actions, emergency shortcut
- [x] Shared UI: Card, Button, FormField, StatusBadge, Avatar, PageHeader
- [x] Health profile page (`/profile`): React Hook Form + Zod, tag inputs, medications/supplements rows, "no known allergies", live completion card (localStorage for now)
- [x] Family profiles: header profile switcher, add-member dialog with consent, "managing records for…" banner, family management in Settings, health data stored per profile (localStorage for now)

- [x] ID & Insurance page (`/id-insurance`): identity documents (masked number, blurred previews, never sent to AI), insurance policies (TPA one-tap call, expiry badge, family floater covering several profiles), file upload with real file-type checks, Hospital Kit with "Send files directly" (Web Share API, download fallback). Details in localStorage, files in IndexedDB for now
- [x] Shared `Dialog` (native `<dialog>`) and `FilePicker` components

## Not yet verified

- [ ] Manual click-through in a browser (desktop, tablet, mobile)

## Pending

- [ ] Configure Supabase (schema with `profiles` + `profile_id` on all health tables, RLS)
- [ ] Add TanStack Query; move services from localStorage to Supabase
- [ ] Implement authentication
- [ ] Dashboard reads real data for the active profile (currently mock, always "Rahul", 68%)
- [ ] Implement document vault
- [ ] Integrate AI extraction (Gemini) + wrong-person name check
- [ ] Implement AI search
- [ ] Implement emergency center (contacts, card per profile)
- [ ] Move ID & Insurance from localStorage/IndexedDB to Supabase (tables + private storage)
- [ ] Hospital Kit secure link / QR (needs server) and emergency card in the kit
- [ ] Edit existing ID documents / insurance policies (currently add + delete only)
- [ ] Implement emergency sharing
- [ ] Test application
- [ ] Deploy application
- [ ] Prepare README and interview explanation

---

# 14. Immediate Next Action

Choose one:

1. **Emergency contacts** on the Emergency Center page (reuses the profile form setup, localStorage for now), or
2. **Supabase setup (Day 3):** create the project, write the schema (`profiles`, `health_profiles`, `emergency_contacts`, `documents`, `document_extractions`) with `profile_id` foreign keys and RLS, then add auth and TanStack Query.

---

# 15. Guidelines for Future Development Sessions

When continuing MediVault development:

- Treat this document as the project brief.
- Continue using the existing Next.js project.
- Do not recreate the application.
- Give exact file paths for all code.
- Provide complete code for files being created or replaced.
- Inspect existing code before replacing it.
- Explain commands and where to execute them.
- Use Tailwind CSS v4-compatible syntax.
- Continue with JavaScript unless the user chooses TypeScript.
- Avoid installing unnecessary packages.
- Implement features incrementally.
- Explain important architectural decisions.
- Keep the 15-day timeline in mind.
- Do not expand the agreed MVP scope unnecessarily.
- Verify each implementation step before moving to the next.
- Do not claim that a feature or dependency is installed or complete unless verified.

**Primary development objective:** Build a polished, secure, AI-enabled personal medical document management application that demonstrates strong SDE-2 frontend engineering skills.
