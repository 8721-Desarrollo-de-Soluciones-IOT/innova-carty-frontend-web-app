# Innova Carty Console · Frontend Web Application

Consola web de operaciones para el administrador de tienda: monitoreo en tiempo real de la flota de carritos inteligentes (US11) y gestión del catálogo con pesos nominales y tolerancias (US13). Construida con Angular 22, TypeScript y Angular Material, a partir de los mock-ups del capítulo 5 del informe.

## Funcionalidades del Sprint 1

| Vista | Ruta | User Story |
| :--- | :--- | :--- |
| Inicio de sesión del personal | `/sign-in` | US11 |
| Dashboard (KPIs, sesiones por hora, alertas en vivo, estado de la flota) | `/dashboard` | US11 |
| Lista de carritos con filtros por estado y búsqueda | `/carts` | US11 |
| Detalle del carrito, discrepancia de peso y desbloqueo con PIN | `/carts/:id` | US11 |
| Alertas por tipo (geocerca, peso, RFID, dispositivos) | `/alerts` | US11 |
| Catálogo, edición de tolerancias y alta de productos | `/catalog` | US13 |

Las vistas de monitoreo se refrescan cada 5 segundos.

## Estructura (por bounded context)

```
src/app/
├── iam/          # Inicio de sesión, AuthService y guards
├── monitoring/   # Carritos, sesiones de compra, alertas y eventos (US11)
│   ├── domain/model/        # Entidades y reglas (peso, tolerancia, estados)
│   ├── application/         # CartSupervisionService (desbloqueo, auditoría)
│   ├── infrastructure/      # Clientes REST de /api/v1
│   └── presentation/        # Páginas y diálogos
├── catalog/      # Productos y tolerancias (US13)
└── shared/       # Layout, BaseApiService, polling y componentes comunes
server/           # API fake del Sprint 1 con json-server (db.json = datos semilla)
```

## Backend (Sprint 2)

La consola consume la API real **Innova Carty Platform** (Spring Boot en Render + PostgreSQL en Supabase), repositorio [`innova-carty-backend`](https://github.com/8721-Desarrollo-de-Soluciones-IOT/innova-carty-backend). La URL está en `src/environments/environment.ts`:

```ts
apiBaseUrl: 'https://innova-carty-backend.onrender.com/api/v1'
```

- Cada petición lleva el token JWT del inicio de sesión (`auth.interceptor.ts`). Si el token vence, la consola vuelve al login.
- Solo las cuentas de personal (`ADMIN`) entran a la consola. Las cuentas de comprador (`SHOPPER`) usan la app móvil.
- Los datos que reporta el carrito físico **CART-0427** (ESP32) aparecen en vivo: productos leídos por RFID, pagos de la app, bloqueos en la salida y alertas.
- En el plan gratuito de Render el backend se duerme tras 15 min sin uso; la primera petición tarda alrededor de un minuto.

**Cuenta demo:** `lucia.medina@retailco.pe` / `demo1234`, PIN de supervisor `2468`.

## Ejecutar en local

Requiere Node.js 22 o superior.

```bash
npm install
npm start          # consola en http://localhost:4200 contra el backend de Render
npm run start:fake # API fake del Sprint 1 (json-server en :3000) + consola
npm run api:reset  # vuelve a los datos semilla de la API fake
npm test           # pruebas unitarias (Vitest)
npm run build      # build de producción en dist/frontend-web-app
```

## Despliegue

Vercel, con el preset de Angular. `vercel.json` redirige todas las rutas a `index.html`; la API vive en Render.

## Convenciones

GitFlow (`main`, `develop`, `feature/*`, `release/*`, `hotfix/*`), Conventional Commits y Semantic Versioning. Estilo de código según la guía de Angular y Prettier (`.prettierrc`).
