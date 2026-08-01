# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Angular frontend for AutoFacSigo, a university/entrepreneurship project. The business distributes food-industry chemicals (plants, factories, catering, restaurants), sold to B2B clients. The end goal is two distinct surfaces in one app:

1. A **public landing page** presenting the product catalog and company info — not started yet.
2. An **internal admin dashboard** for managing the Siigo-invoice-capture workflow that the backend (`../AutoFacApi`) automates via Selenium — this is the only part currently implemented.

Today the entire app *is* the admin dashboard: the root route redirects straight into it, with no public site and no auth boundary in front of it.

## Commands

- `ng serve` (or `npm start`) — dev server at `http://localhost:4200`
- `ng build` — production build to `dist/`
- `ng test` — unit tests via Karma/Jasmine
- `ng generate component <name>` — scaffold a new component (NgModule-style, not standalone — see Architecture)

## Architecture

Angular **15.2**, classic `NgModule` architecture (not standalone components) — everything is declared in `app.module.ts` and routed through a single `AppRoutingModule`. Styling is **TailwindCSS**; there is no Angular Material, PrimeNG, or Bootstrap installed, despite a stray `matTooltip` attribute in `registros.component.html` that does nothing since Material isn't imported.

Feature folders under `src/app/`: `dash-board` (the shell/layout with sidebar), `home` (invoice-capture trigger), `registros` (invoice table), `user` and `messages` (empty placeholders, no logic). Each HTTP-calling feature has its own service (`DashBoardService`, `CapturaServiceService`) rather than a shared API client.

### Current routing (`app-routing.module.ts`)

```
''                    → redirect to dashboard/home
dashboard             → DashBoardComponent (shell)
  home                → HomeComponent
  registros/list      → RegistrosComponent
  messages/list       → MessagesComponent
  usuarios/list       → UserComponent
```

The sidebar links to `/settings`, `/help`, `/password`, `/sing-out`, none of which exist in the router.

### Backend integration

No `environments/` folder exists — the API base URL (`http://localhost:8080/api/...`) is hardcoded separately inside `dash-board.service.ts` and `home/captura-service.service.ts`. When adding new services that call the backend, either follow that existing pattern for consistency or introduce `environment.ts` deliberately (worth raising with the user first, since it touches every existing service).

The `Data` interface (`interface/data.interfaces.ts`) mirrors the backend's `Data` entity — a captured Siigo invoice row (`numeroFactura`, `cliente`, `nit`, dates, `valorTotal`, `formaPago`, `medioPago`), not a product or customer model. There is currently no product/catalog data model on either the frontend or backend.

### What's missing (not bugs — just not built yet)

No login, no `AuthGuard`, no HTTP interceptor, no session/token handling of any kind — the backend API is fully open, so there is nothing to authenticate against yet either. No public landing/catalog components. No product, client, or invoice CRUD UI beyond the read-only `registros` list tied to the single `Data` entity.
