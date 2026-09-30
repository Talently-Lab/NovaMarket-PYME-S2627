import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';

export default function RegisterPage() {
  const { login, setFlashMessage } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState('');
  const [termsError, setTermsError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleTermsChange = (e) => {
    setTerms(e.target.checked);
    if (e.target.checked) setTermsError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!terms) {
      setTermsError('Debés aceptar los Términos y la Política de Privacidad para continuar.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data } = await authAPI.register(form);
      localStorage.setItem('nm-token', data.token);
      login(data.user, data.token);
      setFlashMessage(`¡Bienvenido/a, ${data.user.name.split(' ')[0]}! Tu cuenta fue creada exitosamente.`);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear la cuenta. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__header">
          <h1 className="auth-card__title">Crear cuenta</h1>
          <p className="auth-card__subtitle">Únite a NovaMarket y empezá a comprar</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Nombre completo</label>
            <input
              className="form-input"
              type="text"
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Juan Pérez"
              autoComplete="name"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              className="form-input"
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="tucorreo@ejemplo.com"
              autoComplete="email"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">Contraseña</label>
            <div className="form-input-wrapper">
              <input
                className={`form-input${error ? ' error' : ''}`}
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="form-input-eye"
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
            <span className="form-hint">Usá letras, números y símbolos para mayor seguridad.</span>
          </div>

          {/* Checkbox Términos y Privacidad */}
          <div className="form-group">
            <label className="form-terms">
              <input
                type="checkbox"
                id="terms"
                checked={terms}
                onChange={handleTermsChange}
                aria-required="true"
                aria-describedby={termsError ? 'terms-error' : undefined}
                className="form-terms__checkbox"
              />
              <span className="form-terms__text">
                Acepto los{' '}
                <Link to="/terminos" target="_blank" rel="noopener noreferrer">
                  Términos y Condiciones
                </Link>
                {' '}y la{' '}
                <Link to="/privacidad" target="_blank" rel="noopener noreferrer">
                  Política de Privacidad
                </Link>
              </span>
            </label>
            {termsError && (
              <p id="terms-error" className="form-error" role="alert">
                ⚠ {termsError}
              </p>
            )}
          </div>

          {error && (
            <p className="form-error" style={{ marginBottom: 'var(--sp-4)' }}>
              ⚠ {error}
            </p>
          )}

          <button
            type="submit"
            className="btn btn--gradient btn--full"
            disabled={loading}
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <div className="auth-card__footer">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login">Iniciá sesión</Link>
        </div>
      </div>
    </div>
  );
}
