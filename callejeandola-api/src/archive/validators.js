const { z } = require("zod");

exports.spotSchema = z.object({
    name: z.string().min(3),
    description: z.string(),
    country: z.string(),
    city: z.string(),
    lat: z.number(),
    lng: z.number(),
    type: z.string()
});