import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

const GLITCH_CHARS = '!<>-_\\/[]{}—=+*^?#@$%&';

function useGlitchText(text, active) {
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    if (!active) return;
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplay(
        text
          .split('')
          .map((char, i) => {
            if (char === ' ') return ' ';
            if (i < iteration) return text[i];
            return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
          })
          .join('')
      );
      if (iteration >= text.length) clearInterval(interval);
      iteration += 0.4;
    }, 40);
    return () => clearInterval(interval);
  }, [text, active]);

  return display;
}

export default function NotFoundPage() {
  const navigate = useNavigate();
  const [glitching, setGlitching] = useState(false);
  const glitchedTitle = useGlitchText('Página no encontrada', glitching);

  // Activa el glitch al montar
  useEffect(() => {
    const t = setTimeout(() => setGlitching(true), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="not-found">

      {/* Ícono animado */}
      <div className="not-found__icon" aria-hidden="true">
        🤖
      </div>

      {/* Código de error */}
      <p className="not-found__code">404</p>

      {/* Título con efecto glitch */}
      <h1 className="not-found__title">{glitchedTitle}</h1>

      {/* Mensaje con humor tech */}
      <p className="not-found__desc">
        Parece que esta página se fue al carrito... y nadie la compró.
        <br />
        O quizás viajó al multiverso tech. Nunca lo sabremos.
      </p>

      {/* Terminal fake */}
      <div className="not-found__terminal" aria-hidden="true">
        <span className="not-found__terminal-line">
          <span className="not-found__prompt">~/novamarket</span>
          <span className="not-found__cmd"> $ find página --ruta &quot;{typeof window !== 'undefined' ? window.location.pathname : '/???'}&quot;</span>
        </span>
        <span className="not-found__terminal-line not-found__terminal-error">
          Error: No such file or directory 🚫
        </span>
        <span className="not-found__terminal-line">
          <span className="not-found__prompt">~/novamarket</span>
          <span className="not-found__cmd not-found__cursor"> $▋</span>
        </span>
      </div>

      {/* Acciones */}
      <div className="not-found__actions">
        <Link to="/" className="btn btn--gradient btn--lg">
          🏠 Volver al inicio
        </Link>
        <button
          onClick={() => navigate(-1)}
          className="btn btn--secondary btn--lg"
        >
          ← Página anterior
        </button>
      </div>

      {/* Easter egg */}
      <p className="not-found__easter">
        <span
          role="img"
          aria-label="tip"
          title="Pro tip: la página del catálogo sí existe 😉"
          style={{ cursor: 'help', fontSize: 'var(--text-xs)', color: 'var(--color-text-disabled)' }}
        >
          💡 Pro tip: intentá buscar en el catálogo
        </span>
      </p>

    </div>
  );
}
