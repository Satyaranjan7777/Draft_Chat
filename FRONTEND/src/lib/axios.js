import axios from "axios";
import { getSessionToken, getTabId } from "../utils/sessionAuth";

export const axiosInstance = axios.create({
    baseURL: "http://localhost:5001/api",
    timeout: 15000,
    // withCredentials removed — we use Bearer tokens now, not cookies
});

// Attach the current tab's token and tab ID on every request
axiosInstance.interceptors.request.use(
    (config) => {
        const token = getSessionToken();
        const tabId = getTabId();

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        config.headers["X-Tab-ID"] = tabId;

        return config;
    },
    (error) => Promise.reject(error)
);

// Handle 401 responses — clear only this tab's session
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error?.response?.status === 401) {
            // Import lazily to avoid circular dep issues at module init time
            const { clearSessionToken } = await import("../utils/sessionAuth");
            clearSessionToken();
            // The store's checkAuth / auth expiry handler will set authUser: null
            // and redirect. Don't redirect here to avoid loops.
        }
        return Promise.reject(error);
    }
);
