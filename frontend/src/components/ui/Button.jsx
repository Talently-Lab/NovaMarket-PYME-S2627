import { Link } from 'react-router-dom';

/**
 * Botón reutilizable. Genera las clases `.btn` que ya define `index.css`
 * (sección 9), así que no cambia el aspecto de ninguna pantalla.
 *
 * Props:
 *  - variant: 'primary' (por defecto) | 'secondary' | 'ghost' | 'outline' | 'gradient'
 *  - size:    'sm' | 'lg' | 'hero' (sin valor = tamaño base)
 *  - full:    ocupa todo el ancho
 *  - icon:    botón cuadrado solo con ícono (acordate de pasar `aria-label`)
 *  - loading: muestra el spinner y deshabilita el botón
 *  - to:      si se pasa, se dibuja un <Link> en lugar de un <button>
 *  - className, onClick, type, disabled y el resto de atributos se pasan tal cual
 */
export default function Button({
  variant = 'primary',
  size,
  full = false,
  icon = false,
  loading = false,
  disabled = false,
  to,
  type = 'button',
  className = '',
  children,
  ...rest
}) {
  const classes = [
    'btn',
    `btn--${variant}`,
    size && `btn--${size}`,
    icon && 'btn--icon',
    full && 'btn--full',
    loading && 'btn--loading',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {children}
    </button>
  );
}
