// const prisma = require("../config/prisma");

// exports.getEvents = async (req, res) => {
//     const events = await prisma.event.findMany();
//     res.json(events);
// };

// exports.createEvent = async (req, res) => {
//     const event = await prisma.event.create({
//         data: req.body
//     });

//     res.json(event);
// };

const prisma = require("../config/prisma");

exports.getEvents = async (req, res) => {
    try {
        const events = await prisma.event.findMany({
            orderBy: { date: "asc" }
        });

        res.json(events);
    } catch (error) {
        res.status(500).json({ error: "Error fetching events" });
    }
};

exports.createEvent = async (req, res) => {
    try {
        const { title, description, date, location, country, image } = req.body;

        const event = await prisma.event.create({
            data: {
                title,
                description,
                date: new Date(date),
                location,
                country,
                image
            }
        });

        res.json(event);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error creating event" });
    }
};