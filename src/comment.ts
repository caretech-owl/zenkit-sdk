import axios from "axios";

export default interface IComment {
  id: number;
  uuid: string;
  message: string;
  parentUUID: string | null;
  listId: number;
  listUUID: string;
  workspaceId: number;
  workspaceUUID: number;
  userId: number;
  created_at: string;
  updated_at: string;
}

export async function comment(
  message: string,
  targetUrl: string,
  parent?: string,
  fileId?: number
): Promise<boolean> {
  const payload: any = { message: message };
  if (parent) {
    payload["parentUUID"] = parent;
  }
  if (fileId) {
    payload["enrichments"] = [
      {
        fileId: fileId,
        type: "File",
      },
    ];
  }
  const res = await axios.post(targetUrl, payload);
  return res.status === 200;
}
