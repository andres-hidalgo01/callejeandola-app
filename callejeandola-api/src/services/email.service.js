const { Resend } = require("resend");

const RESEND_TIMEOUT_MS = Number(
    process.env.RESEND_TIMEOUT_MS || 8000
);

/**
 * Verifica si Resend está seleccionado como proveedor.
 */
function isResendEnabled() {
    return String(process.env.EMAIL_PROVIDER || "")
        .trim()
        .toLowerCase() === "resend";
}

/**
 * Verifica que existan las variables mínimas requeridas.
 */
function hasResendConfig() {
    return Boolean(
        process.env.RESEND_API_KEY &&
        process.env.MAIL_FROM
    );
}

/**
 * Fallback de emergencia.
 *
 * IMPORTANTE:
 * El código solamente debería mostrarse en logs cuando
 * Resend no esté disponible o falle el envío.
 */
function logVerificationCode({ to, code }) {
    console.log("");
    console.log("========================================");
    console.log("CALLEJEANDOLA EMAIL VERIFICATION FALLBACK");
    console.log("Email:", to);
    console.log("Code:", code);
    console.log("Expires in: 15 minutes");
    console.log("========================================");
    console.log("");
}

/**
 * Evita que una llamada externa quede esperando indefinidamente.
 */
function withTimeout(promise, timeoutMs) {
    return Promise.race([
        promise,

        new Promise((_, reject) => {
            setTimeout(() => {
                reject(
                    new Error(
                        `Resend timeout after ${timeoutMs}ms`
                    )
                );
            }, timeoutMs);
        }),
    ]);
}

/**
 * HTML del correo de verificación.
 */
function buildVerificationEmail({ name, code }) {
    return `
        <div style="
            margin: 0;
            padding: 0;
            background: #020617;
            font-family: Arial, Helvetica, sans-serif;
            color: #e5e7eb;
        ">
            <div style="
                display: none;
                max-height: 0;
                overflow: hidden;
                opacity: 0;
                color: transparent;
            ">
                Tu cuenta skater está casi lista.
                Usá este código para verificar tu correo.
            </div>

            <div style="
                max-width: 560px;
                margin: 0 auto;
                padding: 28px 18px;
            ">
                <div style="
                    border: 1px solid rgba(34, 211, 238, 0.28);
                    border-radius: 24px;
                    overflow: hidden;
                    background: #07111f;
                    box-shadow: 0 24px 80px rgba(0, 0, 0, 0.35);
                ">
                    <div style="
                        padding: 24px;
                        border-bottom: 1px solid rgba(148, 163, 184, 0.16);
                    ">
                        <div style="
                            display: inline-block;
                            padding: 7px 10px;
                            margin-bottom: 12px;
                            border-radius: 999px;
                            background: rgba(34, 211, 238, 0.12);
                            color: #67e8f9;
                            font-size: 12px;
                            font-weight: 800;
                            letter-spacing: 0.08em;
                            text-transform: uppercase;
                        ">
                            Cuenta skater
                        </div>

                        <h1 style="
                            margin: 0;
                            color: #ffffff;
                            font-size: 27px;
                            line-height: 1.1;
                            font-weight: 900;
                        ">
                            Bienvenido a Callejeandola
                        </h1>

                        <p style="
                            margin: 10px 0 0;
                            color: #94a3b8;
                            font-size: 14px;
                            line-height: 1.5;
                        ">
                            Spots, eventos, shops y rutas para la escena skate.
                        </p>
                    </div>

                    <div style="padding: 24px;">
                        <h2 style="
                            margin: 0 0 12px;
                            color: #f8fafc;
                            font-size: 22px;
                            line-height: 1.2;
                        ">
                            Verificá tu correo
                        </h2>

                        <p style="
                            margin: 0 0 18px;
                            color: #cbd5e1;
                            font-size: 15px;
                            line-height: 1.55;
                        ">
                            Hola ${name || "skater"}, tu cuenta está casi lista.
                            Usá este código para activar tu perfil y continuar
                            en Callejeandola.
                        </p>

                        <div style="
                            display: inline-block;
                            margin: 6px 0 18px;
                            padding: 16px 22px;
                            border-radius: 18px;
                            background: #06b6d4;
                            color: #ffffff;
                            font-size: 34px;
                            font-weight: 900;
                            letter-spacing: 9px;
                        ">
                            ${code}
                        </div>

                        <p style="
                            margin: 0 0 10px;
                            color: #cbd5e1;
                            font-size: 14px;
                            line-height: 1.5;
                        ">
                            El código expira en 15 minutos por seguridad.
                        </p>

                        <p style="
                            margin: 0;
                            color: #64748b;
                            font-size: 13px;
                            line-height: 1.5;
                        ">
                            Si no creaste esta cuenta, podés ignorar este correo.
                        </p>
                    </div>

                    <div style="
                        padding: 16px 24px;
                        border-top: 1px solid rgba(148, 163, 184, 0.16);
                        color: #64748b;
                        font-size: 12px;
                        line-height: 1.5;
                    ">
                        Callejeandola · Costa Rica ·
                        Skate spots, eventos y comunidad.
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Envía el código de verificación mediante Resend.
 *
 * Si:
 * - Resend no está activado,
 * - faltan variables,
 * - Resend devuelve error,
 * - hay timeout,
 *
 * el código queda disponible mediante fallback de consola.
 */
async function sendVerificationEmail({ to, name, code }) {
    if (!isResendEnabled()) {
        console.warn(
            "EMAIL_PROVIDER no está configurado como resend. Using console fallback."
        );

        logVerificationCode({ to, code });

        return {
            sent: false,
            fallback: "console",
        };
    }

    if (!hasResendConfig()) {
        console.warn(
            "Resend configuration incomplete. Using console fallback."
        );

        logVerificationCode({ to, code });

        return {
            sent: false,
            fallback: "console",
        };
    }

    const resend = new Resend(
        process.env.RESEND_API_KEY
    );

    try {
        const response = await withTimeout(
            resend.emails.send({
                from: process.env.MAIL_FROM,
                to: [to],
                subject: "Tu código para activar Callejeandola",
                html: buildVerificationEmail({
                    name,
                    code,
                }),
            }),
            RESEND_TIMEOUT_MS
        );

        const { data, error } = response || {};

        if (error) {
            throw new Error(
                error.message ||
                "Resend API returned an unknown error"
            );
        }

        console.log(
            "Verification email sent via Resend:",
            to,
            data?.id ? `Email ID: ${data.id}` : ""
        );

        return {
            sent: true,
            provider: "resend",
            id: data?.id || null,
        };
    } catch (error) {
        console.error(
            "Resend send failed. Using console fallback:",
            error.message
        );

        logVerificationCode({
            to,
            code,
        });

        return {
            sent: false,
            fallback: "console",
            error: error.message,
        };
    }
}

module.exports = {
    sendVerificationEmail,
};