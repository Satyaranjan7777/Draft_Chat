import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import mongoose from "mongoose";

export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } })
            .select("fullName email profilePic profilePicture createdAt")
            .sort({ fullName: 1 })
            .lean();

        res.status(200).json(filteredUsers);
    } catch (error) {
        console.error("Error in getUserForSidebar: ", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { id: otherUserId } = req.params;
        const myId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
            return res.status(400).json({ error: "Invalid user ID" });
        }

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: otherUserId },
                { senderId: otherUserId, receiverId: myId },
            ],
        })
            .sort({ createdAt: 1 })
            .lean();

        res.status(200).json(messages);
    } catch (error) {
        console.error("Error in getMessages: ", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const { id: receiverId } = req.params;
        // Always derive sender from the verified JWT — never trust client-provided senderId
        const senderId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(receiverId)) {
            return res.status(400).json({ error: "Invalid receiver ID" });
        }

        const receiver = await User.findById(receiverId).lean();
        if (!receiver) {
            return res.status(404).json({ error: "Receiver not found" });
        }

        if (!text?.trim() && !image) {
            return res.status(400).json({ error: "Message must have text or an image" });
        }

        let imageUrl;
        if (image) {
            // Upload base64 image to Cloudinary
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text: text?.trim() || "",
            image: imageUrl || "",
        });

        await newMessage.save();

        // Deliver to receiver's room (all their active tabs)
        const io = req.app.get("io");
        if (io) {
            io.to(`user:${receiverId}`).emit("newMessage", newMessage);
        }

        res.status(200).json(newMessage);
    } catch (error) {
        console.error("Error in sendMessage: ", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
