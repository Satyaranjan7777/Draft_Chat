/**
 * Tab-isolated authentication storage utility.
 *
 * Uses sessionStorage so that:
 *  - Each independently opened tab starts without a session.
 *  - Refreshing the same tab preserves its session.
 *  - Closing a tab removes its session automatically.
 *  - A duplicated tab gets a new tab ID on first meaningful interaction,
 *    and the bearer token remains functionally valid but is isolated once
 *    the user logs out in either tab.
 */

const TOKEN_KEY = "chat-app-session-token";
const TAB_ID_KEY = "chat-app-tab-id";

export const getSessionToken = () => {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(TOKEN_KEY);
};

export const setSessionToken = (token) => {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(TOKEN_KEY, token);
};

export const clearSessionToken = () => {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(TOKEN_KEY);
};

/**
 * Returns a stable tab ID that persists across refreshes in the same tab.
 * A new tab (or duplicated tab that has cleared its ID) gets a fresh UUID.
 */
export const getTabId = () => {
  if (typeof window === "undefined") return "ssr";
  let tabId = window.sessionStorage.getItem(TAB_ID_KEY);

  if (!tabId) {
    tabId = crypto.randomUUID();
    window.sessionStorage.setItem(TAB_ID_KEY, tabId);
  }

  return tabId;
};
