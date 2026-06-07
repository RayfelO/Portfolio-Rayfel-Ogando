<div align="center">
  <img src="https://avatars.githubusercontent.com/u/141379819?v=4" alt="Rayfel Ogando" width="120" height="120" style="border-radius: 50%;" />

  <h1>Rayfel Ogando</h1>
</div>

Portafolio personal construido con React + TypeScript y Vite. La aplicacion muestra una vista tipo bento grid con proyectos, experiencia, educacion, certificaciones, stack tecnico y un modal de contacto conectado a una API serverless.

## Que incluye

- Cambio de idioma `ES / EN`
- Toggle de tema `dark / light` con persistencia en `localStorage`
- Grid principal con tarjetas de:
  - avatar y presentacion
  - stack tecnico
  - certificaciones
  - proyectos open source y privados
  - experiencia laboral
  - educacion
  - contacto rapido con enlaces a GitHub, LinkedIn y boton para ver el CV en PDF
- Vista de proyectos con:
  - selector entre proyectos open source y privados
  - carousel de imagenes
  - lightbox a pantalla completa
  - visor de README / documentacion en markdown
  - enlace a GitHub y, cuando aplica, al sitio en vivo
- Modal de contacto con validacion de campos y envio por API
- Analitica con PostHog para eventos clave
- CV generado con [FlowCV](https://app.flowcv.com), integrado como PDF descargable

## Stack

| Capa | Tecnologia | Version / Notas |
| --- | --- | --- |
| Runtime / PM | Bun | Scripts y despliegue en Vercel |
| Framework | React | 19.2.6 |
| Lenguaje | TypeScript | ~6.0.2 |
| Build Tool | Vite | 8.0.12 con plugin de Tailwind |
| Estilos | Tailwind CSS | v4 basado en CSS, sin config JS |
| Animaciones | Motion (motion.dev) | v12, animaciones por componente |
| Validacion | Zod | v4.4.3, runtime y esquemas de datos |
| Analytics | PostHog | v1.379.2, captura manual |
| Email | Resend | v6.12.4, serverless function |
| Iconos | Lucide React + React Icons | + SVG inline propios |
| Lint / Format | Biome | v2.4.16 |
| Code Health | Fallow | v2.88.2, `unused-files` y `circular-deps` en modo error |

## Estructura principal

- `src/App.tsx`: orquestacion general de la pagina
- `src/data/portfolio.ts`: proyectos, certificaciones, experiencia y educacion
- `src/i18n/translations.ts`: textos en espanol e ingles
- `src/lib/theme.ts`: persistencia y aplicacion del tema
- `src/lib/analytics.ts`: eventos de PostHog
- `src/lib/contact.ts`: envio del formulario al endpoint `/api/contact`
- `src/components/`: tarjetas, modal, header, footer y layout
- `api/contact.ts`: endpoint serverless para recibir el formulario y enviar el email

## Requisitos

- Bun
- Node compatible con Vite y TypeScript
- Variables de entorno para analitica y correo si vas a usar el formulario en serio

## Instalacion

```bash
bun install
```

## Desarrollo local

```bash
bun run dev
```

La app corre en Vite y por defecto queda disponible en `http://localhost:5173/`.

Para probar el endpoint `/api/contact` localmente, usar Vercel Dev:

```bash
bun run dev:vercel
```

Esto levanta el servidor de Vercel en `http://localhost:3000` con las functions de `api/` disponibles.

## Scripts

```bash
bun run dev
bun run dev:vercel
bun run build
bun run preview
bun run lint
bun run format
bun run check
bun run fallow
bun run fallow:summary
bun run fallow:health
bun run quality
```

## Variables de entorno

Crear un archivo `.env.local` basado en `.env.example`.

```env
VITE_POSTHOG_KEY=phc_your_key_here
RESEND_API_KEY=re_your_key_here
CONTACT_FROM_EMAIL=Portfolio <onboarding@resend.dev>
CONTACT_TO_EMAIL=tu-correo@gmail.com
```

- `VITE_POSTHOG_KEY` se usa en el frontend para analytics
- `RESEND_API_KEY` se usa en `api/contact.ts` para enviar correos
- `CONTACT_FROM_EMAIL` define el remitente del correo enviado
- `CONTACT_TO_EMAIL` define el destinatario final del mensaje

## Contacto

El formulario del modal hace un `POST` a `/api/contact` con:

- `name` - nombre del remitente
- `reason` - motivo del contacto (`Oferta de trabajo`, `Colaboracion`, `Otro`)
- `email` - correo del remitente
- `message` - mensaje (10-500 caracteres)
- `website` - campo honeypot anti-spam (debe estar vacio)

El endpoint valida con Zod, aplica rate limiting (3 intentos por minuto) y envia el correo via Resend hacia la direccion configurada en `CONTACT_TO_EMAIL`.

## Deploy

El proyecto esta preparado para Vercel con `vercel.json`.

```bash
bun run build
```

Salida esperada:

- `dist/` como directorio de build

## Datos del portafolio

Si necesitas actualizar contenido visible, los lugares a tocar suelen ser:

- `src/data/portfolio.ts` para proyectos, certificaciones, experiencia y educacion
- `src/i18n/translations.ts` para textos de UI
- `src/components/cards/ProjectsCard.tsx` para comportamiento visual de proyectos

## Notas

- El proyecto usa animaciones sutiles con Motion.
- La informacion mostrada en la UI esta pensada para ser editable desde datos, no desde texto hardcodeado disperso.
- El doc `docs/MVP-Portfolio` corresponde a una version inicial de referencia; el estado actual del repositorio ya tiene mas alcance funcional que ese MVP.
