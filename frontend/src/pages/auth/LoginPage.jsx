import { Link } from 'react-router-dom';

export default function LoginPage() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__header">
          <h1 className="auth-card__title">Bienvenido</h1>
          <p className="auth-card__subtitle">Ingresá a tu cuenta para continuar</p>
        </div>

        <form>
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
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>
          <button type="submit" className="btn btn--primary btn--full">
            Ingresar
          </button>
        </form>

        <div className="auth-card__footer">
          ¿No tenés cuenta?{' '}
          <Link to="/registro">Registrate gratis</Link>
        </div>
      </div>
    </div>
  );
}
