import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export const BASE_URL = "https://base.zenkit.com/api/v1";
const API_KEY = process.env.ZENKIT_API_KEY;

export const EP_GET_CURRENT_USER = BASE_URL + "/auth/currentuser";
export const EP_GET_WORKSPACES = BASE_URL + "/users/me/workspacesWithLists";

axios.interceptors.request.use(function (config) {
  config.headers["Content-Type"] = "application/json";
  config.headers["Zenkit-API-Key"] = API_KEY;
  return config;
});
