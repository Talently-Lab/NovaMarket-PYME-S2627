import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await authAPI.register(form);
      localStorage.setItem('nm-token', data.token);
      login(data.user, data.token);
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
            <input
              className={`form-input${error ? ' error' : ''}`}
              type="password"
              id="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
              required
            />
            <span className="form-hint">Usá letras, números y símbolos para mayor seguridad.</span>
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
