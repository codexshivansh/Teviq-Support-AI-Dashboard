# Teviq Support AI Dashboard

React and Vite admin portal for brand onboarding, knowledge management, AI testing, Shopify sync, conversations, analytics, widget installation, and settings.

## Local Setup

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Required environment variables:

```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_test_or_live_key
VITE_API_BASE_URL=https://teviq-support-ai-backend.onrender.com
VITE_ENABLE_DEMO_LOGIN=false
```

Demo login is additionally blocked by production build mode. Enable it only for local development when an instant internal workspace is useful.

## Build

```bash
npm run build
npm run preview
```

## Live And Local Boundaries

Live API-backed areas:

- Clerk authentication and brand-scoped workspace access
- onboarding metadata updates
- knowledge documents, policies, and FAQs
- AI Playground
- Shopify OAuth, sync, catalog, and order context
- conversations and analytics

Local UI state remains appropriate for non-critical presentation settings that have not yet been persisted.

## Authentication

Protected requests obtain the current Clerk session JWT and send:

```http
Authorization: Bearer <jwt>
```

Real Clerk sessions clear stale demo-session state. Demo sessions are unavailable in production and use `X-Teviq-Demo-Auth` only when local demo mode is enabled.

## Widget Install

The install page emits the immutable production widget release:

```html
<script
  src="https://teviq-support-ai-widget.vercel.app/v1.1.0/widget.js"
  data-brand-id="CLIENT_BRAND_ID"
  data-api-url="https://teviq-support-ai-backend.onrender.com">
</script>
```
