import axios from "axios";
import { Element, FieldCategory } from "./element";
import {
  FieldType,
  FieldValueType,
  ValueField,
  ValueFieldType,
} from "./fields/base";
import * as fields from "./fields/index";
import IComment, { comment } from "./comment";
import { BASE_URL } from "./config";
import { IFile, addFile, deleteFile, uploadFile } from "./file";
import { ReadStream } from "fs";
import { IWebhook, TriggerType, createWebhook } from "./webhook";

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
  [key: string]: FieldValueType;
  //   [key: `${string}_text`]: string;
  //   [key: `${string}_date`]: string; // TODO make DateStringType YYYY-MM-DD (HH:mm:ss)
  //   [key: `${string}_link`]: string;
  //   [key: `${string}_persons`]: Array<number>;
  //   [key: `${string}_references`]: Array<string>;
  //   [key: `${string}_categories`]: Array<number>;
}

const FieldMap: {
  [key: number]: new (entry: IEntry, element: Element) => FieldType;
} = {
  [FieldCategory.TEXT]: fields.TextField,
  [FieldCategory.NUMBER]: fields.NumberField,
  [FieldCategory.DATE]: fields.DateField,
  [FieldCategory.LINK]: fields.LinkField,
  [FieldCategory.PERSONS]: fields.PersonsField,
  [FieldCategory.REFERENCES]: fields.ReferencesField,
  [FieldCategory.CATEGORIES]: fields.CategoriesField,
};

export class Entry {
  protected data: IEntry;
  protected fields: Map<string, FieldType>;

  private _key: ValueField<ValueFieldType> | null;

  constructor(jsonData: IEntry, elements: Array<Element>) {
    this.data = jsonData;
    this.fields = new Map();
    this._key = null;
    for (const element of elements) {
      const cls = FieldMap[element.elementcategory];
      if (cls !== undefined) {
        const entry = new cls(this.data as IEntry, element);
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

  public field(name: string) {
    return this.fields.get(name);
  }

  public listFieldNames(): Array<string> {
    return Array.from(this.fields.keys());
  }

  get id(): number {
    return this.data.id;
  }

  public async deleteFile(uuid: string): Promise<IFile>;
  public async deleteFile(file: IFile): Promise<IFile>;
  public async deleteFile(param: IFile | string): Promise<IFile> {
    if (typeof param === "string") {
      return await deleteFile(param);
    } else {
      return await deleteFile(param.uuid);
    }
  }

  public async createCommentWebhook(address: string): Promise<IWebhook | null> {
    return createWebhook(
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
  ): Promise<boolean> {
    return comment(
      message,
      `${BASE_URL}/users/me/lists/${this.data.listId}/entries/${this.id}/activities`,
      parent,
      fileId
    );
  }

  public async listComments(): Promise<Array<IComment>> {
    const res = await axios.get(
      `${BASE_URL}/lists/${this.data.listId}/entries/${this.id}/activities?filter=2`
    );
    return (res.data.activities || []) as Array<IComment>;
  }

  get primaryKey(): string {
    return this._key?.value?.toString() || "";
  }

  public async uploadFile(filePath: string): Promise<IFile | null> {
    return uploadFile(filePath, `${BASE_URL}/lists/${this.data.listId}/files`);
  }

  public async addFile(
    data: ReadStream | Buffer,
    fileName: string
  ): Promise<IFile> {
    return addFile(
      data,
      fileName,
      `${BASE_URL}/lists/${this.data.listId}/files`
    );
  }

  public async commit() {
    const editData: { [key: string]: FieldValueType } = {};
    for (const field of this.fields.values()) {
      if (field.edited) {
        editData[field.element.fieldName] = field.value;
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

  public async delete(): Promise<boolean> {
    const res = await axios.delete(
      `${BASE_URL}/lists/${this.data.listId}/entries/${this.id}`
    );
    return res.status === 200;
  }
}
