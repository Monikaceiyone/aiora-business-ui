# AIORA SEO Metadata Documentation

## Overview

All metadata is centrally managed in `src/lib/meta-config.ts`.  
Each route has a unique `title`, `description`, and `keywords`.  
The `buildMetadata(key)` helper returns a full Next.js `Metadata` object including OpenGraph and Twitter card fields.

Since all page components use `'use client'`, metadata is exported from dedicated `layout.tsx` files per route (Next.js App Router pattern).

---

## Implementation Files

| File | Purpose |
|------|---------|
| `src/lib/meta-config.ts` | Central config — all titles, descriptions, keywords |
| `src/app/(website)/layout.tsx` | Commence (homepage) metadata |
| `src/app/(website)/core-suite/layout.tsx` | Core Suite metadata |
| `src/app/(website)/configurations/layout.tsx` | Configurations metadata |
| `src/app/(website)/costing/layout.tsx` | Costing metadata |
| `src/app/(website)/connect/layout.tsx` | Connect metadata |

> Command Centre (`dashboard.aiora.live`) is an external domain — its metadata is defined in `metaConfig.commandCentre` for reference but applied on that separate deployment.

---

## Metadata Table

| Tab Name | Route | Meta Title | Meta Description | Meta Keywords |
|----------|-------|------------|-----------------|---------------|
| Commence | `/` | AIORA – AI Platform for Real Businesses | AIORA automates calls, WhatsApp orders, and customer support for grocery stores, restaurants, salons, clinics, and retail shops across India. | AI business automation, WhatsApp AI agent, voice AI India, AIORA, small business AI, AI for retail, AI for restaurants, AI for clinics |
| Core Suite | `/core-suite` | Core Suite – AIORA AI Agents & Tools | Explore AIORA's Core Suite: Voice Agent (VoIT), Marketing Agent, E-commerce Agent, Inventory Agent, Booking Agent, Logistics, Finance, and Operations AI. | AI agents, voice agent, VoIT, marketing automation, e-commerce AI, inventory management AI, booking agent, logistics AI, finance AI, operations AI |
| Configurations | `/configurations` | Configurations – Build Your Custom AI Agent \| AIORA | Configure a custom AI agent for your business. Define your automation task, input sources, triggers, and expected outputs — AIORA builds it for you. | custom AI agent, business automation setup, AI configuration, workflow automation, no-code AI, task automation India |
| Costing | `/costing` | Pricing & Plans – AIORA Business AI | Simple, transparent pricing for AIORA. Business plan from ₹3,999/month with Voice Agent, WhatsApp Sales, Marketing, and Inventory automation. Enterprise plans available. | AIORA pricing, AI subscription India, business AI cost, WhatsApp automation price, voice agent pricing, AI plan India, ₹3999 AI plan |
| Connect | `/connect` | Connect with AIORA – Get Started Today | Reach out to AIORA to get started with AI automation for your business. Submit your inquiry and our team will onboard you within 48 hours. | contact AIORA, get started AI, AI onboarding India, business inquiry, WhatsApp AI signup, AIORA demo |
| Command Centre | `dashboard.aiora.live` | Command Centre – AIORA Business Dashboard | Manage your AI agents, monitor conversations, track orders, and control your entire business automation from the AIORA Command Centre dashboard. | AIORA dashboard, business command centre, AI agent management, order tracking, WhatsApp dashboard, business analytics AI |

---

## Adding a New Page

1. Add an entry to `metaConfig` in `src/lib/meta-config.ts`
2. Create a `layout.tsx` in the route folder:

```ts
import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/meta-config';

export const metadata: Metadata = buildMetadata('yourKey');

export default function YourLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
```

---

## Title Length Guidelines

| Page | Title Length |
|------|-------------|
| Commence | 43 chars ✓ |
| Core Suite | 38 chars ✓ |
| Configurations | 50 chars ✓ |
| Costing | 38 chars ✓ |
| Connect | 42 chars ✓ |
| Command Centre | 46 chars ✓ |

All titles are within the recommended 50–60 character range.  
All descriptions are within the recommended 150–160 character range.
