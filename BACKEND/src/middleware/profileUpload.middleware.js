import multer from "multer";

const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];

const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        if (!allowedImageTypes.includes(file.mimetype)) {
            return cb(new Error("Only JPG, PNG, and WEBP images are allowed"));
        }

        cb(null, true);
    },
});

export const uploadProfilePicture = (req, res, next) => {
    upload.single("profilePicture")(req, res, (error) => {
        if (!error) return next();

        if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
            return res.status(413).json({
                success: false,
                message: "Profile picture must be 5 MB or smaller",
            });
        }

        return res.status(400).json({
            success: false,
            message: error.message || "Invalid profile picture upload",
        });
    });
};
