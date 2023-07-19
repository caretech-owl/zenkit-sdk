import axios from "axios";
import { BASE_URL, EP_GET_WORKSPACES } from "./config";
import type { ICollection } from "./collection";
import { Collection, isTypedCollection } from "./collection";
import type { IUser } from "./user";
import type { ReadStream } from "fs";
import type { IFile } from "./file";
import { addFile, uploadFile, deleteFile } from "./file";
import { type IComment, deleteComment } from "./comment";
import { comment } from "./comment";
import type { IWebhook } from "./webhook";
import { TriggerType, createWebhook } from "./webhook";
import type { IGroup } from "./group";

export enum IWorkspacePermission {
  ADMIN = "workspaceAdmin",
  USER = "workspaceUser",
  CONTRIBUTOR = "workspaceContributor",
  COMMENTER = "commentOnlyWorkspaceUser",
  WRITE_ONLY = "writeOnlyWorkspaceUser",
  READ_ONLY = "readOnlyWorkspaceUser",
  // "roleId": "listAdmin"|"listUser"|"listContributor"|"commentOnlyListUser"|"writeOnlyListUser"|"readOnlyListUser" }
}

export interface IWorkspaceAccess {
  uuid: string;
  workspaceId: number;
  userId: number;
  groupId: number | null;
  roleId: IWorkspacePermission;
}

export interface IWorkspace {
  name: string;
  id: number;
  shortId: string;
  lists: Array<ICollection>;
}

export class Workspace {
  data: IWorkspace;
  private _collections: Map<number, Collection>;

  constructor(jsonData: IWorkspace) {
    this.data = jsonData;
    this._collections = new Map();
    for (const list of this.data.lists) {
      const ctor = Collection.typedCollections.get(list.uuid) || Collection;
      const collection = new ctor(list);
      this._collections.set(collection.id, collection);
    }
  }

  get id(): number {
    return this.data.id;
  }

  get name(): string {
    return this.data.name;
  }

  get workspaces(): Array<{ id: number; name: string }> {
    const res = [];
    for (const ws of this._collections.values()) {
      res.push({ id: ws.id, name: ws.name });
    }
    return res;
  }

  public collection(id: number): Collection | null;
  public collection(name: string): Collection | null;
  public collection<T extends Collection>(
    cls: new (col: ICollection) => T
  ): T | null;

  public collection<T extends Collection>(
    param: unknown
  ): T | Collection | null {
    if (typeof param === "number") {
      return this._collections.get(param) || null;
    } else if (typeof param === "string") {
      return this.getCollectionByName(param);
    } else if (isTypedCollection(param)) {
      const collection = this._collections.get(param.id);
      if (collection) {
        return collection as T;
      }
    }
    return null;
  }

  private getCollectionByName(regex: string): Collection | null {
    const rx = new RegExp(regex);
    for (const collection of this._collections.values()) {
      if (rx.test(collection.name)) {
        return collection;
      }
    }
    return null;
  }

  public async createCommentWebhook(address: string): Promise<IWebhook | null> {
    return createWebhook(address, TriggerType.COMMENT, this.id, null, null);
  }

  public async listAccessInfo(): Promise<{
    users: Array<IUser>;
    accesses: Array<IWorkspaceAccess>;
    groups: Array<IGroup>;
  }> {
    const res = await axios.get(`${BASE_URL}/workspaces/${this.id}/accesses`);
    // console.log(res.data);
    return (
      (res.data as {
        users: Array<IUser>;
        accesses: Array<IWorkspaceAccess>;
        groups: Array<IGroup>;
      }) || []
    );
  }

  public async addUser(
    userUUID: string,
    role: IWorkspacePermission
  ): Promise<IUser> {
    const res: { status: number; data: IUser } = await axios.post(
      `${BASE_URL}/workspaces/${this.id}/accesses`,
      {
        roleId: role,
        userUUID: userUUID,
      }
    );
    return res.data;
  }

  public async setAccess(
    access: IWorkspaceAccess,
    role: IWorkspacePermission
  ): Promise<IWorkspaceAccess> {
    const res: { status: number; data: { access: IWorkspaceAccess } } =
      await axios.put(
        `${BASE_URL}/workspaces/${this.id}/accesses/${access.uuid}`,
        { roleId: role }
      );
    return res.data.access;
  }

  public async removeAccess(
    access: IWorkspaceAccess
  ): Promise<IWorkspaceAccess> {
    const res: { status: number; data: { access: IWorkspaceAccess } } =
      await axios.delete(
        `${BASE_URL}/workspaces/${this.id}/accesses/${access.uuid}`
      );
    return res.data.access;
  }

  public async listComments(limit = 100): Promise<Array<IComment>> {
    const res: { status: number; data: { activities: Array<IComment> } } =
      await axios.get(
        `${BASE_URL}/workspaces/${this.id}/activities?filter=2&limit=${limit}`
      );
    return res.data.activities;
  }

  public async uploadFile(filePath: string): Promise<IFile | null> {
    return uploadFile(filePath, `${BASE_URL}/workspaces/${this.id}/files`);
  }

  public async addFile(
    data: ReadStream | Buffer,
    fileName: string
  ): Promise<IFile> {
    return addFile(data, fileName, `${BASE_URL}/workspaces/${this.id}/files`);
  }

  public async deleteFile(fileId: number): Promise<IFile>;
  public async deleteFile(file: IFile): Promise<IFile>;
  public async deleteFile(param: IFile | number): Promise<IFile> {
    if (typeof param === "number") {
      return await deleteFile(param);
    } else {
      return await deleteFile(param.id);
    }
  }

  public async deleteComment(comment: IComment): Promise<boolean> {
    return deleteComment(comment, `${BASE_URL}/workspaces/${this.id}`);
  }

  public async comment(
    message: string,
    parent?: string,
    fileId?: number
  ): Promise<IComment | null> {
    return comment(
      message,
      `${BASE_URL}/users/me/workspaces/${this.id}`,
      parent,
      fileId
    );
  }
}

export async function getCurrentWorkspaces(): Promise<Map<number, Workspace>> {
  const workspaces = new Map<number, Workspace>();
  const res = await axios.get(EP_GET_WORKSPACES);
  if (res.status === 200 && res.data !== null) {
    for (const ws of res.data) {
      const workspace = new Workspace(ws as IWorkspace);
      workspaces.set(workspace.id, workspace);
    }
  } else {
    console.warn(`Could not process workspaces for current user!`);
  }
  return workspaces;
}
