const prisma = require("../config/prisma");

exports.getSponsors = async (req, res) => {
  try {
    const sponsors = await prisma.sponsor.findMany({
      where: { active: true }
    });

    res.json(sponsors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching sponsors" });
  }
};

exports.createSponsor = async (req, res) => {
  try {
    const { name, logo, website, active } = req.body;

    const sponsor = await prisma.sponsor.create({
      data: {
        name,
        logo,
        website,
        active: active ?? true
      }
    });

    res.json(sponsor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creating sponsor" });
  }
};