import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Íconos SVG para el sidebar
function DashboardIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );
}

function ProductsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2" y="1.33" width="12" height="13.33" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <line x1="5" y1="5" x2="11" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="5" y1="8" x2="11" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="5" y1="11" x2="8"  y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function OrdersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="1" y="3.33" width="14" height="9.33" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <line x1="1" y1="6.67" x2="15" y2="6.67" stroke="currentColor" strokeWidth="1.5"/>
      <line x1="5"  y1="10" x2="5"  y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="8"  y1="10" x2="8"  y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="11" y1="10" x2="11" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function CustomersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M2 13.33c0-3.31 2.69-6 6-6s6 2.69 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function CategoriesIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

const NAV_ITEMS = [
  { to: '/admin',             label: 'Dashboard',     Icon: DashboardIcon,  end: true },
  { to: '/admin/productos',   label: 'Productos',     Icon: ProductsIcon              },
  { to: '/admin/pedidos',     label: 'Pedidos',       Icon: OrdersIcon                },
  { to: '/admin/clientes',    label: 'Clientes',      Icon: CustomersIcon             },
  { to: '/admin/categorias',  label: 'Categorías',    Icon: CategoriesIcon            },
  { to: '/admin/config',      label: 'Configuración', Icon: SettingsIcon              },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Iniciales del usuario para el avatar
  const initials = user?.name
    ? user.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : 'AD';

  return (
    <div className="admin-shell">

      {/* ── Topbar ── */}
      <header className="admin-topbar">
        <Link to="/" className="admin-topbar__logo" aria-label="NovaMarket inicio">
          <span className="admin-topbar__logo-text">Nova<span>Market</span></span>
        </Link>

        <div className="admin-topbar__user">
          <span className="admin-topbar__role">
            {user?.role === 'admin' ? 'Administrador Principal' : user?.name || 'Admin'}
          </span>
          <div className="admin-topbar__avatar" aria-hidden="true">
            {initials}
          </div>
          <button className="admin-topbar__logout" onClick={handleLogout}>
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* ── Body: sidebar + main ── */}
      <div className="admin-body">
        <aside className="admin-sidebar">
          <nav className="admin-sidebar__nav" aria-label="Navegación admin">
            {NAV_ITEMS.map(({ to, label, Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `admin-nav-item${isActive ? ' admin-nav-item--active' : ''}`
                }
              >
                <Icon />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="admin-main">
          <Outlet />
        </main>
      </div>

    </div>
  );
}
