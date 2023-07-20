import axios from "axios";
import { BASE_URL } from "./config";
import type { IEntry } from "./entry";
import { Entry } from "./entry";
import type { IElement } from "./element";
import { Element } from "./element";
import type { ValueFieldType } from "./fields/base";
import type { IUser } from "./user";
import type { IComment } from "./comment";
import { comment, deleteComment } from "./comment";
import type { IWebhook } from "./webhook";
import { TriggerType, createWebhook } from "./webhook";
import type { IFile } from "./file";
import { addFile, deleteFile, uploadFile } from "./file";
import type { ReadStream } from "fs";
import type { IGroup } from "./group";
import { assertReturnCode } from "./utils";

export enum ICollectionPermission {
  ADMIN = "listAdmin",
  USER = "listUser",
  CONTRIBUTOR = "listContributor",
  COMMENTER = "commentOnlyListUser",
  WRITE_ONLY = "writeOnlyListUser",
  READ_ONLY = "readOnlyListUser",
}

export interface ICollectionAccess {
  uuid: string;
  workspaceId: number;
  userId: number;
  groupId: number | null;
  roleId: ICollectionPermission;
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
  uuid: string;
  name: string;
  workspaceId: number;
  visibility: number;
}

export class Collection {
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

  public async addUser(
    userUUID: string,
    role: ICollectionPermission
  ): Promise<string> {
    const res = await axios.post(`${BASE_URL}/lists/${this.id}/accesses`, {
      roleId: role,
      userUUID: userUUID,
    });
    return res.data as string;
  }

  public async listAccessInfo(): Promise<{
    users: Array<IUser>;
    accesses: Array<ICollectionAccess>;
    groups: Array<IGroup>;
  }> {
    const res = await axios.get(`${BASE_URL}/lists/${this.id}/accesses`);
    // console.log(res.data);
    return (
      (res.data as {
        users: Array<IUser>;
        accesses: Array<ICollectionAccess>;
        groups: Array<IGroup>;
      }) || []
    );
  }

  public async setAccess(
    access: ICollectionAccess,
    role: ICollectionPermission
  ): Promise<ICollectionAccess> {
    const res: { status: number; data: { access: ICollectionAccess } } =
      await axios.put(`${BASE_URL}/lists/${this.id}/accesses/${access.uuid}`, {
        roleId: role,
      });
    assertReturnCode(res, 200);
    return res.data.access;
  }

  public async removeAccess(
    access: ICollectionAccess
  ): Promise<ICollectionAccess> {
    const res: { status: 200; data: { access: ICollectionAccess } } =
      await axios.delete(
        `${BASE_URL}/lists/${this.id}/accesses/${access.uuid}`
      );
    assertReturnCode(res, 200);
    return res.data.access;
  }

  public listEntries(): Array<{ key: string; id: number }> {
    return this._entries.map((ent) => {
      return { key: ent.primaryKey, id: ent.id };
    });
  }

  public async listComments(limit = 100): Promise<Array<IComment>> {
    const res: { status: number; data: { activities?: Array<IComment> } } =
      await axios.get(
        `${BASE_URL}/lists/${this.id}/activities?filter=2&limit=${limit}`
      );
    return res.data.activities || [];
  }

  public async uploadFile(filePath: string): Promise<IFile | null> {
    return uploadFile(filePath, `${BASE_URL}/lists/${this.id}/files`);
  }

  public async addFile(
    data: ReadStream | Buffer,
    fileName: string
  ): Promise<IFile> {
    return addFile(data, fileName, `${BASE_URL}/lists/${this.id}/files`);
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

  public async deleteFile(fileId: number): Promise<IFile>;
  public async deleteFile(file: IFile): Promise<IFile>;
  public async deleteFile(param: IFile | number): Promise<IFile> {
    if (typeof param === "number") {
      return await deleteFile(param);
    } else {
      return await deleteFile(param.id);
    }
  }

  public async createCommentWebhook(address: string): Promise<IWebhook | null> {
    return createWebhook(address, TriggerType.COMMENT, null, this.id, null);
  }

  public async listWebhooks(): Promise<Array<IWebhook>> {
    const res = await axios.get(`${BASE_URL}/webhooks/list/${this.id}`);
    return res.data as Array<IWebhook>;
  }

  public async createEntry(
    primaryValue: ValueFieldType,
    data: Record<string, ValueFieldType> = {}
  ): Promise<Entry> {
    const key = this.primaryKey;
    if (!key) {
      throw new Error(
        "Primary key not set! Please call populate once before creating entries."
      );
    }
    if (typeof primaryValue !== key?.type) {
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

  public async getElements(): Promise<Array<Element>> {
    if (this._elements === undefined) {
      this._elements = await this.requestElements();
    }
    return this._elements;
  }

  public async populate(filter = {}, limit = 100, skip = 0): Promise<void> {
    this._entries = [];
    const res: { status: number; data: { listEntries: Array<IEntry> } } =
      await axios.post(`${BASE_URL}/lists/${this.id}/entries/filter/list`, {
        filter: filter,
        limit: limit,
        skip: skip,
        allowDeprecated: false,
      });
    assertReturnCode(res, 200);
    for (const element of res.data["listEntries"]) {
      this._entries.push(
        new this.entry_ctor(element, await this.getElements())
      );
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
