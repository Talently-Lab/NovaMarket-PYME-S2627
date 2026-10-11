import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../../services/api';
import Button from '../../components/ui/Button';

export default function ResetPasswordPage() {
  const [searchParams]  = useSearchParams();
  const navigate        = useNavigate();

  const [token,      setToken]      = useState(searchParams.get('token') || '');
  const [password,   setPassword]   = useState('');
  const [confirm,    setConfirm]    = useState('');
  const [showPass,   setShowPass]   = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [success,    setSuccess]    = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token.trim()) { setError('El código es requerido.'); return; }
    if (password.trim().length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.'); return;
    }
    if (password !== confirm) { setError('Las contraseñas no coinciden.'); return; }

    setLoading(true);
    try {
      await authAPI.resetPassword({ token: token.trim(), newPassword: password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'El código es inválido o expiró.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-card__tabs">
          <Link to="/login" className="auth-card__tab">Iniciar sesión</Link>
          <div className="auth-card__tab auth-card__tab--active">Nueva contraseña</div>
        </div>

        <div className="auth-card__body">

          {success ? (
            <div className="forgot-token" style={{ textAlign: 'center' }}>
              <div className="forgot-token__icon">✓</div>
              <h2 className="forgot-token__title">¡Contraseña actualizada!</h2>
              <p className="forgot-token__desc">
                Tu contraseña fue cambiada correctamente. Redirigiendo al inicio de sesión…
              </p>
            </div>
          ) : (
            <>
              <p className="auth-card__desc">
                Ingresá el código que recibiste y tu nueva contraseña.
              </p>

              {error && <p className="form-error" role="alert">{error}</p>}

              <form onSubmit={handleSubmit}>

                <div className="form-group">
                  <label className="form-label" htmlFor="token">Código de verificación</label>
                  <input
                    className="form-input form-input--mono"
                    type="text"
                    id="token"
                    value={token}
                    onChange={e => { setToken(e.target.value.replace(/\D/g,'').slice(0,6)); setError(''); }}
                    placeholder="123456"
                    maxLength={6}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="password">Nueva contraseña</label>
                  <div className="form-input-wrapper">
                    <input
                      className="form-input"
                      type={showPass ? 'text' : 'password'}
                      id="password"
                      value={password}
                      onChange={e => { setPassword(e.target.value); setError(''); }}
                      placeholder="Mínimo 8 caracteres"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="form-input-eye"
                      onClick={() => setShowPass(v => !v)}
                      aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showPass ? '🙈' : '👁'}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="confirm">Confirmar contraseña</label>
                  <input
                    className="form-input"
                    type={showPass ? 'text' : 'password'}
                    id="confirm"
                    value={confirm}
                    onChange={e => { setConfirm(e.target.value); setError(''); }}
                    placeholder="Repetí la contraseña"
                    autoComplete="new-password"
                  />
                </div>

                <Button
                  type="submit"
                  full
                  disabled={loading}
                  style={{ marginTop: 'var(--sp-4)' }}
                >
                  {loading ? 'Guardando…' : 'Restablecer contraseña'}
                </Button>
              </form>

              <p className="auth-card__footer-link">
                <Link to="/olvide-contrasena">¿No tenés el código? Solicitá uno nuevo</Link>
              </p>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
