---
name: Railway NODE_ENV=production build pitfall
description: Nixpacks setzt NODE_ENV=production beim Install, was pnpm dazu bringt, devDependencies zu überspringen — tsx, vite, sharp etc. fehlen dann beim Build.
---

## Regel
`railway.toml` buildCommand muss immer `NODE_ENV=development` vorangestellt haben:

```toml
buildCommand = "NODE_ENV=development pnpm install --no-frozen-lockfile && pnpm --filter @workspace/taxi-app run build"
```

**Why:** Nixpacks v1.41+ setzt automatisch `NODE_ENV=production` während der Build-Phase. pnpm 9 respektiert das und überspringt alle devDependencies. Dadurch fehlen `tsx`, `vite`, `sharp` und alle anderen Build-Tools → Build schlägt mit `tsx: not found` / `ERR_MODULE_NOT_FOUND` fehl.

**How to apply:** Immer prüfen wenn railway.toml angefasst wird. Pakete die nur beim Build gebraucht werden (tsx, vite, sharp) dürfen in devDependencies bleiben — aber NODE_ENV=development muss im buildCommand stehen. Laufzeit-Pakete (express, compression, lenis, sharp wenn per railway-start.mjs gebraucht) müssen in `dependencies`.
