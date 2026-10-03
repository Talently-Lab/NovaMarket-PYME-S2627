import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { useAuth } from '../../context/AuthContext';
import { ordersAPI } from '../../services/api';

const fmt    = (n) => Number(n ?? 0).toLocaleString('es-AR', { minimumFractionDigits: 2 });
const fmtPDF = (n) => Number(n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const STATUS_MAP = {
  pending:   { label: 'Pendiente',  color: '#f59e0b', bg: 'rgba(245,158,11,0.12)'  },
  confirmed: { label: 'Confirmado', color: '#7D1CE2', bg: 'rgba(125,28,226,0.12)'  },
  shipped:   { label: 'En camino',  color: '#3b82f6', bg: 'rgba(59,130,246,0.12)'  },
  delivered: { label: 'Entregado',  color: '#22c55e', bg: 'rgba(34,197,94,0.12)'   },
  cancelled: { label: 'Cancelado',  color: '#ef4444', bg: 'rgba(239,68,68,0.12)'   },
};

const METHOD_LABEL = {
  tarjeta:       'Tarjeta',
  billetera:     'Billetera virtual',
  transferencia: 'Transferencia',
};

const TABS = [
  { id: 'all',       label: 'Todos'      },
  { id: 'confirmed', label: 'Confirmados' },
  { id: 'shipped',   label: 'En camino'  },
  { id: 'delivered', label: 'Entregados' },
  { id: 'cancelled', label: 'Cancelados' },
];

// ── Helpers PDF compartidos ───────────────────────────────────────────────────
function pdfHeader(doc, W, pad) {
  doc.setFillColor(5, 5, 6);
  doc.rect(0, 0, W, 28, 'F');
  doc.setTextColor(210, 238, 66);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('NovaMarket', pad, 14);
  doc.setTextColor(254, 254, 254);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Recibo digital de compra', pad, 21);
  doc.text('novamarket-pyme-s2627.netlify.app', W - pad, 21, { align: 'right' });
}

function pdfFooter(doc, W, y) {
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.setFont('helvetica', 'italic');
  doc.text('Checkout simulado — no representa un cobro real.', W / 2, y, { align: 'center' });
  doc.text('NovaMarket © 2026 — Proyecto educativo Talently Lab', W / 2, y + 5, { align: 'center' });
}

// ── Recibo individual ─────────────────────────────────────────────────────────
function generateReceiptPDF(order) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = 210, pad = 20, col2 = W - pad;
  let y = 20;

  const line  = (yy) => { doc.setDrawColor(220,220,220); doc.line(pad, yy, col2, yy); };
  const right = (t, yy) => doc.text(String(t), col2, yy, { align: 'right' });
  const left  = (t, yy) => doc.text(String(t), pad, yy);

  pdfHeader(doc, W, pad);
  y = 40;

  doc.setTextColor(5,5,6); doc.setFont('helvetica','bold'); doc.setFontSize(14);
  doc.text('Comprobante de pago', pad, y); y += 8;

  doc.setFontSize(9); doc.setFont('helvetica','normal'); doc.setTextColor(100,100,100);
  left(`Pedido #${String(order.id).padStart(6,'0')}`, y);
  right(new Date(order.created_at ?? Date.now()).toLocaleString('es-AR', {
    day:'2-digit', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit'
  }), y); y += 8;

  line(y); y += 6;

  // Envío
  doc.setTextColor(5,5,6); doc.setFont('helvetica','bold'); doc.setFontSize(9);
  left('Envío a', y); y += 5;
  doc.setFont('helvetica','normal'); doc.setTextColor(80,80,80);
  if (order.shipping_name)    { left(order.shipping_name, y);    y += 5; }
  if (order.shipping_address) { left(order.shipping_address, y); y += 5; }
  if (order.shipping_city)    { left(order.shipping_city, y);    y += 5; }
  y += 3; line(y); y += 6;

  // Productos
  if (order.items?.length) {
    doc.setFont('helvetica','bold'); doc.setTextColor(5,5,6); doc.setFontSize(9);
    left('Productos', y); y += 5;
    doc.setFont('helvetica','normal'); doc.setTextColor(80,80,80);
    order.items.forEach(item => {
      const name = item.product_name || `Producto #${item.product_id}`;
      left(`${name} x${item.quantity}`, y);
      right(`$${fmtPDF(item.unit_price * item.quantity)}`, y);
      y += 5;
    });
    y += 3; line(y); y += 6;
  }

  // Desglose
  const rows = [];
  if (order.total != null)          rows.push(['Subtotal',  `$${fmtPDF(order.total)}`]);
  if ((order.discount_amount ?? 0) > 0) rows.push(['Descuento', `- $${fmtPDF(order.discount_amount)}`]);
  if ((order.tax_amount ?? 0) > 0)  rows.push(['IVA (21%)', `$${fmtPDF(order.tax_amount)}`]);

  doc.setFont('helvetica','normal'); doc.setTextColor(80,80,80); doc.setFontSize(9);
  rows.forEach(([label, val]) => { left(label,y); right(val,y); y+=5; });
  y += 2;

  // Total
  doc.setFillColor(5,5,6);
  doc.rect(pad-3, y-4, W-pad*2+6, 9, 'F');
  doc.setTextColor(210,238,66); doc.setFont('helvetica','bold'); doc.setFontSize(10);
  left('Total pagado', y+1.5);
  right(`$${fmtPDF(order.total_with_tax ?? order.total)}`, y+1.5);
  y += 12;

  // Pago
  doc.setFont('helvetica','normal'); doc.setTextColor(80,80,80); doc.setFontSize(9);
  if (order.payment_method) {
    left('Medio de pago', y);
    let m = METHOD_LABEL[order.payment_method] || order.payment_method;
    if (order.card_last4) m += ` · ****${order.card_last4}`;
    right(m, y); y += 6;
  }

  y += 4; line(y); y += 8;
  pdfFooter(doc, W, y);
  doc.save(`recibo-novamarket-${String(order.id).padStart(6,'0')}.pdf`);
}

// ── Historial completo de pedidos ─────────────────────────────────────────────
function generateAllOrdersPDF(orders, userName) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = 210, pad = 20, col2 = W - pad;
  let y = 20;

  const line  = (yy) => { doc.setDrawColor(220,220,220); doc.line(pad, yy, col2, yy); };
  const right = (t, yy) => doc.text(String(t), col2, yy, { align: 'right' });
  const left  = (t, yy) => doc.text(String(t), pad, yy);

  const checkPage = (needed = 20) => {
    if (y + needed > 275) { doc.addPage(); y = 20; }
  };

  pdfHeader(doc, W, pad);
  y = 40;

  // Título del historial
  doc.setTextColor(5,5,6); doc.setFont('helvetica','bold'); doc.setFontSize(14);
  doc.text('Historial de pedidos', pad, y); y += 7;
  doc.setFontSize(9); doc.setFont('helvetica','normal'); doc.setTextColor(100,100,100);
  doc.text(`Cliente: ${userName ?? 'Usuario'}`, pad, y);
  doc.text(new Date().toLocaleString('es-AR', {
    day:'2-digit', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit'
  }), col2, y, { align:'right' });
  y += 6; line(y); y += 8;

  // Totales acumulados
  let grandTotal = 0;
  let grandSubtotal = 0;
  let grandDiscount = 0;
  let grandTax = 0;

  // ── Un bloque por pedido ──
  orders.forEach((order, idx) => {
    const totalFinal = order.total_with_tax ?? order.total ?? 0;
    grandTotal    += Number(totalFinal);
    grandSubtotal += Number(order.total ?? 0);
    grandDiscount += Number(order.discount_amount ?? 0);
    grandTax      += Number(order.tax_amount ?? 0);

    checkPage(45);

    // Cabecera del pedido
    doc.setFillColor(235, 235, 245);
    doc.rect(pad - 3, y - 4, W - pad * 2 + 6, 8, 'F');
    doc.setTextColor(5,5,6); doc.setFont('helvetica','bold'); doc.setFontSize(9);
    left(`Pedido #${String(order.id).padStart(6,'0')}`, y);

    const st = STATUS_MAP[order.status];
    if (st) {
      doc.setTextColor(st.color.replace('#','') === st.color ? 80 : 80, 80, 80);
      doc.setFont('helvetica','normal');
      doc.text(`[${st.label}]`, pad + 55, y);
    }

    doc.setTextColor(5,5,6); doc.setFont('helvetica','bold');
    right(`$${fmtPDF(totalFinal)}`, y); y += 6;

    // Fecha y pago
    doc.setFont('helvetica','normal'); doc.setTextColor(120,120,120); doc.setFontSize(8);
    left(new Date(order.created_at ?? Date.now()).toLocaleString('es-AR', {
      day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit'
    }), y);
    if (order.payment_method) {
      let m = METHOD_LABEL[order.payment_method] || order.payment_method;
      if (order.card_last4) m += ` ****${order.card_last4}`;
      right(m, y);
    }
    y += 5;

    // Productos
    if (order.items?.length) {
      doc.setFontSize(8); doc.setTextColor(80,80,80);
      order.items.forEach(item => {
        checkPage(6);
        const name = item.product_name || `Producto #${item.product_id}`;
        left(`  • ${name} x${item.quantity}`, y);
        right(`$${fmtPDF(item.unit_price * item.quantity)}`, y);
        y += 4.5;
      });
    }

    // Desglose mini
    y += 1;
    doc.setFontSize(8); doc.setTextColor(120,120,120);
    if ((order.discount_amount ?? 0) > 0) {
      left(`  Descuento${order.coupon_code ? ` (${order.coupon_code})` : ''}`, y);
      right(`- $${fmtPDF(order.discount_amount)}`, y); y += 4;
    }
    if ((order.tax_amount ?? 0) > 0) {
      left('  IVA (21%)', y); right(`$${fmtPDF(order.tax_amount)}`, y); y += 4;
    }

    if (idx < orders.length - 1) { y += 3; line(y); y += 5; }
  });

  // ── Resumen total ──
  checkPage(50);
  y += 6; line(y); y += 8;

  doc.setFillColor(5,5,6);
  doc.rect(pad - 3, y - 5, W - pad * 2 + 6, 7, 'F');
  doc.setTextColor(210,238,66); doc.setFont('helvetica','bold'); doc.setFontSize(11);
  left('Resumen total del historial', y); y += 10;

  doc.setTextColor(5,5,6); doc.setFont('helvetica','normal'); doc.setFontSize(9);
  const summaryRows = [
    ['Subtotal acumulado',    `$${fmtPDF(grandSubtotal)}`],
    ['Descuentos totales',    `- $${fmtPDF(grandDiscount)}`],
    ['IVA total (21%)',       `$${fmtPDF(grandTax)}`],
    [`Pedidos (${orders.length})`, ''],
  ];
  summaryRows.forEach(([label, val]) => {
    doc.setTextColor(80,80,80);
    left(label, y);
    if (val) right(val, y);
    y += 5;
  });

  y += 2;
  doc.setFillColor(210,238,66);
  doc.rect(pad - 3, y - 4, W - pad * 2 + 6, 10, 'F');
  doc.setTextColor(5,5,6); doc.setFont('helvetica','bold'); doc.setFontSize(12);
  left('TOTAL INVERTIDO', y + 2);
  right(`$${fmtPDF(grandTotal)}`, y + 2);
  y += 14;

  line(y); y += 8;
  pdfFooter(doc, W, y);

  const date = new Date().toISOString().slice(0,10);
  doc.save(`historial-novamarket-${date}.pdf`);
}


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

function DownloadIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
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
            })}{' '}
            {new Date(order.created_at).toLocaleTimeString('es-AR', {
              hour: '2-digit', minute: '2-digit',
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
                {order.shipping_city && <>{order.shipping_city}</>}
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

          {/* Botón descargar recibo */}
          <div className="ocard__actions">
            <button
              className="btn btn--secondary btn--sm ocard__download-btn"
              onClick={() => generateReceiptPDF(order)}
            >
              <DownloadIcon size={13} />
              Descargar recibo
            </button>
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
        <div className="orders-header__actions">
          <button
            className="btn btn--secondary ocard__download-btn"
            onClick={() => generateAllOrdersPDF(orders, user?.name)}
            title="Descargar historial completo en PDF"
          >
            <DownloadIcon size={14} />
            Historial PDF
          </button>
          <Link to="/catalogo" className="btn btn--primary btn--hero">
            + Seguir comprando
          </Link>
        </div>
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
