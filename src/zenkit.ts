import axios from "axios";
import { BASE_URL } from "./config";
import { IUser, getCurrentUser } from "./user";
import { IWebhook } from "./webhook";
import { Workspace, getCurrentWorkspaces } from "./workspace";
import { Collection, ICollection, isTypedCollection } from "./collection";

export default class Zenkit {
  private user: IUser;
  private _workspaces: Map<number, Workspace>;

  private constructor(user: IUser, workspaces: Map<number, Workspace>) {
    this.user = user;
    this._workspaces = workspaces;
  }

  get my(): IUser {
    return this.user;
  }

  get workspaces(): Array<{ id: number; name: string }> {
    const res = [];
    for (const ws of this._workspaces.values()) {
      res.push({ id: ws.id, name: ws.name });
    }
    return res;
  }

  public async listWebhooks(): Promise<Array<IWebhook>> {
    const res = await axios.get(`${BASE_URL}/users/me/webhooks`);
    return res.data as Array<IWebhook>;
  }

  public static async createAsync(): Promise<Zenkit> {
    const user = await getCurrentUser();
    if (!user) {
      throw Error("User probably not logged in.");
    }
    const workspaces = await getCurrentWorkspaces();
    return new Zenkit(user, workspaces);
  }

  public workspace(id: number): Workspace | null;
  public workspace(name: string): Workspace | null;

  public workspace(param: unknown): Workspace | null {
    if (typeof param === "number") {
      return this._workspaces.get(param) || null;
    } else if (typeof param === "string") {
      return this.getWorkspaceByName(param);
    }
    return null;
  }

  public collection(id: number): Collection | null;
  public collection(name: string): Collection | null;
  public collection<
    T extends Collection & { id: number; uuid: string; workspaceId: number }
  >(
    cls: (new (col: ICollection) => T) & {
      id: number;
      uuid: string;
      workspaceId: number;
    }
  ): T | null;

  public collection<T extends Collection>(
    param: unknown
  ): T | Collection | null {
    if (typeof param === "number") {
      for (const ws of this._workspaces.values()) {
        const collection = ws.collection(param);
        if (collection) {
          return collection;
        }
      }
    } else if (typeof param === "string") {
      for (const ws of this._workspaces.values()) {
        const collection = ws.collection(param);
        if (collection) {
          return collection;
        }
      }
    } else if (isTypedCollection(param)) {
      const collection = this._workspaces
        .get(param.workspaceId)
        ?.collection(param.id);
      if (collection) {
        return collection as T;
      }
    }
    return null;
  }

  private getWorkspaceByName(regex: string): Workspace | null {
    const rx = new RegExp(regex);
    for (const workspace of this._workspaces.values()) {
      if (rx.test(workspace.name)) {
        return workspace;
      }
    }
    return null;
  }
}
