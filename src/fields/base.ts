import { IEntry } from "../entry";

export type FieldType = FieldValueTypes | FieldArrayType;
export type FieldValueTypes = string | number | null | boolean | object;
export type FieldArrayType = Array<FieldValueTypes>;

export abstract class FieldBase<T> {
  entry: IEntry;
  edited: boolean;
  name: string;

  constructor(name: string, entry: IEntry) {
    this.entry = entry;
    this.edited = false;
    this.name = name;
  }

  get value(): FieldType {
    return this.entry[this.name];
  }
}

export abstract class ValueField<T> extends FieldBase<T> {
  set(newValue: FieldValueTypes) {
    this.edited = this.edited || newValue != this.value;
    this.entry[this.name] = newValue;
  }
}

export abstract class ArrayField<T> extends FieldBase<T> {
  add(newValue: T) {
    this.edited = true;
  }

  removeValue(oldValue: FieldValueTypes) {
    const arr = this.entry[this.name];
    if (!Array.isArray(arr)) {
      throw Error("Field is not an array!");
    }
    const index = arr.indexOf(oldValue);
    if (index !== -1) {
      this.removeIndex(index);
    }
  }

  removeIndex(index: number) {
    const arr = this.entry[this.name];
    if (!Array.isArray(arr)) {
      throw Error("Field is not an array!");
    }
    this.edited = true;
    arr.splice(index, 1);
  }

  get(i: number): FieldType {
    const arr = this.entry[this.name];
    if (!Array.isArray(arr)) {
      throw Error("Field is not an array!");
    }
    return arr[i];
  }

  clear() {
    this.edited = true;
    this.entry[this.name] = [];
  }
}
