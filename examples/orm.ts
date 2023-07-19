import { Collection, Entry, IEntry, Element } from "../src";
import * as fields from "../src/fields";

export enum TestCollection {
  ZU_BEARBEITEN = 13389240,
  IN_BEARBEITUNG = 13389241,
  ERLEDIGT = 13389242,
}

export enum TestCollection {
  NEW = 13391152,
  STALE = 13391153,
  UNCONFIRMED = 13391154,
  BUG = 13391155,
}

export class TestCollectionEntry extends Entry {
  public get primaryTextField() {
    return this.field("Primary Text Field") as fields.TextField;
  }

  public get statusField() {
    return this.field("Status Field") as fields.CategoriesField;
  }

  public get textField() {
    return this.field("Text Field") as fields.TextField;
  }

  public get dateField() {
    return this.field("Date Field") as fields.DateField;
  }

  public get timeField() {
    return this.field("Time Field") as fields.DateField;
  }

  public get memberField() {
    return this.field("Member Field") as fields.PersonsField;
  }

  public get numberField() {
    return this.field("Number Field") as fields.NumberField;
  }

  public get tagField() {
    return this.field("Tag Field") as fields.CategoriesField;
  }

  public get referenceField() {
    return this.field("Reference Field") as fields.ReferencesField;
  }
}

export class TestCollectionCollection extends Collection {
  static id: number = 3207438;
  static uuid: string = "dfda7cb2-65a9-4a70-b317-5988b3ba7b59";
  static workspaceId: number = 1281787;

  entry_ctor: new (entry: IEntry, elements: Array<Element>) => Entry =
    TestCollectionEntry;

  public entry(id: number): TestCollectionEntry | null;
  public entry(key: string): TestCollectionEntry | null;
  public entry(param: unknown): TestCollectionEntry | null {
    if (typeof param === "number") {
      return this.getEntryById(param) as TestCollectionEntry;
    } else if (typeof param === "string") {
      return this.getEntryByKey(param) as TestCollectionEntry;
    }
    return null;
  }

  public async createEntry(
    primaryValue: string,
    data = {}
  ): Promise<TestCollectionEntry> {
    return super.createEntry(
      primaryValue,
      data
    ) as Promise<TestCollectionEntry>;
  }
}

Collection.registerTypedCollection(TestCollectionCollection);
