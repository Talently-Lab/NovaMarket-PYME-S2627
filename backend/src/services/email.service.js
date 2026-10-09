const https = require('https');

/**
 * Envía email usando la API HTTP de Brevo (no SMTP).
 * SMTP está bloqueado en Render free tier — la API HTTP funciona sin restricciones.
 * Requiere las variables de entorno BREVO_API_KEY y BREVO_SENDER_EMAIL.
 *
 * Obtener API key: app.brevo.com → Configuración → SMTP y API → pestaña API Keys
 */

/**
 * Envía el código de recuperación de contraseña por email.
 * @param {string} to     - Email del destinatario
 * @param {string} token  - Código de 6 dígitos
 * @returns {Promise<boolean>} true si se envió, false si falló
 */
async function sendPasswordResetEmail(to, token) {
  if (!process.env.BREVO_API_KEY) {
    console.error('[Email] Falta variable BREVO_API_KEY');
    return false;
  }

  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'christiansanti.martinez@gmail.com';
  const senderName  = 'NovaMarket';

  const body = JSON.stringify({
    sender:  { name: senderName, email: senderEmail },
    to:      [{ email: to }],
    subject: 'Recuperá tu contraseña — NovaMarket',
    htmlContent: `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body style="margin:0;padding:0;background:#F6F8FD;font-family:'Inter',sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#F6F8FD;padding:40px 0;">
          <tr>
            <td align="center">
              <table width="480" cellpadding="0" cellspacing="0" style="background:#050506;border-radius:16px;overflow:hidden;">

                <!-- Header -->
                <tr>
                  <td style="padding:32px 40px 24px;border-bottom:1px solid #1a1a2e;">
                    <p style="margin:0;font-family:'Space Grotesk',sans-serif;font-size:22px;font-weight:800;color:#D2EE42;letter-spacing:-0.03em;">
                      Nova<span style="color:#FEFEFE;">Market</span>
                    </p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:32px 40px;">
                    <h1 style="margin:0 0 12px;font-family:'Space Grotesk',sans-serif;font-size:24px;font-weight:700;color:#FEFEFE;letter-spacing:-0.02em;">
                      Recuperá tu contraseña
                    </h1>
                    <p style="margin:0 0 8px;font-size:15px;color:#9090a8;line-height:1.6;">
                      Solicitud para: <strong style="color:#FEFEFE;">${to}</strong>
                    </p>
                    <p style="margin:0 0 28px;font-size:15px;color:#9090a8;line-height:1.6;">
                      Usá el siguiente código para continuar:
                    </p>

                    <!-- Código -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding:28px;background:#0d0d1a;border:2px solid #D2EE42;border-radius:12px;">
                          <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#9090a8;text-transform:uppercase;letter-spacing:0.1em;">
                            Tu código de verificación
                          </p>
                          <p style="margin:0;font-family:'Courier New',monospace;font-size:42px;font-weight:900;color:#D2EE42;letter-spacing:0.2em;">
                            ${token}
                          </p>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:24px 0 0;font-size:13px;color:#6b6b80;line-height:1.6;">
                      ⏱ Este código expira en <strong style="color:#FEFEFE;">15 minutos</strong>.<br/>
                      Si no solicitaste este cambio, ignorá este email — tu cuenta sigue segura.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding:20px 40px 28px;border-top:1px solid #1a1a2e;">
                    <p style="margin:0;font-size:12px;color:#6b6b80;text-align:center;">
                      NovaMarket © 2026 · Proyecto educativo Talently Lab<br/>
                      Este es un email automático, no respondas este mensaje.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  });

  return new Promise((resolve) => {
    const options = {
      hostname: 'api.brevo.com',
      path:     '/v3/smtp/email',
      method:   'POST',
      headers:  {
        'accept':       'application/json',
        'content-type': 'application/json',
        'api-key':      process.env.BREVO_API_KEY,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`[Email] Código enviado a ${to}`);
          resolve(true);
        } else {
          console.error(`[Email] Error API Brevo ${res.statusCode}:`, data);
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      console.error('[Email] Error al enviar:', err.message);
      resolve(false);
    });

    req.write(body);
    req.end();
  });
}

module.exports = { sendPasswordResetEmail };
