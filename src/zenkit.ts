import type { IUser } from "./user";
import { getCurrentUser } from "./user";
import { type Workspace } from "./workspace";
import { getCurrentWorkspaces } from "./workspace";
import type { Collection, ICollection } from "./collection";
import { isTypedCollection } from "./collection";

export default class Zenkit {
  private user: IUser;
  private _workspaces: Map<number, Workspace>;

  private constructor(user: IUser, workspaces: Map<number, Workspace>) {
    this.user = user;
    this._workspaces = workspaces;
  }

  public get my(): IUser {
    return this.user;
  }

  public get workspaces(): Array<{ id: number; name: string }> {
    const res = [];
    for (const ws of this._workspaces.values()) {
      res.push({ id: ws.id, name: ws.name });
    }
    return res;
  }

  public static async createAsync(): Promise<Zenkit> {
    const user = await getCurrentUser();
    if (!user) {
      throw Error("User probably not logged in.");
    }
    const workspaces = await getCurrentWorkspaces();
    if (!workspaces) {
      throw Error(`Cannot get workspaces for user '${user.username}'.`);
    }
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
  public collection<T extends Collection>(
    cls: new (col: ICollection) => T
  ): T | null;

  public collection<T extends Collection>(
    param: number | string | T
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
