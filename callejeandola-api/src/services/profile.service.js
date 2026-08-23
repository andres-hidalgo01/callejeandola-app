const prisma = require("../config/prisma");

function sanitizeProfile(profile) {
    if (!profile) return null;

    return {
        id: profile.id,
        userId: profile.userId,
        displayName: profile.displayName,
        bio: profile.bio,
        city: profile.city,
        stance: profile.stance,
        level: profile.level,
        avatar: profile.avatar,
        instagram: profile.instagram,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
    };
}

async function getProfileByUserId(userId) {
    const profile = await prisma.profile.findUnique({
        where: {
            userId: Number(userId),
        },
    });

    return sanitizeProfile(profile);
}

// async function upsertProfile(userId, payload) {
//     const cleanPayload = {
//         displayName: String(payload.displayName || "").trim() || null,
//         bio: String(payload.bio || "").trim() || null,
//         city: String(payload.city || "").trim() || null,
//         stance: String(payload.stance || "").trim() || null,
//         level: String(payload.level || "").trim() || null,
//         avatar: String(payload.avatar || "").trim() || null,
//         instagram: String(payload.instagram || "").trim() || null,
//     };

//     const profile = await prisma.profile.upsert({
//         where: {
//             userId: Number(userId),
//         },
//         update: cleanPayload,
//         create: {
//             userId: Number(userId),
//             ...cleanPayload,
//         },
//     });




//     return sanitizeProfile(profile);
// }

async function upsertProfile(userId, payload) {
    const cleanPayload = {
        displayName: String(payload.displayName || "").trim() || null,
        bio: String(payload.bio || "").trim() || null,
        city: String(payload.city || "").trim() || null,
        stance: String(payload.stance || "").trim() || null,
        level: String(payload.level || "").trim() || null,
        avatar: String(payload.avatar || "").trim() || null,
        instagram: String(payload.instagram || "").trim() || null,
    };

    const profile = await prisma.profile.upsert({
        where: {
            userId: Number(userId),
        },
        update: cleanPayload,
        create: {
            userId: Number(userId),
            ...cleanPayload,
        },
    });

    if (cleanPayload.displayName) {
        await prisma.user.update({
            where: {
                id: Number(userId),
            },
            data: {
                name: cleanPayload.displayName,
            },
        });
    }

    return sanitizeProfile(profile);
}


module.exports = {
    getProfileByUserId,
    upsertProfile,
};