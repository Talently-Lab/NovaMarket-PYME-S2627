import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ordersAPI, productsAPI } from '../../services/api';
import { usersAPI } from '../../services/api';

// Badge de estado de pedido
function StatusBadge({ status }) {
  const map = {
    entregado:  { label: 'Entregado',   color: '#22c55e' },
    pendiente:  { label: 'Pendiente',   color: '#7D1CE2' },
    procesando: { label: 'Procesando',  color: '#f59e0b' },
    cancelado:  { label: 'Cancelado',   color: '#ef4444' },
  };
  const s = map[status?.toLowerCase()] ?? { label: status, color: '#7D1CE2' };
  return (
    <span className="admin-badge" style={{ '--badge-color': s.color }}>
      {s.label}
    </span>
  );
}

export default function DashboardPage() {
  const [stats, setStats]   = useState({ ventas: null, pedidos: null, productos: null, clientes: null });
  const [orders, setOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      ordersAPI.getAllAdmin(),
      productsAPI.getAll(),
      usersAPI.getAllAdmin(),
    ]).then(([ordersRes, productsRes, usersRes]) => {
      console.log('orders:', ordersRes);
      console.log('products:', productsRes);
      console.log('users:', usersRes);
      if (ordersRes.status === 'fulfilled') {
        const allOrders = ordersRes.value.data.orders ?? [];
        // Solo cuentan confirmed, shipped y delivered (pending = sin confirmar, cancelled = anulado)
        const ventas = allOrders
          .filter(o => ['confirmed', 'shipped', 'delivered'].includes(o.status))
          .reduce((sum, o) => sum + Number(o.total ?? 0), 0);
        setStats(prev => ({
          ...prev,
          ventas,
          pedidos: allOrders.length,
        }));
        setOrders(allOrders.slice(0, 5));
      }
      if (productsRes.status === 'fulfilled') {
        const allProducts = productsRes.value.data.products ?? [];
        setStats(prev => ({ ...prev, productos: allProducts.length }));
        setTopProducts(allProducts.slice(0, 4));
      }
      if (usersRes.status === 'fulfilled') {
        const allUsers = usersRes.value.data.users ?? [];
        setStats(prev => ({ ...prev, clientes: allUsers.length }));
      }
    }).finally(() => setLoading(false));
  }, []);

  const fmt = (n) =>
    n == null ? '—' : Number(n).toLocaleString('es-AR', { minimumFractionDigits: 2 });

  const STAT_CARDS = [
    { label: 'Ventas del mes',       value: stats.ventas    != null ? `$${fmt(stats.ventas)}`    : '—' },
    { label: 'Pedidos nuevos',       value: stats.pedidos   != null ? String(stats.pedidos)       : '—' },
    { label: 'Productos activos',    value: stats.productos != null ? String(stats.productos)     : '—' },
    { label: 'Clientes registrados', value: stats.clientes  != null ? String(stats.clientes)      : '—' },
  ];

  return (
    <div className="admin-dashboard">

      {/* Título */}
      <div className="admin-dashboard__header">
        <h1 className="admin-dashboard__title">Dashboard Informativo</h1>
        <p className="admin-dashboard__subtitle">
          Resumen de operaciones y métricas generales del e-commerce.
        </p>
      </div>

      {/* Stat cards */}
      <div className="admin-stats-grid">
        {STAT_CARDS.map(({ label, value }) => (
          <div key={label} className="admin-stat-card">
            <span className="admin-stat-card__label">{label}</span>
            <span className="admin-stat-card__value">
              {loading ? '…' : value}
            </span>
          </div>
        ))}
      </div>

      {/* Tablas */}
      <div className="admin-tables-row">

        {/* Pedidos recientes */}
        <div className="admin-panel admin-panel--dark admin-panel--grow">
          <h2 className="admin-panel__title admin-panel__title--pink">Pedidos Recientes</h2>
          <div className="admin-orders-table-wrapper">
            <table className="admin-orders-table">
              <thead>
                <tr>
                  <th>#Pedido</th>
                  <th>Cliente</th>
                  <th>Fecha</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th className="text-right">Acción</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="admin-orders-table__empty">Cargando…</td></tr>
                ) : orders.length === 0 ? (
                  <tr><td colSpan={6} className="admin-orders-table__empty">Sin pedidos aún</td></tr>
                ) : (
                  orders.map((o) => (
                    <tr key={o.id}>
                      <td className="admin-orders-table__id">{o.id}</td>
                      <td>{o.user_name ?? o.user?.name ?? '—'}</td>
                      <td className="admin-orders-table__date">
                        {o.created_at
                          ? new Date(o.created_at).toLocaleDateString('es-AR')
                          : '—'}
                      </td>
                      <td className="admin-orders-table__total">${fmt(o.total)}</td>
                      <td><StatusBadge status={o.status} /></td>
                      <td className="text-right">
                        <Link
                          to={`/admin/pedidos`}
                          className="admin-orders-table__action"
                        >
                          Ver
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Productos más vendidos */}
        <div className="admin-panel admin-panel--dark admin-panel--fixed">
          <h2 className="admin-panel__title admin-panel__title--violet">
            Productos más vendidos
          </h2>
          <ul className="admin-top-products">
            {loading ? (
              <li className="admin-top-products__empty">Cargando…</li>
            ) : topProducts.length === 0 ? (
              <li className="admin-top-products__empty">Sin datos</li>
            ) : (
              topProducts.map((p) => (
                <li key={p.id} className="admin-top-products__item">
                  <span className="admin-top-products__name">{p.name}</span>
                  <span className="admin-top-products__qty">
                    {p.stock ?? '—'} unidades
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>

      </div>
    </div>
  );
}
