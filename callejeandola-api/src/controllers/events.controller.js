// const prisma = require("../config/prisma");

// exports.getEvents = async (req, res) => {
//   try {

//     const events = await prisma.event.findMany({
//       include:{
//         spot: true,
//         shop: true,
//       },      
//       orderBy: {
//         createdAt: "desc"
//       }
//     });

//     res.json(events);

//   } catch (error) {

//     console.error(error);

//     res.status(500).json({
//       error: "Error fetching events"
//     });

//   }
// };

// exports.getEventById = async (req, res) => {
//   try {

//     const { id } = req.params;

//     const event = await prisma.event.findUnique({
//       where: {
//         id: Number(id)
//       }
//     });

//     if (!event) {
//       return res.status(404).json({
//         error: "Event not found"
//       });
//     }

//     res.json(event);

//   } catch (error) {

//     console.error(error);

//     res.status(500).json({
//       error: "Error fetching event"
//     });

//   }
// };

// exports.createEvent = async (req, res) => {
//   try {

//     const {
//       title,
//       description,
//       date,
//       location,
//       country,
//       image,
//       spotId
//     } = req.body;

//     if (!title || !location) {
//       return res.status(400).json({
//         error: "Title and location are required"
//       });
//     }

//     const existingEvent = await prisma.event.findFirst({
//       where: {
//         title: title.trim(),
//         location: location.trim()
//       }
//     });

//     if (existingEvent) {
//       return res.status(400).json({
//         error: "Event already exists"
//       });
//     }

//     const event = await prisma.event.create({
//       data: {
//         title,
//         description,
//         date: new Date(date),
//         location,
//         country,
//         image,
//         spotId
//       }
//     });

//     res.status(201).json(event);

//   } catch (error) {

//     console.error(error);

//     res.status(500).json({
//       error: "Error creating event"
//     });

//   }
// };

// exports.updateEvent = async (req, res) => {
//   try {

//     const { id } = req.params;

//     const updatedEvent = await prisma.event.update({
//       where: {
//         id: Number(id)
//       },
//       data: req.body
//     });

//     res.json(updatedEvent);

//   } catch (error) {

//     console.error(error);

//     res.status(500).json({
//       error: "Error updating event"
//     });

//   }
// };

// exports.deleteEvent = async (req, res) => {
//   try {

//     const { id } = req.params;

//     await prisma.event.delete({
//       where: {
//         id: Number(id)
//       }
//     });

//     res.json({
//       message: "Event deleted"
//     });

//   } catch (error) {

//     console.error(error);

//     res.status(500).json({
//       error: "Error deleting event"
//     });

//   }
// };


const prisma = require("../config/prisma");

function normalizeEventPayload(body) {
  const spotId = body.spotId ? Number(body.spotId) : null;

  return {
    title: String(body.title || "").trim(),
    description: String(body.description || "").trim() || null,
    date: body.date ? new Date(body.date) : new Date(),
    location: String(body.location || "").trim(),
    country: String(body.country || "Costa Rica").trim(),
    image: String(body.image || "").trim() || null,
    spotId,
  };
}

exports.getEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      include: {
        spot: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(events);
  } catch (error) {
    console.error("Get events error:", error);

    res.status(500).json({
      error: "Error fetching events",
    });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const event = await prisma.event.findUnique({
      where: {
        id,
      },
      include: {
        spot: true,
      },
    });

    if (!event) {
      return res.status(404).json({
        error: "Event not found",
      });
    }

    res.json(event);
  } catch (error) {
    console.error("Get event error:", error);

    res.status(500).json({
      error: "Error fetching event",
    });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const payload = normalizeEventPayload(req.body);

    if (!payload.title) {
      return res.status(400).json({
        error: "Title is required",
      });
    }

    if (!payload.location) {
      return res.status(400).json({
        error: "Location is required",
      });
    }

    if (!payload.spotId) {
      return res.status(400).json({
        error: "A linked skatepark is required",
      });
    }

    const event = await prisma.event.create({
      data: payload,
      include: {
        spot: true,
      },
    });

    res.status(201).json(event);
  } catch (error) {
    console.error("Create event error:", error);

    res.status(500).json({
      error: "Error creating event",
    });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const existingEvent = await prisma.event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      return res.status(404).json({
        error: "Event not found",
      });
    }

    const payload = normalizeEventPayload(req.body);

    if (!payload.title) {
      return res.status(400).json({
        error: "Title is required",
      });
    }

    if (!payload.location) {
      return res.status(400).json({
        error: "Location is required",
      });
    }

    const safeSpotId =
      req.body.spotId !== undefined && req.body.spotId !== null && req.body.spotId !== ""
        ? Number(req.body.spotId)
        : existingEvent.spotId;

    const event = await prisma.event.update({
      where: { id },
      data: {
        ...payload,
        spotId: safeSpotId,
        shopId: null,
      },
      include: {
        spot: true,
      },
    });

    res.json(event);
  } catch (error) {
    console.error("Update event error:", error);

    res.status(500).json({
      error: "Error updating event",
    });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const id = Number(req.params.id);

    await prisma.event.delete({
      where: {
        id,
      },
    });

    res.json({
      message: "Event deleted",
    });
  } catch (error) {
    console.error("Delete event error:", error);

    res.status(500).json({
      error: "Error deleting event",
    });
  }
};