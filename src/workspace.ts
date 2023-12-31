import axios, { AxiosError } from "axios";
import { BASE_URL, EP_GET_WORKSPACES } from "./config";
import type { ICollection } from "./collection";
import { Collection, isTypedCollection } from "./collection";
import type { IUser } from "./user";
import type { ReadStream } from "fs";
import { File } from "./file";
import { type IComment, deleteComment, type IActivity } from "./comment";
import { comment } from "./comment";
import { TriggerType, Webhook } from "./webhook";
import type { IGroup } from "./group";
import { assertReturnCode } from "./utils";
import type { IChatGroup, IUserAccess } from "./chat";
import { UserRole } from "./chat";

class IWorkspacePermission {
  private static instance?: IWorkspacePermission;
  private map = new Map<UserRole, string>([
    [UserRole.OWNER, "workspaceOwner"],
    [UserRole.ADMIN, "workspaceAdmin"],
    [UserRole.USER, "workspaceUser"],
    [UserRole.CONTRIBUTOR, "workspaceContributor"],
    [UserRole.COMMENTER, "commentOnlyWorkspaceUser"],
    [UserRole.WRITE_ONLY, "writeOnlyWorkspaceUser"],
    [UserRole.READ_ONLY, "readOnlyWorkspaceUser"],
  ]);
  private reversedMap: Map<string, UserRole>;

  private constructor() {
    this.reversedMap = new Map();
    for (const [role, name] of this.map.entries()) {
      this.reversedMap.set(name, role);
    }
  }

  public static getInstance(): IWorkspacePermission {
    if (!this.instance) {
      this.instance = new IWorkspacePermission();
    }
    return this.instance;
  }

  public getRole(name: string): UserRole {
    return this.reversedMap.get(name) || UserRole.UNKNOWN;
  }

  public getName(role: UserRole): string {
    return this.map.get(role) || "";
  }
}

interface IWorkspaceAccess {
  uuid: string;
  workspaceId: number;
  userId: number | null;
  groupId: number | null;
  roleId: string;
}

export interface IWorkspace {
  name: string;
  id: number;
  shortId: string;
  lists: Array<ICollection>;
  resourceTags: Array<{ tag: string; appType: string; isOwner: boolean }>;
}

export class Workspace implements IChatGroup {
  public data: IWorkspace;
  private _collections: Map<number, Collection>;

  public constructor(jsonData: IWorkspace) {
    this.data = jsonData;
    this._collections = new Map();
    for (const list of this.data.lists) {
      const ctor = Collection.typedCollections.get(list.uuid) || Collection;
      const collection = new ctor(list);
      this._collections.set(collection.id, collection);
    }
  }

  public async setUserRole(userId: number, role: UserRole): Promise<boolean>;
  public async setUserRole(user: IUser, role: UserRole): Promise<boolean>;
  public async setUserRole(
    userOrId: IUser | number,
    role: UserRole
  ): Promise<boolean> {
    const userId = typeof userOrId === "number" ? userOrId : userOrId.id;
    const userAccesses = (await this.getAccessInfo()).get(userId) || null;
    if (userAccesses && userAccesses.userAccessIds.length > 0) {
      return (
        (await this.setAccess(
          userAccesses.userAccessIds[0].uuid,
          IWorkspacePermission.getInstance().getName(role)
        )) !== undefined
      );
    }
    return typeof userOrId === "object"
      ? (await this.addAccess(
          userOrId.uuid,
          IWorkspacePermission.getInstance().getName(role)
        )) !== undefined
      : false;
  }

  public async getUsers(roles: Array<UserRole> = []): Promise<Array<IUser>> {
    if (roles.length === 0) {
      const res = await axios.get(`${BASE_URL}/workspaces/${this.id}/accesses`);
      const data =
        (res.data as {
          users: Array<IUser>;
        }) || {};
      return data.users || [];
    }
    const users = [];
    const access = await this.getAccessInfo();
    for (const userAccesses of access.values()) {
      for (const access of userAccesses.userAccessIds) {
        if (roles.indexOf(access.role) > -1) {
          users.push(userAccesses.userInfo);
          break;
        }
      }
    }
    return users;
  }

  public async getUserRole(userId: number): Promise<UserRole>;
  public async getUserRole(user: IUser): Promise<UserRole>;
  public async getUserRole(userOrId: IUser | number): Promise<UserRole> {
    const userId = typeof userOrId === "number" ? userOrId : userOrId.id;
    const userAccesses = (await this.getAccessInfo()).get(userId) || null;
    let res = UserRole.UNKNOWN;
    if (userAccesses) {
      for (const access of userAccesses.groupAccessIds) {
        res = Math.max(access.role, res);
      }
      for (const access of userAccesses.userAccessIds) {
        res = Math.max(access.role, res);
      }
    }
    return res;
  }

  public async removeUser(userId: number): Promise<boolean>;
  public async removeUser(user: IUser): Promise<boolean>;
  public async removeUser(userOrId: IUser | number): Promise<boolean> {
    const userId = typeof userOrId === "number" ? userOrId : userOrId.id;
    const userAccesses = (await this.getAccessInfo()).get(userId) || null;
    if (userAccesses) {
      for (const access of userAccesses.userAccessIds) {
        await this.removeAccess(access.uuid);
      }
    }
    return true;
  }

  public get id(): number {
    return this.data.id;
  }

  public get name(): string {
    return this.data.name;
  }

  public get collections(): IterableIterator<Collection> {
    return this._collections.values();
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

  public async createCommentWebhook(address: string): Promise<Webhook | null> {
    return Webhook.createWebhook(
      address,
      TriggerType.COMMENT,
      this.id,
      null,
      null
    );
  }

  public async getAccessInfo(): Promise<Map<number, IUserAccess>> {
    const res = await axios.get(`${BASE_URL}/workspaces/${this.id}/accesses`);
    // console.log(res.data);
    const data =
      (res.data as {
        users: Array<IUser>;
        accesses: Array<IWorkspaceAccess>;
        groups: Array<IGroup>;
      }) || [];

    const userMapping = new Map<number, IUserAccess>();
    const groupMapping: Record<number, { userIds: Array<number> }> = {};

    for (const usr of data.users) {
      userMapping.set(usr.id, {
        userInfo: usr,
        userAccessIds: [],
        groupAccessIds: [],
      });
    }
    for (const grp of data.groups) {
      groupMapping[grp.id] = { userIds: grp.userIds };
    }

    for (const access of data.accesses) {
      if (access.userId) {
        userMapping.get(access.userId)!.userAccessIds.push({
          uuid: access.uuid,
          role: IWorkspacePermission.getInstance().getRole(access.roleId),
        });
      } else if (access.groupId) {
        for (const usr of groupMapping[access.groupId].userIds) {
          userMapping.get(usr)!.groupAccessIds.push({
            uuid: access.uuid,
            role: IWorkspacePermission.getInstance().getRole(access.roleId),
          });
        }
      }
    }

    return userMapping;
  }

  public async addAccess(
    userUUID: string,
    role: string
  ): Promise<IWorkspaceAccess | undefined> {
    const res: { status: number; data?: { access: IWorkspaceAccess } } =
      await axios.post(`${BASE_URL}/workspaces/${this.id}/accesses`, {
        roleId: role,
        userUUID: userUUID,
      });
    return res.data?.access;
  }

  public async setAccess(
    accessUUID: string,
    role: string
  ): Promise<IWorkspaceAccess | undefined> {
    const res: { status: number; data?: { access: IWorkspaceAccess } } =
      await axios.put(
        `${BASE_URL}/workspaces/${this.id}/accesses/${accessUUID}`,
        { roleId: role }
      );
    return res.data?.access;
  }

  public async removeAccess(accessUUID: string): Promise<IWorkspaceAccess> {
    const res: { status: number; data: { access: IWorkspaceAccess } } =
      await axios.delete(
        `${BASE_URL}/workspaces/${this.id}/accesses/${accessUUID}`
      );
    return res.data.access;
  }

  public async getComments(limit = 100, skip = 0): Promise<Array<IComment>> {
    return this.getActivities(2, limit, skip);
  }

  public async getActivities(
    type = 0,
    limit = 100,
    skip = 0
  ): Promise<Array<IActivity>> {
    const res: { status: number; data: { activities?: Array<IActivity> } } =
      await axios.get(
        `${BASE_URL}/workspaces/${this.id}/activities?filter=${type}&limit=${limit}&skip=${skip}`
      );
    return res.data.activities || [];
  }

  public async uploadFile(filePath: string): Promise<File | null> {
    return File.uploadFile(filePath, `${BASE_URL}/workspaces/${this.id}/files`);
  }

  public async addFile(
    data: ReadStream | Buffer,
    fileName: string
  ): Promise<File> {
    return File.addFile(
      data,
      fileName,
      `${BASE_URL}/workspaces/${this.id}/files`
    );
  }

  public async getFiles(query?: string): Promise<Array<File>> {
    return File.getFiles(
      Array.from(this._collections.values()).map((col) => col.id),
      query
    );
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

export async function getCurrentWorkspaces(): Promise<Map<
  number,
  Workspace
> | null> {
  const workspaces = new Map<number, Workspace>();
  try {
    const res = await axios.get(EP_GET_WORKSPACES);
    assertReturnCode(res, 200);
    if (res.status === 200 && res.data !== null) {
      for (const ws of res.data) {
        const workspace = new Workspace(ws as IWorkspace);
        workspaces.set(workspace.id, workspace);
      }
    } else {
      console.warn(`Could not process workspaces for current user!`);
    }
    return workspaces;
  } catch (err) {
    if (err instanceof AxiosError) {
      console.error(`${err.response?.status}: ${err.response?.statusText}`);
    }
  }
  return null;
}
