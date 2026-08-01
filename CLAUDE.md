# CLAUDE.md — Portfolio davidsaenz.dev

Portfolio personal de David Sáenz. Next.js 15.3 (App Router) + React 19 + TypeScript 5
(strict) + Tailwind v4 + Framer Motion + tsParticles. Node 20 (`.nvmrc`). Desplegado en
Vercel (davidsaenz.dev). 4 rutas: about-me, services, portfolio, contact. i18n manual
ES/EN con Context + localStorage (`locales/`).

## Reglas críticas

- **NUNCA ejecutes comandos git** (add/commit/push/branch/merge — ninguno). David maneja
  todo el git. Prepara los cambios, reporta qué tocaste, y para ahí.
- Nunca commitees ni imprimas secretos. Credenciales solo como variables de entorno en
  Vercel; en local, `.env.local` (gitignored). Este repo hoy NO tiene ningún secreto —
  mantenerlo así.
- El formulario de contacto usa Formspree con honeypot — no lo rompas ni "migres" sin
  que David lo pida (el endpoint hardcodeado es normal, Formspree es público por diseño).
- Contenido de UI: español por defecto, inglés vía `locales/`. Código y comentarios en
  inglés; documentación del repo en español.
- Para CUALQUIER trabajo del bot de WhatsApp, lee primero `docs/whatsapp-bot-spec.md`
  y ejecuta solo la fase acordada en la sesión. Una fase = una rama = un PR.

## Gotchas conocidos (auditoría 2026-07)

- `tailwind.config.ts` está en formato v3 pero el proyecto usa Tailwind v4
  (`@tailwindcss/postcss`): ese archivo se ignora salvo `@config` en el CSS. Verifica si
  los colores `secondary`/`darkbg` están realmente activos antes de usarlos.
- La i18n es parcial: `locales/` traduce la UI, pero `data.tsx` (experiencia, servicios,
  testimonios) está hardcodeado en español.
- En `dataPortfolio`, los proyectos 5–11 son placeholders (Unsplash + demos `#!`).
- El README dice "Next.js 14" pero el proyecto usa la 15.

## Comandos

- `npm install` (node_modules puede no estar instalado localmente)
- `npm run dev` — dev server
- `npm run build` — build de producción (correr SIEMPRE antes de dar una fase por lista)
- `npm run lint`

## Convenciones

- TypeScript strict; sin `any` nuevos.
- Componentes en `components/`, siguiendo el patrón existente.
- Sin dependencias nuevas salvo razón clara (las del bot están listadas en el spec).
- Push a `main` = deploy automático en Vercel. Tratar `main` como producción.
- Flujo de PR: rama → PR → squash-and-merge (lo ejecuta David).
