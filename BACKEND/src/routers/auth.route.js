import express from "express"
import {
    checkAuth,
    getProfile,
    login,
    logout,
    removeProfilePicture,
    signup,
    updateProfile
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { uploadProfilePicture } from "../middleware/profileUpload.middleware.js";

const router = express.Router()

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

router.get("/profile", protectRoute, getProfile);
router.patch("/profile-picture", protectRoute, uploadProfilePicture, updateProfile);
router.delete("/profile-picture", protectRoute, removeProfilePicture);
router.put("/update-profile", protectRoute, uploadProfilePicture, updateProfile);

// checkAuth is publicly callable but reads Bearer token internally
router.get("/check", checkAuth);

export default router;
