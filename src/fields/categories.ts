import { IEntry } from "../entry";
import { Element } from "../element";
import { ArrayField } from "./base";

export default class CategoriesField extends ArrayField<number> {
  constructor(entry: IEntry, element: Element) {
    super(entry, element);
  }

  public addLabel(id: number): boolean;
  public addLabel(key: string): boolean;
  public addLabel(param: unknown): boolean {
    if (typeof param === "number") {
      return this._addLabelById(param);
    } else if (typeof param === "string") {
      return this._addLabelByRegex(param);
    }
    return false;
  }

  public removeLabel(id: number): boolean;
  public removeLabel(key: string): boolean;
  public removeLabel(param: unknown): boolean {
    if (typeof param === "number") {
      return this._removeLabelById(param);
    } else if (typeof param == "string") {
      return this._removeLabelByRegex(param);
    }
    return false;
  }

  private _addLabelByRegex(regex: string): boolean {
    const cat = this.element.label(regex);
    if (cat) {
      return this._addLabelById(cat.id);
    }
    return false;
  }

  private _addLabelById(id: number): boolean {
    if (!this.element.elementData.multiple) {
      this.clear();
    }
    this.add(id);
    return true;
  }

  private _removeLabelByRegex(regex: string): boolean {
    const cat = this.element.label(regex);
    if (cat) {
      return this._removeLabelById(cat.id);
    }
    return false;
  }

  private _removeLabelById(id: number): boolean {
    this.removeValue(id);
    return true;
  }
}
