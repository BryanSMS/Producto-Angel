// Ejecutar desde la raíz: node scripts/check-barcodes.js
// Los códigos siguientes son datos sintéticos de prueba. No se asignan a ningún
// producto del catálogo ni representan códigos EAN/UPC reales certificados.
import assert from 'node:assert/strict';
import { productos } from '../src/data/productos.js';
import { normalizeBarcode, isValidBarcode, findProductByBarcode } from '../src/utils/barcodes.js';

const fixtures = Object.freeze([
  Object.freeze({ id: 'TEST-A', barcode: '000123', barcodeFormat: null }),
  Object.freeze({ id: 'TEST-B', barcode: '123', barcodeFormat: null }),
  Object.freeze({ id: 'TEST-C', barcode: null, barcodeFormat: null }),
  Object.freeze({ id: 'TEST-D', barcode: ' 000456 ', barcodeFormat: null }),
]);

assert.equal(normalizeBarcode(' \t000123\r\n'), '000123');
assert.equal(normalizeBarcode('000123'), '000123');
assert.equal(normalizeBarcode('0'), '0');
assert.equal(normalizeBarcode('00 0123'), '00 0123');
assert.equal(normalizeBarcode('000-123'), '000-123');

for (const value of [null, undefined, '', ' \t\n', 123, 0, NaN, true, {}, ['000123']]) {
  assert.equal(normalizeBarcode(value), null);
  assert.equal(isValidBarcode(value), false);
  assert.equal(findProductByBarcode(fixtures, value), null);
}

for (const value of ['000123', ' 000123 ', '0']) {
  assert.equal(isValidBarcode(value), true);
}

for (const value of ['00 0123', '000-123', '12.3', '+123', '1e3', 'ABC123', '１２３']) {
  assert.equal(isValidBarcode(value), false);
  assert.equal(findProductByBarcode(fixtures, value), null);
}

assert.equal(findProductByBarcode(fixtures, ' \t000123\n'), fixtures[0]);
assert.equal(findProductByBarcode(fixtures, '123'), fixtures[1]);
assert.equal(findProductByBarcode(fixtures, '000456'), fixtures[3]);
assert.equal(findProductByBarcode(fixtures, '00123'), null);
assert.equal(findProductByBarcode(fixtures, '00012'), null);
assert.equal(findProductByBarcode(fixtures, '999999'), null);
assert.equal(findProductByBarcode(fixtures, 'TEST-A'), null);
assert.equal(findProductByBarcode([], '000123'), null);
assert.equal(findProductByBarcode(null, '000123'), null);
assert.equal(findProductByBarcode(undefined, '000123'), null);
assert.equal(findProductByBarcode({}, '000123'), null);
assert.equal(findProductByBarcode([null, {}, { barcode: 123 }], '123'), null);

// Una cifra adicional al inicio no debe resolverse como el mismo UPC/EAN.
const upcFixture = Object.freeze({ barcode: '012345678901', barcodeFormat: 'upc_a' });
assert.equal(findProductByBarcode([upcFixture], '012345678901'), upcFixture);
assert.equal(findProductByBarcode([upcFixture], '0012345678901'), null);

// El catálogo debe conservar los dos campos incluso cuando aún no hay código.
for (const product of productos) {
  assert.ok(Object.hasOwn(product, 'barcode'), `${product.id}: falta barcode`);
  assert.ok(Object.hasOwn(product, 'barcodeFormat'), `${product.id}: falta barcodeFormat`);
  assert.ok(product.barcode === null || isValidBarcode(product.barcode), `${product.id}: barcode inválido`);
  assert.ok(
    product.barcodeFormat === null || ['ean_13', 'ean_8', 'upc_a', 'upc_e'].includes(product.barcodeFormat),
    `${product.id}: barcodeFormat inválido`,
  );
}

console.log(`OK: normalización, validación, búsqueda exacta y modelo de ${productos.length} productos.`);
