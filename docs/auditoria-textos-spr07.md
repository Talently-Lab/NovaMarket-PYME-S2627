# Auditoría de Textos Finales — Sprint 07 (Copy QA)

> Documento original: `docs/Spr07pdf.pdf`
> Responsable: Marketing / Lucía Chiarandini
> Incorporado al repo: 16/oct/2026

---

## 1. Barra superior del Header (reemplaza "Lorem ipsum")

**Opciones evaluadas:**
- Opción 1: ☎ Atención al cliente: (011) XXXX-XXXX | ✉ ventas@novamarket.com.ar
- Opción 2: ✉ Consultas y ventas: ventas@novamarket.com.ar | Contáctanos
- Opción 3: ¿Tenés dudas? Contáctanos | ✉ ventas@novamarket.com.ar
- Opción 4: ¡Aprovechá nuestras ofertas y renová tus accesorios!
- Opción 5: Envío gratis + promociones exclusivas en productos seleccionados.
- Opción 6: Envío gratis en compras superiores a $100.000

**✅ Opción elegida definitiva:**
> "Promociones exclusivas en productos seleccionados + envío gratis en compras superiores a $70.000"

**Estado:** ⏳ Pendiente aplicar en `Header.jsx` (línea del promo bar)

---

## 2. Título principal del Hero

**✅ Texto definitivo:** "Tecnología que simplifica tu vida"

**Estado:** ✅ Ya implementado

---

## 3. Subtítulo del Hero

**Texto anterior:** "Encontra tu próximo setup"

**✅ Texto definitivo:** "Todo lo que necesitás, en un solo lugar"

**Estado:** ⏳ Pendiente aplicar en `HomePage.jsx`

---

## 4. Navegación — etiquetas del menú

- "Home" → **✅ "Inicio"** — ya aplicado (commit `b6a1dab`)
- "Catálogo" → reemplazado por **"Notebooks"** como segunda entrada del nav — ya aplicado (commit `b6a1dab`)

---

## 5. Sección Marca en filtros del Catálogo

**Problema:** cuando no hay marcas cargadas en BD, aparece "Sin marcas disponibles".

**✅ Fix aplicado:** la sección Marca se oculta completamente cuando no hay marcas (commit `4172e54`).

**Pendiente (si se quiere mejorar):** agregar buscador con ícono lupa o lista desplegable vertical, al estilo del filtro de Categorías.

---

## 6. Links del Footer — Centro de ayuda / Garantías / Contacto

**Problema:** los links "Centro de ayuda FAQ", "Garantías y devoluciones" y "Contacto con ventas" generan error (páginas no implementadas).

**Estado:** ⏳ Pendiente — definir si van a una página real, a un formulario de contacto, o se eliminan del MVP.

---

## 7. Mensaje de error en Login

**Texto anterior:** "Credenciales inválidas"

**✅ Texto definitivo:** "Datos incorrectos, intente de nuevo"

**Estado:** ⏳ Pendiente aplicar en `LoginPage.jsx` y/o el backend (`auth.controller.js`)

---

## Resumen de pendientes

| # | Item | Archivo | Estado |
|---|------|---------|--------|
| 1 | Texto promo bar header | `Header.jsx` | ⏳ Pendiente |
| 3 | Subtítulo hero | `HomePage.jsx` | ⏳ Pendiente |
| 6 | Links footer sin página | `Footer.jsx` | ⏳ Pendiente decisión |
| 7 | Mensaje error login | `LoginPage.jsx` / `auth.controller.js` | ⏳ Pendiente |
