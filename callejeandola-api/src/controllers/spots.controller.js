const prisma = require("../config/prisma");

exports.getSpots = async (req, res) => {
  try {

    const spots = await prisma.spot.findMany({
      orderBy: {
        createdAt: "desc"
      }
    });

    res.json(spots);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Error fetching spots"
    });

  }
};

exports.getSpotById = async (req, res) => {
  try {

    const { id } = req.params;

    const spotById = await prisma.spot.findUnique({
      where: {
        id: Number(id)
      }
    });

    if (!spotById) {
      return res.status(404).json({
        error: "Spot not found"
      });
    }

    res.json(spotById);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Error fetching spot by Id"
    });

  }
};

exports.createSpot = async (req, res) => {
  try {

    const {
      name,
      description,
      country,
      city,
      lat,
      lng,
      type,
      image
    } = req.body;

    // VALIDACIONES BÁSICAS
    if (!name || !city) {
      return res.status(400).json({
        error: "Name and city are required"
      });
    }

    // VALIDAR DUPLICADOS
    const existingSpot = await prisma.spot.findFirst({
      where: {
        name: name.trim(),
        city: city.trim()
      }
    });

    if (existingSpot) {
      return res.status(400).json({
        error: "Spot already exists"
      });
    }

    // CREAR SPOT
    const spot = await prisma.spot.create({
      data: {
        name,
        description,
        country,
        city,
        lat,
        lng,
        type,
        image
      }
    });

    res.status(201).json(spot);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Error creating spot"
    });

  }
};

exports.updateSpot = async (req, res) => {
  try {

    const { id } = req.params;

    const updatedSpot = await prisma.spot.update({
      where: {
        id: Number(id)
      },
      data: req.body
    });

    res.json(updatedSpot);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Error updating spot"
    });

  }
};

exports.deleteSpot = async (req, res) => {
  try {

    const { id } = req.params;

    await prisma.spot.delete({
      where: {
        id: Number(id)
      }
    });

    res.json({
      message: "Spot deleted"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Error deleting spot"
    });

  }
};
