import type { IEntry } from "../entry";
import type { Element } from "../element";

export type FieldValueType = ValueFieldType | ArrayFieldType;
export type ValueFieldType = string | number | null | boolean | object;
export type ArrayFieldType = Array<ValueFieldType>;
export type FieldType = ArrayField<ValueFieldType> | ValueField<ValueFieldType>;

export abstract class FieldBase<T> {
  entry: IEntry;
  edited: boolean;
  element: Element;

  get name() {
    return this.element.fieldName;
  }

  constructor(entry: IEntry, element: Element) {
    this.entry = entry;
    this.edited = false;
    this.element = element;
  }

  get value(): T {
    return this.entry[this.element.fieldName] as T;
  }
}

export abstract class ValueField<
  T extends FieldValueType
> extends FieldBase<T> {
  set(newValue: T) {
    this.edited = this.edited || newValue != this.value;
    this.entry[this.element.fieldName] = newValue;
  }
}

export abstract class ArrayField<T extends FieldValueType> extends FieldBase<
  Array<T>
> {
  add(newValue: T) {
    if (this.value.indexOf(newValue) === -1) {
      this.value.push(newValue);
      this.edited = true;
    }
  }

  removeValue(oldValue: T) {
    const index = this.value.indexOf(oldValue);
    if (index > -1) {
      this.removeIndex(index);
    }
  }

  removeIndex(index: number) {
    this.edited = true;
    this.value.splice(index, 1);
  }

  get(i: number): T {
    return this.value[i];
  }

  clear() {
    this.edited = true;
    this.entry[this.element.fieldName] = [];
  }
}
