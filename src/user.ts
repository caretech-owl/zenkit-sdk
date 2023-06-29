import axios from "axios";
import { BASE_URL } from "./config";

interface User {
  id: number;
  shortId: string;
  uuid: string;
  organizationId: string;
  fullname: string;
  initials: string;
  username: string;
}

export async function getUser(): Promise<User | null> {
  const res = await axios.get(`${BASE_URL}/auth/currentuser`);
  if (res.status === 200 && res.data !== null) {
    return res.data;
  } else {
    console.error(
      "Did not receive a valid user response. Is your API key valid?"
    );
  }
  return null;
}
