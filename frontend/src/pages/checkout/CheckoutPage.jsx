import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { ordersAPI } from '../../services/api';

const TAX_RATE = 0.21;

// ── Íconos ────────────────────────────────────────────────────────────────────
function LockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}

function CardIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <rect x="1" y="4" width="22" height="16" rx="2"/>
      <line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
      <path d="M16 3H8L4 7h16l-4-4z"/>
      <circle cx="17" cy="13" r="1" fill="currentColor"/>
    </svg>
  );
}

function BankIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <line x1="3" y1="21" x2="21" y2="21"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
      <polyline points="5 10 5 21"/>
      <polyline points="19 10 19 21"/>
      <polyline points="9 10 9 21"/>
      <polyline points="15 10 15 21"/>
      <polyline points="3 10 12 3 21 10"/>
    </svg>
  );
}

// ── Cuotas disponibles ────────────────────────────────────────────────────────
function getInstallments(base) {
  return [
    { n: 1,  label: `1 pago de`,     total: base,              surcharge: 0   },
    { n: 3,  label: `3 cuotas de`,   total: +(base * 1.08).toFixed(2), surcharge: 8   },
    { n: 6,  label: `6 cuotas de`,   total: +(base * 1.15).toFixed(2), surcharge: 15  },
    { n: 12, label: `12 cuotas de`,  total: +(base * 1.30).toFixed(2), surcharge: 30  },
  ].map(i => ({ ...i, monthly: +(i.total / i.n).toFixed(2) }));
}

// ── Formateo ──────────────────────────────────────────────────────────────────
const fmt = (n) => Number(n).toLocaleString('es-AR', { minimumFractionDigits: 2 });

const PAYMENT_METHODS = [
  { id: 'tarjeta',      label: 'Tarjeta',             sub: 'Crédito o débito · Visa, Mastercard, Amex', icon: <CardIcon />,   badge: 'Promos' },
  { id: 'billetera',    label: 'Billetera virtual',    sub: 'Mercado Pago, MODO, Ualá',                  icon: <WalletIcon />, badge: '5% OFF' },
  { id: 'transferencia',label: 'Transferencia',        sub: 'CBU / Alias bancario',                       icon: <BankIcon />,   badge: null     },
];

// ── Componente principal ──────────────────────────────────────────────────────
export default function CheckoutPage() {
  const { items, total: cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Envío
  const [shipping, setShipping] = useState({
    name: user?.name || '', address: '', city: '', phone: '', notes: '',
  });

  // Pago
  const [payMethod,    setPayMethod]    = useState('tarjeta');
  const [cardType,     setCardType]     = useState('credito');
  const [cardNumber,   setCardNumber]   = useState('');
  const [cardName,     setCardName]     = useState('');
  const [cardExpiry,   setCardExpiry]   = useState('');
  const [cardCvv,      setCardCvv]      = useState('');
  const [cardBrand,    setCardBrand]    = useState('');
  const [installment,  setInstallment]  = useState(1);

  // Cupón
  const [couponInput,   setCouponInput]   = useState('');
  const [couponApplied, setCouponApplied] = useState(null); // { code, discount_percent }
  const [couponError,   setCouponError]   = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  // UI
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  // ── Cálculos ──────────────────────────────────────────────────────────────
  const subtotal = cartTotal;

  // Descuento por billetera (5% OFF)
  const walletDiscount = payMethod === 'billetera' ? +(subtotal * 0.05).toFixed(2) : 0;

  // Descuento por cupón
  const couponDiscount = couponApplied
    ? +(subtotal * (couponApplied.discount_percent / 100)).toFixed(2)
    : 0;

  const totalDiscount = walletDiscount + couponDiscount;
  const baseForTax    = subtotal - totalDiscount;
  const taxAmount     = +(baseForTax * TAX_RATE).toFixed(2);
  const totalWithTax  = +(baseForTax + taxAmount).toFixed(2);

  const installments  = useMemo(() => getInstallments(totalWithTax), [totalWithTax]);
  const selectedInst  = installments.find(i => i.n === installment) || installments[0];

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleShipping = (e) =>
    setShipping(prev => ({ ...prev, [e.target.name]: e.target.value }));

  // Formatear número de tarjeta con espacios cada 4 dígitos
  const handleCardNumber = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    setCardNumber(raw.replace(/(.{4})/g, '$1 ').trim());
  };

  // Formatear vencimiento MM/AA
  const handleExpiry = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCardExpiry(raw.length > 2 ? `${raw.slice(0,2)}/${raw.slice(2)}` : raw);
  };

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const { data } = await ordersAPI.validateCoupon(couponInput.trim());
      setCouponApplied(data);
    } catch {
      setCouponError('Cupón inválido o expirado.');
      setCouponApplied(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponApplied(null);
    setCouponInput('');
    setCouponError('');
  };

  const handleConfirm = async () => {
    if (!shipping.name || !shipping.address || !shipping.city) {
      setError('Nombre, dirección y ciudad son requeridos.');
      return;
    }
    if (payMethod === 'tarjeta') {
      if (cardNumber.replace(/\s/g, '').length < 13) { setError('Número de tarjeta inválido.'); return; }
      if (!cardName.trim())   { setError('Nombre en la tarjeta es requerido.'); return; }
      if (!cardExpiry.trim()) { setError('Fecha de vencimiento es requerida.'); return; }
      if (cardCvv.length < 3) { setError('CVV inválido.'); return; }
    }

    setLoading(true);
    setError('');
    try {
      const orderItems = items.map(item => ({
        product_id: item.id,
        quantity:   item.quantity,
        unit_price: Number(item.price),
      }));

      const paymentData = {
        method:          payMethod,
        card_number:     cardNumber,
        card_name:       cardName,
        card_expiry:     cardExpiry,
        card_cvv:        cardCvv,
        card_brand:      cardBrand,
        card_type:       cardType,
        installments:    installment,
        coupon_code:     couponApplied?.code || '',
        discount_amount: totalDiscount,
        tax_amount:      taxAmount,
        total_with_tax:  totalWithTax,
      };

      const { data } = await ordersAPI.create({
        items:    orderItems,
        shipping,
        payment:  paymentData,
      });

      clearCart();
      navigate('/pedido-confirmado', {
        state: {
          order: {
            ...data.order,
            subtotal,
            discount_amount: totalDiscount,
            tax_amount:      taxAmount,
            total_with_tax:  totalWithTax,
            payment_method:  payMethod,
            installments:    installment,
            installment_amount: selectedInst.monthly,
          },
        },
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Error al confirmar el pedido. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    navigate('/carrito');
    return null;
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="checkout-wrapper container">

      {/* Back link */}
      <Link to="/carrito" className="checkout-back">
        ← Seguir comprando
      </Link>

      <h1 className="checkout-title">Finalizar compra</h1>

      <div className="checkout-layout">

        {/* ── Columna izquierda ── */}
        <div className="checkout-left">

          {/* Datos de envío */}
          <div className="checkout-section">
            <h2 className="checkout-section__title">Datos de envío</h2>
            <div className="checkout-fields">
              <div className="form-group">
                <label className="form-label" htmlFor="name">Nombre completo *</label>
                <input className="form-input" type="text" id="name" name="name"
                  value={shipping.name} onChange={handleShipping}
                  placeholder="Tu nombre completo" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="address">Dirección *</label>
                <input className="form-input" type="text" id="address" name="address"
                  value={shipping.address} onChange={handleShipping}
                  placeholder="Calle 123, Piso 4, Depto B" />
              </div>
              <div className="checkout-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="city">Ciudad *</label>
                  <input className="form-input" type="text" id="city" name="city"
                    value={shipping.city} onChange={handleShipping}
                    placeholder="Buenos Aires" />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="phone">Teléfono</label>
                  <input className="form-input" type="tel" id="phone" name="phone"
                    value={shipping.phone} onChange={handleShipping}
                    placeholder="+54 9 11 1234 5678" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="notes">Notas (opcional)</label>
                <input className="form-input" type="text" id="notes" name="notes"
                  value={shipping.notes} onChange={handleShipping}
                  placeholder="Instrucciones para el repartidor" />
              </div>
            </div>
          </div>

          {/* Medio de pago */}
          <div className="checkout-section">
            <h2 className="checkout-section__title">Medio de pago</h2>

            <div className="pay-methods">
              {PAYMENT_METHODS.map(m => (
                <button
                  key={m.id}
                  type="button"
                  className={`pay-method-card${payMethod === m.id ? ' pay-method-card--active' : ''}`}
                  onClick={() => setPayMethod(m.id)}
                >
                  {m.badge && (
                    <span className={`pay-method-card__badge${m.badge === '5% OFF' ? ' pay-method-card__badge--green' : ''}`}>
                      {m.badge}
                    </span>
                  )}
                  <span className="pay-method-card__icon">{m.icon}</span>
                  <span className="pay-method-card__label">{m.label}</span>
                  <span className="pay-method-card__sub">{m.sub}</span>
                </button>
              ))}
            </div>

            {/* Formulario tarjeta */}
            {payMethod === 'tarjeta' && (
              <div className="card-form">
                <h3 className="card-form__title">Datos de la tarjeta</h3>

                {/* Tipo de tarjeta */}
                <div className="form-group">
                  <label className="form-label">Tipo de tarjeta</label>
                  <div className="card-type-toggle">
                    <button
                      type="button"
                      className={`card-type-btn${cardType === 'credito' ? ' card-type-btn--active' : ''}`}
                      onClick={() => setCardType('credito')}
                    >Crédito</button>
                    <button
                      type="button"
                      className={`card-type-btn${cardType === 'debito' ? ' card-type-btn--active' : ''}`}
                      onClick={() => setCardType('debito')}
                    >Débito</button>
                  </div>
                </div>

                {/* Número */}
                <div className="form-group">
                  <label className="form-label" htmlFor="cardNumber">Número de tarjeta</label>
                  <input className="form-input form-input--mono" type="text" id="cardNumber"
                    value={cardNumber} onChange={handleCardNumber}
                    placeholder="0000 0000 0000 0000" maxLength={19} />
                </div>

                {/* Nombre */}
                <div className="form-group">
                  <label className="form-label" htmlFor="cardName">Nombre como figura en la tarjeta</label>
                  <input className="form-input" type="text" id="cardName"
                    value={cardName} onChange={e => setCardName(e.target.value.toUpperCase())}
                    placeholder="NOMBRE APELLIDO" />
                </div>

                {/* Vencimiento + CVV + Banco */}
                <div className="checkout-row checkout-row--3">
                  <div className="form-group">
                    <label className="form-label" htmlFor="cardExpiry">Vencimiento</label>
                    <input className="form-input form-input--mono" type="text" id="cardExpiry"
                      value={cardExpiry} onChange={handleExpiry}
                      placeholder="MM/AA" maxLength={5} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="cardCvv">CVV</label>
                    <input className="form-input form-input--mono" type="password" id="cardCvv"
                      value={cardCvv} onChange={e => setCardCvv(e.target.value.replace(/\D/g,'').slice(0,4))}
                      placeholder="3 dígitos" maxLength={4} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="cardBrand">Banco emisor</label>
                    <select className="form-input" id="cardBrand"
                      value={cardBrand} onChange={e => setCardBrand(e.target.value)}>
                      <option value="">Otro banco</option>
                      <option value="galicia">Banco Galicia</option>
                      <option value="santander">Santander</option>
                      <option value="bbva">BBVA</option>
                      <option value="hsbc">HSBC</option>
                      <option value="macro">Banco Macro</option>
                      <option value="icbc">ICBC</option>
                      <option value="nacion">Banco Nación</option>
                    </select>
                  </div>
                </div>

                {/* Cuotas — solo crédito */}
                {cardType === 'credito' && (
                  <div className="form-group">
                    <label className="form-label">Cuotas</label>
                    <div className="installments-list">
                      {installments.map(inst => (
                        <label key={inst.n} className={`installment-option${installment === inst.n ? ' installment-option--active' : ''}`}>
                          <input type="radio" name="installment" value={inst.n}
                            checked={installment === inst.n}
                            onChange={() => setInstallment(inst.n)} />
                          <span className="installment-option__main">
                            {inst.label} <strong>${fmt(inst.monthly)}</strong>
                          </span>
                          {inst.surcharge > 0 && (
                            <span className="installment-option__detail">
                              Total ${fmt(inst.total)} · +{inst.surcharge}%
                            </span>
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Info billetera */}
            {payMethod === 'billetera' && (
              <div className="pay-info-box">
                <p className="pay-info-box__text">
                  🎉 <strong>5% OFF</strong> aplicado automáticamente al pagar con Mercado Pago, MODO o Ualá.
                </p>
                <p className="pay-info-box__sub">
                  Serás redirigido a la plataforma de pago al confirmar el pedido.
                </p>
              </div>
            )}

            {/* Info transferencia */}
            {payMethod === 'transferencia' && (
              <div className="pay-info-box">
                <p className="pay-info-box__text">
                  🏦 Realizá la transferencia al <strong>CBU/Alias</strong> que te enviaremos por email.
                </p>
                <p className="pay-info-box__sub">
                  Tu pedido se confirmará dentro de las 24hs hábiles de acreditado el pago.
                </p>
              </div>
            )}
          </div>

        </div>

        {/* ── Resumen lateral ── */}
        <aside className="checkout-summary">

          <h2 className="checkout-summary__title">Resumen de la orden</h2>
          <p className="checkout-summary__count">{items.length} {items.length === 1 ? 'producto' : 'productos'}</p>

          {/* Items */}
          <div className="checkout-summary__items">
            {items.map(item => (
              <div key={item.id} className="checkout-summary__item">
                <span className="checkout-summary__item-name truncate">
                  {item.name}
                  <span className="checkout-summary__item-qty"> x{item.quantity}</span>
                </span>
                <span className="checkout-summary__item-price">
                  ${fmt(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="checkout-summary__divider" />

          {/* Cupón */}
          <div className="checkout-summary__coupon">
            <p className="checkout-summary__coupon-label">¿Tenés un cupón?</p>
            {!couponApplied ? (
              <div className="coupon-row">
                <input
                  className="form-input coupon-input"
                  type="text"
                  value={couponInput}
                  onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError(''); }}
                  placeholder="NOVA10"
                  maxLength={20}
                />
                <button
                  className="btn btn--secondary coupon-btn"
                  onClick={handleApplyCoupon}
                  disabled={couponLoading}
                >
                  {couponLoading ? '...' : 'Aplicar'}
                </button>
              </div>
            ) : (
              <div className="coupon-applied">
                <span className="coupon-applied__code">✓ {couponApplied.code} — {couponApplied.discount_percent}% OFF</span>
                <button className="coupon-applied__remove" onClick={handleRemoveCoupon}>✕</button>
              </div>
            )}
            {couponError && <p className="form-error" style={{ marginTop: '4px', fontSize: '12px' }}>{couponError}</p>}
          </div>

          <div className="checkout-summary__divider" />

          {/* Desglose */}
          <div className="checkout-summary__breakdown">
            <div className="checkout-summary__row">
              <span>Subtotal</span>
              <span>${fmt(subtotal)}</span>
            </div>
            {totalDiscount > 0 && (
              <div className="checkout-summary__row checkout-summary__row--discount">
                <span>Descuento{couponApplied ? ` (${couponApplied.code})` : ''}{walletDiscount > 0 ? ' + Billetera' : ''}</span>
                <span>− ${fmt(totalDiscount)}</span>
              </div>
            )}
            <div className="checkout-summary__row checkout-summary__row--tax">
              <span>IVA (21%)</span>
              <span>${fmt(taxAmount)}</span>
            </div>
          </div>

          <div className="checkout-summary__divider" />

          <div className="checkout-summary__total">
            <span>Total a pagar</span>
            <span className="checkout-summary__total-value">${fmt(totalWithTax)}</span>
          </div>

          {payMethod === 'tarjeta' && cardType === 'credito' && installment > 1 && (
            <p className="checkout-summary__installment-note">
              {selectedInst.n} cuotas de ${fmt(selectedInst.monthly)} · +{selectedInst.surcharge}%
            </p>
          )}

          {error && (
            <p className="form-error" style={{ marginTop: 'var(--sp-3)' }}>⚠ {error}</p>
          )}

          <button
            className="btn btn--primary btn--full checkout-summary__cta"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? 'Confirmando...' : `Confirmar pedido · $${fmt(totalWithTax)}`}
          </button>

          <p className="checkout-summary__secure">
            <LockIcon />
            Pago cifrado · Checkout simulado
          </p>

        </aside>
      </div>
    </div>
  );
}
