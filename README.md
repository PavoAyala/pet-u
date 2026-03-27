# PET-U Project

Este es un monorepo desarrollado con **Astro**, **Turborepo** y **Firebase** para el proyecto PET-U.

## Estructura del Proyecto

El proyecto se divide en diferentes paquetes bajo la carpeta `apps/` y `packages/`:

### Aplicaciones (`apps/`)

-   **`website`**: La página principal del sitio web de PET-U.
    -   **Tecnología**: Astro 5 (con modo **SSR** habilitado para Vercel).
    -   **Funcionalidad**: Muestra la tienda boutique, catálogo de productos y servicios en tiempo real desde Firestore.
-   **`admin`**: El panel de administración para gestionar el inventario.
    -   **Tecnología**: Astro (Client-side rendering).
    -   **Funcionalidad**: Permite crear, editar y eliminar productos de la boutique.

### Paquetes Compartidos (`packages/`)

-   **`firebase-config`**: Configuración centralizada de Firebase para que todas las aplicaciones usen la misma base de datos.

## Configuración de Firebase

-   **Proyecto ID**: `pet-u-fe87c`
-   **Colecciones principales**:
    -   `productos`: Almacena los artículos de la boutique (nombre, marca, precio, descripción, imagen, stock).

## Cómo empezar

### Requisitos

-   Node.js (v20+)
-   pnpm (v10+)

### Instalación

```bash
pnpm install
```

### Desarrollo Local

Para correr ambas aplicaciones (admin y website) simultáneamente:

```bash
pnpm dev
```

-   **Sitio Web**: `http://localhost:4321`
-   **Panel Admin**: `http://localhost:4001`

### Despliegue

El proyecto está configurado para desplegarse automáticamente:
-   **Website**: Desplegado en **Vercel** (`https://pet-u.vercel.app`).
-   **Admin**: Desplegado en **Firebase Hosting** (`https://pet-u-admin.web.app`).

---
Desarrollado para PET-U.
