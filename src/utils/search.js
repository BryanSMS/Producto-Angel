// Normalizar texto: remover acentos y convertir a minúsculas
export function normalizeText(value = '') {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

// Filtrar productos por búsqueda
export function searchProducts(productos, query) {
  if (!query || !query.trim()) return productos;

  const normalizedQuery = normalizeText(query);

  return productos.filter((product) => {
    const searchFields = [
      product.nombre,
      product.marca,
      product.categoria,
      product.grupo,
      product.descripcion,
      product.id,
    ];

    return searchFields
      .map(normalizeText)
      .some((field) => field && field.includes(normalizedQuery));
  });
}

// Filtrar productos por categoría
export function filterByCategory(productos, categoria) {
  if (categoria === 'Todos') return productos;
  return productos.filter((product) => product.categoria === categoria);
}

// Filtrar productos por grupo/subcategoría
export function filterByGrupo(productos, grupo) {
  if (!grupo || grupo === 'Todos') return productos;
  return productos.filter((product) => product.grupo === grupo);
}

// Combinar búsqueda y filtro de categoría + grupo. El parámetro `grupo` es
// opcional para no romper llamadas existentes que solo filtran por categoría.
export function filterProducts(productos, searchQuery, categoria, grupo) {
  let filtered = filterByCategory(productos, categoria);
  filtered = filterByGrupo(filtered, grupo);
  filtered = searchProducts(filtered, searchQuery);
  return filtered;
}

// Lista de grupos/subcategorías disponibles para una categoría dada,
// calculada a partir de los productos reales (evita listas de grupos
// desincronizadas de los datos). Siempre incluye "Todos" como primera opción.
export function getGruposByCategoria(productos, categoria) {
  if (!categoria || categoria === 'Todos') return ['Todos'];

  const grupos = [];
  productos.forEach((product) => {
    if (product.categoria === categoria && product.grupo && !grupos.includes(product.grupo)) {
      grupos.push(product.grupo);
    }
  });

  return ['Todos', ...grupos];
}
