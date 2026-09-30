import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI } from '../../services/api';
import usePagination from '../../hooks/usePagination';
import Pagination from '../../components/ui/Pagination';

const PAGE_SIZE = 10;

export default function ProductsAdminPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const {
    page,
    setPage,
    totalPages,
    pageItems: paginatedProducts,
  } = usePagination(products, PAGE_SIZE);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');

      const { data } = await productsAPI.getAllAdmin();

      setProducts(data.products);
    } catch (error) {
      console.error(error);
      setError('No se pudieron cargar los productos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      '¿Seguro que querés eliminar este producto?'
    );

    if (!confirmed) return;

    try {
      setError('');

      await productsAPI.remove(id);
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.id === id
            ? { ...product, is_active: false }
            : product
        )
      );
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.error ||
        'No se pudo eliminar el producto.'
      );
    }
  };

  return (
    <div className="admin-products">

      <div className="admin-products__header">
        <h1>Gestión de Productos</h1>

        <Link
          to="/admin/productos/nuevo"
          className="btn btn--primary"
        >
          + Nuevo producto
        </Link>
      </div>

      {error && (
        <p className="admin-error">
          {error}
        </p>
      )}

      {loading ? (
        <p>Cargando productos...</p>
      ) : (
        <>
          <table className="admin-table">

            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>

              {products.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    No hay productos registrados.
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((product) => (
                  <tr key={product.id}>

                    <td>
                      <strong>{product.name}</strong>
                    </td>

                    <td>
                      {product.category || 'Sin categoría'}
                    </td>

                    <td>
                      ${Number(product.price).toLocaleString('es-AR')}
                    </td>

                    <td>
                      {product.stock}
                    </td>

                    <td>
                      <div className="admin-table__actions">
                        <Link
                          to={`#`}
                          className="btn btn--secondary btn--sm"
                        >
                          Editar
                        </Link>

                        {product.is_active && (
                          <button
                            className="btn btn--danger btn--sm"
                            onClick={() => handleDelete(product.id)}
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>
                ))
              )}

            </tbody>

          </table>

          <Pagination
            page={page}
            totalPages={totalPages}
            onChange={setPage}
            totalItems={products.length}
            pageSize={PAGE_SIZE}
          />
        </>
      )}

    </div>
  );
}