const prisma = require("../config/prisma");

exports.getSponsors = async (req, res) => {
  try {
    const sponsors = await prisma.sponsor.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(sponsors);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error fetching sponsors",
    });
  }
};

exports.getSponsorById = async (req, res) => {
  try {
    const { id } = req.params;

    const sponsor = await prisma.sponsor.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!sponsor) {
      return res.status(404).json({
        error: "Sponsor not found",
      });
    }

    res.json(sponsor);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error fetching sponsor",
    });
  }
};

exports.createSponsor = async (req, res) => {
  try {
    const {
      name,
      logo,
      website,
      active,
    } = req.body;

    const existingSponsor = await prisma.sponsor.findFirst({
      where: {
        name: name.trim(),
      },
    });

    if (existingSponsor) {
      return res.status(400).json({
        error: "Sponsor already exists",
      });
    }

    const sponsor = await prisma.sponsor.create({
      data: {
        name,
        logo,
        website,
        active,
      },
    });

    res.status(201).json(sponsor);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error creating sponsor",
    });
  }
};

exports.updateSponsor = async (req, res) => {
  try {
    const { id } = req.params;

    const sponsor = await prisma.sponsor.update({
      where: {
        id: Number(id),
      },
      data: req.body,
    });

    res.json(sponsor);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error updating sponsor",
    });
  }
};

exports.deleteSponsor = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.sponsor.delete({
      where: {
        id: Number(id),
      },
    });

    res.json({
      message: "Sponsor deleted",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error deleting sponsor",
    });
  }
};