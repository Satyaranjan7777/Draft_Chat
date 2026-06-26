import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
    deleteProfilePictureFromCloudinary,
    uploadProfilePictureToCloudinary,
} from "../lib/profilePictureCloudinary.js";

const getProfilePicture = (user) => ({
    url: user.profilePicture?.url || user.profilePic || "",
    publicId: user.profilePicture?.publicId || "",
});

const toSafeUser = (user) => ({
    _id: user._id,
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    profilePic: user.profilePicture?.url || user.profilePic || "",
    profilePicture: getProfilePicture(user),
    createdAt: user.createdAt,
});

const normalizeEmail = (email = "") => String(email).trim().toLowerCase();

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const findUserByEmail = (email) =>
    User.findOne({
        email: {
            $regex: `^${escapeRegex(email)}$`,
            $options: "i",
        },
    });

export const signup = async (req, res) => {
    const { fullName, email, password } = req.body;
    try {
        const normalizedEmail = normalizeEmail(email);
        const normalizedFullName = String(fullName || "").trim();

        if (!normalizedFullName || !normalizedEmail || !password) {
            return res.status(400).json({ message: "All Fields are Required" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const user = await findUserByEmail(normalizedEmail);

        if (user) return res.status(400).json({ message: "Email already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName: normalizedFullName,
            email: normalizedEmail,
            password: hashedPassword,
        });

        if (newUser) {
            const token = generateToken(newUser._id);
            await newUser.save();

            return res.status(201).json({
                success: true,
                token,
                user: toSafeUser(newUser),
            });
        } else {
            res.status(400).json({ message: "Invalid User data" });
        }
    } catch (error) {
        console.log("Error in signup controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const normalizedEmail = normalizeEmail(email);

        if (!normalizedEmail || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await findUserByEmail(normalizedEmail);

        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = generateToken(user._id);

        return res.status(200).json({
            success: true,
            token,
            user: toSafeUser(user),
        });
    } catch (error) {
        console.log("Error in login Controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const logout = (req, res) => {
    try {
        // Clear the cookie for backward compatibility; frontend handles sessionStorage removal
        res.cookie("jwt", "", { maxAge: 0 });
        res.status(200).json({ message: "Logout Successfully" });
    } catch (error) {
        console.log("Error in logout Controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const updateProfile = async (req, res) => {
    let newUpload = null;

    try {
        const userId = req.user._id;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Profile picture is required",
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        newUpload = await uploadProfilePictureToCloudinary(req.file.buffer, user._id);
        const oldPublicId = user.profilePicture?.publicId;

        user.profilePicture = {
            url: newUpload.secure_url,
            publicId: newUpload.public_id,
        };
        user.profilePic = newUpload.secure_url;

        await user.save();

        if (oldPublicId) {
            await deleteProfilePictureFromCloudinary(oldPublicId).catch(() => {});
        }

        req.app.get("io")?.emit("profileUpdated", toSafeUser(user));

        res.status(200).json({
            success: true,
            message: "Profile picture updated successfully",
            user: toSafeUser(user),
        });
    } catch (error) {
        if (newUpload?.public_id) {
            await deleteProfilePictureFromCloudinary(newUpload.public_id).catch(() => {});
        }
        console.log("Error in Update Profile", error);
        res.status(500).json({
            success: false,
            message: "Unable to update profile picture",
        });
    }
};

export const getProfile = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            user: toSafeUser(req.user),
        });
    } catch (error) {
        console.log("Error in getProfile controller", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

export const removeProfilePicture = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const oldPublicId = user.profilePicture?.publicId;
        user.profilePicture = { url: "", publicId: "" };
        user.profilePic = "";
        await user.save();

        if (oldPublicId) {
            await deleteProfilePictureFromCloudinary(oldPublicId).catch(() => {});
        }

        req.app.get("io")?.emit("profileUpdated", toSafeUser(user));

        res.status(200).json({
            success: true,
            message: "Profile picture removed successfully",
            user: toSafeUser(user),
        });
    } catch (error) {
        console.log("Error in removeProfilePicture controller", error);
        res.status(500).json({
            success: false,
            message: "Unable to remove profile picture",
        });
    }
};

export const checkAuth = async (req, res) => {
    try {
        // Try Bearer token first
        let token = null;
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        }

        // Fallback: cookie
        if (!token && req.cookies?.jwt) {
            token = req.cookies.jwt;
        }

        if (!token) {
            return res.status(200).json({ user: null });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch {
            return res.status(401).json({
                success: false,
                message: "Token invalid or expired",
            });
        }

        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found",
            });
        }

        res.status(200).json({ success: true, user: toSafeUser(user) });
    } catch (error) {
        console.log("Error in checkAuth controller", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
