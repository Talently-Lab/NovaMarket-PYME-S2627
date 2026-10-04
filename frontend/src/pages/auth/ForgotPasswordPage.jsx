import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../../services/api';

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [token,   setToken]   = useState(''); // código simulado devuelto por el backend

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError('El email es requerido.'); return; }
    setLoading(true); setError('');
    try {
      const { data } = await authAPI.forgotPassword({ email: email.trim() });
      // En modo simulado el backend devuelve el token directamente
      if (data.reset_token) setToken(data.reset_token);
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

          {!token ? (
            <>
              <p className="auth-card__desc">
                Ingresá tu email y te enviaremos un código para restablecer tu contraseña.
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
            /* ── Código generado (modo simulado) ── */
            <div className="forgot-token">
              <div className="forgot-token__icon">✓</div>
              <h2 className="forgot-token__title">Código generado</h2>
              <p className="forgot-token__desc">
                En producción este código llegaría a <strong>{email}</strong> por email.
                Como estamos en modo demo, acá está tu código:
              </p>
              <div className="forgot-token__code">{token}</div>
              <p className="forgot-token__note">
                Válido por 15 minutos. Copialo y usalo en el siguiente paso.
              </p>
              <Link
                to={`/restablecer-contrasena?token=${token}`}
                className="btn btn--primary btn--full"
                style={{ marginTop: 'var(--sp-4)' }}
              >
                Ingresar nueva contraseña →
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
