# UI Components Skill

## Description
React + TypeScript component creation for Hockey Parent platform.
Stack: React 18, TypeScript, Tailwind CSS, shadcn/ui, React Query.

## Instructions
1. Use functional components with TypeScript only — no class components
2. All forms: react-hook-form + Zod validation
3. Data fetching: React Query (`useQuery`, `useMutation`) only
4. Styling: Tailwind CSS only, no inline styles, no CSS modules
5. Component max size: 200 lines — extract to hooks if larger
6. Name: PascalCase for components, camelCase for hooks (use prefix)
7. Mobile-first: start with `sm:` breakpoint, then `md:`, `lg:`
8. All interactive elements need `aria-label` for accessibility

## Templates
### Component template:
```tsx
interface PlayerCardProps {
  player: Player;
  onSelect?: (id: string) => void;
}

export function PlayerCard({ player, onSelect }: PlayerCardProps) {
  return (
    <div className="rounded-lg border p-4 hover:shadow-md transition-shadow">
      {/* content */}
    </div>
  );
}
```

## Notes
- UI language: Russian. Code identifiers: English
- Design tokens defined in tailwind.config.ts under `theme.extend`