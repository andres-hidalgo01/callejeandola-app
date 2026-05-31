// const prisma = require("../config/prisma");

// exports.getShops = async (req, res) => {
//   try {
//     const shops = await prisma.shop.findMany({
//       orderBy: {
//         createdAt: "desc"
//       }
//     });

//     res.json(shops);

//   } catch (error) {

//     console.error(error);

//     res.status(500).json({
//       error: "Error fetching shops"
//     });

//   }
// };

// exports.getShopById = async (req, res) => {
//   try {

//     const { id } = req.params;

//     const shop = await prisma.shop.findUnique({
//       where: {
//         id: Number(id)
//       }
//     });

//     if (!shop) {
//       return res.status(404).json({
//         error: "Shop not found"
//       });
//     }

//     res.json(shop);

//   } catch (error) {

//     console.error(error);

//     res.status(500).json({
//       error: "Error fetching shop"
//     });

//   }
// };

// exports.createShop = async (req, res) => {
//   try {

//     const {
//       name,
//       description,
//       city,
//       country,
//       category,
//       verified,
//       promo,
//       website,
//       instagram,
//       address,
//       lat,
//       lng,
//       image
//     } = req.body;

//     if (!name || !city) {
//       return res.status(400).json({
//         error: "Name and city are required"
//       });
//     }

//     const existingShop = await prisma.shop.findFirst({
//       where: {
//         name: name.trim(),
//         city: city.trim()
//       }
//     });

//     if (existingShop) {
//       return res.status(400).json({
//         error: "Shop already exists"
//       });
//     }

//     const shop = await prisma.shop.create({
//       data: {
//         name,
//         description,
//         city,
//         country,
//         category,
//         verified,
//         promo,
//         website,
//         instagram,
//         address,
//         lat,
//         lng,
//         image
//       }
//     });

//     res.status(201).json(shop);

//   } catch (error) {

//     console.error(error);

//     res.status(500).json({
//       error: "Error creating shop"
//     });

//   }
// };

// exports.updateShop = async (req, res) => {
//   try {

//     const { id } = req.params;

//     const updatedShop = await prisma.shop.update({
//       where: {
//         id: Number(id)
//       },
//       data: req.body
//     });

//     res.json(updatedShop);

//   } catch (error) {

//     console.error(error);

//     res.status(500).json({
//       error: "Error updating shop"
//     });

//   }
// };

// exports.deleteShop = async (req, res) => {
//   try {

//     const { id } = req.params;

//     await prisma.shops.delete({
//       where: {
//         id: Number(id)
//       }
//     });

//     res.json({
//       message: "Shop deleted"
//     });

//   } catch (error) {

//     console.error(error);

//     res.status(500).json({
//       error: "Error deleting shop"
//     });

//   }
// };

const prisma = require("../config/prisma");

exports.getShops = async (req, res) => {
  try {
    const shops = await prisma.shop.findMany({
      orderBy: {
        id: "desc",
      },
    });

    res.json(shops);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error fetching shops",
    });
  }
};

exports.getShopById = async (req, res) => {
  try {
    const { id } = req.params;

    const shop = await prisma.shop.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!shop) {
      return res.status(404).json({
        error: "Shop not found",
      });
    }

    res.json(shop);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error fetching shop",
    });
  }
};

exports.createShop = async (req, res) => {
  try {
    const {
      name,
      description,
      city,
      country,
      category,
      website,
      instagram,
      image,
      verified,
      promo,
    } = req.body;

    const existingShop = await prisma.shop.findFirst({
      where: {
        name: name.trim(),
        city: city.trim(),
      },
    });

    if (existingShop) {
      return res.status(400).json({
        error: "Shop already exists",
      });
    }

    const shop = await prisma.shop.create({
      data: {
        name,
        description,
        city,
        country,
        category,
        website,
        instagram,
        image,
        verified,
        promo,
      },
    });

    res.status(201).json(shop);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error creating shop",
    });
  }
};

exports.updateShop = async (req, res) => {
  try {
    const { id } = req.params;

    const shop = await prisma.shop.update({
      where: {
        id: Number(id),
      },
      data: req.body,
    });

    res.json(shop);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error updating shop",
    });
  }
};

exports.deleteShop = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.shop.delete({
      where: {
        id: Number(id),
      },
    });

    res.json({
      message: "Shop deleted",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error deleting shop",
    });
  }
};