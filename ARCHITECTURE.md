# Arquitetura — Kozmo Tech LP

Este documento descreve as decisões de arquitetura, o sistema de design e o fluxo de dados da landing page.

---

## Visão geral

```
Browser ──► Astro (static HTML) ──► Layout.astro
                                        │
                                    LandingPage.astro  (orquestrador)
                                        │
                        ┌───────────────┼───────────────┐
                     Navbar           Hero           Marquee
                     About          Services         Product
                     Team           Location         Contact
                     Footer    AccessibilityWidget  WhatsAppButton
```

O site é inteiramente **pré-renderizado em build time** (output estático). Não há servidor, API ou banco de dados envolvidos. Todo estado do usuário (alto contraste, tamanho de fonte) é persistido em `localStorage`.

---

## Roteamento

### Páginas geradas

| Arquivo | Rota de saída | Idioma |
|---|---|---|
| `src/pages/index.astro` | `/` | Português |
| `src/pages/[lang]/index.astro` | `/en`, `/es`, `/fr` | EN / ES / FR |
| `src/pages/404.astro` | `/404.html` | Detectado por JS |

### Como o 404 detecta o idioma

Como há um único `404.html` para todas as rotas inválidas, o idioma não pode ser determinado em build time. Um script inline lê o prefixo da URL (`/en/...`, `/es/...`, `/fr/...`) e troca os textos via DOM imediatamente — sem flash visível.

---

## Internacionalização (i18n)

### Estrutura

```
src/i18n/
├── locales/
│   ├── pt.json    # Português (padrão)
│   ├── en.json    # Inglês
│   ├── es.json    # Espanhol
│   └── fr.json    # Francês
└── translations.ts
```

### Fluxo

```
[lang]/index.astro
    │  passa { lang }
    ▼
LandingPage.astro
    │  getT(lang) → objeto T completo
    ▼
Componentes recebem t.secao via props tipadas
```

`getT(lang)` retorna o objeto de tradução correspondente, fazendo fallback para `pt` em caso de idioma desconhecido. O tipo `T` é inferido diretamente de `pt.json`, garantindo que todos os idiomas precisam ter as mesmas chaves (verificado pelo TypeScript).

### Adicionando um idioma

1. Criar `src/i18n/locales/xx.json` com todas as chaves de `pt.json`
2. Importar e adicionar em `translations.ts`
3. Adicionar `xx` no array `supportedLangs` em `translations.ts`
4. Adicionar o mapeamento em `astro.config.mjs` (sitemap) e `Layout.astro` (hreflang)

---

## Arquitetura de componentes

### Hierarquia

```
Layout.astro               ← HTML, <head>, SEO, fontes, init de preferências, canvas starfield
└── LandingPage.astro      ← orquestrador: importa e compõe todas as seções
    ├── Navbar.astro
    ├── Hero.astro
    ├── Marquee.astro
    ├── About.astro
    ├── Services.astro
    ├── Product.astro
    ├── Team.astro
    ├── Location.astro
    ├── Contact.astro
    ├── Footer.astro
    ├── AccessibilityWidget.astro  ← flutuante, bottom-left
    └── WhatsAppButton.astro       ← flutuante, bottom-right
```

### Contrato de props

Cada componente de seção recebe apenas a fatia de tradução que lhe diz respeito:

```ts
// Exemplo
interface Props {
  t: T['hero']  // só a seção 'hero' do objeto de traduções
}
```

Isso mantém os componentes agnósticos de idioma — toda a lógica de seleção de idioma fica em `LandingPage.astro`.

---

## Sistema de design

### Design tokens (`src/styles/global.css`)

Todos os tokens são definidos via `@theme` do Tailwind v4 e ficam disponíveis como classes utilitárias.

#### Paleta

| Token | Valor | Uso |
|---|---|---|
| `--color-space` | `#03020A` | Background principal |
| `--color-space2` | `#06050F` | Background secundário |
| `--color-cosmos` | `#E8EAFF` | Texto primário |
| `--color-muted-text` | `#7A7D9C` | Texto secundário / legendas |
| `--color-soft-text` | `#4A4D6A` | Texto terciário / placeholders |
| `--color-cyan` | `#00E5FF` | Cor primária, CTAs, destaques |
| `--color-cyan2` | `#00B8D4` | Cyan variante (hover, gradients) |
| `--color-violet` | `#7C3AED` | Cor secundária (purple) |
| `--color-violet2` | `#A855F7` | Violet variante |
| `--color-rose` | `#EC4899` | Acento pink |
| `--color-neon-green` | `#10B981` | Status OK / sucesso |
| `--color-neon-amber` | `#F59E0B` | Status pendente / aviso |
| `--color-neon-red` | `#EF4444` | Status cancelado / erro |

#### Tipografia

| Família | Token | Uso | Pesos |
|---|---|---|---|
| Orbitron | `font-display` | Títulos, logo, números | 400, 600, 700, 800, 900 |
| DM Sans | `font-body` | Corpo de texto, UI | 300, 400, 500, 600 |

Tamanhos responsivos via `clamp()`:
- `text-hero` → `clamp(2.25rem, 7vw, 5.625rem)`
- `text-section` → `clamp(1.5rem, 3.5vw, 2.75rem)`
- `text-prod-title` → `clamp(1.25rem, 2.5vw, 1.875rem)`

#### Bordas e raios

| Token | Valor |
|---|---|
| `--radius-card` | 12px |
| `--radius-panel` | 16px |

### Alto contraste

Ativado adicionando a classe `high-contrast` ao `<html>`. Aumenta os valores de contraste no tema escuro:

```css
html.high-contrast {
  --color-cosmos:     #FFFFFF;
  --color-muted-text: #D0D0E0;
  --color-soft-text:  #A0A0C0;
}
```

A preferência é salva em `localStorage` (`high-contrast: '1'`) e restaurada por um script inline no `<head>` antes do paint — evitando flash de acessibilidade incorreta.

### Tamanho de fonte

Controlado via `data-font-size` no `<html>`:

```css
html[data-font-size="small"] { font-size: 14px; }
html[data-font-size="large"] { font-size: 18px; }
```

Como todos os tamanhos internos usam `rem`, escalar o `font-size` raiz escala o layout inteiro proporcionalmente.

---

## Background visual

### Starfield canvas

Um `<canvas id="starfield">` fixo com `z-index: 0` e `pointer-events: none` renderiza estrelas animadas via `requestAnimationFrame`. O script (inline, via `is:inline`) é inicializado no `Layout.astro`. As estrelas são redimensionadas via `resize` event.

### Nebulas

Três `<div>` com `position: fixed`, gradientes radiais e `filter: blur(80px)` animados via `@keyframes nebDrift`. Definem o "campo de nebulosas" do tema espacial.

---

## SEO

### O que está configurado em `Layout.astro`

- `<title>` e `<meta name="description">`
- `<link rel="canonical">` — URL canônica por idioma
- `<link rel="alternate" hreflang="...">` — para todos os 4 idiomas + `x-default`
- Open Graph: `og:type`, `og:url`, `og:title`, `og:description`, `og:locale`, `og:locale:alternate`
- Twitter Card: `summary_large_image`
- JSON-LD: schema `Organization` com endereço e ponto de contato

### Sitemap

Gerado automaticamente pelo `@astrojs/sitemap` com mapeamento de locales:

```
https://kozmotech.com.br/              (pt-BR)
https://kozmotech.com.br/en            (en)
https://kozmotech.com.br/es            (es)
https://kozmotech.com.br/fr            (fr)
```

---

## Build e deploy

O comando `npm run build` gera em `dist/`:

```
dist/
├── index.html          # Rota / (PT)
├── en/index.html
├── es/index.html
├── fr/index.html
├── 404.html
├── _astro/             # CSS e JS com hash de conteúdo
├── sitemap-0.xml
├── sitemap-index.xml
└── robots.txt
```

O output é compatível com qualquer CDN ou hospedagem estática (Vercel, Netlify, Cloudflare Pages, etc.). Nenhuma configuração de servidor é necessária.

---

## Comandos

| Comando | Ação |
|---|---|
| `npm run dev` | Servidor local em `localhost:4321` |
| `npm run build` | Build estático em `dist/` |
| `npm run preview` | Preview do build em `localhost:4321` |
