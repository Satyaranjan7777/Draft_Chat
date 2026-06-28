import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import {
  getSessionToken,
  setSessionToken,
  clearSessionToken,
  getTabId,
} from "../utils/sessionAuth";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const getErrorMessage = (error, fallback = "Something went wrong") =>
  error?.response?.data?.message || error?.message || fallback;

export const useAuthStore = create((set, get) => ({
  authUser: null,
  socket: null,
  onlineUsers: [],
  isSigningUp: false,
  isLogingIn: false,   // kept for backward compat with components using this name
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,

  /**
   * Called on app mount.
   * Reads the current tab's token from sessionStorage.
   * If no token → unauthenticated, no API call.
   * If token exists → validate with /auth/check and restore session.
   */
  checkAuth: async () => {
    const token = getSessionToken();

    if (!token) {
      set({ authUser: null, isCheckingAuth: false });
      return;
    }

    try {
      const res = await axiosInstance.get("/auth/check");
      const user = res.data?.user ?? res.data;

      if (user) {
        set({ authUser: user });
        get().connectSocket();
      } else {
        clearSessionToken();
        set({ authUser: null });
      }
    } catch (error) {
      // 401 = token invalid/expired → clear this tab only
      clearSessionToken();
      get().disconnectSocket();
      set({ authUser: null });
      if (error?.response?.status !== 401) {
        console.log("Error in checkAuth", error);
      }
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      const { token, user } = res.data;

      setSessionToken(token);
      set({ authUser: user });
      get().connectSocket();
      toast.success("Account created successfully");
      return user;
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to create account"));
      throw error;
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLogingIn: true, isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      const { token, user } = res.data;

      setSessionToken(token);
      set({ authUser: user });
      get().connectSocket();
      toast.success("Logged in successfully");
      return user;
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to login"));
      throw error;
    } finally {
      set({ isLogingIn: false, isLoggingIn: false });
    }
  },

  /**
   * Logout affects only the current tab.
   * Does NOT clear localStorage (themes stay).
   * Does NOT broadcast to other tabs.
   */
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } catch {
      // Continue local logout even if the server call fails
    } finally {
      get().disconnectSocket();
      clearSessionToken();
      set({ authUser: null });
      toast.success("Logged out successfully");
    }
  },

  getMyProfile: async () => {
    const res = await axiosInstance.get("/auth/profile");
    const user = res.data?.user || res.data;
    set({ authUser: user });
    return user;
  },

  updateProfile: async (file) => {
    set({ isUpdatingProfile: true });
    try {
      const formData = new FormData();
      formData.append("profilePicture", file);

      const res = await axiosInstance.patch("/auth/profile-picture", formData);
      const user = res.data?.user || res.data;
      set({ authUser: user });
      toast.success(res.data?.message || "Profile picture updated");
      return user;
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to update profile picture"));
      throw error;
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  removeProfilePicture: async () => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.delete("/auth/profile-picture");
      const user = res.data?.user || res.data;
      set({ authUser: user });
      toast.success(res.data?.message || "Profile picture removed");
      return user;
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to remove profile picture"));
      throw error;
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  /**
   * Connect Socket.IO for this tab.
   * Uses the current tab's token + tab ID for authentication.
   * Each tab gets its own independent socket connection.
   */
  connectSocket: async () => {
    const { authUser } = get();
    // Don't double-connect
    if (!authUser || get().socket?.connected) return;

    const token = getSessionToken();
    const tabId = getTabId();

    if (!token) return;

    const { io } = await import("socket.io-client");

    // Guard against race: another call may have connected while we awaited
    if (get().socket?.connected) return;

    const newSocket = io(SOCKET_URL, {
      auth: {
        token,
        tabId,
      },
      transports: ["websocket", "polling"],
    });

    newSocket.on("onlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });

    newSocket.on("profileUpdated", (updatedUser) => {
      const currentUser = get().authUser;
      const currentId = String(currentUser?._id || currentUser?.id || "");
      const updatedId = String(updatedUser?._id || updatedUser?.id || "");

      if (currentId && updatedId && currentId === updatedId) {
        set({ authUser: updatedUser });
      }
    });

    newSocket.on("connect_error", (err) => {
      console.warn("Socket connection error:", err.message);
      // If auth failed, clear this tab's session
      if (err.message === "Authentication required" || err.message === "Invalid or expired token") {
        clearSessionToken();
        get().disconnectSocket();
        set({ authUser: null });
      }
    });

    set({ socket: newSocket });
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
    }
    set({ socket: null, onlineUsers: [] });
  },
}));
