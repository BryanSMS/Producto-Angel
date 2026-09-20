/**
 * Quita solo espacios exteriores y conserva todos los dígitos, incluidos ceros.
 * Devuelve null para cadenas vacías o valores que no sean strings. No convierte
 * números a texto: podrían haber perdido ceros antes de llegar a esta función.
 */
export function normalizeBarcode(value) {
  if (typeof value !== 'string') return null;
  return value.trim() || null;
}

/**
 * Valida únicamente que el valor sea texto no vacío compuesto por dígitos ASCII.
 * No comprueba longitud, formato EAN/UPC ni dígito de control en esta etapa.
 */
export function isValidBarcode(value) {
  const barcode = normalizeBarcode(value);
  return barcode !== null && /^[0-9]+$/.test(barcode);
}

/**
 * Devuelve el primer producto con coincidencia exacta tras normalizar, o null
 * si la entrada/colección no es válida o el código no está registrado.
 * No usa el id, los filtros visuales ni barcodeFormat; no convierte UPC/EAN.
 * No modifica la colección ni sus productos.
 */
export function findProductByBarcode(productos, value) {
  const barcode = normalizeBarcode(value);
  if (!Array.isArray(productos) || !isValidBarcode(barcode)) return null;

  return productos.find((product) => normalizeBarcode(product?.barcode) === barcode) ?? null;
}
