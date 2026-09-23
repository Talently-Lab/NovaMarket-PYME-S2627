import { Link } from 'react-router-dom';

export default function LoginPage() {
  return (
    <div className="auth">
      <div className="auth__card">
        <h1>Iniciar sesión</h1>
        <form className="auth__form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" placeholder="tucorreo@ejemplo.com" required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input type="password" id="password" name="password" placeholder="••••••••" required />
          </div>
          <button type="submit" className="btn btn--primary btn--full">
            Ingresar
          </button>
        </form>
        <p className="auth__switch">
          ¿No tenés cuenta? <Link to="/registro">Registrate</Link>
        </p>
      </div>
    </div>
  );
}
