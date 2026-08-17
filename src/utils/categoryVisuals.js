import {
  CupSoda,
  Cookie,
  Candy,
  Sparkles,
  Baby,
  SprayCan,
  ScrollText,
  Package,
  ShoppingBasket,
} from 'lucide-react';

// Icono + color de acento por categoría. Se usa como imagen de reemplazo
// (placeholder local) mientras no exista una fotografía real del producto
// en /public/productos/. En cuanto agregues una foto real en `imagen`,
// esta se muestra en su lugar automáticamente.
const VISUALS_BY_CATEGORY = {
  Bebidas: { icon: CupSoda, color: '#1f6f5c' },
  'Snacks y Dulces': { icon: Candy, color: '#e05226' },
  Galletas: { icon: Cookie, color: '#c17a2c' },
  Abarrotes: { icon: ShoppingBasket, color: '#8a6b2e' },
  'Higiene Personal': { icon: Sparkles, color: '#2c7da0' },
  'Cuidado del Bebé': { icon: Baby, color: '#c9698a' },
  'Limpieza del Hogar': { icon: SprayCan, color: '#3d7a5c' },
  Papel: { icon: ScrollText, color: '#6b6456' },
  Otros: { icon: Package, color: '#5c5f66' },
};

const DEFAULT_VISUAL = { icon: Package, color: '#5c5f66' };

export function getCategoryVisual(categoria) {
  return VISUALS_BY_CATEGORY[categoria] || DEFAULT_VISUAL;
}
