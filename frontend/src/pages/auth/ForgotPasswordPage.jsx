import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../../services/api';

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [sent,    setSent]    = useState(false); // email enviado correctamente

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError('El email es requerido.'); return; }
    setLoading(true); setError('');
    try {
      await authAPI.forgotPassword({ email: email.trim() });
      // El backend siempre responde 200 (anti-enumeración)
      // El código llega al email del usuario via Resend
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al procesar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-card__tabs">
          <Link to="/login" className="auth-card__tab">Iniciar sesión</Link>
          <div className="auth-card__tab auth-card__tab--active">Recuperar cuenta</div>
        </div>

        <div className="auth-card__body">

          {!sent ? (
            <>
              <p className="auth-card__desc">
                Ingresá tu email y te enviaremos un código de 6 dígitos para restablecer tu contraseña.
              </p>

              {error && (
                <p className="form-error" role="alert">{error}</p>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label" htmlFor="email">Correo electrónico</label>
                  <input
                    className="form-input"
                    type="email"
                    id="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(''); }}
                    placeholder="ejemplo@correo.com"
                    autoComplete="email"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn--primary btn--full"
                  disabled={loading}
                  style={{ marginTop: 'var(--sp-4)' }}
                >
                  {loading ? 'Enviando…' : 'Enviar código'}
                </button>
              </form>

              <p className="auth-card__footer-link">
                <Link to="/login">← Volver al inicio de sesión</Link>
              </p>
            </>
          ) : (
            /* ── Email enviado ── */
            <div className="forgot-token">
              <div className="forgot-token__icon">✉</div>
              <h2 className="forgot-token__title">Revisá tu email</h2>
              <p className="forgot-token__desc">
                Si <strong>{email}</strong> tiene una cuenta en NovaMarket, 
                recibirás un código de verificación en los próximos minutos.
              </p>
              <p className="forgot-token__note">
                El código expira en 15 minutos. Revisá también tu carpeta de spam.
              </p>
              <Link
                to="/restablecer-contrasena"
                className="btn btn--primary btn--full"
                style={{ marginTop: 'var(--sp-4)' }}
              >
                Tengo mi código →
              </Link>
              <p className="auth-card__footer-link" style={{ marginTop: 'var(--sp-3)' }}>
                <button
                  onClick={() => { setSent(false); setEmail(''); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-accent)', fontSize: 'var(--text-sm)' }}
                >
                  Reenviar a otro email
                </button>
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
