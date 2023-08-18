import axios, { AxiosError } from "axios";
import type { IFile } from "./file";
import { assertReturnCode } from "./utils";

export interface IEnrichment {
  uuid: string;
  type: string;
  listId: number | null;
  listEntryUUID: string | null;
  fileId: number;
  file?: IFile;
}

export enum IAcivityType {
  COMMENT = 0,
  CREATED = 1,
  UPDATED = 2,
  DEPRECATED = 3,
  IMPORTED = 4,
  COPIED = 5,
  RESTORED = 6,
  BULK = 7,
}

export interface IComment extends IActivity {}

export interface IActivity {
  id: number;
  uuid: string;
  message: string;
  type: IAcivityType;
  parentUUID: string | null;
  listId: number | null;
  listUUID: string | null;
  workspaceId: number;
  workspaceUUID: number;
  userId: number;
  userDisplayname: string;
  userFullname: string;
  userUsername: string;
  userInitials: string;
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
    assertReturnCode(res, [200, 201]);
    return res.data;
  } catch (err: unknown) {
    if (err instanceof AxiosError) {
      const axiosData = err.response?.data as { error: { name: string } };
      console.error(
        `${err.response?.status}: ${err.response?.statusText} -> ${axiosData.error.name}`
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
    return res.status === 200;
  } catch (err: unknown) {
    if (err instanceof AxiosError) {
      console.error(`${err.response?.status}: ${err.response?.statusText}`);
    }
  }
  return false;
}
