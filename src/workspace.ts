import axios from "axios";
import { BASE_URL, EP_GET_WORKSPACES } from "./config";
import { Collection, ICollection } from "./collection";
import { IUser } from "./user";
import { ReadStream } from "fs";
import { IFile, addFile, uploadFile } from "./file";
import { comment } from "./comment";

export interface IWorkspace {
  name: string;
  id: number;
  shortId: string;
  lists: Array<ICollection>;
}

export class Workspace {
  data: IWorkspace;
  private _collections: Array<Collection>;

  constructor(jsonData: IWorkspace) {
    this.data = jsonData;
    this._collections = [];
    for (const list of this.data.lists) {
      this._collections.push(new Collection(list));
    }
  }

  get id(): number {
    return this.data.id;
  }

  get name(): string {
    return this.data.name;
  }

  get collections(): Array<{ id: number; name: string }> {
    return this._collections.map((col) => {
      return { name: col.name, id: col.id };
    });
  }

  public async listUsers(): Promise<Array<IUser>> {
    const res = await axios.get(`${BASE_URL}/workspaces/${this.id}/users`);
    const users = res.data as Array<IUser>;
    return users;
  }

  public collection(id: number): Collection | null;
  public collection(name: string): Collection | null;

  public collection(param: unknown): Collection | null {
    if (typeof param === "number") {
      return this.getCollectionByID(param);
    } else if (typeof param === "string") {
      return this.getCollectionByName(param);
    }
    return null;
  }

  private getCollectionByID(id: number): Collection | null {
    for (const collection of this._collections) {
      if (collection.id == id) {
        return collection;
      }
    }
    return null;
  }

  private getCollectionByName(regex: string): Collection | null {
    const rx = new RegExp(regex);
    for (const collection of this._collections) {
      if (rx.test(collection.name)) {
        return collection;
      }
    }
    return null;
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

  public async comment(
    message: string,
    parent?: string,
    fileId?: number
  ): Promise<boolean> {
    return comment(
      message,
      `${BASE_URL}/users/me/workspaces/${this.id}/activities`,
      parent,
      fileId
    );
  }
}

export async function getCurrentWorkspaces(): Promise<Array<Workspace>> {
  const workspaces = [];
  const res = await axios.get(EP_GET_WORKSPACES);
  if (res.status === 200 && res.data !== null) {
    for (const workspace of res.data) {
      workspaces.push(new Workspace(workspace as IWorkspace));
    }
  } else {
    console.warn(`Could not process workspaces for current user!`);
  }
  return workspaces;
}
