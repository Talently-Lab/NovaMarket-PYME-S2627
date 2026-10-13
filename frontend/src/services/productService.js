import { productsAPI } from './api';

/**
 * Lista de productos con filtros y paginación opcionales.
 * - category: nombre de categoría (opcional)
 * - options: { order, minPrice, maxPrice, page, limit }
 * Devuelve { products, total, page, totalPages }
 */
export async function getProducts(category, options = {}) {
  const params = { ...options };
  if (category) params.category = category;
  const { data } = await productsAPI.getAll(params);
  return {
    products:   data.products   ?? [],
    total:      data.total      ?? 0,
    page:       data.page       ?? 1,
    totalPages: data.totalPages ?? 1,
  };
}
/**
 * Un producto por id. Devuelve el producto.
 */
export async function getProductById(id) {
  const { data } = await productsAPI.getById(id);
  return data.product;
}
