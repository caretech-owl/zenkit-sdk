import axios from "axios";
import { BASE_URL } from "./config";
import { IList } from "./list";

export interface IWorkspace {
  name: string;
  id: number;
  shortId: string;
  lists: Array<IList>;
}

export class Workspace {
  data: IWorkspace;

  constructor(jsonData: IWorkspace) {
    this.data = jsonData;
  }

  get id(): number {
    return this.data.id;
  }

  get name(): string {
    return this.data.name;
  }

  public collection(id: number): IList | null;
  public collection(name: string): IList | null;

  public collection(param: unknown): IList | null {
    if (typeof param === "number") {
      return this.getCollectionByID(param);
    } else if (typeof param === "string") {
      return this.getCollectionByName(param);
    }
    return null;
  }

  private getCollectionByID(id: number): IList | null {
    for (const list of this.data.lists) {
      if (list.id == id) {
        return list;
      }
    }
    return null;
  }

  private getCollectionByName(regex: string): IList | null {
    const rx = new RegExp(regex);
    for (const list of this.data.lists) {
      if (rx.test(list.name)) {
        return list;
      }
    }
    return null;
  }
}

export async function getCurrentWorkspaces(): Promise<Array<Workspace>> {
  const workspaces = [];
  const res = await axios.get(`${BASE_URL}/users/me/workspacesWithLists`);
  if (res.status === 200 && res.data !== null) {
    for (const workspace of res.data) {
      workspaces.push(new Workspace(workspace as IWorkspace));
    }
  }
  console.warn(`Could not process workspaces for current user!`);
  return workspaces;
}
