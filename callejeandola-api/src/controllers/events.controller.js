const prisma = require("../config/prisma");

exports.getEvents = async (req, res) => {
  try {

    const events = await prisma.event.findMany({
      orderBy: {
        createdAt: "desc"
      }
    });

    res.json(events);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Error fetching events"
    });

  }
};

exports.getEventById = async (req, res) => {
  try {

    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: {
        id: Number(id)
      }
    });

    if (!event) {
      return res.status(404).json({
        error: "Event not found"
      });
    }

    res.json(event);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Error fetching event"
    });

  }
};

exports.createEvent = async (req, res) => {
  try {

    const {
      title,
      description,
      date,
      location,
      country,
      image,
      spotId
    } = req.body;

    if (!title || !location) {
      return res.status(400).json({
        error: "Title and location are required"
      });
    }

    const existingEvent = await prisma.event.findFirst({
      where: {
        title: title.trim(),
        location: location.trim()
      }
    });

    if (existingEvent) {
      return res.status(400).json({
        error: "Event already exists"
      });
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date),
        location,
        country,
        image,
        spotId
      }
    });

    res.status(201).json(event);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Error creating event"
    });

  }
};

exports.updateEvent = async (req, res) => {
  try {

    const { id } = req.params;

    const updatedEvent = await prisma.event.update({
      where: {
        id: Number(id)
      },
      data: req.body
    });

    res.json(updatedEvent);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Error updating event"
    });

  }
};

exports.deleteEvent = async (req, res) => {
  try {

    const { id } = req.params;

    await prisma.event.delete({
      where: {
        id: Number(id)
      }
    });

    res.json({
      message: "Event deleted"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Error deleting event"
    });

  }
};