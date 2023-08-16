import type { IEntry } from "../entry";
import type { Element } from "../element";

export type FieldValueType = ValueFieldType | ArrayFieldType;
export type ValueFieldType = string | number | null | boolean | object;
export type ArrayFieldType = Array<ValueFieldType>;
export type FieldType = ArrayField<ValueFieldType> | ValueField<ValueFieldType>;

export abstract class FieldBase<T extends FieldValueType> {
  public entry: IEntry;
  public edited: boolean;
  public element: Element;

  public get name(): string {
    return this.element.fieldName;
  }

  public constructor(entry: IEntry, element: Element) {
    this.entry = entry;
    this.edited = false;
    this.element = element;
  }

  public get value(): T {
    return this.entry[this.element.fieldName] as T;
  }

  public getData(): Array<{ field: string; value: FieldValueType }> {
    return [{ field: this.element.fieldName, value: this.value }];
  }
}

export abstract class ValueField<
  T extends FieldValueType
> extends FieldBase<T> {
  public set(newValue: T): void {
    this.edited = this.edited || newValue != this.value;
    this.entry[this.element.fieldName] = newValue;
  }
}

export abstract class ArrayField<T extends FieldValueType> extends FieldBase<
  Array<T>
> {
  public add(newValue: T): void {
    if (this.value.indexOf(newValue) === -1) {
      this.value.push(newValue);
      this.edited = true;
    }
  }

  public removeValue(oldValue: T): void {
    const index = this.value.indexOf(oldValue);
    if (index > -1) {
      this.removeIndex(index);
    }
  }

  public removeIndex(index: number): void {
    this.edited = true;
    this.value.splice(index, 1);
  }

  public get(i: number): T {
    return this.value[i];
  }

  public clear(): void {
    this.edited = true;
    this.entry[this.element.fieldName] = [];
  }
}
