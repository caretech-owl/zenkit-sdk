import axios from "axios";
import { BASE_URL } from "./config";
import { IEntry, Entry } from "./entry";
import { IElement } from "./element";

export interface ICollection {
  id: number;
  name: string;
}

export class Collection {
  data: ICollection;
  private _elements: Array<IElement> | undefined;
  private _entries: Array<Entry>;

  constructor(jsonData: ICollection) {
    this.data = jsonData;
    this._entries = [];
  }

  get id(): number {
    return this.data.id;
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
      if (entry.key !== "") {
        if (rx.test(entry.key)) {
          return entry;
        }
      }
    }
    return null;
  }

  protected async getElements(): Promise<Array<IElement>> {
    if (this._elements === undefined) {
      this._elements = await this.requestElements();
    }
    return this._elements;
  }

  private async requestElements(): Promise<Array<IElement>> {
    let elements = [];
    const res = await axios.get(`${BASE_URL}/lists/${this.id}/elements`);
    if (res.status == 200 && res.data != null) {
      for (const element of res.data) {
        elements.push(element as IElement);
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
