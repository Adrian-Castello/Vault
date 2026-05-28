# Vault — Suscripciones & Financiaciones 

Dashboard responsive para trackear suscripciones recurrentes y financiaciones a plazos sin intereses. Despliegue en GitHub Pages, persistencia en Supabase.

> **Stack:** React 18 · Vite · TypeScript · Tailwind v3 · Supabase · Recharts · Framer Motion · lucide-react

---

## ✨ Características

- **Dashboard** con próximos cobros (7 días), KPIs y gráfico de evolución a 12 meses.
- **Suscripciones**: ciclos mensual / trimestral / anual, normalizado a coste mensual equivalente.
- **Financiaciones**: cuotas, progreso visual, fecha de fin calculada, deuda pendiente.
- **Modo claro y oscuro** cuidados, con persistencia local y respeto a `prefers-color-scheme`.
- **Responsive mobile-first**: bottom-nav en móvil, sidebar en desktop.
- Animaciones suaves, microinteracciones y estados vacíos/cargando trabajados.

---

## 🚀 Setup local

### 1. Clonar e instalar

```bash
git clone https://github.com/<tu-usuario>/<tu-repo>.git
cd <tu-repo>
npm install
```

### 2. Variables de entorno

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales de Supabase:

```
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

Las encuentras en tu proyecto de Supabase → **Settings → API**.

### 3. Crear las tablas en Supabase

Abre el **SQL Editor** en tu proyecto de Supabase y ejecuta el contenido del archivo [`supabase.sql`](./supabase.sql). Esto crea:

- Tabla `subscriptions` (suscripciones recurrentes).
- Tabla `financings` (financiaciones a plazos).
- Políticas RLS permisivas para el rol `anon` (la app aún no tiene login; ver **siguiente paso**).

### 4. Arrancar en desarrollo

```bash
npm run dev
```

La app abre en `http://localhost:5173`.

---

## 🗄️ Esquema de la base de datos

### `subscriptions`

| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid (PK) | `gen_random_uuid()` |
| `name` | text | obligatorio |
| `emoji` | text | elegido por el usuario |
| `price` | numeric(10,2) | en € |
| `billing_cycle` | text | `monthly` / `quarterly` / `yearly` |
| `next_charge_date` | date | próximo cobro |
| `created_at` | timestamptz | `now()` |

### `financings`

| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid (PK) | `gen_random_uuid()` |
| `name` | text | obligatorio |
| `emoji` | text | elegido por el usuario |
| `total_amount` | numeric(10,2) | importe total financiado |
| `monthly_payment` | numeric(10,2) | cuota mensual |
| `total_installments` | int | nº total de cuotas |
| `paid_installments` | int | cuotas pagadas (default 0) |
| `next_charge_date` | date | próximo cobro |
| `end_date` | date | fecha de fin (calculada al guardar) |
| `created_at` | timestamptz | `now()` |

---

## 🔐 Sobre RLS y auth

El SQL inicial deja **RLS habilitada** con políticas permisivas para `anon`. Es decir, **cualquiera con la URL y la anon key puede leer/escribir**. Esto está bien para un uso personal mientras no haya login, pero **no lo dejes así si vas a compartir la URL**.

Cuando quieras añadir autenticación:

1. Añade una columna `user_id uuid references auth.users` a ambas tablas.
2. Reemplaza las políticas por algo como:
   ```sql
   create policy "users_own_subscriptions"
       on public.subscriptions
       for all
       to authenticated
       using (auth.uid() = user_id)
       with check (auth.uid() = user_id);
   ```
3. En `src/hooks/useSubscriptions.ts` y `useFinancings.ts`, añade `user_id: (await supabase.auth.getUser()).data.user!.id` al insertar.
4. Cambia `persistSession: false` por `true` en `src/lib/supabase.ts`.

El código está estructurado para que ese cambio sea mínimo.

---

## 🌐 Despliegue en GitHub Pages

### 1. Configurar la URL base

GitHub Pages sirve los repos en `https://<usuario>.github.io/<repo>/`, así que Vite necesita saber el subpath. En `vite.config.ts`:

```ts
base: process.env.VITE_BASE_PATH ?? '/vault/'
```

Cambia el fallback al nombre exacto de tu repo (con barras al inicio y final), **o** define la variable `VITE_BASE_PATH` en GitHub.

> Si despliegas en una **custom domain** (`vault.tudominio.com`), pon `base: '/'`.

### 2. Configurar Pages en el repo

1. En GitHub → **Settings → Pages**.
2. **Source**: "GitHub Actions".

### 3. Añadir secrets y variables

En **Settings → Secrets and variables → Actions**:

**Secrets (Repository secrets):**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

**Variables (Repository variables):**
- `VITE_BASE_PATH` → `/<nombre-del-repo>/` (con barras al inicio y final). Solo es necesaria si tu fallback en `vite.config.ts` no coincide con el nombre del repo.

### 4. Push y deploy

```bash
git add .
git commit -m "feat: initial dashboard"
git push origin main
```

El workflow `.github/workflows/deploy.yml` se encarga del resto:

- Instala dependencias con `npm ci`.
- Construye con `npm run build`.
- Copia `dist/index.html` a `dist/404.html` (fallback para que el router funcione al refrescar URLs profundas).
- Sube el artefacto y publica.

Tu app quedará viva en `https://<usuario>.github.io/<repo>/`.

---

## 🧮 Lógica financiera (resumen)

Todo vive en [`src/lib/calculations.ts`](./src/lib/calculations.ts), con funciones puras y testeables:

- **`monthlyCostOfSubscription(sub)`** — `monthly` → precio, `quarterly` → precio/3, `yearly` → precio/12.
- **`totalMonthlySubscriptions(subs)`** — suma normalizada a mes.
- **`totalMonthlyFinancings(fins)`** — suma de cuotas de financiaciones aún activas (`paid < total`).
- **`totalRemainingDebt(fins)`** — `(total - paid) × cuota`, para todas.
- **`upcomingCharges(subs, fins, days)`** — cobros que caen en la próxima ventana de días.
- **`projectMonthlySpend(subs, fins, 12)`** — proyección mes a mes para el gráfico. Las suscripciones trimestrales y anuales solo aportan en su mes correspondiente. Las financiaciones dejan de aportar al completarse.

Todas las fechas se manejan en **horario local** (helpers en `src/lib/dates.ts`) para evitar los desplazamientos de día típicos de `new Date('YYYY-MM-DD')` en timezones no-UTC.

---

## 📁 Estructura del proyecto

```
src/
├── components/
│   ├── Dashboard/         # Upcoming7Days, KpiGrid, SpendChart
│   ├── Subscriptions/     # SubscriptionList, SubscriptionItem, SubscriptionForm
│   ├── Financings/        # FinancingList, FinancingItem, FinancingForm
│   └── ui/                # Modal, Button, Input, EmojiPicker, ThemeToggle,
│                          # BottomNav, Sidebar, Toaster, Skeleton, FAB…
├── lib/
│   ├── supabase.ts        # Cliente
│   ├── calculations.ts    # Funciones puras de cálculo
│   ├── dates.ts           # Helpers de fechas (local-time)
│   └── types.ts           # Tipos del dominio
├── hooks/
│   ├── useSubscriptions.ts
│   ├── useFinancings.ts
│   ├── useTheme.ts
│   └── useToast.tsx
├── pages/
│   ├── DashboardPage.tsx
│   ├── SubscriptionsPage.tsx
│   └── FinancingsPage.tsx
├── App.tsx
├── main.tsx
└── index.css

.github/workflows/deploy.yml   # CI a GitHub Pages
supabase.sql                   # Esquema de la BD
.env.example                   # Plantilla de variables
```

---

## 🛠️ Scripts

```bash
npm run dev       # Servidor de desarrollo
npm run build     # Compila a dist/
npm run preview   # Sirve el build localmente
npm run lint      # Type-check con TypeScript
```

---

## 📝 Licencia

MIT — úsalo como te sirva.
