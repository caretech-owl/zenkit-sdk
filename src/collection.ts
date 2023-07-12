import axios from "axios";
import { BASE_URL } from "./config";
import { IEntry, Entry } from "./entry";
import { Element } from "./element";
import { ValueFieldType } from "./fields/base";
import { IUser } from "./user";
import IComment, { comment } from "./comment";
import { IWebhook, TriggerType } from "./webhook";
import { IFile, addFile, uploadFile } from "./file";
import { ReadStream } from "fs";

export interface ICollection {
  id: number;
  name: string;
  workspaceId: number;
  visibility: number;
}

export class Collection {
  data: ICollection;
  private _elements: Array<Element> | undefined;
  private _entries: Array<Entry>;

  constructor(jsonData: ICollection) {
    this.data = jsonData;
    this._entries = [];
  }

  get id(): number {
    return this.data.id;
  }

  get name(): string {
    return this.data.name;
  }

  get primaryKey(): Element | null {
    for (const elem of this._elements || []) {
      if (elem.isPrimary) {
        return elem;
      }
    }
    return null;
  }

  get elements(): Array<Element> {
    return this._elements || [];
  }

  public async listUsers(): Promise<Array<IUser>> {
    const res = await axios.get(`${BASE_URL}/lists/${this.id}/users`);
    const users = res.data as Array<IUser>;
    if (this.data.visibility === 1) {
      const res2 = await axios.get(
        `${BASE_URL}/workspaces/${this.data.workspaceId}/users`
      );
      for (const user of res2.data as Array<IUser>) {
        users.push(user);
      }
    }
    return users;
  }

  public async addUser(user: IUser): Promise<boolean> {
    const res = await axios.post(`${BASE_URL}/lists/${this.id}/users`, {
      userUUID: user.uuid,
    });
    return res.status === 200;
  }

  public async removeUser(user: IUser): Promise<boolean> {
    const res = await axios.delete(
      `${BASE_URL}/lists/${this.id}/users/${user.id}`
    );
    return res.status === 200;
  }

  public listEntries(): Array<{ key: string; id: number }> {
    return this._entries.map((ent) => {
      return { key: ent.primaryKey, id: ent.id };
    });
  }

  public async listComments(limit = 100): Promise<Array<IComment>> {
    const res = await axios.get(
      `${BASE_URL}/lists/${this.id}/activities?filter=2&limit=${limit}`
    );
    return (res.data.activities || []) as Array<IComment>;
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
  ): Promise<boolean> {
    return comment(
      message,
      `${BASE_URL}/users/me/lists/${this.id}/activities`,
      parent,
      fileId
    );
  }

  public async createCommentWebhook(address: string): Promise<IWebhook> {
    const res = await axios.post(`${BASE_URL}/webhooks`, {
      triggerType: TriggerType.COMMENT,
      url: address,
      listId: this.id,
    });
    return res.data as IWebhook;
  }

  public async listWebhooks(): Promise<Array<IWebhook>> {
    const res = await axios.get(`${BASE_URL}/webhooks/list/${this.id}`);
    return res.data as Array<IWebhook>;
  }

  public async createEntry(
    primaryValue: ValueFieldType,
    data = {}
  ): Promise<Entry> {
    const key = this.primaryKey;
    if (!key) {
      throw new Error(
        "Primary key not set! Please call populate once before creating entries."
      );
    }
    if (typeof primaryValue !== key?.type) {
      throw new Error(`Passed primary key value '${primaryValue}'
       is not valid for primary key '${key.name}' with type '${key.type}'`);
    }
    const res = await axios.post(`${BASE_URL}/lists/${this.id}/entries`, {
      [key.fieldName]: primaryValue,
    });
    if (res.status === 200 && res.data) {
      const entry = new Entry(res.data as IEntry, await this.getElements());
      this._entries.push(entry);
      return entry;
    }
    throw new Error("Something went wrong");
  }

  public entry(id: number): Entry | null;
  public entry(key: string): Entry | null;

  public entry(param: unknown): Entry | null {
    if (typeof param === "number") {
      return this.getEntryById(param);
    } else if (typeof param === "string") {
      return this.getEntryByKey(param);
    }
    return null;
  }

  private getEntryById(id: number): Entry | null {
    for (const entry of this._entries) {
      if (entry.id == id) {
        return entry;
      }
    }
    return null;
  }

  private getEntryByKey(regex: string): Entry | null {
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

  protected async getElements(): Promise<Array<Element>> {
    if (this._elements === undefined) {
      this._elements = await this.requestElements();
    }
    return this._elements;
  }

  private async requestElements(): Promise<Array<Element>> {
    let elements = [];
    const res = await axios.get(`${BASE_URL}/lists/${this.id}/elements`);
    if (res.status == 200 && res.data != null) {
      for (const element of res.data) {
        elements.push(new Element(element));
      }
    }
    return elements;
  }

  public async populate(filter = {}, limit = 100, skip = 0) {
    this._entries = [];
    const res = await axios.post(
      `${BASE_URL}/lists/${this.id}/entries/filter/list`,
      {
        filter: filter,
        limit: limit,
        skip: skip,
        allowDeprecated: false,
      }
    );
    if (res.status == 200 && res.data != null) {
      for (const element of res.data["listEntries"]) {
        this._entries.push(
          new Entry(element as IEntry, await this.getElements())
        );
      }
    }
  }
}
