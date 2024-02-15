import axios from "axios";
import { BASE_URL } from "./config";
import type { IEntry } from "./entry";
import { Entry } from "./entry";
import type { IElement } from "./element";
import { Element } from "./element";
import type { ValueFieldType } from "./fields/base";
import type { IUser } from "./user";
import type { IActivity, IComment } from "./comment";
import { comment, deleteComment } from "./comment";
import { TriggerType, Webhook } from "./webhook";
import { File } from "./file";
import type { ReadStream } from "fs";
import type { IGroup } from "./group";
import { assertReturnCode } from "./utils";
import generateORM from "./orm";
import type { IChatGroup, IUserAccess } from "./chat";
import { UserRole } from "./chat";

class ICollectionPermission {
  private static instance?: ICollectionPermission;
  private map = new Map<UserRole, string>([
    [UserRole.OWNER, "listOwner"],
    [UserRole.ADMIN, "listAdmin"],
    [UserRole.USER, "listUser"],
    [UserRole.CONTRIBUTOR, "listContributor"],
    [UserRole.COMMENTER, "commentOnlyListUser"],
    [UserRole.WRITE_ONLY, "writeOnlyListUser"],
    [UserRole.READ_ONLY, "readOnlyListUser"],
  ]);
  private reversedMap: Map<string, UserRole>;

  private constructor() {
    this.reversedMap = new Map();
    for (const [role, name] of this.map.entries()) {
      this.reversedMap.set(name, role);
    }
  }

  public static getInstance(): ICollectionPermission {
    if (!this.instance) {
      this.instance = new ICollectionPermission();
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

export interface ICollectionAccess {
  uuid: string;
  workspaceId: number;
  userId: number | null;
  groupId: number | null;
  roleId: string;
  provider: unknown;
  providerData: unknown;
  elementRestrictions: unknown;
  entryRestrictions: unknown;
}

export interface ITypedCollection {
  uuid: string;
  id: number;
  workspaceId: number;
}

export interface ICollection {
  id: number;
  shortId: string;
  uuid: string;
  name: string;
  workspaceId: number;
  visibility: number;
  resourceTags: Array<{ tag: string; appType: string; isOwner: boolean }>;
}

export class Collection implements IChatGroup {
  public static typedCollections = new Map<
    string,
    new (col: ICollection) => Collection
  >();

  public entry_ctor: new (entry: IEntry, elements: Array<Element>) => Entry =
    Entry;
  public data: ICollection;

  private _elements: Array<Element> | undefined;
  private _entries: Array<Entry>;

  public constructor(jsonData: ICollection) {
    this.data = jsonData;
    this._entries = [];
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
          ICollectionPermission.getInstance().getName(role)
        )) !== undefined
      );
    }
    return typeof userOrId === "object"
      ? (await this.addAccess(
          userOrId.uuid,
          ICollectionPermission.getInstance().getName(role)
        )) !== undefined
      : false;
  }

  public async getUsers(roles: Array<UserRole> = []): Promise<Array<IUser>> {
    if (roles.length === 0) {
      let res = await axios.get(`${BASE_URL}/lists/${this.id}/accesses`);
      const data =
        (res.data as {
          users: Array<IUser>;
        }) || {};
      if (this.data.visibility > 0) {
        res = await axios.get(
          `${BASE_URL}/workspaces/${this.data.workspaceId}/accesses`
        );
        data.users.push(...(res.data as { users: Array<IUser> }).users);
      }

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

  public get primaryKey(): Element | null {
    for (const elem of this._elements || []) {
      if (elem.isPrimary) {
        return elem;
      }
    }
    return null;
  }

  public get elements(): Array<Element> {
    return this._elements || [];
  }

  public static registerTypedCollection(
    cls: { uuid: string } & (new (col: ICollection) => Collection)
  ): void {
    Collection.typedCollections.set(cls.uuid, cls);
  }

  public async addAccess(
    userUUID: string,
    role: string
  ): Promise<ICollectionAccess | undefined> {
    const res: { data?: { access: ICollectionAccess } } = await axios.post(
      `${BASE_URL}/lists/${this.id}/accesses`,
      {
        roleId: role,
        userUUID: userUUID,
      }
    );
    return res.data?.access as ICollectionAccess;
  }

  public async setAccess(
    accessUUID: string,
    role: string
  ): Promise<ICollectionAccess | undefined> {
    const res: { status: number; data?: { access: ICollectionAccess } } =
      await axios.put(`${BASE_URL}/lists/${this.id}/accesses/${accessUUID}`, {
        roleId: role,
      });
    assertReturnCode(res, 200);
    return res.data?.access;
  }

  public async removeAccess(accessUUID: string): Promise<ICollectionAccess> {
    const res: { status: 200; data: { access: ICollectionAccess } } =
      await axios.delete(`${BASE_URL}/lists/${this.id}/accesses/${accessUUID}`);
    assertReturnCode(res, 200);
    return res.data.access;
  }

  public async getAccessInfo(): Promise<Map<number, IUserAccess>> {
    const res = await axios.get(`${BASE_URL}/lists/${this.id}/accesses`);
    const data =
      (res.data as {
        users: Array<IUser>;
        accesses: Array<ICollectionAccess>;
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
          role: ICollectionPermission.getInstance().getRole(access.roleId),
        });
      } else if (access.groupId) {
        for (const usr of groupMapping[access.groupId].userIds) {
          userMapping.get(usr)!.groupAccessIds.push({
            uuid: access.uuid,
            role: ICollectionPermission.getInstance().getRole(access.roleId),
          });
        }
      }
    }

    return userMapping;
  }

  public async generateORM(prefix?: string): Promise<string> {
    return generateORM(this, prefix);
  }

  public get entries(): Array<Entry> {
    return this._entries;
  }

  public async getComments(limit = 100, skip = 0): Promise<Array<IComment>> {
    return this.getActivities(2, limit, skip);
  }

  public async getActivities(
    type = 0,
    limit = 100,
    skip = 0
  ): Promise<Array<IActivity>> {
    const res: { status: number; data: { activities?: Array<IComment> } } =
      await axios.get(
        `${BASE_URL}/lists/${this.id}/activities?filter=${type}&limit=${limit}&skip=${skip}`
      );
    return res.data.activities || [];
  }

  public async uploadFile(filePath: string): Promise<File | null> {
    return File.uploadFile(filePath, `${BASE_URL}/lists/${this.id}/files`);
  }

  public async addFile(
    data: ReadStream | Buffer,
    fileName: string
  ): Promise<File> {
    return File.addFile(data, fileName, `${BASE_URL}/lists/${this.id}/files`);
  }

  public async getFiles(query?: string): Promise<Array<File>> {
    return File.getFiles([this.id], query);
  }

  public async comment(
    message: string,
    parent?: string,
    fileId?: number
  ): Promise<IComment | null> {
    return comment(
      message,
      `${BASE_URL}/users/me/lists/${this.id}`,
      parent,
      fileId
    );
  }

  public async deleteComment(comment: IComment): Promise<boolean> {
    return deleteComment(comment, `${BASE_URL}/lists/${this.id}`);
  }

  public async createCommentWebhook(address: string): Promise<Webhook | null> {
    return Webhook.createWebhook(
      address,
      TriggerType.COMMENT,
      null,
      this.id,
      null
    );
  }

  public async createEntry(
    primaryValue: ValueFieldType,
    data: Record<string, ValueFieldType> = {}
  ): Promise<Entry> {
    const key = this.primaryKey;
    if (!key) {
      console.log(
        "Primary key not set! Please call populate once before creating entries."
      );
      throw new Error(
        "Primary key not set! Please call populate once before creating entries."
      );
    }
    if (typeof primaryValue !== key?.type) {
      console.log(`Passed primary key value '${primaryValue?.toString()}'
      is not valid for primary key '${key.name}' with type '${key.type}'`);
      throw new Error(`Passed primary key value '${primaryValue?.toString()}'
       is not valid for primary key '${key.name}' with type '${key.type}'`);
    }
    data[key.fieldName] = primaryValue;
    const res = await axios.post(`${BASE_URL}/lists/${this.id}/entries`, data);
    if (res.status === 200 && res.data) {
      const entry = new this.entry_ctor(
        res.data as IEntry,
        await this.getElements()
      );
      this._entries.push(entry);
      return entry;
    }
    throw new Error("Something went wrong");
  }

  public entry(id: number): Entry | null;
  public entry(key: string): Entry | null;

  public entry(param: number | string): Entry | null {
    if (typeof param === "number") {
      return this.getEntryById(param);
    }
    return this.getEntryByKey(param);
  }

  public async sortEntries<T extends Entry>(
    fn: (a: T, b: T) => number
  ): Promise<void> {
    await this.populate();
    this._entries.sort((a, b) => fn(a as T, b as T));
    for (let i = 0; i < this._entries.length; ++i) {
      const entry = this._entries[i];
      if (entry.sortOrder !== i.toString()) {
        await this._entries[i].setSortOrder(i);
      }
    }
  }

  public async getElements(): Promise<Array<Element>> {
    if (this._elements === undefined) {
      this._elements = await this.requestElements();
    }
    return this._elements;
  }

  public async populate(
    limit = 100,
    orderBy: Array<{
      column?: string;
      elementId?: number;
      direction: string;
    }> = [],
    skip = 0
  ): Promise<void> {
    await this.getElements();
    this._entries = [];
    const res: { status: number; data: Array<IEntry> } = await axios.post(
      `${BASE_URL}/lists/${this.id}/entries/filter`,
      {
        filter: {},
        limit: limit,
        skip: skip,
        allowDeprecated: false,
        orderBy: orderBy,
      }
    );
    assertReturnCode(res, 200);
    for (const element of res.data) {
      this._entries.push(new this.entry_ctor(element, this._elements!));
    }
  }

  protected getEntryById(id: number): Entry | null {
    for (const entry of this._entries) {
      if (entry.id == id) {
        return entry;
      }
    }
    return null;
  }

  protected getEntryByKey(regex: string): Entry | null {
    const rx = new RegExp(regex);
    for (const entry of this._entries) {
      if (entry.primaryKey !== "") {
        if (rx.test(entry.primaryKey)) {
          return entry;
        }
      }
    }
    return null;
  }

  private async requestElements(): Promise<Array<Element>> {
    const elements = [];
    const res = await axios.get(`${BASE_URL}/lists/${this.id}/elements`);
    if (res.status == 200 && res.data != null) {
      for (const element of res.data) {
        elements.push(new Element(element as IElement));
      }
    }
    return elements;
  }
}

export function isTypedCollection(obj: unknown): obj is ITypedCollection {
  const check = obj as ITypedCollection;
  return (
    check.uuid !== undefined &&
    check.id !== undefined &&
    check.workspaceId !== undefined
  );
}
