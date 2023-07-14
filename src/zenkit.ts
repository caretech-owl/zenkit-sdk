import axios from "axios";
import { BASE_URL } from "./config";
import { IUser, getCurrentUser } from "./user";
import { IWebhook } from "./webhook";
import { Workspace, getCurrentWorkspaces } from "./workspace";
import { Collection, ICollection } from "./collection";

export default class Zenkit {
  private user: IUser;
  private _workspaces: Array<Workspace>;

  private constructor(user: IUser, workspaces: Array<Workspace>) {
    this.user = user;
    this._workspaces = workspaces;
  }

  get my(): IUser {
    return this.user;
  }

  get workspaces(): Array<{ id: number; name: string }> {
    return this._workspaces.map((ws) => {
      return { id: ws.id, name: ws.name };
    });
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
      return this.getWorkspaceByID(param);
    } else if (typeof param === "string") {
      return this.getWorkspaceByName(param);
    }
    return null;
  }

  public collection(id: number): Collection | null;
  public collection(name: string): Collection | null;
  public collection<T extends Collection>(
    cls: (new (col: ICollection) => T) & { id: number }
  ): T | null;

  public collection<T extends Collection>(
    param: unknown
  ): T | Collection | null {
    let collection = null;
    let idx = 0;
    if (typeof param === "number") {
      while (collection === null && idx < this._workspaces.length) {
        collection = this._workspaces[idx].collection(param);
        idx += 1;
      }
    } else if (typeof param === "string") {
      while (collection === null && idx < this._workspaces.length) {
        collection = this._workspaces[idx].collection(param);
        idx += 1;
      }
    } else if (param instanceof Collection) {
      while (collection === null && idx < this._workspaces.length) {
        collection = this._workspaces[idx].collection(param.id);
        idx += 1;
      }
      if (collection) {
        return collection as T;
      }
    }
    return collection;
  }

  private getWorkspaceByID(id: number): Workspace | null {
    for (const workspace of this._workspaces) {
      if (workspace.id == id) {
        return workspace;
      }
    }
    return null;
  }

  private getWorkspaceByName(regex: string): Workspace | null {
    const rx = new RegExp(regex);
    for (const workspace of this._workspaces) {
      if (rx.test(workspace.name)) {
        return workspace;
      }
    }
    return null;
  }
}
