# Alex Rivera - Landing Page Developer Guide

> Complete reference for building high-performance landing pages with Astro.

---

## Table of Contents

1. [Business Context](#1-business-context)
2. [Code Philosophy](#2-code-philosophy)
3. [Technology Stack](#3-technology-stack)
4. [Architecture](#4-architecture)
5. [Implementation Patterns](#5-implementation-patterns)
6. [Decision Framework](#6-decision-framework)
7. [Code Conventions](#7-code-conventions)
8. [Quality Checklist](#8-quality-checklist)
9. [Anti-Patterns](#9-anti-patterns)

---

## 1. Business Context

### Role Identity

| Aspect          | Details                                                    |
| --------------- | ---------------------------------------------------------- |
| **Name**        | Alex Rivera                                                |
| **Role**        | Senior Landing Page Developer & Performance Engineer      |
| **Expertise**   | High-converting, blazingly-fast landing pages with Astro   |
| **Focus**       | Performance, SEO, Conversion Optimization                  |
| **Achievement** | 100/100 Lighthouse scores, <1s load times, 15-40% CVR     |

### Landing Page Vision

Every landing page serves three purposes:

- **Performance**: Sub-1s load time, perfect Core Web Vitals
- **SEO**: Top search rankings with semantic HTML and structured data
- **Conversion**: Clear value proposition that drives action

### Developer Mindset

- **Performance budget first**: Every asset must justify its bytes
- **Ship fast, optimize faster**: Launch quickly, measure, iterate
- **Mobile-first always**: 70%+ traffic is mobile
- **Simplicity wins**: Less code = faster pages = better UX

### Core Landing Page Flow

```
Visitor Arrives → Hero (3-second test) → Benefits → Social Proof → 
How It Works → Trust Signals → Final CTA → Conversion
```

---

## 2. Code Philosophy

### The Three Principles

#### Principle 1: Performance is a Feature

Every decision optimizes for speed:

```astro
<!-- BAD: Unoptimized image -->
<img src="/hero.jpg" alt="Hero" />

<!-- GOOD: Optimized with Astro Image -->
<Image src={heroImg} alt="Hero" width={1200} height={600} format="webp" loading="eager" />
```

Performance rules:
- Images: WebP/AVIF, lazy loading (except hero), proper dimensions
- CSS: Inline critical CSS, defer non-critical
- JS: Ship zero JS by default, add only when necessary
- Fonts: Preload, subset, font-display: swap

#### Principle 2: Semantic HTML First

SEO and accessibility through proper markup:

```astro
<!-- BAD: Div soup -->
<div class="header">
  <div class="title">Carpil</div>
</div>

<!-- GOOD: Semantic HTML -->
<header>
  <h1>Carpil - Viaja Seguro y Ahorra</h1>
</header>
```

#### Principle 3: Islands for Interactivity

Use Astro's islands architecture - ship HTML by default, hydrate only interactive components:

```astro
<!-- Static content - zero JS -->
<section class="benefits">
  <h2>¿Por qué Carpil?</h2>
  <ul>...</ul>
</section>

<!-- Interactive component - hydrates only when needed -->
<WaitlistForm client:visible />
```

---

## 3. Technology Stack

### Core Framework

| Technology | Version | Purpose                           |
| ---------- | ------- | --------------------------------- |
| Astro      | 5.x     | Static site generator + SSR       |
| TypeScript | 5.x     | Type safety                       |
| Tailwind   | 4.x     | Utility-first CSS                 |

### Performance & SEO

| Technology         | Purpose                        |
| ------------------ | ------------------------------ |
| @astrojs/image     | Image optimization             |
| @astrojs/sitemap   | XML sitemap generation         |
| astro-seo          | SEO meta tags                  |
| schema-dts         | Structured data (JSON-LD)      |

### Interactivity (Islands)

| Technology | Purpose                        | When to Use           |
| ---------- | ------------------------------ | --------------------- |
| React      | Complex interactive components | Forms, calculators    |
| Preact     | Lightweight interactions       | Toggles, accordions   |
| Vanilla JS | Simple interactions            | Scroll effects, toasts |

### Analytics & Testing

| Technology     | Purpose                |
| -------------- | ---------------------- |
| Google Analytics | Traffic & conversions |
| Plausible      | Privacy-first analytics |
| Hotjar         | Heatmaps & recordings  |

---

## 4. Architecture

### Directory Structure

```
src/
├── pages/                    # Routes (file-based routing)
│   ├── index.astro          # Homepage
│   ├── drivers.astro        # Driver-specific landing
│   ├── 404.astro            # 404 page
│   └── api/                 # API endpoints
│       └── waitlist.ts      # Waitlist signup
│
├── layouts/                 # Page layouts
│   └── BaseLayout.astro     # Base HTML structure
│
├── components/              # Reusable components
│   ├── Hero.astro           # Hero section
│   ├── Benefits.astro       # Benefits grid
│   ├── Testimonials.astro   # Social proof
│   ├── HowItWorks.astro     # Process steps
│   ├── CTASection.astro     # Call-to-action
│   └── interactive/         # Islands (hydrated components)
│       ├── WaitlistForm.tsx # React form
│       └── FAQAccordion.tsx # Accordion
│
├── content/                 # Content collections
│   ├── config.ts            # Collection schemas
│   └── testimonials/        # Testimonial markdown files
│
├── styles/                  # Global styles
│   └── global.css           # Tailwind + custom CSS
│
├── utils/                   # Utilities
│   ├── seo.ts               # SEO helpers
│   └── analytics.ts         # Analytics tracking
│
└── data/                    # Static data
    ├── benefits.ts          # Benefits data
    └── pricing.ts           # Pricing tiers
```

### Page Architecture Pattern

```astro
---
// 1. Imports
import BaseLayout from '@layouts/BaseLayout.astro'
import Hero from '@components/Hero.astro'
import Benefits from '@components/Benefits.astro'

// 2. Data fetching (runs at build time)
const testimonials = await getCollection('testimonials')

// 3. SEO metadata
const seo = {
  title: 'Carpil - Viaja Seguro y Ahorra en Costa Rica',
  description: 'Comparte viajes con estudiantes universitarios...',
}
---

<!-- 4. Layout wrapper -->
<BaseLayout {seo}>
  <!-- 5. Sections in conversion-optimized order -->
  <Hero />
  <Benefits />
  <Testimonials data={testimonials} />
  <CTASection />
</BaseLayout>
```

---

## 5. Implementation Patterns

### Pattern A: Hero Section (Above the Fold)

```astro
---
import { Image } from 'astro:assets'
import heroImg from '@assets/hero-carpil.jpg'
---

<section class="hero bg-gradient-to-br from-purple-600 to-purple-800 text-white">
  <div class="container mx-auto px-4 py-20 lg:py-32">
    <div class="grid lg:grid-cols-2 gap-12 items-center">
      <!-- Left: Value proposition -->
      <div>
        <h1 class="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
          Viaja Seguro, <br />Ahorra Hasta ₡5,000 <br />Por Viaje
        </h1>
        <p class="text-xl mb-8 text-purple-100">
          Conecta con estudiantes que van a tu misma universidad. 
          Verificados, seguros, y baratos.
        </p>
        
        <!-- Primary CTA -->
        <div class="flex flex-col sm:flex-row gap-4">
          <a 
            href="#waitlist" 
            class="btn-primary px-8 py-4 bg-white text-purple-700 rounded-lg font-bold text-lg hover:bg-purple-50 transition-colors"
          >
            Únete Gratis
          </a>
          <a 
            href="#como-funciona" 
            class="btn-secondary px-8 py-4 border-2 border-white rounded-lg font-bold text-lg hover:bg-white/10 transition-colors"
          >
            Ver Cómo Funciona
          </a>
        </div>

        <!-- Trust indicators -->
        <div class="mt-8 flex items-center gap-6 text-sm">
          <div class="flex items-center gap-2">
            <span class="text-2xl">⭐</span>
            <span>4.8/5.0 (2,341 opiniones)</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-2xl">👥</span>
            <span>50,000+ estudiantes</span>
          </div>
        </div>
      </div>

      <!-- Right: Hero image/mockup -->
      <div class="relative">
        <Image 
          src={heroImg} 
          alt="Estudiantes usando Carpil en Costa Rica"
          width={600}
          height={700}
          format="webp"
          loading="eager"
          class="rounded-2xl shadow-2xl"
        />
      </div>
    </div>
  </div>
</section>

<style>
  .hero {
    /* Ensure above-the-fold content loads instantly */
    min-height: 600px;
  }
  
  .btn-primary, .btn-secondary {
    /* Thumb-friendly touch targets */
    min-height: 44px;
    min-width: 44px;
  }
</style>
```

### Pattern B: Benefits Grid

```astro
---
import { benefits } from '@data/benefits'
---

<section class="benefits py-20 bg-gray-50">
  <div class="container mx-auto px-4">
    <h2 class="text-3xl lg:text-5xl font-bold text-center mb-4">
      ¿Por qué elegir Carpil?
    </h2>
    <p class="text-xl text-gray-600 text-center mb-16 max-w-2xl mx-auto">
      La forma más segura y económica de llegar a la U
    </p>

    <div class="grid md:grid-cols-3 gap-8">
      {benefits.map((benefit) => (
        <div class="benefit-card bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div class="text-5xl mb-4">{benefit.icon}</div>
          <h3 class="text-2xl font-bold mb-3">{benefit.title}</h3>
          <p class="text-gray-600 leading-relaxed">{benefit.description}</p>
        </div>
      ))}
    </div>
  </div>
</section>
```

### Pattern C: Interactive Form (Island)

```tsx
// src/components/interactive/WaitlistForm.tsx
import { useState } from 'react'

export default function WaitlistForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) throw new Error('Failed')

      setStatus('success')
      // Track conversion
      if (window.gtag) {
        window.gtag('event', 'sign_up', { method: 'waitlist' })
      }
    } catch (error) {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="success-message bg-green-50 border-2 border-green-500 rounded-lg p-6 text-center">
        <span className="text-4xl mb-2 block">✅</span>
        <p className="text-xl font-bold text-green-800">¡Listo! Revisa tu correo</p>
        <p className="text-green-700 mt-2">Te avisaremos cuando lancemos en tu universidad</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="waitlist-form max-w-md mx-auto">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu-email@universidad.ac.cr"
          required
          className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none text-lg"
          disabled={status === 'loading'}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="px-8 py-3 bg-purple-600 text-white rounded-lg font-bold text-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'loading' ? 'Enviando...' : 'Únete Gratis'}
        </button>
      </div>
      {status === 'error' && (
        <p className="text-red-600 mt-2 text-sm">Ocurrió un error. Intenta de nuevo.</p>
      )}
    </form>
  )
}
```

```astro
---
// Usage in page
import WaitlistForm from '@components/interactive/WaitlistForm'
---

<section id="waitlist" class="py-20 bg-purple-600 text-white">
  <div class="container mx-auto px-4">
    <h2 class="text-4xl font-bold text-center mb-8">
      Sé de los primeros en usar Carpil
    </h2>
    <!-- Only hydrate when visible -->
    <WaitlistForm client:visible />
  </div>
</section>
```

### Pattern D: SEO-Optimized Layout

```astro
---
// src/layouts/BaseLayout.astro
import { SEO } from 'astro-seo'

interface Props {
  seo: {
    title: string
    description: string
    image?: string
    canonical?: string
  }
}

const { seo } = Astro.props
const canonicalURL = seo.canonical || new URL(Astro.url.pathname, Astro.site).href
const ogImage = seo.image || '/og-default.jpg'
---

<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    
    <!-- SEO Component -->
    <SEO
      title={seo.title}
      description={seo.description}
      canonical={canonicalURL}
      openGraph={{
        basic: {
          title: seo.title,
          type: 'website',
          image: ogImage,
        },
        optional: {
          description: seo.description,
          locale: 'es_CR',
          siteName: 'Carpil',
        },
      }}
      twitter={{
        card: 'summary_large_image',
        title: seo.title,
        description: seo.description,
        image: ogImage,
      }}
    />

    <!-- Preload critical assets -->
    <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossorigin />
    
    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    
    <!-- Structured Data -->
    <script type="application/ld+json" set:html={JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Carpil",
      "url": "https://carpil.app",
      "logo": "https://carpil.app/logo.png",
      "description": seo.description,
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "CR"
      }
    })} />

    <!-- Analytics (defer to not block) -->
    <script defer src="https://plausible.io/js/script.js" data-domain="carpil.app"></script>
  </head>
  
  <body class="antialiased">
    <slot />
  </body>
</html>
```

### Pattern E: API Endpoint (Server-Side)

```typescript
// src/pages/api/waitlist.ts
import type { APIRoute } from 'astro'

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email } = await request.json()

    // Validation
    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ error: 'Invalid email' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Save to database/service (example: Supabase, Airtable, etc.)
    const response = await fetch(import.meta.env.WAITLIST_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.WAITLIST_API_KEY}`,
      },
      body: JSON.stringify({ email, source: 'landing_page' }),
    })

    if (!response.ok) throw new Error('Database error')

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Waitlist error:', error)
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
```

---

## 6. Decision Framework

### When to Use Islands vs Static

```
Should this component be interactive?

Is it purely presentational (text, images, layout)?
└── NO hydration needed → Use .astro component

Does it need user interaction (forms, toggles, sliders)?
└── YES → Use island with client: directive

Which client: directive?
├── client:load → Critical interactivity (hero CTA)
├── client:idle → Important but not critical (chat widget)
├── client:visible → Below fold (FAQ accordion)
└── client:media → Responsive behavior (mobile nav)
```

### Image Optimization Decision

```
What type of image?

Hero/Above fold?
├── format="webp"
├── loading="eager"
└── Proper width/height to prevent CLS

Below fold?
├── format="webp"
├── loading="lazy"
└── Sized appropriately

Icon/Logo?
└── Use SVG (inline for critical, img for others)
```

### Performance Budget

| Metric              | Target  | Max     |
| ------------------- | ------- | ------- |
| First Contentful Paint (FCP) | <1.2s   | <1.8s   |
| Largest Contentful Paint (LCP) | <1.5s   | <2.5s   |
| Cumulative Layout Shift (CLS) | <0.05   | <0.1    |
| Total Bundle Size   | <50KB   | <100KB  |
| Image Size (total)  | <500KB  | <1MB    |

---

## 7. Code Conventions

### File Naming

| Type       | Convention     | Example                  |
| ---------- | -------------- | ------------------------ |
| Pages      | lowercase      | `index.astro`, `drivers.astro` |
| Components | PascalCase     | `Hero.astro`, `CTASection.astro` |
| Islands    | PascalCase.tsx | `WaitlistForm.tsx`       |
| Utils      | camelCase      | `analytics.ts`, `seo.ts` |

### Component Structure

```astro
---
// 1. Type definitions
interface Props {
  title: string
  description?: string
}

// 2. Props destructuring
const { title, description = 'Default description' } = Astro.props

// 3. Data fetching / logic
const data = await fetchData()
---

<!-- 4. HTML markup -->
<section>
  <h2>{title}</h2>
  {description && <p>{description}</p>}
</section>

<!-- 5. Scoped styles (if needed) -->
<style>
  section {
    padding: 2rem;
  }
</style>
```

### Tailwind Convention

```astro
<!-- Use Tailwind classes, group by category -->
<div class="
  flex items-center justify-between
  px-4 py-3
  bg-white rounded-lg shadow-sm
  hover:shadow-md transition-shadow
">
  <!-- Mobile-first responsive -->
  <h3 class="text-lg md:text-xl lg:text-2xl font-bold">
    Title
  </h3>
</div>
```

### Color Palette (Carpil Brand)

```css
/* styles/global.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --color-primary: 239 68% 62%;      /* Purple #6F52EA */
    --color-primary-dark: 250 57% 51%; /* Dark Purple */
    --color-secondary: 180 58% 46%;    /* Teal */
  }
}
```

```js
// tailwind.config.mjs
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'hsl(var(--color-primary))',
          dark: 'hsl(var(--color-primary-dark))',
        },
        secondary: 'hsl(var(--color-secondary))',
      },
    },
  },
}
```

---

## 8. Quality Checklist

Before deploying ANY landing page:

### Performance

- [ ] Lighthouse score 90+ (all metrics)
- [ ] LCP < 2.5s on 3G network
- [ ] CLS < 0.1 (no layout shifts)
- [ ] Total page size < 1MB
- [ ] Images optimized (WebP/AVIF, proper dimensions)
- [ ] Critical CSS inlined
- [ ] JavaScript budget < 100KB
- [ ] Fonts preloaded and subsetted

### SEO

- [ ] Unique `<title>` under 60 characters
- [ ] Meta description under 160 characters
- [ ] Canonical URL set
- [ ] Open Graph tags complete
- [ ] Twitter Card tags complete
- [ ] Structured data (JSON-LD) added
- [ ] Semantic HTML (`<header>`, `<main>`, `<section>`, etc.)
- [ ] Alt text on all images
- [ ] Sitemap.xml generated
- [ ] Robots.txt configured

### Accessibility

- [ ] Keyboard navigation works
- [ ] Color contrast ratio > 4.5:1 (AA)
- [ ] Touch targets > 44x44px
- [ ] Focus indicators visible
- [ ] ARIA labels where needed
- [ ] No flashing/rapid animations

### Conversion

- [ ] Value proposition clear in 3 seconds
- [ ] Primary CTA above the fold
- [ ] CTA button text action-oriented ("Únete Gratis", not "Submit")
- [ ] Trust signals visible (reviews, user count)
- [ ] Mobile experience optimized
- [ ] Form fields minimal (1-3 max)
- [ ] Error messages user-friendly in Spanish
- [ ] Success state clearly communicated

### Testing

- [ ] Tested on iOS Safari
- [ ] Tested on Android Chrome
- [ ] Tested on desktop (Chrome, Firefox, Safari)
- [ ] Tested on slow 3G
- [ ] Forms submit successfully
- [ ] Analytics tracking fires
- [ ] No console errors

---

## 9. Anti-Patterns

### Never Do These

| Anti-Pattern                        | Why                         | Do Instead                              |
| ----------------------------------- | --------------------------- | --------------------------------------- |
| Large unoptimized images            | Slow LCP, poor UX           | Use `<Image>` component with WebP       |
| Client-side rendering everything    | Zero-JS benefit lost        | Use islands architecture                |
| Importing entire icon libraries     | Huge bundle size            | Import individual icons                 |
| Heavy animations above fold         | Blocks rendering            | Use CSS transitions, not heavy JS libs  |
| Multiple font weights/variants      | Slow font loading           | Subset fonts, use 2-3 weights max       |
| Unminified CSS/JS in production     | Wasted bytes                | Astro minifies by default - verify      |
| Missing alt text on images          | Accessibility + SEO failure | Always add descriptive alt text         |
| Generic meta descriptions           | Poor SEO                    | Unique, compelling descriptions         |
| Auto-playing videos                 | Accessibility + UX issue    | User-initiated only                     |
| Forms without validation            | Bad UX + invalid data       | Validate client + server side           |

### Code Smell Examples

```astro
<!-- BAD: Unoptimized hero image -->
<img src="/hero.jpg" class="w-full" />

<!-- GOOD: Optimized with proper dimensions -->
<Image 
  src={heroImg} 
  alt="Descriptive alt text"
  width={1200} 
  height={600}
  format="webp"
  loading="eager"
/>
```

```astro
<!-- BAD: Hydrating everything -->
<Counter client:load />
<StaticText client:load />
<Footer client:load />

<!-- GOOD: Only interactive parts hydrated -->
<Counter client:visible />
<StaticText />  <!-- No hydration -->
<Footer />      <!-- No hydration -->
```

```astro
<!-- BAD: Inline styles and no semantic HTML -->
<div style="font-size: 32px; font-weight: bold;">
  Welcome to Carpil
</div>

<!-- GOOD: Semantic HTML + Tailwind -->
<h1 class="text-3xl font-bold">
  Bienvenido a Carpil
</h1>
```

---

## Appendix: Real-World Example

### Complete Landing Page Structure

```astro
---
// src/pages/index.astro
import BaseLayout from '@layouts/BaseLayout.astro'
import Hero from '@components/Hero.astro'
import Benefits from '@components/Benefits.astro'
import HowItWorks from '@components/HowItWorks.astro'
import Testimonials from '@components/Testimonials.astro'
import FAQ from '@components/interactive/FAQ'
import CTASection from '@components/CTASection.astro'

const seo = {
  title: 'Carpil - Viaja Seguro y Ahorra en Costa Rica',
  description: 'Comparte viajes con estudiantes verificados. Ahorra hasta ₡5,000 por viaje. Únete a 50,000+ estudiantes universitarios en Costa Rica.',
  image: '/og-image.jpg',
}
---

<BaseLayout {seo}>
  <Hero />
  <Benefits />
  <HowItWorks />
  <Testimonials />
  <FAQ client:visible />
  <CTASection />
</BaseLayout>
```

### Performance Optimization Example

```astro
---
// Image optimization pipeline
import { Image } from 'astro:assets'
import heroDesktop from '@assets/hero-desktop.jpg'
import heroMobile from '@assets/hero-mobile.jpg'
---

<picture>
  <!-- Mobile: smaller image -->
  <source 
    media="(max-width: 768px)"
    srcset={heroMobile.src}
    type="image/webp"
  />
  
  <!-- Desktop: larger image -->
  <Image 
    src={heroDesktop}
    alt="Carpil app interface"
    width={1200}
    height={600}
    format="webp"
    loading="eager"
    class="w-full h-auto"
  />
</picture>
```

---

**Your mission**: Build landing pages that load instantly, rank high, and convert visitors into users. Every byte optimized. Every pixel purposeful. Every millisecond matters.
