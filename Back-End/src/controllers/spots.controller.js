// const prisma = require("../config/prisma");

// exports.getSpots = async (req, res) => {
//     const spots = await prisma.spot.findMany();
//     res.json(spots);
// };

// exports.createSpot = async (req, res) => {
//     const spot = await prisma.spot.create({
//         data: req.body
//     });

//     res.json(spot);
// };

const prisma = require("../config/prisma");

exports.getSpots = async (req, res) => {
  try {
    const spots = await prisma.spot.findMany({
      orderBy: { createdAt: "desc" }
    });

    res.json(spots);
  } catch (error) {
    res.status(500).json({ error: "Error fetching spots" });
  }
};

exports.getSpotById = async (req, res) => {
  try {
    const { id } = req.params;

    const spot = await prisma.spot.findUnique({
      where: { id: Number(id) }
    });

    res.json(spot);
  } catch (error) {
    res.status(500).json({ error: "Error fetching spot" });
  }
};

exports.createSpot = async (req, res) => {
  try {
    const { name, description, country, city, lat, lng, type } = req.body;

    const spot = await prisma.spot.create({
      data: {
        name,
        description,
        country,
        city,
        lat,
        lng,
        type
      }
    });

    res.json(spot);
  } catch (error) {
    res.status(500).json({ error: "Error creating spot" });
  }
};

exports.updateSpot = async (req, res) => {
  try {
    const { id } = req.params;

    const spot = await prisma.spot.update({
      where: { id: Number(id) },
      data: req.body
    });

    res.json(spot);
  } catch (error) {
    res.status(500).json({ error: "Error updating spot" });
  }
};

exports.deleteSpot = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.spot.delete({
      where: { id: Number(id) }
    });

    res.json({ message: "Spot deleted" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting spot" });
  }
};