import { useState, useEffect, useCallback } from 'react';
import { ordersAPI, usersAPI } from '../../services/api';

// ── Iconos ────────────────────────────────────────────────────────────────────
function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  );
}

// ── Sección: Información del negocio ─────────────────────────────────────────
function SectionNegocio() {
  return (
    <div className="config-section">
      <h2 className="config-section__title">Información del negocio</h2>
      <p className="config-section__desc">Datos generales de la tienda.</p>
      <div className="config-grid">
        <div className="form-group">
          <label className="form-label">Nombre de la tienda</label>
          <input className="form-input" type="text" defaultValue="NovaMarket" disabled />
        </div>
        <div className="form-group">
          <label className="form-label">Email de contacto</label>
          <input className="form-input" type="email" defaultValue="contacto@novamarket.com" disabled />
        </div>
        <div className="form-group">
          <label className="form-label">Sitio web</label>
          <input className="form-input" type="text" defaultValue="https://novamarket-pyme-s2627.netlify.app" disabled />
        </div>
        <div className="form-group">
          <label className="form-label">País</label>
          <input className="form-input" type="text" defaultValue="Argentina" disabled />
        </div>
      </div>
      <p className="config-section__note">
        Estos datos son informativos. Para modificarlos, editar directamente en el código.
      </p>
    </div>
  );
}

// ── Sección: Cupones ──────────────────────────────────────────────────────────
function SectionCupones() {
  const [coupons,  setCoupons]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState('');
  const [newCode,  setNewCode]  = useState('');
  const [newPct,   setNewPct]   = useState('');
  const [adding,   setAdding]   = useState(false);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    ordersAPI.getCoupons()
      .then(({ data }) => setCoupons(data.coupons ?? []))
      .catch(() => setError('No se pudieron cargar los cupones.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const flash = (msg, isError = false) => {
    if (isError) setError(msg);
    else setSuccess(msg);
    setTimeout(() => { setError(''); setSuccess(''); }, 3000);
  };

  const handleAdd = async () => {
    if (!newCode.trim() || !newPct) return;
    setAdding(true);
    try {
      await ordersAPI.createCoupon({ code: newCode.trim(), discount_percent: Number(newPct) });
      setNewCode(''); setNewPct('');
      flash(`Cupón ${newCode.toUpperCase()} creado.`);
      load();
    } catch (err) {
      flash(err.response?.data?.error || 'Error al crear el cupón.', true);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (code) => {
    setDeleting(code);
    try {
      await ordersAPI.deleteCoupon(code);
      flash(`Cupón ${code} eliminado.`);
      load();
    } catch (err) {
      flash(err.response?.data?.error || 'Error al eliminar.', true);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="config-section">
      <h2 className="config-section__title">Cupones de descuento</h2>
      <p className="config-section__desc">Gestioná los códigos de descuento activos.</p>

      {error   && <p className="form-error config-section__feedback">{error}</p>}
      {success && <p className="config-section__success">{success}</p>}

      {/* Lista de cupones */}
      <div className="config-coupons-list">
        {loading ? (
          <p className="config-section__note">Cargando…</p>
        ) : coupons.length === 0 ? (
          <p className="config-section__note">No hay cupones activos.</p>
        ) : (
          coupons.map(c => (
            <div key={c.code} className="config-coupon-row">
              <span className="config-coupon-row__code">{c.code}</span>
              <span className="config-coupon-row__pct">{c.discount_percent}% OFF</span>
              <button
                className="btn btn--ghost btn--sm config-coupon-row__del"
                onClick={() => handleDelete(c.code)}
                disabled={deleting === c.code}
                title={`Eliminar ${c.code}`}
              >
                <TrashIcon />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Agregar cupón */}
      <div className="config-coupon-add">
        <h3 className="config-section__subtitle">Agregar cupón</h3>
        <div className="config-coupon-add__row">
          <input
            className="form-input"
            type="text"
            placeholder="Código (ej: VERANO20)"
            value={newCode}
            onChange={e => setNewCode(e.target.value.toUpperCase().replace(/\s/g, ''))}
            maxLength={20}
          />
          <input
            className="form-input config-coupon-add__pct"
            type="number"
            placeholder="% descuento"
            value={newPct}
            onChange={e => setNewPct(e.target.value)}
            min={1} max={100}
          />
          <button
            className="btn btn--primary btn--sm"
            onClick={handleAdd}
            disabled={adding || !newCode.trim() || !newPct}
          >
            <PlusIcon />
            {adding ? 'Creando…' : 'Agregar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Sección: IVA ──────────────────────────────────────────────────────────────
function SectionIVA() {
  return (
    <div className="config-section">
      <h2 className="config-section__title">Impuestos</h2>
      <p className="config-section__desc">Configuración fiscal actual de la tienda.</p>
      <div className="config-grid config-grid--sm">
        <div className="form-group">
          <label className="form-label">Tasa de IVA</label>
          <div className="config-iva-display">
            <span className="config-iva-display__value">21%</span>
            <span className="config-iva-display__label">Argentina — tasa estándar</span>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Aplicado sobre</label>
          <input className="form-input" type="text" defaultValue="Subtotal − descuentos" disabled />
        </div>
      </div>
      <p className="config-section__note">
        La tasa de IVA está definida en el backend (TAX_RATE = 0.21). Para modificarla, editar <code>order.controller.js</code>.
      </p>
    </div>
  );
}

// ── Sección: Cambiar contraseña ───────────────────────────────────────────────
function SectionPassword() {
  const [form,    setForm]    = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [show,    setShow]    = useState({ current: false, new: false, confirm: false });

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError(''); setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.currentPassword || !form.newPassword || !form.confirm) {
      setError('Todos los campos son requeridos.'); return;
    }
    if (form.newPassword.trim().length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres.'); return;
    }
    if (form.newPassword !== form.confirm) {
      setError('Las contraseñas no coinciden.'); return;
    }
    setLoading(true);
    try {
      await usersAPI.changePassword({
        currentPassword: form.currentPassword,
        newPassword:     form.newPassword,
      });
      setSuccess('Contraseña actualizada correctamente.');
      setForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cambiar la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  const toggle = (field) => setShow(prev => ({ ...prev, [field]: !prev[field] }));

  return (
    <div className="config-section config-section--danger">
      <h2 className="config-section__title">Zona de seguridad</h2>
      <p className="config-section__desc">Cambiá la contraseña de tu cuenta de administrador.</p>

      {error   && <p className="form-error config-section__feedback">{error}</p>}
      {success && <p className="config-section__success">{success}</p>}

      <form onSubmit={handleSubmit} className="config-password-form">
        {[
          { name: 'currentPassword', label: 'Contraseña actual',   key: 'current' },
          { name: 'newPassword',     label: 'Nueva contraseña',     key: 'new'     },
          { name: 'confirm',         label: 'Confirmar contraseña', key: 'confirm' },
        ].map(({ name, label, key }) => (
          <div className="form-group" key={name}>
            <label className="form-label" htmlFor={name}>{label}</label>
            <div className="form-input-wrapper">
              <input
                className="form-input"
                type={show[key] ? 'text' : 'password'}
                id={name}
                name={name}
                value={form[name]}
                onChange={handleChange}
                autoComplete={name === 'currentPassword' ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                className="form-input-eye"
                onClick={() => toggle(key)}
                aria-label={show[key] ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {show[key] ? '🙈' : '👁'}
              </button>
            </div>
          </div>
        ))}
        <button
          type="submit"
          className="btn btn--primary"
          disabled={loading}
        >
          {loading ? 'Guardando…' : 'Cambiar contraseña'}
        </button>
      </form>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function ConfigAdminPage() {
  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard__header">
        <div>
          <h1 className="admin-dashboard__title">Configuración</h1>
          <p className="admin-dashboard__subtitle">Ajustes generales del panel de administración.</p>
        </div>
      </div>

      <div className="config-sections">
        <SectionNegocio />
        <SectionCupones />
        <SectionIVA />
        <SectionPassword />
      </div>
    </div>
  );
}
