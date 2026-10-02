import { useLocation, Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';

const fmt = (n) => Number(n ?? 0).toLocaleString('es-AR', { minimumFractionDigits: 2 });

const METHOD_LABEL = {
  tarjeta:       'Tarjeta de crédito/débito',
  billetera:     'Billetera virtual',
  transferencia: 'Transferencia bancaria',
};

function CheckIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
      stroke="#050506" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  );
}

// ── Generador de PDF ─────────────────────────────────────────────────────────
function generateReceiptPDF(order) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  // jsPDF no renderiza bien separadores de miles con punto (es-AR).
  // Usamos en-US internamente y anteponemos el $ manualmente.
  const fmtPDF = (n) => Number(n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const W = 210; // ancho A4
  const pad = 20;
  const col2 = W - pad; // columna derecha
  let y = 20;

  const line  = (y2) => { doc.setDrawColor(220, 220, 220); doc.line(pad, y2, col2, y2); };
  const right = (text, yy) => doc.text(String(text), col2, yy, { align: 'right' });
  const left  = (text, yy) => doc.text(String(text), pad, yy);

  // ── Encabezado ──
  doc.setFillColor(5, 5, 6);
  doc.rect(0, 0, W, 28, 'F');
  doc.setTextColor(210, 238, 66);  // verde lima
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('NovaMarket', pad, 14);
  doc.setTextColor(254, 254, 254);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Recibo digital de compra', pad, 21);
  doc.text('novamarket-pyme-s2627.netlify.app', col2, 21, { align: 'right' });

  y = 40;

  // ── Título ──
  doc.setTextColor(5, 5, 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Comprobante de pago', pad, y);
  y += 8;

  // ── Datos del pedido ──
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  left(`Pedido #${String(order.id).padStart(6, '0')}`, y);
  right(new Date().toLocaleString('es-AR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }), y);
  y += 8;

  line(y); y += 6;

  // ── Datos de envío ──
  doc.setTextColor(5, 5, 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  left('Envío a', y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  if (order.shipping_name)    { left(order.shipping_name, y);    y += 5; }
  if (order.shipping_address) { left(order.shipping_address, y); y += 5; }
  if (order.shipping_city)    { left(order.shipping_city, y);    y += 5; }
  y += 3;

  line(y); y += 6;

  // ── Productos ──
  if (order.items?.length) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(5, 5, 6);
    doc.setFontSize(9);
    left('Productos', y); y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    order.items.forEach(item => {
      const name  = item.product_name || `Producto #${item.product_id}`;
      const price = `$${fmtPDF(item.unit_price * item.quantity)}`;
      left(`${name} x${item.quantity}`, y);
      right(price, y);
      y += 5;
    });
    y += 3;
    line(y); y += 6;
  }

  // ── Desglose financiero ──
  const rows = [];
  if (order.subtotal != null)       rows.push(['Subtotal',    `$${fmtPDF(order.subtotal)}`]);
  if (order.discount_amount > 0)    rows.push(['Descuento',   `- $${fmtPDF(order.discount_amount)}`]);
  if (order.tax_amount > 0)         rows.push(['IVA (21%)',   `$${fmtPDF(order.tax_amount)}`]);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(9);
  rows.forEach(([label, value]) => {
    left(label, y);
    right(value, y);
    y += 5;
  });
  y += 2;

  // Total
  doc.setFillColor(5, 5, 6);
  doc.rect(pad - 3, y - 4, W - pad * 2 + 6, 9, 'F');
  doc.setTextColor(210, 238, 66);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  left('Total pagado', y + 1.5);
  right(`$${fmtPDF(order.total_with_tax ?? order.total)}`, y + 1.5);
  y += 12;

  // Medio de pago
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(9);
  if (order.payment_method) {
    left('Medio de pago', y);
    let methodText = METHOD_LABEL[order.payment_method] || order.payment_method;
    if (order.card_last4) methodText += ` · ****${order.card_last4}`;
    right(methodText, y);
    y += 6;
  }

  y += 4;
  line(y); y += 8;

  // ── Pie ──
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.setFont('helvetica', 'italic');
  doc.text('Este es un recibo digital de un checkout simulado — no representa un cobro real.', W / 2, y, { align: 'center' });
  y += 5;
  doc.text('NovaMarket © 2026 — Proyecto educativo Talently Lab', W / 2, y, { align: 'center' });

  doc.save(`recibo-novamarket-${String(order.id).padStart(6, '0')}.pdf`);
}

// ── Componente ───────────────────────────────────────────────────────────────
export default function OrderConfirmedPage() {
  const { state } = useLocation();
  const order = state?.order;

  return (
    <div className="order-confirmed">

      <div className="order-confirmed__check">
        <CheckIcon />
      </div>

      <h1 className="order-confirmed__title">¡Pago aprobado!</h1>

      <p className="order-confirmed__subtitle">
        Tu pedido fue registrado y confirmado exitosamente.
      </p>

      {order && (
        <div className="order-confirmed__card">

          <div className="order-confirmed__row">
            <span className="order-confirmed__row-label">Número de pedido</span>
            <span className="order-confirmed__row-value">
              #{String(order.id).padStart(6, '0')}
            </span>
          </div>

          <div className="order-confirmed__row">
            <span className="order-confirmed__row-label">Fecha</span>
            <span className="order-confirmed__row-value" style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-sm)' }}>
              {new Date().toLocaleString('es-AR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div className="order-confirmed__row">
            <span className="order-confirmed__row-label">Envío a</span>
            <span style={{ fontSize: 'var(--text-sm)', textAlign: 'right', maxWidth: 200 }}>
              {order.shipping_name}<br />
              {order.shipping_address}, {order.shipping_city}
            </span>
          </div>

          {order.items?.length > 0 && (
            <>
              <hr className="order-confirmed__divider" />
              <div className="order-confirmed__row" style={{ alignItems: 'flex-start' }}>
                <span className="order-confirmed__row-label" style={{ fontWeight: 'var(--weight-bold)', color: 'var(--color-text)' }}>
                  Productos
                </span>
                <span style={{ fontSize: 'var(--text-sm)', textAlign: 'right' }}>
                  {order.items.map((item, i) => (
                    <span key={i} style={{ display: 'block', marginBottom: 'var(--sp-1)' }}>
                      <span style={{ fontWeight: 'var(--weight-semibold)' }}>
                        {item.product_name || `Producto #${item.product_id}`}
                      </span>
                      {' '}
                      <span style={{ color: 'var(--color-text-secondary)' }}>
                        x{item.quantity} — ${fmt(item.unit_price * item.quantity)}
                      </span>
                    </span>
                  ))}
                </span>
              </div>
            </>
          )}

          <hr className="order-confirmed__divider" />

          {order.subtotal != null && (
            <div className="order-confirmed__row">
              <span className="order-confirmed__row-label">Subtotal</span>
              <span style={{ fontSize: 'var(--text-sm)' }}>${fmt(order.subtotal)}</span>
            </div>
          )}

          {order.discount_amount > 0 && (
            <div className="order-confirmed__row" style={{ color: '#22c55e' }}>
              <span className="order-confirmed__row-label">Descuento</span>
              <span style={{ fontSize: 'var(--text-sm)' }}>− ${fmt(order.discount_amount)}</span>
            </div>
          )}

          {order.tax_amount > 0 && (
            <div className="order-confirmed__row">
              <span className="order-confirmed__row-label">IVA (21%)</span>
              <span style={{ fontSize: 'var(--text-sm)' }}>${fmt(order.tax_amount)}</span>
            </div>
          )}

          <hr className="order-confirmed__divider" />

          <div className="order-confirmed__row" style={{ marginBottom: 0 }}>
            <span className="order-confirmed__total-label">Total pagado</span>
            <span className="order-confirmed__total-value">
              ${fmt(order.total_with_tax ?? order.total)}
            </span>
          </div>

          {order.payment_method && (
            <div className="order-confirmed__row" style={{ marginTop: 'var(--sp-2)', marginBottom: 0 }}>
              <span className="order-confirmed__row-label">Medio de pago</span>
              <span style={{ fontSize: 'var(--text-sm)', textAlign: 'right' }}>
                {METHOD_LABEL[order.payment_method] || order.payment_method}
                {order.card_last4 && ` · ****${order.card_last4}`}
                {order.installments > 1 && (
                  <><br />{order.installments} cuotas de ${fmt(order.installment_amount)}</>
                )}
              </span>
            </div>
          )}

        </div>
      )}

      <div className="order-confirmed__actions">
        <Link to="/catalogo" className="btn btn--primary btn--lg">
          Seguir comprando
        </Link>
        <Link to="/mis-pedidos" className="btn btn--secondary btn--lg">
          Ver mis pedidos
        </Link>
        {order && (
          <button
            className="btn btn--secondary btn--lg order-confirmed__download"
            onClick={() => generateReceiptPDF(order)}
          >
            <DownloadIcon />
            Descargar recibo
          </button>
        )}
      </div>

    </div>
  );
}
