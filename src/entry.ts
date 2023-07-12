import axios from "axios";
import { Element, FieldCategory } from "./element";
import {
  FieldType,
  FieldValueType,
  ValueField,
  ValueFieldType,
} from "./fields/base";
import CategoriesField from "./fields/categories";
import DateField from "./fields/date";
import LinkField from "./fields/link";
import PersonsField from "./fields/persons";
import ReferencesField from "./fields/references";
import TextField from "./fields/text";
import { BASE_URL } from "./config";
import NumberField from "./fields/number";
import IComment from "./comment";

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
  [FieldCategory.TEXT]: TextField,
  [FieldCategory.NUMBER]: NumberField,
  [FieldCategory.DATE]: DateField,
  [FieldCategory.LINK]: LinkField,
  [FieldCategory.PERSONS]: PersonsField,
  [FieldCategory.REFERENCES]: ReferencesField,
  [FieldCategory.CATEGORIES]: CategoriesField,
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

  public async createCommentWebhook(address: string): Promise<boolean> {
    const res = await axios.post(`${BASE_URL}/webhooks`, {
      triggerType: 4, // Comments
      url: address,
      listId: this.data.listId,
      listEntryId: this.id,
    });
    return res.status === 200;
  }

  get id(): number {
    return this.data.id;
  }

  public async comment(
    message: string,
    parent?: string,
    fileId?: number
  ): Promise<boolean> {
    const payload: any = { message: message };
    if (parent) {
      payload["parentUUID"] = parent;
    }
    if (fileId) {
      payload["enrichments"] = [
        {
          fileId: fileId,
          type: "File",
        },
      ];
    }
    const res = await axios.post(
      `${BASE_URL}/users/me/lists/${this.data.listId}/entries/${this.id}/activities`,
      payload
    );
    return res.status === 200;
  }

  public async getComments(userId?: number): Promise<Array<IComment>> {
    const res = await axios.get(
      `${BASE_URL}/lists/${this.data.listId}/entries/${this.id}/activities?filter=2`
    );
    return (res.data.activities || []) as Array<IComment>;
  }

  get primaryKey(): string {
    return this._key?.value?.toString() || "";
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
