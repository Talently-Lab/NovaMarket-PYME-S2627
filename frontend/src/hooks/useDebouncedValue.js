import { useEffect, useState } from 'react';

/**
 * Devuelve `valor` recién cuando pasaron `demora` ms sin cambios.
 * Sirve para no filtrar (o consultar al backend) en cada tecla.
 */
export function useDebouncedValue(valor, demora = 300) {
  const [valorDemorado, setValorDemorado] = useState(valor);

  useEffect(() => {
    const id = setTimeout(() => setValorDemorado(valor), demora);
    return () => clearTimeout(id);
  }, [valor, demora]);

  return valorDemorado;
}
