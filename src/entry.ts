import axios from "axios";
import { FieldCategory, IElement } from "./element";
import { ArrayField, FieldType, ValueField } from "./fields/base";
import CategoriesField from "./fields/categories";
import DateField from "./fields/date";
import LinkField from "./fields/link";
import PersonsField from "./fields/persons";
import ReferencesField from "./fields/references";
import TextField from "./fields/text";
import { BASE_URL } from "./config";
import NumberField from "./fields/number";

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
  [key: string]: FieldType;
  //   [key: `${string}_text`]: string;
  //   [key: `${string}_date`]: string; // TODO make DateStringType YYYY-MM-DD (HH:mm:ss)
  //   [key: `${string}_link`]: string;
  //   [key: `${string}_persons`]: Array<number>;
  //   [key: `${string}_references`]: Array<string>;
  //   [key: `${string}_categories`]: Array<number>;
}

const FieldMap: { [key: number]: any } = {
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
  protected fields: Map<
    string,
    ArrayField<number | string> | ValueField<number | string>
  >;

  private _key: ValueField<number | string> | null;

  constructor(jsonData: IEntry, elements: Array<IElement>) {
    this.data = jsonData;
    this.fields = new Map();
    this._key = null;
    for (const element of elements) {
      const cls = FieldMap[element.elementcategory];
      if (cls !== undefined) {
        const entry = new cls(element.uuid, this.data);
        this.fields.set(element.name, entry);
        if (element.isPrimary) {
          this._key = entry;
        }
      }
    }
  }

  public field(name: string) {
    return this.fields.get(name);
  }

  get fieldNames(): Array<string> {
    return Array.from(this.fields.keys());
  }

  get id(): number {
    return this.data.id;
  }

  get key(): string {
    return this._key?.value?.toString() || "";
  }

  public async commit() {
    const editData: { [key: string]: FieldType } = {};
    for (const field of this.fields.values()) {
      if (field.edited) {
        editData[field.name] = field.value;
        field.edited = false;
      }
    }
    if (Object.keys(editData).length > 0) {
      axios.put(
        `${BASE_URL}/lists/${this.data.listId}/entries/${this.id}`,
        editData
      );
    }
  }
}
