# Producto Angel — Vitrina Digital — Resumen de entrega

## 1. Resumen de lo que cambié

Partí de tu proyecto React/Vite existente (que ya tenía una arquitectura sólida:
componentes separados, búsqueda, filtro de categorías, modal, animaciones) y lo
adapté de "catálogo de bisutería" a **vitrina de minimarket/abarrotes**, con un
rediseño visual completo y soporte PWA/offline real.

No se agregó carrito, checkout, pagos, login ni backend — sigue siendo una
vitrina de consulta de precios, tal como pediste.

**Dirección de diseño:** paleta "bodega de barrio" (verde tienda `#1f6f5c` +
naranja de etiqueta de precio `#ff6a3d` sobre fondo cálido), con una etiqueta
de precio "perforada" como elemento distintivo (evoca el ticket de precio
físico de una tienda), en vez de las cards de ecommerce genéricas.

## 2. Archivos modificados

- `vite.config.mjs` — agregado el plugin PWA (manifest + service worker).
- `index.html` — meta tags PWA, iconos, sin fuentes externas.
- `src/main.jsx` — registro del service worker.
- `src/index.css` — nuevos tokens de color/tipografía/radios (paleta minimarket).
- `src/App.jsx` / `App.css` — se agregó la fila de destacados; se quitó una
  regla CSS frágil (`nth-child`) que dependía de la posición exacta de las
  secciones.
- `src/data/productos.js` — nuevo modelo de datos y categorías (ver abajo).
- `src/utils/search.js` — búsqueda ahora incluye marca, grupo y código.
- `src/components/Header.jsx/.css` — nombre de tienda configurable.
- `src/components/HeroMessage.jsx` — texto configurable.
- `src/components/Footer.jsx` — texto configurable.
- `src/components/ProductCard.jsx/.css` — rediseño completo (etiqueta de
  precio, badges de destacado/oferta, overlay de agotado).
- `src/components/ProductModal.jsx/.css` — rediseño completo (marca, unidad,
  categoría/grupo, código, disponibilidad).
- `src/components/CategoryFilter.css`, `SearchBar.css`, `EmptyState.css` —
  colores actualizados a la nueva paleta.
- `public/icon.svg`, `public/icon-light-32x32.png`, `public/icon-dark-32x32.png`,
  `public/apple-icon.png` — nuevo ícono de marca.

## 3. Archivos nuevos

- `src/config/tienda.js` — nombre, eslogan y textos de la tienda en un solo lugar.
- `src/utils/categoryVisuals.js` — mapeo de categoría → ícono/color para las
  imágenes de reemplazo.
- `src/components/ProductImage.jsx/.css` — imagen de producto con fallback
  local automático (ver sección de imágenes).
- `src/components/FeaturedRow.jsx/.css` — fila de destacados con scroll
  horizontal en el inicio.
- `public/icons/icon-192.png`, `icon-512.png`, `icon-512-maskable.png` —
  íconos requeridos por el manifest PWA.

### Eliminado
Se quitaron archivos que no pertenecían a este proyecto Vite (restos de
scaffolding: `components/ui/button.tsx`, `lib/utils.ts`, placeholders de
Next.js sin uso) y las fotos de bisutería/peluches que ya no aplican al
nuevo rubro.

## 4. Arquitectura final

```
src/
  config/
    tienda.js          ← nombre y textos de la tienda
  data/
    productos.js        ← TODOS los productos y categorías viven aquí
  components/
    Header, HeroMessage, SearchBar, CategoryFilter, FeaturedRow,
    ResultCounter, ProductGrid, ProductCard, ProductImage,
    ProductModal, EmptyState, Footer  (cada uno con su .css)
  hooks/
    useIntersectionAnimation.js
  utils/
    search.js            ← búsqueda y filtro por categoría
    formatters.js         ← formato de precio en soles
    categoryVisuals.js    ← ícono/color por categoría (placeholders)
public/
  productos/              ← AQUÍ van tus fotos reales
  icons/                   ← íconos de la PWA
```

La lógica de datos está completamente separada de los componentes: agregar,
quitar o modificar productos nunca requiere tocar código de UI.

## 5. Cómo agregar un producto nuevo

Abre `src/data/productos.js` y agrega un objeto al arreglo `productos`:

```js
{
  id: 'BEB-012',
  nombre: 'Sprite',
  marca: 'Sprite',
  categoria: 'Bebidas',      // debe existir en `categorias`
  grupo: 'Gaseosas',         // subcategoría libre, solo informativa/búsqueda
  precio: 3.5,
  precioAnterior: null,      // pon un número si está en oferta
  unidad: '500 ml',
  imagen: '/productos/beb-012.webp',
  descripcion: 'Gaseosa sabor limón.',
  destacado: false,
  disponible: true,
}
```

Aparece automáticamente en el catálogo, en la búsqueda y en su categoría.

## 6. Cómo cambiar una imagen

Coloca el archivo en `public/productos/` (idealmente `.webp`, cuadrado, mismo
ancho que alto) y actualiza el campo `imagen` del producto con esa ruta,
por ejemplo `/productos/beb-001.webp`. Si el archivo no existe o falla al
cargar, la tarjeta muestra automáticamente un ícono de la categoría en vez de
un espacio roto — no necesitas subir todas las fotos de una sola vez.

## 7. Cómo cambiar un precio

Edita el campo `precio` del producto en `src/data/productos.js`. Si quieres
marcarlo en oferta, llena también `precioAnterior` con el precio anterior
(debe ser mayor al precio actual) y la tarjeta mostrará el precio tachado y
el badge "Oferta" automáticamente.

## 8. Cómo agregar una categoría

1. Agrega el nombre al arreglo `categorias` en `src/data/productos.js`.
2. (Opcional pero recomendado) agrega un ícono/color para esa categoría en
   `src/utils/categoryVisuals.js`, así los productos sin foto real muestran
   un ícono acorde en vez del ícono genérico.

## 9. Cómo activar/usar la PWA

Ya está activada. Al ejecutar `npm run build` se genera automáticamente:
- `manifest.webmanifest` (nombre, ícono, color de tema)
- `sw.js` (service worker) que cachea el HTML/CSS/JS y las fotos de
  `public/productos/`

Para instalarla en un celular: abre la URL publicada en Chrome/Safari →
menú → **"Agregar a pantalla de inicio" / "Instalar app"**. Se abrirá como
una app independiente, sin barra del navegador.

## 10. Limitaciones reales del modo offline y del QR

**A) Funcionamiento offline después de la primera carga — sí, funciona.**
Una vez que el celular visitó la vitrina con internet (o wifi local) al
menos una vez, el service worker guarda el HTML, CSS, JS y las fotos de
producto en el propio dispositivo. Después de eso, el catálogo se puede
seguir abriendo y usando **sin internet**, incluyendo búsqueda y filtros
(todo corre en el dispositivo, no hay backend).

**B) Un código QR por sí solo NO carga una web sin ningún tipo de red.**
Un QR solo contiene una URL de texto; el teléfono necesita algún tipo de
conexión (datos móviles, wifi con internet, o wifi local sin internet) para
poder pedir esa URL la primera vez. Después de esa primera carga, el modo
offline del punto A) sí aplica.

Dos formas de usar el QR en la práctica:
- **QR hacia una URL pública + PWA** (recomendado): publicas la vitrina en
  un hosting (Vercel, Netlify, GitHub Pages, etc.), generas un QR hacia esa
  URL. Los clientes la abren una vez con datos/wifi, y desde ahí puede
  funcionar sin conexión.
- **QR hacia un servidor local:** si no quieres depender de internet en
  absoluto (ej. tienda sin buena señal), puedes montar la build (`dist/`)
  en un mini servidor dentro de tu propia red wifi local (un router con
  almacenamiento, una laptop, un Raspberry Pi, etc.) y el QR apunta a esa
  IP local. Los clientes se conectan a tu wifi de tienda (sin salida a
  internet) y cargan la vitrina desde ahí.

No implementé el generador de QR todavía — la app ya está lista para eso
(URL estable + PWA); lo dejamos para cuando definas el hosting final.

## 11. Comando para ejecutar el proyecto (desarrollo)

```bash
npm install
npm run dev
```

## 12. Comando para generar el build de producción

```bash
npm run build
npm run preview   # opcional, para probar el build de producción localmente
```

El resultado queda en `dist/` — eso es lo que subes al hosting.
