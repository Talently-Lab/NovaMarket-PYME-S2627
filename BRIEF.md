# Análisis NovaMarket

NovaMarket es una PYME dedicada a la venta de productos tecnológicos (accesorios, periféricos y gadgets). Actualmente vende a través de redes sociales y marketplaces de terceros, pero necesita dar el salto y contar con su propio canal de venta online para controlar su catálogo, gestionar pedidos y mejorar la experiencia del cliente.

📌 El Problema a Resolver  
Hoy la empresa sufre de dependencia total de plataformas externas, falta de control sobre la experiencia de compra y tiene procesos manuales y desordenados que limitan su crecimiento.

📌 Objetivo del Proyecto (El MVP)  
Desarrollar una plataforma e-commerce web funcional. El foco está en que el flujo sea claro, simple y operativo. El alcance incluye:

**Para Clientes:** Registro y login, catálogo con filtros, carrito de compras y checkout simulado.  
**Para Administradores:** Login de admin, CRUD (Crear, Leer, Actualizar, Borrar) de productos y visualización básica de pedidos.

⚠️ Fuera de Alcance (Restricciones)  
Para llegar con los tiempos (8 semanas de desarrollo), NO se incluirá: pasarela de pagos real, gestión de envíos, integraciones externas ni aplicación móvil. La prioridad absoluta es la funcionalidad por sobre la optimización extrema.

# ¿Qué quiere transmitir?

### **Estética:**

- Moderna  
- Dinámica  
- Cercana

| Decisión de compra personalizada ✅ No solo mostrar productos ❌ | Compra personalizada | Comunicación Tech y Juvenil |
| :---- | :---- | :---- |
| Base Profesional Confianza | Presencia Gamer dentro de la propuesta general | Comparar alternativas Encontrar opción |

\# Palabras clave sacado del PDF [https://novamarket.atlassian.net/jira/software/projects/SCRUM/boards/1?filter=\&groupBy=none\&selectedIssue=SCRUM-11](https://novamarket.atlassian.net/jira/software/projects/SCRUM/boards/1?filter=&groupBy=none&selectedIssue=SCRUM-11)  
---

[Los 5 Marketplaces que están dominando el comercio electrónico en Latino America](https://es.linkedin.com/pulse/los-5-marketplaces-que-est%C3%A1n-dominando-el-comercio-electr%C3%B3nico-olzse)

---

## **User Flow — NovaMarket**

### **1\. Cliente**

**Inicio / Landing**  
→ Explorar propuesta de NovaMarket  
→ Ver categorías destacadas  
→ Buscar producto  
→ Explorar catálogo

**Catálogo**  
→ Ver productos  
→ Filtrar productos  
→ Ordenar productos  
→ Seleccionar producto

Desde el catálogo el usuario puede:

→ **Comparar alternativas**  
→ Volver al catálogo  
→ Seleccionar producto

**Detalle del producto**  
→ Ver imágenes  
→ Ver nombre y descripción  
→ Ver precio  
→ Ver características  
→ Ver disponibilidad  
→ Evaluar alternativas relacionadas  
→ Agregar al carrito

→ **Agregar al carrito**  
→ Continuar comprando  
→ Ir al carrito

**Carrito**  
→ Ver productos seleccionados  
→ Modificar cantidades  
→ Eliminar productos  
→ Ver subtotal / total  
→ Continuar comprando  
→ Iniciar checkout

**Checkout**  
→ Si NO está logueado → Registro / Login  
→ Si está logueado → Continuar

**Registro**  
→ Completar datos  
→ Crear cuenta  
→ Acceder al checkout

**Login**  
→ Ingresar credenciales  
→ Validar acceso  
→ Acceder al checkout

**Checkout**  
→ Revisar productos  
→ Revisar datos del cliente  
→ Confirmar pedido  
→ Checkout simulado

**Pedido confirmado**  
→ Mostrar confirmación  
→ Mostrar número/resumen del pedido  
→ Finalizar

---

### **2\. Administrador**

**Login de Administrador**  
→ Ingresar credenciales  
→ Validar acceso  
→ Dashboard

**Dashboard**  
→ Ver resumen básico  
→ Gestionar productos  
→ Ver pedidos

**Gestión de Productos**  
→ Ver listado de productos  
→ Buscar / filtrar productos  
→ Crear producto  
→ Editar producto  
→ Eliminar producto  
→ Confirmar eliminación  
→ Volver al listado

**Crear producto**  
→ Completar información  
→ Guardar producto  
→ Producto creado  
→ Volver al listado

**Editar producto**  
→ Seleccionar producto  
→ Modificar información  
→ Guardar cambios  
→ Producto actualizado  
→ Volver al listado

**Pedidos**  
→ Ver listado de pedidos  
→ Seleccionar pedido  
→ Ver información básica del pedido  
→ Volver al listado

---

## **Flujo principal resumido**

CLIENTE

Inicio  
  ↓  
Catálogo  
  ↓  
Buscar / Filtrar / Ordenar  
  ↓  
Ver producto  
  ↓  
Comparar alternativas  
  ↓  
Agregar al carrito  
  ↓  
Carrito  
  ├──→ Continuar comprando → Catálogo  
  ↓  
Checkout  
  ↓  
¿Usuario logueado?  
  ├── NO → Registro / Login  
  │          ↓  
  │       Checkout  
  │  
  └── SÍ  
       ↓  
Revisar pedido  
       ↓  
Confirmar pedido  
       ↓  
Checkout simulado  
       ↓  
Pedido confirmado

ADMINISTRADOR

Login  
  ↓  
Dashboard  
  ├──→ Productos  
  │      ├── Ver productos  
  │      ├── Crear producto  
  │      ├── Editar producto  
  │      └── Eliminar producto  
  │  
  └──→ Pedidos  
         ├── Ver pedidos  
         └── Ver detalle

