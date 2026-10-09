const nodemailer = require('nodemailer');

/**
 * Crea el transporter de Nodemailer usando Brevo (ex Sendinblue) SMTP.
 * Requiere las variables de entorno BREVO_USER y BREVO_SMTP_KEY.
 * Instrucciones para obtener la clave SMTP:
 *   1. Ir a app.brevo.com → Configuración → Transaccional → SMTP y API
 *   2. Copiar el Login (email de la cuenta) en BREVO_USER
 *   3. Generar o copiar la contraseña SMTP en BREVO_SMTP_KEY
 */
const createTransporter = () =>
  nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.BREVO_USER,
      pass: process.env.BREVO_SMTP_KEY,
    },
  });

/**
 * Envía el código de recuperación de contraseña por email.
 * @param {string} to     - Email del destinatario
 * @param {string} token  - Código de 6 dígitos
 * @returns {Promise<boolean>} true si se envió, false si falló
 */
async function sendPasswordResetEmail(to, token) {
  if (!process.env.BREVO_USER || !process.env.BREVO_SMTP_KEY) {
    console.error('[Email] Faltan variables BREVO_USER o BREVO_SMTP_KEY');
    return false;
  }

  const transporter = createTransporter();

  const html = `
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
  `;

  try {
    await transporter.sendMail({
      from: `"NovaMarket" <${process.env.BREVO_USER}>`,
      to,
      subject: 'Recuperá tu contraseña — NovaMarket',
      html,
    });

    console.log(`[Email] Código enviado a ${to}`);
    return true;
  } catch (err) {
    console.error('[Email] Error al enviar:', err.message);
    return false;
  }
}

module.exports = { sendPasswordResetEmail };
