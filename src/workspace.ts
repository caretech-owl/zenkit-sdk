import axios from "axios";
import { EP_GET_WORKSPACES } from "./config";
import { ICollection } from "./collections";

export interface IWorkspace {
  name: string;
  id: number;
  shortId: string;
  lists: Array<ICollection>;
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

  public collection(id: number): ICollection | null;
  public collection(name: string): ICollection | null;

  public collection(param: unknown): ICollection | null {
    if (typeof param === "number") {
      return this.getCollectionByID(param);
    } else if (typeof param === "string") {
      return this.getCollectionByName(param);
    }
    return null;
  }

  private getCollectionByID(id: number): ICollection | null {
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
  const res = await axios.get(EP_GET_WORKSPACES);
  if (res.status === 200 && res.data !== null) {
    for (const workspace of res.data) {
      workspaces.push(new Workspace(workspace as IWorkspace));
    }
  }
  console.warn(`Could not process workspaces for current user!`);
  return workspaces;
}
