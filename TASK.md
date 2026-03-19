You are a senior frontend developer building "Hockey Parent" (Хоккейный Родитель) —
a platform for objective evaluation of young Russian hockey players.

## Goal
Build a functional frontend prototype to demonstrate core UI flows to the client.
No backend needed yet — use mock data and static JSON.

## Tech Stack
- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- React Router v6 (client-side routing)
- React Query (with mock fetcher functions, no real API calls)
- react-hook-form + Zod (form validation)
- recharts (for progress/rating charts)
- UI Language: Russian. Code: English identifiers only.

## Mock Data
Create a `src/mocks/` folder with static JSON files:
- `players.json` — 10 sample player profiles with all fields
- `ratings.json` — skill scores per player
- `videos.json` — placeholder video thumbnails (use picsum.photos)

## Pages to Build (in priority order)
1. **/** — Landing page: hero section, problem statement, CTA "Зарегистрировать игрока"
2. **/login** — Simple login form (email + password), role selector: Родитель / Скаут
3. **/dashboard** — Parent dashboard: child's rating card, recent test results, 
   progress chart (recharts LineChart), "Добавить видео" button
4. **/player/:id** — Player profile page: avatar, bio, anthropometric table, 
   skill radar chart, video gallery with thumbnails
5. **/players** — Scout view: filterable player list (region, age, position), 
   player cards with rating badge
6. **/player/new** — Multi-step form to create player profile:
   Step 1: Personal info (name, birth date, position, region)
   Step 2: Anthropometrics (height, weight, arm span, leg length)
   Step 3: Physical tests (20m sprint fwd/bwd, standing jump, etc.)
   Step 4: Upload photo + confirmation

## Component Rules
- Functional components + TypeScript only
- Mobile-first responsive design (Tailwind sm/md/lg breakpoints)
- All forms: react-hook-form + Zod schema validation
- Use shadcn/ui primitives: Button, Card, Input, Select, Badge, Dialog, Tabs
- Named exports only, no default exports
- Max component size: 150 lines — extract to hooks if larger
- Every interactive element needs hover + focus states
- Use Russian text for all UI labels, placeholders, and error messages

## Design System
- Primary color: blue-700 (hockey/trust feel)
- Accent: amber-500 (highlight ratings and CTAs)
- Font: Inter (via Google Fonts or Fontsource)
- Border radius: rounded-xl for cards, rounded-md for inputs
- Consistent spacing scale: 4/8/16/24/32/48px

## Deliverable
A fully navigable prototype where:
- All pages are accessible via React Router
- Forms show real validation errors in Russian
- Charts render with mock data
- Mobile view works correctly on 375px width
- No console errors or TypeScript errors

## Current Task
Scaffold the project: Vite + React + TS + Tailwind + shadcn/ui + React Router. Create folder structure and base Layout with sidebar navigation.

Start with project scaffold: Vite setup → folder structure → routing → 
layout component → then pages in priority order.
Ask before making assumptions about design decisions.
