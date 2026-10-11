import { productsAPI } from './api';

/**
 * Lista de productos.
 * - category: nombre de categoría (opcional). Sin valor trae todas.
 * - options: filtros extra del backend ({ order, minPrice, maxPrice }).
 * Devuelve siempre un array (vacío si la API no trae productos).
 */
export async function getProducts(category, options = {}) {
  const params = { ...options };
  if (category) params.category = category;
  const { data } = await productsAPI.getAll(params);
  return data.products ?? [];
}

/**
 * Un producto por id. Devuelve el producto.
 * Si no existe, el error de Axios llega con response.status 404 para que la página lo muestre.
 */
export async function getProductById(id) {
  const { data } = await productsAPI.getById(id);
  return data.product;
}
