const multer = require("multer");
const path = require("path");

const storage = multer.memoryStorage();

const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
];

const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];

function fileFilter(req, file, cb) {
    const mimetype = String(file.mimetype || "").toLowerCase();
    const ext = path.extname(file.originalname || "").toLowerCase();

    const isMimeAllowed = allowedMimeTypes.includes(mimetype);
    const isExtensionAllowed = allowedExtensions.includes(ext);

    console.log("Upload file check:", {
        originalname: file.originalname,
        mimetype,
        ext,
        isMimeAllowed,
        isExtensionAllowed,
    });

    if (!isMimeAllowed && !isExtensionAllowed) {
        return cb(new Error("Only JPG, PNG and WEBP images are allowed"));
    }

    cb(null, true);
}

const uploadImage = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter,
});

module.exports = {
    uploadImage,
};