import cloudinary from "./cloudinary.js";

const PROFILE_PICTURE_FOLDER = "chat-app/profile-pictures";

const uploadBufferToCloudinary = (buffer, options = {}) =>
    new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
            if (error) return reject(error);
            resolve(result);
        });

        stream.end(buffer);
    });

export const uploadProfilePictureToCloudinary = (buffer, userId) =>
    uploadBufferToCloudinary(buffer, {
        folder: PROFILE_PICTURE_FOLDER,
        resource_type: "image",
        public_id: `user-${userId}-${Date.now()}`,
        overwrite: false,
        transformation: [
            {
                width: 500,
                height: 500,
                crop: "fill",
                gravity: "face",
                quality: "auto",
                fetch_format: "auto",
            },
        ],
    });

export const deleteProfilePictureFromCloudinary = async (publicId) => {
    if (!publicId) return null;
    return cloudinary.uploader.destroy(publicId, { resource_type: "image" });
};
