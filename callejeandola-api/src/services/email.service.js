const nodemailer = require("nodemailer");

const SMTP_TIMEOUT_MS = Number(process.env.SMTP_TIMEOUT_MS || 8000);

function hasSmtpConfig() {
    return Boolean(
        process.env.SMTP_HOST &&
        process.env.SMTP_PORT &&
        process.env.SMTP_USER &&
        process.env.SMTP_PASS &&
        process.env.MAIL_FROM
    );
}

function logVerificationCode({ to, code }) {
    console.log("========================================");
    console.log("CALLEJEANDOLA EMAIL VERIFICATION");
    console.log("Email:", to);
    console.log("Code:", code);
    console.log("Expires in: 15 minutes");
    console.log("========================================");
}

function createTransporter() {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: String(process.env.SMTP_SECURE || "false") === "true",
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        connectionTimeout: SMTP_TIMEOUT_MS,
        greetingTimeout: SMTP_TIMEOUT_MS,
        socketTimeout: SMTP_TIMEOUT_MS,
    });
}

function withTimeout(promise, timeoutMs) {
    return Promise.race([
        promise,
        new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error(`SMTP timeout after ${timeoutMs}ms`));
            }, timeoutMs);
        }),
    ]);
}

async function sendVerificationEmail({ to, name, code }) {
    logVerificationCode({ to, code });

    if (!hasSmtpConfig()) {
        console.warn("SMTP no configurado. Usando código de consola.");
        return {
            sent: false,
            fallback: "console",
        };
    }

    const transporter = createTransporter();

    try {
        await withTimeout(
            transporter.sendMail({
                from: process.env.MAIL_FROM,
                to,
                subject: "Tu código para activar Callejeandola",
                html: `
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
                            Tu cuenta skater está casi lista. Usá este código para verificar tu correo.
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
                                background:
                                    radial-gradient(circle at top right, rgba(124, 58, 237, 0.22), transparent 34%),
                                    linear-gradient(180deg, #07111f 0%, #020617 100%);
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
                                        Usá este código para activar tu perfil y continuar en Callejeandola.
                                    </p>

                                    <div style="
                                        display: inline-block;
                                        margin: 6px 0 18px;
                                        padding: 16px 22px;
                                        border-radius: 18px;
                                        background: linear-gradient(135deg, #06b6d4, #7c3aed);
                                        color: #ffffff;
                                        font-size: 34px;
                                        font-weight: 900;
                                        letter-spacing: 9px;
                                        box-shadow: 0 18px 42px rgba(6, 182, 212, 0.22);
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
                                    Callejeandola · Costa Rica · Skate spots, eventos y comunidad.
                                </div>
                            </div>
                        </div>
                    </div>
                `,
            }),
            SMTP_TIMEOUT_MS
        );

        console.log("Verification email sent:", to);

        return {
            sent: true,
        };
    } catch (error) {
        console.error("SMTP send failed. Using console fallback:", error.message);

        return {
            sent: false,
            fallback: "console",
            error: error.message,
        };
    } finally {
        transporter.close();
    }
}

module.exports = {
    sendVerificationEmail,
};