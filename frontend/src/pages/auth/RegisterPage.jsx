import { Link } from 'react-router-dom';

export default function RegisterPage() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__header">
          <h1 className="auth-card__title">Crear cuenta</h1>
          <p className="auth-card__subtitle">Únite a NovaMarket y empezá a comprar</p>
        </div>

        <form>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Nombre completo</label>
            <input
              className="form-input"
              type="text"
              id="name"
              name="name"
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
              placeholder="tucorreo@ejemplo.com"
              autoComplete="email"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">Contraseña</label>
            <input
              className="form-input"
              type="password"
              id="password"
              name="password"
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
              required
            />
            <span className="form-hint">Usá letras, números y símbolos para mayor seguridad.</span>
          </div>
          <button type="submit" className="btn btn--gradient btn--full">
            Crear cuenta
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
