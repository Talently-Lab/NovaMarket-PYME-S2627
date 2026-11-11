export default function TermsPage() {
  return (
    <div className="legal-page">
      <div className="legal-page__header">
        <p className="legal-page__notice">
          ⚠️ Este documento es parte de un proyecto educativo simulado (Talently Lab).
          No tiene valor legal real.
        </p>
        <h1 className="legal-page__title">Términos y Condiciones</h1>
        <p className="legal-page__meta">Última actualización: septiembre 2026</p>
      </div>

      <div className="legal-page__body">
        <section>
          <h2>1. Aceptación de los términos</h2>
          <p>
            Al crear una cuenta y utilizar NovaMarket, aceptás estos Términos y Condiciones
            en su totalidad. Si no estás de acuerdo, no debés usar el servicio.
          </p>
        </section>

        <section>
          <h2>2. Descripción del servicio</h2>
          <p>
            NovaMarket es una plataforma de e-commerce que permite la compra de accesorios,
            periféricos y gadgets tecnológicos. El checkout es simulado y no se realizan
            cobros reales.
          </p>
        </section>

        <section>
          <h2>3. Registro y cuenta</h2>
          <p>
            Para realizar compras debés registrarte con un email válido y una contraseña
            segura. Sos responsable de mantener la confidencialidad de tus credenciales.
          </p>
        </section>

        <section>
          <h2>4. Uso aceptable</h2>
          <p>
            Queda prohibido usar NovaMarket para actividades fraudulentas, enviar spam,
            intentar acceder a cuentas ajenas o interferir con el funcionamiento del servicio.
          </p>
        </section>

        <section>
          <h2>5. Disponibilidad del servicio</h2>
          <p>
            NovaMarket se ofrece "tal cual" sin garantías de disponibilidad continua.
            El servicio puede sufrir interrupciones por mantenimiento sin previo aviso.
          </p>
        </section>

        <section>
          <h2>6. Limitación de responsabilidad</h2>
          <p>
            En ningún caso NovaMarket será responsable por daños indirectos, incidentales
            o consecuentes derivados del uso o imposibilidad de uso del servicio.
          </p>
        </section>

        <section>
          <h2>7. Modificaciones</h2>
          <p>
            Nos reservamos el derecho de modificar estos términos en cualquier momento.
            Los cambios entran en vigor al publicarse en esta página.
          </p>
        </section>

        <section>
          <h2>8. Contacto</h2>
          <p>
            Para consultas sobre estos términos podés contactarnos en{' '}
            <a href="mailto:soporte@novamarket.com">soporte@novamarket.com</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
