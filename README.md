# Astro Starter Kit: Basics

```sh
npm create astro@latest -- --template basics
```

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/withastro/astro/tree/latest/examples/basics)
[![Open with CodeSandbox](https://assets.codesandbox.io/github/button-edit-lime.svg)](https://codesandbox.io/p/sandbox/github/withastro/astro/tree/latest/examples/basics)
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/withastro/astro?devcontainer_path=.devcontainer/basics/devcontainer.json)

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

![just-the-basics](https://github.com/withastro/astro/assets/2244813/a0a5533c-a856-4198-8470-2d67b1d7c554)

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   └── Card.astro
│   ├── layouts/
│   │   └── Layout.astro
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

---

## 🚗 Public Ride Link (`/ride/[id]`)

**File:** `src/pages/ride/[id].astro`

This is a shareable public page that displays the details of a specific ride. It is intended to be shared with potential passengers so they can see the ride info and contact the driver.

### Route

```
/ride/:id
```

The `:id` parameter is the ride's unique identifier, as returned by the backend API.

### Data Fetching

The page calls `getRide(id)` from `src/lib/api.ts`, which fetches:

```
GET {API_URL}/rides/drivers/:id
```

The `API_URL` environment variable must be set (via `.env` or your deployment environment).

### Page Sections

**When the ride is found:**

| Section | Description |
| :------ | :---------- |
| **Route card** | Shows origin → destination, departure date, departure time, and available seats |
| **Driver card** | Shows driver name, profile picture (or initials avatar), rating, verified badge, and a WhatsApp message button |
| **CTA button** | "Unirme al viaje" — links to `https://wa.me/506{driver.phone}` to contact the driver via WhatsApp |
| **Footer** | Link back to the homepage ("¿Qué es Carpil?") |

**When the ride is not found (or deleted):**

Displays a "Viaje no encontrado" card with a "Volver al inicio" button that takes the user back to the homepage.

### Key Behaviors

- **SEO**: The page uses `noindex` — it is not meant to be indexed by search engines, only accessed via direct share link.
- **Locale**: Dates and times are formatted in `es-CR` (Spanish, Costa Rica). Prices are shown in Costa Rican colones (₡).
- **WhatsApp integration**: Both the driver card chat button and the "Unirme al viaje" CTA link to `https://wa.me/506{phone}` using the driver's phone number. If the driver has no phone number, the link falls back to `/`.
- **Driver avatar fallback**: If the driver has no profile picture, a colored avatar with the driver's initials (up to 2 words) is shown instead.

### Environment Variables

| Variable | Description |
| :------- | :---------- |
| `API_URL` | Base URL of the backend API (e.g. `https://api.carpil.com`) |
