import axios from "axios";
import { EP_GET_CURRENT_USER } from "./config";
export interface IUser {
  id: number;
  shortId: string;
  uuid: string;
  fullname: string;
  initials: string;
  username: string;
}

export async function getCurrentUser(): Promise<IUser | null> {
  const res = await axios.get(EP_GET_CURRENT_USER);
  if (res.status === 200 && res.data !== null) {
    return res.data;
  } else {
    console.error(
      "Did not receive a valid user response. Is your API key valid?"
    );
  }
  return null;
}
