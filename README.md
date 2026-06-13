# Kozmo Tech — Landing Page

Landing page institucional da **Kozmo Tech**, software house baseada em Sergipe, Brasil.

Construída com **Astro 6** + **Tailwind CSS v4** + **TypeScript**. Output 100% estático.

---

## Stack

| Tecnologia | Versão | Uso |
|---|---|---|
| Astro | ^6 | Framework (SSG) |
| Tailwind CSS | ^4 | Utilitários de CSS + design tokens |
| TypeScript | strict | Tipagem das props e i18n |
| @astrojs/sitemap | latest | Sitemap automático com i18n |

---

## Estrutura do projeto

```
/
├── public/
│   ├── favicon.svg
│   ├── favicon.ico
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── LandingPage.astro      ← orquestrador principal
│   │   ├── Navbar.astro
│   │   ├── Hero.astro
│   │   ├── Marquee.astro
│   │   ├── About.astro
│   │   ├── Services.astro
│   │   ├── Product.astro
│   │   ├── Team.astro
│   │   ├── Location.astro
│   │   ├── Contact.astro
│   │   ├── Footer.astro
│   │   ├── AccessibilityWidget.astro
│   │   └── WhatsAppButton.astro
│   ├── i18n/
│   │   ├── locales/
│   │   │   ├── pt.json   ← fonte de verdade para o tipo T
│   │   │   ├── en.json
│   │   │   ├── es.json
│   │   │   └── fr.json
│   │   └── translations.ts
│   ├── layouts/
│   │   └── Layout.astro  ← SEO, fontes, init de acessibilidade, starfield
│   ├── pages/
│   │   ├── index.astro        → /     (PT)
│   │   ├── [lang]/index.astro → /en, /es, /fr
│   │   └── 404.astro
│   └── styles/
│       └── global.css    ← @theme tokens + keyframes + utilitários globais
├── ARCHITECTURE.md
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

---

## Comandos

```sh
npm run dev      # servidor local → localhost:4321
npm run build    # build estático → dist/
npm run preview  # preview do build
```

---

## Idiomas disponíveis

| Rota | Idioma |
|---|---|
| `/` | Português (padrão) |
| `/en` | English |
| `/es` | Español |
| `/fr` | Français |

Para adicionar um novo idioma, veja `ARCHITECTURE.md`.

---

## Acessibilidade

O widget flutuante (bottom-left) expõe:
- **Alto contraste** — aumenta os valores de contraste no tema escuro
- **Tamanho de fonte** — pequeno / normal / grande (escala via `font-size` no `<html>`)

As preferências são salvas em `localStorage` e restauradas antes do primeiro paint.

---

## Deploy

O output de `npm run build` é HTML/CSS/JS estático puro — compatível com Vercel, Netlify, Cloudflare Pages ou qualquer CDN.

Lembre-se de ajustar o campo `site` em `astro.config.mjs` com a URL de produção real antes do deploy.
