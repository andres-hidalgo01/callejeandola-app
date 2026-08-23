const prisma = require("../config/prisma");

async function getFavoriteSpots(userId) {
    const favorites = await prisma.userFavoriteSpot.findMany({
        where: {
            userId: Number(userId),
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    const spotIds = favorites.map((item) => item.spotId);

    if (!spotIds.length) return [];

    const spots = await prisma.spot.findMany({
        where: {
            id: {
                in: spotIds,
            },
        },
    });

    return spots;
}

async function addFavoriteSpot(userId, spotId) {
    const cleanUserId = Number(userId);
    const cleanSpotId = Number(spotId);

    const spot = await prisma.spot.findUnique({
        where: {
            id: cleanSpotId,
        },
    });

    if (!spot) {
        const error = new Error("Spot not found");
        error.statusCode = 404;
        throw error;
    }

    const existing = await prisma.userFavoriteSpot.findUnique({
        where: {
            userId_spotId: {
                userId: cleanUserId,
                spotId: cleanSpotId,
            },
        },
    });

    if (existing) {
        return existing;
    }

    return prisma.userFavoriteSpot.create({
        data: {
            userId: cleanUserId,
            spotId: cleanSpotId,
        },
    });
}

async function removeFavoriteSpot(userId, spotId) {
    const cleanUserId = Number(userId);
    const cleanSpotId = Number(spotId);

    const existing = await prisma.userFavoriteSpot.findUnique({
        where: {
            userId_spotId: {
                userId: cleanUserId,
                spotId: cleanSpotId,
            },
        },
    });

    if (!existing) {
        return null;
    }

    await prisma.userFavoriteSpot.delete({
        where: {
            userId_spotId: {
                userId: cleanUserId,
                spotId: cleanSpotId,
            },
        },
    });

    return existing;
}

async function getSavedEvents(userId) {
    const savedEvents = await prisma.userSavedEvent.findMany({
        where: {
            userId: Number(userId),
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    const eventIds = savedEvents.map((item) => item.eventId);

    if (!eventIds.length) return [];

    const events = await prisma.event.findMany({
        include: {
            spot: true,
            shop: true,
        },
        where: {
            id: {
                in: eventIds,
            },
        },
    });

    return events;
}

async function addSavedEvent(userId, eventId) {
    const cleanUserId = Number(userId);
    const cleanEventId = Number(eventId);

    const event = await prisma.event.findUnique({
        where: {
            id: cleanEventId,
        },
    });

    if (!event) {
        const error = new Error("Event not found");
        error.statusCode = 404;
        throw error;
    }

    const existing = await prisma.userSavedEvent.findUnique({
        where: {
            userId_eventId: {
                userId: cleanUserId,
                eventId: cleanEventId,
            },
        },
    });

    if (existing) {
        return existing;
    }

    return prisma.userSavedEvent.create({
        data: {
            userId: cleanUserId,
            eventId: cleanEventId,
        },
    });
}

async function removeSavedEvent(userId, eventId) {
    const cleanUserId = Number(userId);
    const cleanEventId = Number(eventId);

    const existing = await prisma.userSavedEvent.findUnique({
        where: {
            userId_eventId: {
                userId: cleanUserId,
                eventId: cleanEventId,
            },
        },
    });

    if (!existing) {
        return null;
    }

    await prisma.userSavedEvent.delete({
        where: {
            userId_eventId: {
                userId: cleanUserId,
                eventId: cleanEventId,
            },
        },
    });

    return existing;
}

module.exports = {
    getFavoriteSpots,
    addFavoriteSpot,
    removeFavoriteSpot,
    getSavedEvents,
    addSavedEvent,
    removeSavedEvent,
};