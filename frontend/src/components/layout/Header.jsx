import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="header">
      <div className="header__container">
        <Link to="/" className="header__logo">
          NovaMarket
        </Link>
        <nav className="header__nav">
          <Link to="/catalogo">Catálogo</Link>
          <Link to="/carrito">Carrito</Link>
          <Link to="/login">Ingresar</Link>
        </nav>
      </div>
    </header>
  );
}
