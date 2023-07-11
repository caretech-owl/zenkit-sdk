import axios from "axios";
import { BASE_URL } from "./config";
import { IUser, getCurrentUser } from "./user";
import { IWebhook } from "./webhook";
import { Workspace, getCurrentWorkspaces } from "./workspace";

export default class Zenkit {
  private user: IUser;
  private workspaces: Array<Workspace>;

  private constructor(user: IUser, workspaces: Array<Workspace>) {
    this.user = user;
    this.workspaces = workspaces;
  }

  get my(): IUser {
    return this.user;
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

  private getWorkspaceByID(id: number): Workspace | null {
    for (const workspace of this.workspaces) {
      if (workspace.id == id) {
        return workspace;
      }
    }
    return null;
  }

  private getWorkspaceByName(regex: string): Workspace | null {
    const rx = new RegExp(regex);
    for (const workspace of this.workspaces) {
      if (rx.test(workspace.name)) {
        return workspace;
      }
    }
    return null;
  }
}
