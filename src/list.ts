import axios from "axios";
import { BASE_URL } from "./config";
import { IEntry, Entry } from "./entry";

export interface IList {
  id: number;
  name: string;
}

export class List {
  data: IList;
  private _elements: Array<IElement> | undefined;
  private _entries: Array<Entry> | undefined;

  constructor(jsonData: IList) {
    this.data = jsonData;
  }

  get id(): number {
    return this.data.id;
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
