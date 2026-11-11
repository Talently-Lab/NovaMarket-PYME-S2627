import { useEffect, useRef, useState } from 'react';

/**
 * useReveal — detecta cuando un elemento entra al viewport
 * y retorna ref + clase CSS para animar con fade/slide suave.
 * once: true = solo anima la primera vez
 */
export function useReveal({ threshold = 0.15, once = true } = {}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, once]);

  return [ref, visible];
}
