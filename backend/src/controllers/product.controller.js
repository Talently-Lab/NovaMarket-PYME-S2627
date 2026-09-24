const ProductModel = require('../models/product.model');

/**
 * GET /api/products
 * Lista productos activos con filtros opcionales
 * Público — no requiere autenticación
 */
async function getProducts(req, res) {
  const { category, minPrice, maxPrice, order } = req.query;

  const products = await ProductModel.findAll({
    category,
    minPrice: minPrice ? parseFloat(minPrice) : undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    order,
  });

  return res.status(200).json({ products, total: products.length });
}

/**
 * GET /api/products/:id
 * Detalle de un producto
 * Público — no requiere autenticación
 */
async function getProductById(req, res) {
  const { id } = req.params;

  if (isNaN(id)) {
    return res.status(400).json({ error: 'El ID del producto debe ser un número.' });
  }

  const product = await ProductModel.findById(Number(id));

  if (!product) {
    return res.status(404).json({ error: 'Producto no encontrado.' });
  }

  return res.status(200).json({ product });
}

/**
 * GET /api/admin/products
 * Lista TODOS los productos (incluye inactivos) — solo admin
 */
async function getProductsAdmin(req, res) {
  const products = await ProductModel.findAllAdmin();
  return res.status(200).json({ products, total: products.length });
}

/**
 * POST /api/admin/products
 * Crea un nuevo producto — solo admin
 */
async function createProduct(req, res) {
  const { name, description, price, stock, category, image_url } = req.body;

  // Validaciones
  if (!name || !price || !category) {
    return res.status(400).json({ error: 'Nombre, precio y categoría son requeridos.' });
  }

  if (isNaN(price) || price < 0) {
    return res.status(400).json({ error: 'El precio debe ser un número positivo.' });
  }

  if (stock !== undefined && (isNaN(stock) || stock < 0)) {
    return res.status(400).json({ error: 'El stock debe ser un número positivo.' });
  }

  const product = await ProductModel.create({
    name,
    description,
    price: parseFloat(price),
    stock: stock ? parseInt(stock) : 0,
    category,
    image_url,
  });

  return res.status(201).json({
    message: 'Producto creado exitosamente.',
    product,
  });
}

/**
 * PUT /api/admin/products/:id
 * Actualiza un producto — solo admin
 */
async function updateProduct(req, res) {
  const { id } = req.params;

  if (isNaN(id)) {
    return res.status(400).json({ error: 'El ID del producto debe ser un número.' });
  }

  const existing = await ProductModel.findById(Number(id), true);
  if (!existing) {
    return res.status(404).json({ error: 'Producto no encontrado.' });
  }

  const { name, description, price, stock, category, image_url, is_active } = req.body;

  if (price !== undefined && (isNaN(price) || price < 0)) {
    return res.status(400).json({ error: 'El precio debe ser un número positivo.' });
  }

  const updated = await ProductModel.update(Number(id), {
    name,
    description,
    price: price !== undefined ? parseFloat(price) : undefined,
    stock: stock !== undefined ? parseInt(stock) : undefined,
    category,
    image_url,
    is_active,
  });

  return res.status(200).json({
    message: 'Producto actualizado correctamente.',
    product: updated,
  });
}

/**
 * DELETE /api/admin/products/:id
 * Soft delete de un producto — solo admin
 */
async function deleteProduct(req, res) {
  const { id } = req.params;

  if (isNaN(id)) {
    return res.status(400).json({ error: 'El ID del producto debe ser un número.' });
  }

  const deleted = await ProductModel.softDelete(Number(id));

  if (!deleted) {
    return res.status(404).json({ error: 'Producto no encontrado.' });
  }

  return res.status(200).json({ message: 'Producto eliminado correctamente.' });
}

module.exports = {
  getProducts,
  getProductById,
  getProductsAdmin,
  createProduct,
  updateProduct,
  deleteProduct,
};
