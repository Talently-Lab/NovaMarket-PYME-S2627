import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI, ordersAPI } from '../../services/api';

const STATUS_LABELS = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

export default function DashboardPage() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [ordersTotal, setOrdersTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError('');

        const [productsResponse, ordersResponse] = await Promise.all([
          productsAPI.getAllAdmin(),
          ordersAPI.getAllAdmin(),
        ]);

        setProducts(productsResponse.data.products);
        setOrders(ordersResponse.data.orders);
        setOrdersTotal(ordersResponse.data.total);
      } catch (error) {
        console.error(error);
        setError('No se pudieron cargar las estadísticas.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Cantidad de productos por categoría
  const productsByCategory = products.reduce((acc, product) => {
    const category = product.category || 'Sin categoría';

    acc[category] = (acc[category] || 0) + 1;

    return acc;
  }, {});

  // Cantidad de pedidos por estado
  const ordersByStatus = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;

    return acc;
  }, {});

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>

      {loading && <p>Cargando estadísticas...</p>}
      {error && <p>{error}</p>}

      {!loading && !error && (
        <div className="dashboard__stats">

          {/* Card Pedidos */}
          <div className="stat-card">
            <h3>Pedidos</h3>

            <p>
              Cantidad de pedidos: <strong>{ordersTotal}</strong>
            </p>

            <div className="stat-card__categories">
              <h4>Por estado</h4>

              {Object.entries(STATUS_LABELS).map(([status, label]) => (
                <div
                  key={status}
                  className={`stat-card__category stat-card__category--${status}`}
                >
                  <span>{label}</span>
                  <strong>{ordersByStatus[status] || 0}</strong>
                </div>
              ))}
            </div>

            <div className="stat-card__actions">
              <Link to="/admin/pedidos" className="btn btn--primary">
                Ver pedidos
              </Link>
            </div>
          </div>

          {/* Card Productos */}
          <div className="stat-card">
            <h3>Productos</h3>

            <p>
              Productos en total: <strong>{products.length}</strong>
            </p>

            <div className="stat-card__categories">
              <h4>Por categoría</h4>

              {Object.entries(productsByCategory).map(([category, total]) => (
                <div key={category} className="stat-card__category">
                  <span>{category}</span>
                  <strong>{total}</strong>
                </div>
              ))}
            </div>

            <div className="stat-card__actions">
               <Link to="/admin/productos/nuevo" className="btn btn--primary">
                  Cargar producto nuevo
               </Link>

             <Link to="/admin/productos"className="btn btn--primary">
                Gestionar productos
             </Link>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}