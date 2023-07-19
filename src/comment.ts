import axios, { AxiosError } from "axios";
import { IFile } from "./file";
import { assertReturnCode } from "./utils";

export interface IEnrichment {
  uuid: string;
  type: string;
  listId: number | null;
  listEntryUUID: string | null;
  fileId: number;
  file?: IFile;
}

export interface IComment {
  id: number;
  uuid: string;
  message: string;
  parentUUID: string | null;
  listId: number | null;
  listUUID: string | null;
  workspaceId: number;
  workspaceUUID: number;
  userId: number;
  created_at: string;
  updated_at: string;
  enrichments?: Array<IEnrichment>;
}

export async function comment(
  message: string,
  targetUrl: string,
  parent?: string,
  fileId?: number
): Promise<IComment | null> {
  const payload: {
    message: string;
    parentUUID?: string;
    enrichments?: [{ fileId: number; type: string }];
  } = { message: message };
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
  try {
    const res: { status: number; data: IComment } = await axios.post(
      `${targetUrl}/activities`,
      payload
    );
    assertReturnCode(res, 201);
    return res.data;
  } catch (err: unknown) {
    if (err instanceof AxiosError) {
      console.error(
        `${err.response?.status}: ${err.response?.statusText} -> ${err.response?.data.error.name}`
      );
    }
  }
  return null;
}

export async function deleteComment(
  comment: IComment,
  targetUrl: string
): Promise<boolean> {
  try {
    const res = await axios.delete(`${targetUrl}/activities/${comment.uuid}`);
    console.log(res.status);
    console.log(res.data);
    return res.status === 200;
  } catch (err: unknown) {
    if (err instanceof AxiosError) {
      console.error(`${err.response?.status}: ${err.response?.statusText}`);
    }
  }
  return false;
}
