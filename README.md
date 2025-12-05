# SkinAI

A health-themed Next.js app using ONNX Runtime Web to predict skin conditions and recommend skincare products.

## Tech Stack
- Next.js App Router + TypeScript
- Tailwind CSS
- ONNX Runtime Web (`onnxruntime-web`)
- Supabase (`@supabase/ssr`) for auth + history
- Local dataset under `public/skincare_product/`

## Getting Started
1) Add env vars to `.env.local` (not committed):
```
NEXT_PUBLIC_SUPABASE_URL=https://zvmnczbuymtmgczkqnrl.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_AfM9toVVR5YjlO9uqwsimQ_NY38p2Hj
```
2) Install and run:
```bash
npm install
npm run dev
```
Open http://localhost:3000

## Scripts
- `npm run dev` — Start dev server
- `npm run build` — Build production
- `npm run start` — Run production build
- `npm run lint` — Lint code

## Project Structure
```
app/
  layout.tsx        # Global layout with Navbar & Footer
  page.tsx          # Home page
  predict/page.tsx  # Inference page (camera/upload)
  (protected)/       # Auth-protected pages
    profile/page.tsx # User profile
    history/page.tsx # Prediction history
  about/page.tsx    # About page
components/
  Navbar.tsx
  Footer.tsx
lib/
  modelPrefetch.ts  # Prefetch helper for ONNX model
public/
  model/best_skin_model.onnx
  skincare_product/
    treatment.json
    gambar_produk/
app/api/
  predictions/route.ts # Save prediction history (SSR client)
  health/route.ts      # Env + session + query health check
```

## Model & Data
- Place your ONNX model at `public/model/best_skin_model.onnx`.
- Ensure `public/skincare_product/treatment.json` and product images exist.

## Best Practices
- Use `@supabase/ssr` `createBrowserClient` (client) and `createServerClient` (server) to sync auth via cookies.
- Protect `/profile` and `/history` with `middleware.ts`.
- RLS: ensure policies allow users to upsert their `app_users` row and insert/select their own `predictions`.
- Use strict TypeScript in `tsconfig.json`.
- Avoid CDN scripts; import packages via `npm`.
- Prefetch model and keep UI responsive.

### Suggested RLS (Supabase SQL)
```sql
alter table public.app_users enable row level security;
create policy "app_users_select_own" on public.app_users for select using (auth.uid() = id);
create policy "app_users_upsert_own" on public.app_users for insert with check (auth.uid() = id);
create policy "app_users_update_own" on public.app_users for update using (auth.uid() = id) with check (auth.uid() = id);

alter table public.predictions enable row level security;
create policy "predictions_select_own" on public.predictions for select using (auth.uid() = user_id);
create policy "predictions_insert_own" on public.predictions for insert with check (auth.uid() = user_id);
```

## Deployment
- Vercel recommended.
- Connect GitHub, set env vars in project settings, deploy.
- Set `images` domains in `next.config.js` if using external images.

## Notes
- Camera requires secure context: https or http://localhost.
- Inference runs client-side; no user images leave the device.
- Use `GET /api/health` to verify env, session, and DB connectivity.
