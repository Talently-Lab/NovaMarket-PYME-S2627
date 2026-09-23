import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="not-found">
      <p className="not-found__code">404</p>
      <h1 className="not-found__title">Página no encontrada</h1>
      <p className="not-found__desc">
        La página que buscás no existe o fue movida.
      </p>
      <Link to="/" className="btn btn--primary btn--lg" style={{ marginTop: 'var(--sp-4)' }}>
        Volver al inicio
      </Link>
    </div>
  );
}
