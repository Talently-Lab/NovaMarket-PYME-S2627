import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ordersAPI } from '../../services/api';
import usePagination from '../../hooks/usePagination';
import Pagination from '../../components/ui/Pagination';

const PAGE_SIZE = 10;

const STATUS_LABELS = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

export default function OrdersAdminPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const {
    page,
    setPage,
    totalPages,
    pageItems: paginatedOrders,
  } = usePagination(orders, PAGE_SIZE);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError('');

        const { data } = await ordersAPI.getAllAdmin();

        setOrders(data.orders);
      } catch (error) {
        console.error(error);
        setError('No se pudieron cargar los pedidos.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);

      const { data } = await ordersAPI.updateStatus(
        orderId,
        newStatus
      );

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId
            ? { ...order, status: data.order.status }
            : order
        )
      );
    } catch (error) {
      console.error(error);
      setError('No se pudo actualizar el estado del pedido.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="admin-orders">
      <h1>Pedidos</h1>

      {loading && <p>Cargando pedidos...</p>}

      {error && <p>{error}</p>}

      {!loading && !error && (
        <>
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    No hay pedidos registrados.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>

                    <td>
                      <strong>{order.user_name}</strong>
                      <br />
                      <small>{order.user_email}</small>
                    </td>

                    <td>
                      {new Date(order.created_at).toLocaleDateString('es-AR')}
                    </td>

                    <td>
                      ${Number(order.total).toLocaleString('es-AR')}
                    </td>

                    <td>
                      <select
                        className={`status-select status-select--${order.status}`}
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(
                            order.id,
                            e.target.value
                          )
                        }
                        disabled={updatingId === order.id}
                      >
                        {Object.entries(STATUS_LABELS).map(
                          ([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          )
                        )}
                      </select>
                    </td>

                    <td>
                      <Link
                        to={`#`}
                        className="btn btn--secondary btn--sm"
                      >
                        Ver detalle
                      </Link>
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
            totalItems={orders.length}
            pageSize={PAGE_SIZE}
          />
        </>
      )}
    </div>
  );
}