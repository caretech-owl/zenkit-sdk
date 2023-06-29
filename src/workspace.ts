import axios from "axios";
import { BASE_URL } from "./config";

interface Workspace {
  name: string;
}

export async function getWorkspace(
  regex_string: string
): Promise<Workspace | null> {
  const res = await axios.get(`${BASE_URL}/users/me/workspacesWithLists`);
  if (res.status === 200 && res.data !== null) {
    const rx = new RegExp(regex_string);
    for (const workspace of res.data) {
      if (rx.test(workspace.name)) {
        return workspace;
      }
    }
  }
  console.error(
    `Did not find any workspace with a name matching '${regex_string}'.`
  );
  return null;
}
