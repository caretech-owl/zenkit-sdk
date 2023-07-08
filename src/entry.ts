import { FieldCategory, IElement } from "./element";
import { ArrayField, FieldType, ValueField } from "./fields/base";
import CategoriesField from "./fields/categories";
import DateField from "./fields/date";
import LinkField from "./fields/link";
import PersonsField from "./fields/persons";
import ReferencesField from "./fields/references";
import TextField from "./fields/text";

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

  private _key: ValueField<number | string>;

  public field(name: string) {
    return this.fields.get(name);
  }

  get fieldNames(): Array<string> {
    return Array.from(this.fields.keys());
  }

  get id(): number {
    return this.data.id;
  }

  get key(): string  {
    return this._key.value?.toString() || "";
  }

  constructor(jsonData: IEntry, elements: Array<IElement>) {
    this.data = jsonData;
    this.fields = new Map();
    for (const element of elements) {
      const cls = FieldMap[element.elementcategory];
      element.
      if (cls !== undefined) {
        this.fields.set(element.name, new cls(element.id, this.data));
      }
    }
  }

  public async commit() {
    const editData: { [key: string]: FieldType } = {};
    for (const field of this.fields.values()) {
      if (field.edited) {
        editData[field.name] = field.value;
        field.edited = false;
      }
    }
  }
}
