# PET-U Project

This is a monorepo built with **Astro**, **Turborepo**, and **Firebase** for the PET-U project.

## Project Structure

The project is divided into different packages under the `apps/` and `packages/` folders:

### Applications (`apps/`)

-   **`website`**: The main PET-U website.
    -   **Technology**: Astro 5 (with **SSR** enabled for Vercel).
    -   **Functionality**: Displays the boutique store, product catalog, and services in real time from Firestore.
-   **`admin`**: The administration panel for managing inventory.
    -   **Technology**: Astro (client-side rendering).
    -   **Functionality**: Allows creating, editing, and deleting boutique products.

### Shared Packages (`packages/`)

-   **`firebase-config`**: Centralized Firebase configuration so all applications use the same database.

## Firebase Configuration

-   **Project ID**: `pet-u-fe87c`
-   **Main collections**:
    -   `productos`: Stores boutique items (name, brand, price, description, image, stock).

## Getting Started

### Requirements

-   Node.js (v20+)
-   pnpm (v10+)

### Installation

```bash
pnpm install
```

### Local Development

To run both applications (admin and website) together with the local emulators:

```bash
pnpm dev
```

This command automatically starts:
-   **Terminal 1**: Firebase emulators (Auth, Firestore, UI).
-   **Terminal 2**: Development servers for `website` and `admin`.

### Deployment

The project is configured to deploy automatically:
-   **Website**: Deployed on **Vercel** (`https://pet-u.vercel.app`).
-   **Admin**: Deployed on **Firebase Hosting** (`https://pet-u-admin.web.app`).

---
Built for PET-U.
