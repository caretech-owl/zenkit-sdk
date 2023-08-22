import axios from "axios";
import type { Element } from "./element";
import { FieldCategory } from "./element";
import type { FieldType, FieldValueType, ValueFieldType } from "./fields/base";
import { ValueField } from "./fields/base";
import * as fields from "./fields/index";
import type { IActivity, IComment } from "./comment";
import { comment, deleteComment } from "./comment";
import { BASE_URL } from "./config";
import { File } from "./file";
import type { ReadStream } from "fs";
import { TriggerType, Webhook } from "./webhook";
import { assertReturnCode } from "./utils";
import { type IChatRoom } from "./chat";

export interface IEntry {
  id: number;
  shortId: string;
  uuid: string;
  created_at: string;
  updated_at: string;
  created_by: number;
  updated_by: number;
  displayString: string;
  comment_count: number;
  listId: number;
  sortOrder: string;
  [key: string]: FieldValueType;
  //   [key: `${string}_text`]: string;
  //   [key: `${string}_date`]: string; // TODO make DateStringType YYYY-MM-DD (HH:mm:ss)
  //   [key: `${string}_link`]: string;
  //   [key: `${string}_persons`]: Array<number>;
  //   [key: `${string}_references`]: Array<string>;
  //   [key: `${string}_categories`]: Array<number>;
}

const FieldMap: Record<
  number,
  new (entry: IEntry, element: Element) => FieldType
> = {
  [FieldCategory.TEXT]: fields.TextField,
  [FieldCategory.NUMBER]: fields.NumberField,
  [FieldCategory.DATE]: fields.DateField,
  [FieldCategory.LINK]: fields.LinkField,
  [FieldCategory.PERSONS]: fields.PersonsField,
  [FieldCategory.REFERENCES]: fields.ReferencesField,
  [FieldCategory.CATEGORIES]: fields.CategoriesField,
};

export class Entry implements IChatRoom {
  protected data: IEntry;
  protected fields: Map<string, FieldType>;

  private _key: ValueField<ValueFieldType> | null;

  public constructor(jsonData: IEntry, elements: Array<Element>) {
    this.data = jsonData;
    this.fields = new Map();
    this._key = null;
    for (const element of elements) {
      const cls = FieldMap[element.elementcategory];
      if (cls !== undefined) {
        const entry = new cls(this.data, element);
        this.fields.set(element.name, entry);
        if (element.isPrimary) {
          if (entry instanceof ValueField) {
            this._key = entry;
          } else {
            throw new Error(
              "Currently only primitive value fields are supported as primary keys."
            );
          }
        }
      }
    }
  }

  public field(name: string): FieldType | undefined {
    return this.fields.get(name);
  }

  public listFieldNames(): Array<string> {
    return Array.from(this.fields.keys());
  }

  public get id(): number {
    return this.data.id;
  }

  public get uuid(): string {
    return this.data.uuid;
  }

  public get sortOrder(): string {
    return this.data.sortOrder;
  }

  public async createCommentWebhook(address: string): Promise<Webhook | null> {
    return Webhook.createWebhook(
      address,
      TriggerType.COMMENT,
      null,
      this.data.listId,
      this.id
    );
  }

  public async comment(
    message: string,
    parent?: string,
    fileId?: number
  ): Promise<IComment | null> {
    return comment(
      message,
      `${BASE_URL}/users/me/lists/${this.data.listId}/entries/${this.id}`,
      parent,
      fileId
    );
  }

  public async deleteComment(comment: IComment): Promise<boolean> {
    return deleteComment(
      comment,
      `${BASE_URL}/users/me/lists/${this.data.listId}/entries/${this.id}`
    );
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
        `${BASE_URL}/lists/${this.data.listId}/entries/${this.id}/activities?filter=${type}&limit=${limit}&skip=${skip}`
      );
    assertReturnCode(res, 200);
    return res.data.activities || [];
  }

  public get primaryKey(): string {
    return this._key?.value?.toString() || "";
  }

  public async uploadFile(filePath: string): Promise<File | null> {
    return File.uploadFile(
      filePath,
      `${BASE_URL}/lists/${this.data.listId}/files`
    );
  }

  public async addFile(
    data: ReadStream | Buffer,
    fileName: string
  ): Promise<File> {
    return File.addFile(
      data,
      fileName,
      `${BASE_URL}/lists/${this.data.listId}/files`
    );
  }

  public async commit(): Promise<void> {
    const editData: Record<string, FieldValueType> = {};
    for (const field of this.fields.values()) {
      if (field.edited) {
        for (const data of field.getData()) {
          editData[data.field] = data.value;
        }
        field.edited = false;
      }
    }
    if (Object.keys(editData).length > 0) {
      await axios.put(
        `${BASE_URL}/lists/${this.data.listId}/entries/${this.id}`,
        editData
      );
    }
  }

  public async setSortOrder(idx: number): Promise<void> {
    const res = await axios.put(
      `${BASE_URL}/lists/${this.data.listId}/entries/${this.id}`,
      { sortOrder: idx }
    );
    assertReturnCode(res, 200);
  }

  public async delete(): Promise<boolean> {
    const res = await axios.delete(
      `${BASE_URL}/lists/${this.data.listId}/entries/${this.id}`
    );
    return res.status === 200;
  }
}
