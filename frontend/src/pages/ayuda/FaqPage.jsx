import { useState } from 'react';
import { Link } from 'react-router-dom';

const FAQS = [
  {
    q: '¿Cómo realizo una compra?',
    a: 'Explorá el catálogo, agregá los productos al carrito y seguí los pasos del checkout. Necesitás una cuenta para finalizar la compra.',
  },
  {
    q: '¿Cuáles son los medios de pago aceptados?',
    a: 'Aceptamos tarjeta de crédito/débito, billetera virtual y transferencia bancaria. Los pagos con tarjeta admiten cuotas con recargo.',
  },
  {
    q: '¿Puedo cambiar o cancelar mi pedido?',
    a: 'Podés cancelar tu pedido dentro de las 2 horas posteriores a la confirmación. Pasado ese tiempo, contactanos a ventas@novamarket.com.ar.',
  },
  {
    q: '¿Hacen envíos a todo el país?',
    a: 'Sí. Enviamos a todo el territorio nacional. Los tiempos de entrega varían según la zona (ver Seguimiento de pedidos).',
  },
  {
    q: '¿Cómo aplico un cupón de descuento?',
    a: 'En el paso de checkout encontrás un campo para ingresar el código del cupón. El descuento se aplica automáticamente sobre el subtotal.',
  },
  {
    q: '¿Qué garantía tienen los productos?',
    a: 'Todos los productos cuentan con garantía oficial del fabricante de 12 meses. Para más detalles, consultá la sección Garantías y devoluciones.',
  },
  {
    q: '¿Cómo recupero mi contraseña?',
    a: 'En la pantalla de login, hacé click en "Olvidé mi contraseña" e ingresá tu email. Recibirás un código de 6 dígitos para restablecerla.',
  },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="faq-item">
      <button
        className={`faq-item__question${open ? ' faq-item__question--open' : ''}`}
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
      >
        {q}
        <span className="faq-item__icon" aria-hidden="true">{open ? '−' : '+'}</span>
      </button>
      {open && <p className="faq-item__answer">{a}</p>}
    </div>
  );
}

export default function FaqPage() {
  return (
    <div className="help-page container">
      <nav className="help-page__breadcrumb" aria-label="Ruta de navegación">
        <Link to="/" className="help-page__breadcrumb-link">Inicio</Link>
        <span aria-hidden="true"> / </span>
        <span>Centro de ayuda FAQ</span>
      </nav>

      <h1 className="help-page__title">Centro de ayuda</h1>
      <p className="help-page__intro">Preguntas frecuentes sobre compras, envíos, pagos y cuenta.</p>

      <div className="faq-list">
        {FAQS.map(({ q, a }) => (
          <FaqItem key={q} q={q} a={a} />
        ))}
      </div>

      <div className="help-page__contact-note">
        <p>¿No encontraste lo que buscabas? Escribinos a <a href="mailto:ventas@novamarket.com.ar" className="help-page__link">ventas@novamarket.com.ar</a></p>
      </div>
    </div>
  );
}
