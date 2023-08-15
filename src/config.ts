import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export const BASE_URL = "https://base.zenkit.com/api/v1";
export const CHAT_URL = "https://chat.zenkit.com/api/v1";

const API_KEY = process.env.ZENKIT_API_KEY;

export const EP_GET_CURRENT_USER = CHAT_URL + "/auth/currentuser";
export const EP_GET_USER = CHAT_URL + "/users";
export const EP_GET_WORKSPACES = BASE_URL + "/users/me/workspacesWithLists";
export const EP_GET_NOTIFICATIONS_EP = CHAT_URL + "/users/me/notifications";

axios.interceptors.request.use((config) => {
  if (!("Content-Type" in config.headers)) {
    config.headers["Content-Type"] = "application/json";
  }
  if (config.url?.startsWith(BASE_URL) || config.url?.startsWith(CHAT_URL)) {
    config.headers["Zenkit-API-Key"] = API_KEY;
  }
  return config;
});
