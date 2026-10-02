import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ordersAPI } from '../../services/api';

const fmt = (n) => Number(n ?? 0).toLocaleString('es-AR', { minimumFractionDigits: 2 });

const STATUS_MAP = {
  pending:   { label: 'Pendiente',  color: '#f59e0b', bg: 'rgba(245,158,11,0.12)'  },
  confirmed: { label: 'Confirmado', color: '#7D1CE2', bg: 'rgba(125,28,226,0.12)'  },
  shipped:   { label: 'En camino',  color: '#3b82f6', bg: 'rgba(59,130,246,0.12)'  },
  delivered: { label: 'Entregado',  color: '#22c55e', bg: 'rgba(34,197,94,0.12)'   },
  cancelled: { label: 'Cancelado',  color: '#ef4444', bg: 'rgba(239,68,68,0.12)'   },
};

const METHOD_LABEL = {
  tarjeta:       '💳 Tarjeta',
  billetera:     '📱 Billetera virtual',
  transferencia: '🏦 Transferencia',
};

const TABS = [
  { id: 'all',       label: 'Todos'      },
  { id: 'confirmed', label: 'Confirmados' },
  { id: 'shipped',   label: 'En camino'  },
  { id: 'delivered', label: 'Entregados' },
  { id: 'cancelled', label: 'Cancelados' },
];

function PackageIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" style={{ color: 'var(--color-text-disabled)' }}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
      <line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  );
}

function ChevronIcon({ open }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}
      aria-hidden="true">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  );
}

// ── Card individual con acordeón ──────────────────────────────────────────────
function OrderCard({ order }) {
  const [open, setOpen] = useState(false);
  const st = STATUS_MAP[order.status] ?? STATUS_MAP.pending;

  const totalFinal = order.total_with_tax ?? order.total ?? 0;
  const subtotal   = order.total ?? 0;
  const discount   = order.discount_amount ?? 0;
  const tax        = order.tax_amount ?? 0;

  return (
    <div className="ocard">

      {/* ── Cabecera siempre visible ── */}
      <div className="ocard__header" onClick={() => setOpen(o => !o)}>
        <div className="ocard__header-left">
          <span className="ocard__id">#{String(order.id).padStart(6, '0')}</span>
          <span className="ocard__date">
            {new Date(order.created_at).toLocaleDateString('es-AR', {
              day: '2-digit', month: 'short', year: 'numeric',
            })}
          </span>
        </div>

        <div className="ocard__header-right">
          <span className="ocard__total-preview">${fmt(totalFinal)}</span>
          <span className="ocard__badge" style={{ color: st.color, background: st.bg }}>
            {st.label}
          </span>
          <ChevronIcon open={open} />
        </div>
      </div>

      {/* ── Resumen colapsado (siempre visible debajo del header) ── */}
      <div className="ocard__summary">
        <span className="ocard__items-preview">
          {order.items?.length
            ? order.items.slice(0, 2).map(i => i.product_name).filter(Boolean).join(', ')
              + (order.items.length > 2 ? ` +${order.items.length - 2} más` : '')
            : 'Sin productos'}
        </span>
        {order.payment_method && (
          <span className="ocard__method">
            {METHOD_LABEL[order.payment_method] || order.payment_method}
            {order.card_last4 && ` · ****${order.card_last4}`}
          </span>
        )}
      </div>

      {/* ── Detalle expandible ── */}
      {open && (
        <div className="ocard__detail">

          {/* Productos */}
          <div className="ocard__section">
            <h4 className="ocard__section-title">Productos</h4>
            <div className="ocard__products">
              {order.items?.map((item, i) => (
                <div key={item.id ?? i} className="ocard__product">
                  <div className="ocard__product-info">
                    <span className="ocard__product-name">{item.product_name || `Producto #${item.product_id}`}</span>
                    <span className="ocard__product-qty">x{item.quantity}</span>
                  </div>
                  <span className="ocard__product-price">
                    ${fmt(item.unit_price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="ocard__divider" />

          {/* Desglose financiero */}
          <div className="ocard__section">
            <h4 className="ocard__section-title">Desglose</h4>
            <div className="ocard__breakdown">
              <div className="ocard__breakdown-row">
                <span>Subtotal</span>
                <span>${fmt(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="ocard__breakdown-row ocard__breakdown-row--discount">
                  <span>Descuento{order.coupon_code ? ` (${order.coupon_code})` : ''}</span>
                  <span>− ${fmt(discount)}</span>
                </div>
              )}
              {tax > 0 && (
                <div className="ocard__breakdown-row">
                  <span>IVA (21%)</span>
                  <span>${fmt(tax)}</span>
                </div>
              )}
              <div className="ocard__breakdown-row ocard__breakdown-row--total">
                <span>Total pagado</span>
                <span>${fmt(totalFinal)}</span>
              </div>
            </div>
          </div>

          <div className="ocard__divider" />

          {/* Envío y pago */}
          <div className="ocard__section ocard__section--row">
            <div>
              <h4 className="ocard__section-title">Envío</h4>
              <p className="ocard__info-text">
                {order.shipping_name && <>{order.shipping_name}<br /></>}
                {order.shipping_address && <>{order.shipping_address}<br /></>}
                {order.shipping_city && <>📍 {order.shipping_city}</>}
              </p>
            </div>
            {order.payment_method && (
              <div>
                <h4 className="ocard__section-title">Pago</h4>
                <p className="ocard__info-text">
                  {METHOD_LABEL[order.payment_method] || order.payment_method}
                  {order.card_last4 && <><br />****{order.card_last4}</>}
                  {order.installments > 1 && (
                    <><br />{order.installments} cuotas</>
                  )}
                </p>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function MyOrdersPage() {
  const { user } = useAuth();
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [tab,     setTab]     = useState('all');

  useEffect(() => {
    ordersAPI.getAll()
      .then(({ data }) => setOrders(data.orders ?? []))
      .catch(() => setError('No se pudieron cargar tus pedidos. Intentá de nuevo.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() =>
    tab === 'all' ? orders : orders.filter(o => o.status === tab),
    [orders, tab]
  );

  // Contar por estado para los tabs
  const counts = useMemo(() => {
    const c = { all: orders.length };
    orders.forEach(o => { c[o.status] = (c[o.status] ?? 0) + 1; });
    return c;
  }, [orders]);

  if (loading) {
    return (
      <div className="orders-state">
        <p className="orders-state__text">Cargando tus pedidos…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-state">
        <p className="form-error">{error}</p>
        <Link to="/" className="btn btn--primary" style={{ marginTop: 'var(--sp-4)' }}>
          Volver al inicio
        </Link>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="orders-state">
        <PackageIcon />
        <h1 className="orders-state__title">Todavía no hiciste pedidos</h1>
        <p className="orders-state__text">
          Explorá el catálogo y encontrá algo que te guste.
        </p>
        <Link to="/catalogo" className="btn btn--primary btn--lg">
          Explorar catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="orders-wrapper container">

      {/* Cabecera */}
      <div className="orders-header">
        <div>
          <h1 className="orders-title">Mis pedidos</h1>
          <p className="orders-subtitle">
            Hola, <strong>{user?.name?.split(' ')[0]}</strong> — {orders.length} {orders.length === 1 ? 'pedido realizado' : 'pedidos realizados'}
          </p>
        </div>
        <Link to="/catalogo" className="btn btn--primary btn--hero">
          + Seguir comprando
        </Link>
      </div>

      {/* Tabs */}
      <div className="orders-tabs">
        {TABS.filter(t => t.id === 'all' || counts[t.id]).map(t => (
          <button
            key={t.id}
            className={`orders-tab${tab === t.id ? ' orders-tab--active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
            {counts[t.id] > 0 && (
              <span className="orders-tab__count">{counts[t.id]}</span>
            )}
          </button>
        ))}
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="orders-state" style={{ minHeight: '30vh' }}>
          <p className="orders-state__text">No hay pedidos en esta categoría.</p>
        </div>
      ) : (
        <div className="orders-list">
          {filtered.map(order => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}

    </div>
  );
}
