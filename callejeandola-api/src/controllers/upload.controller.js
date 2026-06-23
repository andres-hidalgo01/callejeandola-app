const cloudinary = require("../config/cloudinary");
const { env } = require("../config/env");

function uploadBufferToCloudinary(buffer, options = {}) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            options,
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );

        stream.end(buffer);
    });
}

exports.uploadImageController = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: "Image file is required",
            });
        }

        const entity = String(req.body.entity || "general").trim().toLowerCase();

        const allowedEntities = ["spots", "events", "shops", "sponsors", "profiles", "general"];

        if (!allowedEntities.includes(entity)) {
            return res.status(400).json({
                error: "Invalid media entity",
            });
        }

        const result = await uploadBufferToCloudinary(req.file.buffer, {
            folder: `${env.CLOUDINARY_FOLDER || "callejeandola"}/${entity}`,
            resource_type: "image",
            transformation: [
                {
                    width: 1200,
                    height: 900,
                    crop: "limit",
                    quality: "auto",
                    fetch_format: "auto",
                },
            ],
        });

        return res.status(201).json({
            data: {
                url: result.secure_url,
                publicId: result.public_id,
                width: result.width,
                height: result.height,
                format: result.format,
                bytes: result.bytes,
            },
        });
    } catch (error) {
        console.error("Cloudinary upload error:", error);

        return res.status(500).json({
            error: error.message || "Error uploading image",
        });
    }
};