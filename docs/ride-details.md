# Guía: Página de viaje en Astro (`/rides/[id]`)

Esta guía explica cómo construir la página pública de un viaje en Astro usando el endpoint `GET /v1/rides/drivers/:id`.

---

## Endpoint

```
GET {{base_url}}/v1/rides/drivers/:id
```

- **Autenticación:** No requerida (página pública)
- **Parámetro:** `id` — el ID del viaje (string)

### Respuesta exitosa `200`

```json
{
  "ride": {
    "id": "abc123",
    "origin": {
      "id": "place_id_google",
      "name": {
        "primary": "San José",
        "secondary": "San José, Costa Rica"
      },
      "location": { "lat": 9.9281, "lng": -84.0907 }
    },
    "destination": {
      "id": "place_id_google",
      "name": {
        "primary": "Cartago",
        "secondary": "Cartago, Costa Rica"
      },
      "location": { "lat": 9.8647, "lng": -83.9197 }
    },
    "meetingPoint": null,
    "availableSeats": 3,
    "price": 4500,
    "departureDate": "2024-10-12T13:30:00.000Z",
    "status": "active",
    "driver": {
      "id": "user_abc",
      "name": "Alejandro Ruiz",
      "profilePicture": "https://...",
      "isDriver": true
    },
    "passengers": [],
    "chatId": "chat_xyz",
    "deletedAt": null
  }
}
```

### Errores

| Código | Descripción |
|--------|-------------|
| `404`  | Viaje no encontrado |
| `500`  | Error interno del servidor |

---

## Estructura de archivos en Astro

```
src/
  pages/
    rides/
      [id].astro       ← página dinámica del viaje
  lib/
    api.ts             ← función fetch reutilizable
  types/
    ride.ts            ← tipos del viaje
```

---

## Tipos (`src/types/ride.ts`)

```ts
export interface Location {
  id: string
  name: {
    primary: string
    secondary: string
  }
  location: {
    lat: number
    lng: number
  }
}

export interface Driver {
  id: string
  name: string
  profilePicture?: string
}

export interface Ride {
  id: string
  origin: Location | null
  destination: Location | null
  meetingPoint: Location | null
  availableSeats: number
  price: number
  departureDate: string   // ISO 8601
  status: 'active' | 'canceled' | 'completed'
  driver: Driver
  passengers: Driver[]
  chatId: string
  deletedAt: string | null
}

export interface RideResponse {
  ride: Ride
}
```

---

## Fetch helper (`src/lib/api.ts`)

```ts
const BASE_URL = import.meta.env.API_URL  // ej: https://api.carpil.app/v1

export async function getRide(id: string): Promise<Ride | null> {
  const res = await fetch(`${BASE_URL}/rides/drivers/${id}`)

  if (!res.ok) return null

  const data: RideResponse = await res.json()
  return data.ride
}
```

---

## Página (`src/pages/rides/[id].astro`)

```astro
---
import type { Ride } from '../../types/ride'
import { getRide } from '../../lib/api'

const { id } = Astro.params

const ride = await getRide(id!)

if (!ride) {
  return Astro.redirect('/404')
}

const departureDate = new Date(ride.departureDate)
const dateLabel = departureDate.toLocaleDateString('es-CR', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})
const timeLabel = departureDate.toLocaleTimeString('es-CR', {
  hour: '2-digit',
  minute: '2-digit',
})
---

<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <title>{ride.origin?.name.primary} → {ride.destination?.name.primary} | Carpil</title>
    <meta name="description" content={`Viaje de ${ride.origin?.name.primary} a ${ride.destination?.name.primary} el ${dateLabel}. ₡${ride.price.toLocaleString('es-CR')}`} />

    <!-- Open Graph (para previsualización al compartir) -->
    <meta property="og:title" content={`${ride.origin?.name.primary} → ${ride.destination?.name.primary}`} />
    <meta property="og:description" content={`${dateLabel} · ${timeLabel} · ₡${ride.price.toLocaleString('es-CR')}`} />
    <meta property="og:type" content="website" />
  </head>
  <body>
    <main>
      <h1>{ride.origin?.name.primary} → {ride.destination?.name.primary}</h1>

      <section>
        <p><strong>Fecha:</strong> {dateLabel}</p>
        <p><strong>Hora:</strong> {timeLabel}</p>
        <p><strong>Precio:</strong> ₡{ride.price.toLocaleString('es-CR')}</p>
        <p><strong>Asientos disponibles:</strong> {ride.availableSeats}</p>
      </section>

      <section>
        <h2>Conductor</h2>
        {ride.driver.profilePicture && (
          <img src={ride.driver.profilePicture} alt={ride.driver.name} width={64} height={64} />
        )}
        <p>{ride.driver.name}</p>
      </section>

      <a href={`carpil://ride/${ride.id}`}>Reservar en la app</a>
    </main>
  </body>
</html>
```

---

## Variable de entorno

En `.env` del proyecto Astro:

```env
API_URL=https://api.carpil.app/v1
```

En `astro.config.mjs`, si usas SSR (necesario para rutas dinámicas con fetch en el servidor):

```js
import { defineConfig } from 'astro/config'
import node from '@astrojs/node'

export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
})
```

> Si preferís SSG, usá `getStaticPaths` solo si tenés una lista fija de IDs.
> Para viajes dinámicos (cualquier ID), SSR es la opción correcta.

---

## Deep link a la app

El botón "Reservar en la app" puede usar un deep link para abrir Carpil directamente:

```
carpil://ride/{id}
```

Con fallback a la App Store / Play Store si la app no está instalada.
