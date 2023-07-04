import axios from "axios";
import { BASE_URL } from "./config";

interface ICategory {
  id: number;
  uuid: string;
  name: string;
  color: string; // TODO make ColorStringType
}

enum FieldCategory {
  Text = 1,
  Link = 3,
  Date = 4,
  Label = 6,
  Creation_Date = 8,
  Updated_Date = 9,
  Creation_User = 11,
  Updated_User = 12,
  User = 14,
  Attachement = 15,
  Reference = 16,
}

interface IEntry {
  id: number;
  shordId: string;
  uuid: string;
  created_at: string;
  updated_at: string;
  created_by: number;
  updated_by: number;
  displayString: string;
  comment_count: number;
  [key: `${string}_text`]: string;
  [key: `${string}_date`]: string; // TODO make DateStringType YYYY-MM-DD
  [key: `${string}_link`]: string;
  [key: `${string}_references`]: Array<string>;
  [key: `${string}_categories_sort`]: Array<ICategory>;
}

class Entry {
  protected data: IEntry;
  protected _localData: any;
  protected element: IElement;
  constructor(jsonData: IEntry, element: IElement) {
    this.data = jsonData;
    this.element = element;
  }

  public async update() {}
}

class TextEntry extends Entry {
  get value(): string {
    return this.data[`${this.element.uuid}_text`];
  }

  set value(val: string) {
    this.data[`${this.element.uuid}_text`] = val;
    this._localData[`${this.element.uuid}_text`] = val;
  }
}

interface IElement {
  id: number;
  uuid: string;
  name: string;
  description: string | null;
  isPrimary: boolean;
  sortOrder: number;
  elementcategory: FieldCategory;
  elementData: {
    predefinedCategories?: Array<ICategories>;
  };
}

export interface IList {
  id: number;
  name: string;
}

export class List {
  data: IList;
  elements: Array<IElement> | undefined;
  private _entries: Array<IEntry> | undefined;

  constructor(jsonData: IList) {
    this.data = jsonData;
  }

  get id(): number {
    return this.data.id;
  }

  public async updateElements() {
    this.elements = [];
    const res = await axios.get(`${BASE_URL}/lists/${this.id}/elements`);
    if (res.status == 200 && res.data != null) {
      for (const element of res.data) {
        this.elements.push(element as IElement);
      }
    }
  }

  public async populate(filter = {}, limit = 100, skip = 0) {
    if (!this.elements) {
      await this.updateElements();
    }
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
        this._entries.push(element as IElement);
      }
    }
  }
}
