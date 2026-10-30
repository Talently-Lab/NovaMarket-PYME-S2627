/**
 * Unit Tests — Lógica de cálculos del backend
 * Cubre: cálculo de IVA, descuentos por cupón, descuento por billetera,
 *        combinaciones cupón + billetera, edge cases de matemática financiera.
 *
 * Estrategia: tests unitarios puros — se extrae la lógica de cálculo
 * del order.controller.js y se testea directamente con funciones puras.
 * Esto permite coverage sin DB ni servidor.
 */

process.env.NODE_ENV = 'test';

// ── Constantes replicadas del controller ─────────────────────────────────────

const TAX_RATE = 0.21;
const VALID_COUPONS: Record<string, number> = {
  NOVA10:   10,
  NOVA20:   20,
  GAMING15: 15,
  PROMO5:   5,
};
const WALLET_DISCOUNT_RATE = 0.05; // 5% billetera virtual

// ── Funciones puras extraídas del controller para testear ────────────────────

function calculateCouponDiscount(subtotal: number, code: string | null): number {
  if (!code) return 0;
  const normalized = code.toUpperCase().trim();
  const pct = VALID_COUPONS[normalized];
  if (!pct) return 0;
  return +(subtotal * (pct / 100)).toFixed(2);
}

function calculateWalletDiscount(subtotal: number, method: string): number {
  if (method !== 'billetera') return 0;
  return +(subtotal * WALLET_DISCOUNT_RATE).toFixed(2);
}

function calculateTax(subtotal: number, totalDiscount: number): number {
  const base = subtotal - totalDiscount;
  return +(base * TAX_RATE).toFixed(2);
}

function calculateTotal(subtotal: number, totalDiscount: number, tax: number): number {
  return +((subtotal - totalDiscount) + tax).toFixed(2);
}

function calculateOrderTotals(
  subtotal: number,
  couponCode: string | null,
  method: string
): {
  couponDiscount: number;
  walletDiscount: number;
  totalDiscount: number;
  taxAmount: number;
  totalWithTax: number;
} {
  const couponDiscount = calculateCouponDiscount(subtotal, couponCode);
  const walletDiscount = calculateWalletDiscount(subtotal, method);
  const totalDiscount  = +(couponDiscount + walletDiscount).toFixed(2);
  const taxAmount      = calculateTax(subtotal, totalDiscount);
  const totalWithTax   = calculateTotal(subtotal, totalDiscount, taxAmount);
  return { couponDiscount, walletDiscount, totalDiscount, taxAmount, totalWithTax };
}

// ── Tests de IVA ─────────────────────────────────────────────────────────────

describe('Cálculo de IVA (21%)', () => {

  it('TC-IVA01 subtotal 10000, sin descuento → IVA = 2100', () => {
    const tax = calculateTax(10000, 0);
    expect(tax).toBe(2100);
  });

  it('TC-IVA02 subtotal 0 → IVA = 0', () => {
    const tax = calculateTax(0, 0);
    expect(tax).toBe(0);
  });

  it('TC-IVA03 subtotal 100 → IVA = 21.00', () => {
    const tax = calculateTax(100, 0);
    expect(tax).toBe(21);
  });

  it('TC-IVA04 IVA se calcula sobre (subtotal - descuento), no sobre subtotal bruto', () => {
    // subtotal 10000, descuento 1000 → base 9000 → IVA 1890
    const tax = calculateTax(10000, 1000);
    expect(tax).toBe(1890);
  });

  it('TC-IVA05 descuento igual al subtotal → IVA = 0', () => {
    const tax = calculateTax(1000, 1000);
    expect(tax).toBe(0);
  });

  it('TC-IVA06 resultado tiene máximo 2 decimales', () => {
    const tax = calculateTax(333, 0);  // 333 * 0.21 = 69.93
    const decimals = tax.toString().split('.')[1];
    expect(decimals === undefined || decimals.length <= 2).toBe(true);
  });

  it('TC-IVA07 subtotal 224997 (precio real del catálogo) → IVA correcto', () => {
    // subtotal 224997, descuento 0 → base 224997 → IVA = 224997 * 0.21 = 47249.37
    const tax = calculateTax(224997, 0);
    expect(tax).toBe(47249.37);
  });
});

// ── Tests de descuento por cupón ─────────────────────────────────────────────

describe('Cálculo de descuento por cupón', () => {

  it('TC-CUP01 NOVA10 sobre 10000 → descuento = 1000', () => {
    const disc = calculateCouponDiscount(10000, 'NOVA10');
    expect(disc).toBe(1000);
  });

  it('TC-CUP02 NOVA20 sobre 10000 → descuento = 2000', () => {
    const disc = calculateCouponDiscount(10000, 'NOVA20');
    expect(disc).toBe(2000);
  });

  it('TC-CUP03 GAMING15 sobre 10000 → descuento = 1500', () => {
    const disc = calculateCouponDiscount(10000, 'GAMING15');
    expect(disc).toBe(1500);
  });

  it('TC-CUP04 PROMO5 sobre 10000 → descuento = 500', () => {
    const disc = calculateCouponDiscount(10000, 'PROMO5');
    expect(disc).toBe(500);
  });

  it('TC-CUP05 código inválido → descuento = 0', () => {
    const disc = calculateCouponDiscount(10000, 'INVALIDO99');
    expect(disc).toBe(0);
  });

  it('TC-CUP06 sin código (null) → descuento = 0', () => {
    const disc = calculateCouponDiscount(10000, null);
    expect(disc).toBe(0);
  });

  it('TC-CUP07 código en minúsculas → normalizado correctamente', () => {
    const disc = calculateCouponDiscount(10000, 'nova20');
    expect(disc).toBe(2000);
  });

  it('TC-CUP08 código con espacios → normalizado', () => {
    const disc = calculateCouponDiscount(10000, '  NOVA10  ');
    expect(disc).toBe(1000);
  });

  it('TC-CUP09 subtotal 0 con cupón válido → descuento = 0', () => {
    const disc = calculateCouponDiscount(0, 'NOVA20');
    expect(disc).toBe(0);
  });

  it('TC-CUP10 subtotal decimal → resultado con 2 decimales', () => {
    const disc = calculateCouponDiscount(333.33, 'NOVA10');
    const decimals = disc.toString().split('.')[1];
    expect(decimals === undefined || decimals.length <= 2).toBe(true);
  });
});

// ── Tests de descuento por billetera ─────────────────────────────────────────

describe('Cálculo de descuento por billetera virtual (5%)', () => {

  it('TC-WAL01 método billetera → 5% de descuento', () => {
    const disc = calculateWalletDiscount(10000, 'billetera');
    expect(disc).toBe(500);
  });

  it('TC-WAL02 método tarjeta → sin descuento de billetera', () => {
    const disc = calculateWalletDiscount(10000, 'tarjeta');
    expect(disc).toBe(0);
  });

  it('TC-WAL03 método transferencia → sin descuento', () => {
    const disc = calculateWalletDiscount(10000, 'transferencia');
    expect(disc).toBe(0);
  });

  it('TC-WAL04 método vacío → sin descuento', () => {
    const disc = calculateWalletDiscount(10000, '');
    expect(disc).toBe(0);
  });

  it('TC-WAL05 subtotal 100 con billetera → 5.00', () => {
    const disc = calculateWalletDiscount(100, 'billetera');
    expect(disc).toBe(5);
  });

  it('TC-WAL06 subtotal 0 con billetera → 0', () => {
    const disc = calculateWalletDiscount(0, 'billetera');
    expect(disc).toBe(0);
  });
});

// ── Tests de total con IVA ────────────────────────────────────────────────────

describe('Cálculo del total final (subtotal - descuentos + IVA)', () => {

  it('TC-TOT01 sin descuentos → totalWithTax = subtotal * 1.21', () => {
    const total = calculateTotal(10000, 0, calculateTax(10000, 0));
    expect(total).toBe(12100);
  });

  it('TC-TOT02 con descuento → (subtotal - desc) * 1.21', () => {
    const disc  = 1000;
    const tax   = calculateTax(10000, disc);  // 9000 * 0.21 = 1890
    const total = calculateTotal(10000, disc, tax);
    expect(total).toBe(10890);  // 9000 + 1890
  });

  it('TC-TOT03 subtotal = descuento → total = 0', () => {
    const disc  = 1000;
    const tax   = calculateTax(1000, disc);
    const total = calculateTotal(1000, disc, tax);
    expect(total).toBe(0);
  });

  it('TC-TOT04 resultado tiene máximo 2 decimales', () => {
    const tax   = calculateTax(333, 0);
    const total = calculateTotal(333, 0, tax);
    const decimals = total.toString().split('.')[1];
    expect(decimals === undefined || decimals.length <= 2).toBe(true);
  });
});

// ── Tests de combinaciones reales (cupón + billetera) ────────────────────────

describe('Combinaciones de descuentos — escenarios reales del checkout', () => {

  it('TC-COM01 solo billetera, sin cupón → 5% descuento + IVA sobre base reducida', () => {
    const subtotal = 10000;
    const { totalDiscount, taxAmount, totalWithTax } = calculateOrderTotals(subtotal, null, 'billetera');
    expect(totalDiscount).toBe(500);         // 5% de 10000
    expect(taxAmount).toBe(1995);            // 9500 * 0.21 = 1995
    expect(totalWithTax).toBe(11495);        // 9500 + 1995
  });

  it('TC-COM02 cupón NOVA20, sin billetera → 20% descuento + IVA', () => {
    const subtotal = 10000;
    const { totalDiscount, taxAmount, totalWithTax } = calculateOrderTotals(subtotal, 'NOVA20', 'tarjeta');
    expect(totalDiscount).toBe(2000);        // 20% de 10000
    expect(taxAmount).toBe(1680);            // 8000 * 0.21 = 1680
    expect(totalWithTax).toBe(9680);         // 8000 + 1680
  });

  it('TC-COM03 cupón NOVA10 + billetera → ambos descuentos se suman', () => {
    const subtotal = 10000;
    const { couponDiscount, walletDiscount, totalDiscount } = calculateOrderTotals(subtotal, 'NOVA10', 'billetera');
    expect(couponDiscount).toBe(1000);       // 10% de 10000
    expect(walletDiscount).toBe(500);        // 5% de 10000
    expect(totalDiscount).toBe(1500);        // suma de ambos
  });

  it('TC-COM04 cupón NOVA20 + billetera → IVA sobre (subtotal - totalDescuento)', () => {
    const subtotal = 10000;
    const { totalDiscount, taxAmount, totalWithTax } = calculateOrderTotals(subtotal, 'NOVA20', 'billetera');
    const expectedDiscount = 2000 + 500;     // NOVA20(2000) + billetera(500)
    const expectedBase     = 10000 - expectedDiscount;       // 7500
    const expectedTax      = +(expectedBase * 0.21).toFixed(2);  // 1575
    const expectedTotal    = +(expectedBase + expectedTax).toFixed(2); // 9075

    expect(totalDiscount).toBe(expectedDiscount);
    expect(taxAmount).toBe(expectedTax);
    expect(totalWithTax).toBe(expectedTotal);
  });

  it('TC-COM05 sin descuentos, tarjeta → total = subtotal * 1.21', () => {
    const subtotal = 5000;
    const { totalWithTax } = calculateOrderTotals(subtotal, null, 'tarjeta');
    expect(totalWithTax).toBe(+(5000 * 1.21).toFixed(2));
  });

  it('TC-COM06 subtotal 0, cualquier configuración → todo en 0', () => {
    const { couponDiscount, walletDiscount, totalDiscount, taxAmount, totalWithTax } =
      calculateOrderTotals(0, 'NOVA20', 'billetera');
    expect(couponDiscount).toBe(0);
    expect(walletDiscount).toBe(0);
    expect(totalDiscount).toBe(0);
    expect(taxAmount).toBe(0);
    expect(totalWithTax).toBe(0);
  });

  it('TC-COM07 GAMING15 + billetera sobre subtotal real del catálogo', () => {
    // Ejemplo con productos reales: 2 productos a ~25000 y ~20000 = 45000
    const subtotal = 45000;
    const { totalDiscount, totalWithTax } = calculateOrderTotals(subtotal, 'GAMING15', 'billetera');
    const expectedDiscount = +(45000 * 0.15 + 45000 * 0.05).toFixed(2); // 6750 + 2250 = 9000
    const expectedBase     = 45000 - 9000;  // 36000
    const expectedTotal    = +(36000 * 1.21).toFixed(2);  // 43560

    expect(totalDiscount).toBe(expectedDiscount);
    expect(totalWithTax).toBe(expectedTotal);
  });

  it('TC-COM08 los descuentos nunca producen total negativo', () => {
    // Cupón máximo (NOVA20) + billetera = 25% sobre subtotal pequeño
    const subtotal = 100;
    const { totalWithTax } = calculateOrderTotals(subtotal, 'NOVA20', 'billetera');
    expect(totalWithTax).toBeGreaterThanOrEqual(0);
  });
});

// ── Tests de propiedades matemáticas ─────────────────────────────────────────

describe('Propiedades matemáticas de los cálculos', () => {

  it('TC-MAT01 totalWithTax siempre >= subtotal - totalDiscount (no puede ser menor que la base)', () => {
    const cases = [
      { subtotal: 10000, coupon: 'NOVA10', method: 'tarjeta'   },
      { subtotal: 50000, coupon: 'NOVA20', method: 'billetera' },
      { subtotal: 1000,  coupon: null,     method: 'tarjeta'   },
    ];
    for (const c of cases) {
      const { totalDiscount, totalWithTax } = calculateOrderTotals(c.subtotal, c.coupon, c.method);
      const base = c.subtotal - totalDiscount;
      expect(totalWithTax).toBeGreaterThanOrEqual(base);
    }
  });

  it('TC-MAT02 IVA siempre = (totalWithTax - base) con tolerancia de 0.01 por redondeos', () => {
    const subtotal = 12345.67;
    const { totalDiscount, taxAmount, totalWithTax } = calculateOrderTotals(subtotal, 'PROMO5', 'tarjeta');
    const base        = subtotal - totalDiscount;
    const calculatedIVA = +(totalWithTax - base).toFixed(2);
    expect(Math.abs(calculatedIVA - taxAmount)).toBeLessThanOrEqual(0.01);
  });

  it('TC-MAT03 descuento con cupón es siempre <= subtotal', () => {
    const subtotal = 100;
    for (const code of Object.keys(VALID_COUPONS)) {
      const disc = calculateCouponDiscount(subtotal, code);
      expect(disc).toBeLessThanOrEqual(subtotal);
    }
  });

  it('TC-MAT04 descuento billetera es siempre <= subtotal', () => {
    const subtotal = 100;
    const disc = calculateWalletDiscount(subtotal, 'billetera');
    expect(disc).toBeLessThanOrEqual(subtotal);
  });

  it('TC-MAT05 todos los valores tienen máximo 2 decimales', () => {
    const subtotal = 33333;
    const { couponDiscount, walletDiscount, totalDiscount, taxAmount, totalWithTax } =
      calculateOrderTotals(subtotal, 'NOVA10', 'billetera');

    const checkDecimals = (n: number) => {
      const parts = n.toString().split('.');
      return parts.length === 1 || parts[1].length <= 2;
    };

    expect(checkDecimals(couponDiscount)).toBe(true);
    expect(checkDecimals(walletDiscount)).toBe(true);
    expect(checkDecimals(totalDiscount)).toBe(true);
    expect(checkDecimals(taxAmount)).toBe(true);
    expect(checkDecimals(totalWithTax)).toBe(true);
  });
});
