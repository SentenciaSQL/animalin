# Animalin

Plataforma SaaS multi-tenant para clínicas veterinarias y propietarios de mascotas.

- **Backend:** Java 21, Spring Boot 3.5, Spring Security, JWT + refresh tokens, JPA/Hibernate, Flyway, PostgreSQL (H2 en desarrollo), OpenAPI.
- **Web:** Angular 19, Tailwind CSS, ngx-translate (español por defecto / inglés).
- **Móvil:** Flutter para propietarios, misma API REST.
- **Multi-tenant:** base de datos compartida, esquema compartido, `tenant_id`. El tenant se resuelve desde el JWT, nunca desde un identificador enviado por el cliente.

```
Angular + Flutter  →  Spring Boot /api/v1  →  PostgreSQL
                              ↓
                    TenantContext (JWT → usuario → tenant)
```

## Requisitos

- JDK 21 y Maven Wrapper (`backend/mvnw`)
- Node.js 22 (frontend)
- Flutter 3.24+ (app móvil)
- Docker (opcional, para PostgreSQL o el stack completo)

## Variables de entorno

| Variable | Descripción | Valor de desarrollo |
| --- | --- | --- |
| `SPRING_PROFILES_ACTIVE` | `dev` (H2), `postgres`, `test` | `dev` |
| `DATABASE_URL` | JDBC PostgreSQL | `jdbc:postgresql://localhost:5432/animalin` |
| `DATABASE_USER` | Usuario PostgreSQL | `animalin` |
| `DATABASE_PASSWORD` | Contraseña PostgreSQL | `animalin` |
| `ANIMALIN_JWT_SECRET` | Secreto JWT (≥ 256 bits) | solo desarrollo |
| `API_URL` | Base URL Flutter (`--dart-define`) | `http://localhost:8080/api/v1` |

En desarrollo el perfil `dev` usa H2 en `backend/data/animalin` (modo PostgreSQL). No hace falta PostgreSQL para arrancar el API en local.

## Multi-tenancy y seguridad

- Usuarios globales en `users`. La pertenencia a una clínica está en `tenant_memberships`.
- El personal de clínica recibe `tenantId` en el JWT. Los propietarios pueden relacionarse con varias clínicas (`tenantId` nulo en el token, acceso por mascota/membresía).
- `SUPER_ADMIN` no opera datos clínicos de un tenant.
- Los repositorios y `AccessGuard` filtran siempre por tenant. Un ID de otra clínica responde **404**, no 403, para no filtrar existencia.
- Recurso de ejemplo: `GET /api/v1/pets` (el backend aplica el tenant). No usar `/tenants/{id}/pets` para personal autenticado.
- Branding dinámico: `GET /api/v1/settings/branding` (sesión) y `GET /api/v1/public/tenants/{slug}/branding` (login de clínica). Si no hay logo, Angular y Flutter muestran la marca Animalin.

## Roles

`SUPER_ADMIN` · `TENANT_ADMIN` · `VETERINARIAN` · `RECEPTIONIST` · `PET_OWNER`

La recepción no tiene `MEDICAL_RECORD_READ` / `WRITE` por defecto.

## Datos de demostración

Contraseña común: **`Admin123!`**

| Email | Rol | Clínica |
| --- | --- | --- |
| `leo.a@example.org` | SUPER_ADMIN | plataforma |
| `tina.r@example.net` | TENANT_ADMIN | san-martin |
| `emma.t@example.net` | VETERINARIAN | san-martin |
| `nathan.k@example.net` | RECEPTIONIST | san-martin |
| `emma.t@example.net` | PET_OWNER | san-martin (Luna) |
| `rachel.c@example.org` | TENANT_ADMIN | huellitas |
| `walt.e@example.net` | PET_OWNER | huellitas |
| `xavier.y@example.org` | PET_OWNER | ambas clínicas |

Login de clínica con branding: `http://localhost:4200/login/san-martin`

OpenAPI: `http://localhost:8080/swagger-ui.html`

## Backend

```bash
cd backend
./mvnw spring-boot:run
# pruebas (incluye aislamiento multi-tenant)
./mvnw test
```

Migraciones Flyway en `backend/src/main/resources/db/migration/`.

## Frontend Angular

```bash
cd web
npm install
npm start          # proxy /api → http://localhost:8080
npm run build
```

Tema claro / oscuro / sistema. Idioma: preferencia de usuario → clínica → `es`.

## Flutter

```bash
cd mobile
flutter create . --project-name animalin
flutter pub get
flutter run --dart-define=API_URL=http://10.0.2.2:8080/api/v1
```

En iOS simulador use `http://localhost:8080/api/v1`. FCM queda preparado en `lib/core/push.dart` (registrar token en `POST /api/v1/notifications/push-token`).

## Docker

```bash
# API + PostgreSQL + panel web
docker compose up --build
```

El panel queda en `http://localhost:4200` y el API en `http://localhost:8080`.

## Internacionalización

Archivos:

- Angular: `web/public/assets/i18n/{es,en}.json`
- Flutter: `mobile/assets/i18n/{es,en}.json`

## Arquitectura de módulos (API)

`auth`, `users`, `tenants`, `plans`, `branches`, `owners`, `pets`, `appointments`, `medical`, `documents`, `messaging`, `notifications`, `reports`, `admin`, `audit`, `storage`.

Los archivos clínicos se guardan fuera de PostgreSQL (disco local en desarrollo; listo para S3/Cloudinary). Ruta lógica: `/tenants/{tenantId}/pets/{petId}/documents/`.
