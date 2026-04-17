# Reglas del Agente PET-U

## 🔐 Manejo de Claves y Variables Sensibles

- **NUNCA** se deben incluir claves API, credenciales o cualquier información sensible directamente en el código fuente (hardcoded).
- Todas las variables sensibles deben gestionarse a través de archivos **`.env`**.
- En proyectos Astro, las variables accesibles desde el cliente deben llevar el prefijo **`PUBLIC_`** (ej. `PET_U_MAPS`).

## 🚀 Astro y Ciclo de Vida

- Para que los scripts funcionen tras una navegación suave (Transitions), se debe usar `document.addEventListener('astro:page-load', ...)` para reinicializar comportamientos.
- Preferir el uso de componentes `Astro` en lugar de fragmentos HTML puros cuando la lógica sea reutilizable.

## 🎨 Estética y Diseño (PET-U Brand)

- Mantener la estética **Premium y Orgánica** de PET-U: uso de colores verdes profundos (`#3C4F35`), tonos arena (`#fdfbf7`) y tipografías Serif para títulos elegantes.
- Todas las interacciones deben incluir micro-animaciones (hover effects, transiciones suaves, sutiles zooms).
- Los modales deben usar un backdrop blur y animaciones de entrada (`zoomIn`).

## 🛠️ Organización de Código y Naming

- Los IDs de los elementos HTML deben ser únicos y descriptivos (ej. `id="bookingModalSubmit"` en vez de `id="submit"`).
- Mantener las funciones de carga de librerías externas (como Google Maps) de forma condicional para optimizar el rendimiento.
- El lenguaje principal de la interfaz y los comentarios de negocio debe ser **Español**.

## 🔥 Firebase y Base de Datos

- Las operaciones con Realtime Database o Firestore deben incluir manejo de errores (`try/catch`) y estados de carga visibles para el usuario.
- Seguir la estructura de datos establecida (ej. objeto `happyBus` dentro de `reservations`).
