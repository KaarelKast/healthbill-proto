# FE-01: Frontend Project Setup

## Goal
Bootstrap the React/Vite/TypeScript frontend project.

## Stack
React 18 · Vite 5 · TypeScript 5 · @tehik-ee/tedi-react · TanStack Query v5 · react-router-dom

## Steps

1. In `apps/frontend/`, run:
```bash
npm create vite@latest . -- --template react-ts
npm install @tehik-ee/tedi-react
npm install @tanstack/react-query
npm install react-router-dom
npm install -D @types/react @types/react-dom
```

2. Create `src/main.tsx`:
```tsx
import "@tehik-ee/tedi-react/index.css";   // MUST be first import
import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } }
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
```

3. Create `.env.local`:
```
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_DEMO_MODE=true
```

4. Create `vite.config.ts` with dev proxy:
```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
});
```

5. Delete the default Vite boilerplate files: `src/App.css`, `src/assets/`, `src/index.css` (TEDI CSS replaces these). Keep `index.html`.

6. Create `src/App.tsx` as a placeholder (will be implemented in FE-06):
```tsx
export default function App() {
  return <div>HealthBill</div>;
}
```

## Done when
- `npm run dev` starts on port 5173 with no errors
- Browser shows "HealthBill" text
- No TypeScript errors
