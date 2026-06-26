import express from "express"
import dotenv from "dotenv"
import cookieParser from "cookie-parser";
import cors from "cors"
import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

import { connectDB } from "./src/lib/db.js";
import authRoutes from "./src/routers/auth.route.js";
import messageRoutes from "./src/routers/message.route.js";

dotenv.config()

const app = express();
const PORT = process.env.PORT;
const server = createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        credentials: true,
    },
});

// userId -> Set<socketId>  (supports multiple tabs per user)
const userSocketMap = new Map();

const getOnlineUserIds = () => Array.from(userSocketMap.keys());

// Socket.IO JWT authentication middleware
io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
        return next(new Error("Authentication required"));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = String(decoded.userId);
        socket.tabId = socket.handshake.auth?.tabId || null;
        next();
    } catch {
        next(new Error("Invalid or expired token"));
    }
});

io.on("connection", (socket) => {
    const userId = socket.userId;
    const tabId = socket.tabId;

    // Register socket in multi-socket map
    if (!userSocketMap.has(userId)) {
        userSocketMap.set(userId, new Set());
    }
    userSocketMap.get(userId).add(socket.id);

    // Join rooms for targeted messaging
    socket.join(`user:${userId}`);
    if (tabId) {
        socket.join(`tab:${tabId}`);
    }

    // Broadcast updated online list
    io.emit("onlineUsers", getOnlineUserIds());

    socket.on("disconnect", () => {
        const sockets = userSocketMap.get(userId);
        if (sockets) {
            sockets.delete(socket.id);
            if (sockets.size === 0) {
                userSocketMap.delete(userId);
            }
        }

        io.emit("onlineUsers", getOnlineUserIds());
    });
});

// Expose io and the helper to get a user's socket IDs for controllers
app.set("io", io);
app.set("userSocketMap", userSocketMap);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);

app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);

const startServer = async () => {
    try {
        await connectDB();
        server.listen(PORT, () => {
            console.log("Server Running on PORT: " + PORT);
        });
    } catch {
        process.exitCode = 1;
    }
};

startServer();
