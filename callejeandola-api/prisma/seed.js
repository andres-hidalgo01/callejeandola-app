require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

/* =========================================================
   SAFETY GUARDS
   ---------------------------------------------------------
   Este seed es SOLO para desarrollo/local.

   Bloquea:
   - NODE_ENV=production
   - DATABASE_URL que no apunte a localhost / 127.0.0.1

   Esto evita ejecutar accidentalmente datos demo
   contra PostgreSQL de producción.
========================================================= */

const NODE_ENV = String(process.env.NODE_ENV || "")
    .trim()
    .toLowerCase();

const DATABASE_URL = String(process.env.DATABASE_URL || "").trim();

if (NODE_ENV === "production") {
    console.error("");
    console.error("====================================================");
    console.error("SEED BLOCKED");
    console.error("prisma/seed.js is DEVELOPMENT-ONLY.");
    console.error("NODE_ENV=production detected.");
    console.error("====================================================");
    console.error("");

    process.exit(1);
}

if (!DATABASE_URL) {
    console.error("");
    console.error("====================================================");
    console.error("SEED BLOCKED");
    console.error("DATABASE_URL is missing.");
    console.error("====================================================");
    console.error("");

    process.exit(1);
}

let databaseHostname = "";

try {
    const parsedDatabaseUrl = new URL(DATABASE_URL);
    databaseHostname = parsedDatabaseUrl.hostname;
} catch (error) {
    console.error("");
    console.error("====================================================");
    console.error("SEED BLOCKED");
    console.error("DATABASE_URL is invalid.");
    console.error(error.message);
    console.error("====================================================");
    console.error("");

    process.exit(1);
}

const LOCAL_DATABASE_HOSTS = new Set([
    "localhost",
    "127.0.0.1",
    "::1",
]);

if (!LOCAL_DATABASE_HOSTS.has(databaseHostname)) {
    console.error("");
    console.error("====================================================");
    console.error("SEED BLOCKED");
    console.error("Database is NOT local.");
    console.error(`Detected host: ${databaseHostname}`);
    console.error("");
    console.error(
        "This seed can only run against localhost / 127.0.0.1."
    );
    console.error("====================================================");
    console.error("");

    process.exit(1);
}

/* =========================================================
   DEVELOPMENT PASSWORD
   ---------------------------------------------------------
   Puedes sobreescribirlo desde .env usando:

   SEED_DEV_PASSWORD=123456

   Si no existe, usa 123456.
========================================================= */

const DEV_PASSWORD =
    process.env.SEED_DEV_PASSWORD || "123456";

/* =========================================================
   USERS
========================================================= */

const users = [
    {
        name: "Global Admin",
        email: "admin@callejeandola.com",
        password: DEV_PASSWORD,
        role: "GLOBAL_ADMIN",
        country: "Costa Rica",
        active: true,
    },
    {
        name: "Local Admin CR",
        email: "localadmin@callejeandola.com",
        password: DEV_PASSWORD,
        role: "LOCAL_ADMIN",
        country: "Costa Rica",
        active: true,
    },
    {
        name: "Judge Demo",
        email: "judge@callejeandola.com",
        password: DEV_PASSWORD,
        role: "JUDGE",
        country: "Costa Rica",
        active: true,
    },
    {
        name: "Skater Demo",
        email: "skater@callejeandola.com",
        password: DEV_PASSWORD,
        role: "SKATER",
        country: "Costa Rica",
        active: true,
    },
];

/* =========================================================
   SPOTS
========================================================= */

const spots = [
    {
        name: "Parque de Patinaje Los Lagos",
        description:
            "Skatepark público en Los Lagos, Heredia. Spot principal para probar navegación, favoritos y route hub.",
        country: "Costa Rica",
        city: "Heredia",
        zone: "Los Lagos",
        type: "Street",
        lat: 9.9735432,
        lng: -84.1143624,
        verified: true,
        image: "",
    },
    {
        name: "Skate Park José María Zeledón",
        description:
            "Skatepark ubicado en Curridabat, San José. Buen punto para pruebas de ruta y eventos locales.",
        country: "Costa Rica",
        city: "San José",
        zone: "Curridabat",
        type: "Park",
        lat: 9.9147,
        lng: -84.0349,
        verified: true,
        image: "",
    },
    {
        name: "Skatepark Los Pinos",
        description:
            "Skatepark en Cartago usado como spot demo para validar filtros, rutas y cards.",
        country: "Costa Rica",
        city: "Cartago",
        zone: "Los Pinos",
        type: "Park",
        lat: 9.8644,
        lng: -83.9194,
        verified: false,
        image: "",
    },
    {
        name: "Skatepark 214 San Rafael Abajo",
        description:
            "Spot comunitario en San Rafael Abajo, Desamparados. Usado como demo de comunidad local.",
        country: "Costa Rica",
        city: "San José",
        zone: "Desamparados",
        type: "Street",
        lat: 9.8938,
        lng: -84.0632,
        verified: false,
        image: "",
    },
    {
        name: "Heredia Skate Plaza",
        description:
            "Skate plaza en Heredia. Referencia para espacios urbanos de skate y BMX.",
        country: "Costa Rica",
        city: "Heredia",
        zone: "Centro",
        type: "Plaza",
        lat: 9.9981,
        lng: -84.1165,
        verified: false,
        image: "",
    },
    {
        name: "San Jorge Skate Spot",
        description:
            "Spot demo en San Jorge, Heredia. Pendiente validación fina de coordenadas.",
        country: "Costa Rica",
        city: "Heredia",
        zone: "San Jorge",
        type: "Street",
        lat: 10.0008,
        lng: -84.1199,
        verified: false,
        image: "",
    },
    {
        name: "Nosara Skatepark",
        description:
            "Skatepark de Nosara. Spot de referencia para escena de playa y turismo skate.",
        country: "Costa Rica",
        city: "Guanacaste",
        zone: "Nosara",
        type: "Park",
        lat: 9.9765,
        lng: -85.6529,
        verified: false,
        image: "",
    },
    {
        name: "Jacó Centro Cívico Skatepark",
        description:
            "Skatepark en Jacó, usado como punto demo para spots de playa y eventos.",
        country: "Costa Rica",
        city: "Puntarenas",
        zone: "Jacó Centro Cívico",
        type: "Park",
        lat: 9.6167,
        lng: -84.6296,
        verified: false,
        image: "",
    },
    {
        name: "Parque de la Paz Skate Zone",
        description:
            "Zona de práctica dentro del Parque de la Paz. Útil para sesiones y encuentros urbanos.",
        country: "Costa Rica",
        city: "San José",
        zone: "San Sebastián",
        type: "Flat",
        lat: 9.9007,
        lng: -84.0805,
        verified: false,
        image: "",
    },
    {
        name: "La Sabana Flatground",
        description:
            "Área amplia para flatground, cruising y grabación de clips.",
        country: "Costa Rica",
        city: "San José",
        zone: "La Sabana",
        type: "Flat",
        lat: 9.9368,
        lng: -84.1076,
        verified: false,
        image: "",
    },
    {
        name: "San Pedro Street Spot",
        description:
            "Spot urbano cerca de San Pedro. Ideal para pruebas de street filtering.",
        country: "Costa Rica",
        city: "San José",
        zone: "San Pedro",
        type: "Street",
        lat: 9.9364,
        lng: -84.0512,
        verified: false,
        image: "",
    },
    {
        name: "Belén Urban Spot",
        description:
            "Spot demo en Belén, Heredia. Pendiente validación de obstáculos y coordenadas exactas.",
        country: "Costa Rica",
        city: "Heredia",
        zone: "Belén",
        type: "Street",
        lat: 9.9802,
        lng: -84.1825,
        verified: false,
        image: "",
    },
];

/* =========================================================
   EVENTS
========================================================= */

const events = [
    {
        title: "Best Trick Los Lagos",
        description:
            "Evento demo en Los Lagos para probar saved events y route hub.",
        country: "Costa Rica",
        city: "Heredia",
        place: "Parque de Patinaje Los Lagos",
        month: "JUN",
        day: "20",
        time: "2:00 PM",
        price: 0,
        category: "Best Trick",
        lat: 9.9735432,
        lng: -84.1143624,
        image: "",
    },
    {
        title: "Open Jam San José",
        description:
            "Jam local para skaters de todos los niveles.",
        country: "Costa Rica",
        city: "San José",
        place: "Parque de la Paz",
        month: "JUL",
        day: "05",
        time: "3:00 PM",
        price: 0,
        category: "Jam",
        lat: 9.9007,
        lng: -84.0805,
        image: "",
    },
    {
        title: "Street Session Escalante",
        description:
            "Sesión urbana para contenido y comunidad.",
        country: "Costa Rica",
        city: "San José",
        place: "Barrio Escalante",
        month: "JUL",
        day: "12",
        time: "4:00 PM",
        price: 0,
        category: "Street",
        lat: 9.9347,
        lng: -84.0628,
        image: "",
    },
    {
        title: "Nosara Jungle Skate Session",
        description:
            "Evento demo de playa/skate para validar expansión fuera del GAM.",
        country: "Costa Rica",
        city: "Guanacaste",
        place: "Nosara Skatepark",
        month: "AGO",
        day: "02",
        time: "10:00 AM",
        price: 0,
        category: "Session",
        lat: 9.9765,
        lng: -85.6529,
        image: "",
    },
];

/* =========================================================
   SHOPS
========================================================= */

const shops = [
    {
        name: "CJ Test Shop",
        description:
            "Skateshop demo para pruebas de visibilidad.",
        country: "Costa Rica",
        city: "San José",
        category: "Skateshop",
        verified: true,
        promo: true,
        image: "",
    },
    {
        name: "Heredia Skate Supply",
        description:
            "Shop local demo para Heredia.",
        country: "Costa Rica",
        city: "Heredia",
        category: "Skateshop",
        verified: false,
        promo: false,
        image: "",
    },
    {
        name: "Jacó Board Shop",
        description:
            "Shop demo de playa para futuras rutas de skate tourism.",
        country: "Costa Rica",
        city: "Puntarenas",
        category: "Skateshop",
        verified: false,
        promo: false,
        image: "",
    },
    {
        name: "Nosara Skate Supply",
        description:
            "Shop demo para zona de Nosara.",
        country: "Costa Rica",
        city: "Guanacaste",
        category: "Skateshop",
        verified: false,
        promo: false,
        image: "",
    },
];

/* =========================================================
   SPONSORS
========================================================= */

const sponsors = [
    {
        name: "CJ Test Sponsor",
        description:
            "Sponsor demo para barra superior.",
        tier: "FREE",
        url: "",
        logo: "",
        active: true,
    },
    {
        name: "Maxxx Energy",
        description:
            "Sponsor demo con presencia en la app.",
        tier: "PREMIUM",
        url: "",
        logo: "",
        active: true,
    },
    {
        name: "Board House CR",
        description:
            "Sponsor demo tipo shop/marca local.",
        tier: "GOLD",
        url: "",
        logo: "",
        active: true,
    },
    {
        name: "Skateparks CR",
        description:
            "Referencia demo para comunidad y contenido de skateparks.",
        tier: "COMMUNITY",
        url: "https://www.facebook.com/p/Skateparks-de-Costa-Rica-100083330891483/",
        logo: "",
        active: true,
    },
];

/* =========================================================
   USERS UPSERT
========================================================= */

async function upsertUsers() {
    for (const user of users) {
        const hashedPassword = await bcrypt.hash(
            user.password,
            10
        );

        await prisma.user.upsert({
            where: {
                email: user.email,
            },

            update: {
                name: user.name,

                // IMPORTANTE:
                // También actualizamos password.
                // Así npm run seed resetea correctamente
                // los usuarios DEV.
                password: hashedPassword,

                role: user.role,
                country: user.country,
                active: user.active,
            },

            create: {
                name: user.name,
                email: user.email,
                password: hashedPassword,
                role: user.role,
                country: user.country,
                active: user.active,
            },
        });
    }
}

/* =========================================================
   GENERIC UPSERT BY NAME
========================================================= */

async function upsertByName(model, items) {
    for (const item of items) {
        const { id, ...data } = item;

        const existing = await model.findFirst({
            where: {
                name: data.name,
            },
        });

        if (existing) {
            await model.update({
                where: {
                    id: existing.id,
                },
                data,
            });
        } else {
            await model.create({
                data,
            });
        }
    }
}

/* =========================================================
   EVENTS UPSERT
========================================================= */

async function upsertEvents(items = events) {
    for (const item of items) {
        const { id, ...data } = item;

        const existing = await prisma.event.findFirst({
            where: {
                title: data.title,
            },
        });

        if (existing) {
            await prisma.event.update({
                where: {
                    id: existing.id,
                },
                data,
            });
        } else {
            await prisma.event.create({
                data,
            });
        }
    }
}

/* =========================================================
   MAIN
========================================================= */

async function main() {
    console.log("");
    console.log("==============================================");
    console.log("CALLEJEANDOLA DEVELOPMENT SEED");
    console.log("==============================================");
    console.log(`Environment : ${NODE_ENV || "development"}`);
    console.log(`DB Host     : ${databaseHostname}`);
    console.log("Mode        : LOCAL DEVELOPMENT ONLY");
    console.log("==============================================");
    console.log("");

    /* -----------------------------------------------------
       USERS
    ----------------------------------------------------- */

    await upsertUsers();

    console.log("Users seeded");

    /* -----------------------------------------------------
       SPOTS

       Tu esquema actual no utiliza verified en el create,
       por eso se elimina antes del upsert.
    ----------------------------------------------------- */

    const normalizedSpots = spots.map(
        ({ verified, ...spot }) => spot
    );

    await upsertByName(
        prisma.spot,
        normalizedSpots
    );

    console.log("Spots seeded");

    /* -----------------------------------------------------
       EVENTS

       Normalizamos el formato demo anterior hacia
       los campos actuales de Prisma:
       title / description / country / image /
       location / date.
    ----------------------------------------------------- */

    const normalizedEvents = events.map((event) => {
        const safeMonth =
            event.month || "JUN";

        const safeDay = String(
            event.day || "20"
        ).padStart(2, "0");

        const monthMap = {
            JAN: "01",
            FEB: "02",
            MAR: "03",
            APR: "04",
            MAY: "05",
            JUN: "06",
            JUL: "07",
            AGO: "08",
            AUG: "08",
            SEP: "09",
            OCT: "10",
            NOV: "11",
            DEC: "12",
            DIC: "12",
        };

        const monthNumber =
            monthMap[safeMonth.toUpperCase()] ||
            "06";

        return {
            title: event.title,

            description:
                event.description || "",

            country:
                event.country || "Costa Rica",

            image:
                event.image || "",

            location:
                event.location ||
                event.place ||
                event.city ||
                "Costa Rica",

            date:
                event.date ||
                new Date(
                    `2026-${monthNumber}-${safeDay}T14:00:00-06:00`
                ),
        };
    });

    await upsertEvents(
        normalizedEvents
    );

    console.log("Events seeded");

    /* -----------------------------------------------------
       SHOPS
    ----------------------------------------------------- */

    await upsertByName(
        prisma.shop,
        shops
    );

    console.log("Shops seeded");

    /* -----------------------------------------------------
       SPONSORS

       Normalizamos url -> website porque tu modelo
       actual usa website.
    ----------------------------------------------------- */

    const normalizedSponsors =
        sponsors.map((sponsor) => ({
            name: sponsor.name,

            logo:
                sponsor.logo || "",

            website:
                sponsor.website ||
                sponsor.url ||
                "",

            active:
                sponsor.active ?? true,
        }));

    await upsertByName(
        prisma.sponsor,
        normalizedSponsors
    );

    console.log("Sponsors seeded");

    console.log("");
    console.log("==============================================");
    console.log("Seed completed successfully");
    console.log("==============================================");
    console.log("");
    console.log("DEV USERS");
    console.log("----------------------------------------------");
    console.log(
        "GLOBAL_ADMIN : admin@callejeandola.com"
    );
    console.log(
        "LOCAL_ADMIN  : localadmin@callejeandola.com"
    );
    console.log(
        "JUDGE        : judge@callejeandola.com"
    );
    console.log(
        "SKATER       : skater@callejeandola.com"
    );
    console.log("");
    console.log(
        `DEV PASSWORD : ${DEV_PASSWORD}`
    );
    console.log("==============================================");
    console.log("");
}

/* =========================================================
   EXECUTION
========================================================= */

main()
    .catch((error) => {
        console.error("");
        console.error("==============================================");
        console.error("Seed failed");
        console.error("==============================================");
        console.error(error);
        console.error("");

        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
