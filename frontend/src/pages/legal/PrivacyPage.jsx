export default function PrivacyPage() {
  return (
    <div className="legal-page">
      <div className="legal-page__header">
        <p className="legal-page__notice">
          ⚠️ Este documento es parte de un proyecto educativo simulado (Talently Lab).
          No tiene valor legal real.
        </p>
        <h1 className="legal-page__title">Política de Privacidad</h1>
        <p className="legal-page__meta">Última actualización: septiembre 2026</p>
      </div>

      <div className="legal-page__body">
        <section>
          <h2>1. Responsable del tratamiento</h2>
          <p>
            NovaMarket (proyecto educativo simulado — Talently Lab) es responsable del
            tratamiento de los datos personales recolectados a través de esta plataforma.
          </p>
        </section>

        <section>
          <h2>2. Datos que recolectamos</h2>
          <p>Al registrarte y realizar compras recolectamos:</p>
          <ul>
            <li><strong>Datos de cuenta:</strong> nombre completo, dirección de email y contraseña (almacenada con hash bcrypt)</li>
            <li><strong>Datos de envío:</strong> nombre, dirección, ciudad y teléfono (al realizar un pedido)</li>
            <li><strong>Datos de uso:</strong> historial de pedidos dentro de la plataforma</li>
          </ul>
        </section>

        <section>
          <h2>3. Finalidad del tratamiento</h2>
          <p>Usamos tus datos exclusivamente para:</p>
          <ul>
            <li>Gestionar tu cuenta y autenticación</li>
            <li>Procesar y registrar tus pedidos</li>
            <li>Brindarte soporte cuando lo necesitás</li>
          </ul>
          <p>No vendemos ni compartimos tus datos con terceros para fines comerciales.</p>
        </section>

        <section>
          <h2>4. Base legal (Ley 25.326 — Argentina)</h2>
          <p>
            El tratamiento de tus datos se realiza con tu consentimiento explícito al
            aceptar esta política durante el registro, de acuerdo con la Ley N° 25.326
            de Protección de Datos Personales de la República Argentina.
          </p>
        </section>

        <section>
          <h2>5. Almacenamiento y seguridad</h2>
          <p>
            Tus datos se almacenan en base de datos PostgreSQL alojada en Supabase (AWS
            us-east-1). Las contraseñas se almacenan con hash bcrypt y nunca en texto
            plano. La comunicación se realiza exclusivamente por HTTPS.
          </p>
        </section>

        <section>
          <h2>6. Plazo de conservación</h2>
          <p>
            Conservamos tus datos mientras tu cuenta esté activa. Podés solicitar la
            eliminación de tu cuenta y datos en cualquier momento contactándonos.
          </p>
        </section>

        <section>
          <h2>7. Tus derechos</h2>
          <p>Tenés derecho a:</p>
          <ul>
            <li><strong>Acceso:</strong> conocer qué datos tenemos sobre vos</li>
            <li><strong>Rectificación:</strong> corregir datos incorrectos</li>
            <li><strong>Supresión:</strong> solicitar la eliminación de tus datos</li>
            <li><strong>Oposición:</strong> oponerte al tratamiento de tus datos</li>
          </ul>
        </section>

        <section>
          <h2>8. Cookies</h2>
          <p>
            NovaMarket utiliza localStorage del navegador para mantener tu sesión activa
            (token JWT) y las preferencias de tema (claro/oscuro). No utilizamos cookies
            de seguimiento ni publicidad.
          </p>
        </section>

        <section>
          <h2>9. Contacto</h2>
          <p>
            Para ejercer tus derechos o consultas sobre privacidad:{' '}
            <a href="mailto:privacidad@novamarket.com">privacidad@novamarket.com</a>
          </p>
        </section>
      </div>
    </div>
  );
}
