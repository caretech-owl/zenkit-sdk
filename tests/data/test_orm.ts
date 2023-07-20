import { Collection, Entry, IEntry, Element, fields } from "../../src";

export enum SingleLabelField {
  ZU_BEARBEITEN = 13425638,
  IN_BEARBEITUNG = 13425639,
  ERLEDIGT = 13425640,
}

export enum MultipleLabelField {
  ONE = 13425644,
  TWO = 13425645,
  THREE = 13425646,
  FOUR = 13425647,
}

export class MockCollectionEntry extends Entry {
  public get textField() {
    return this.field("Text Field") as fields.TextField;
  }

  public get numberField() {
    return this.field("Number Field") as fields.NumberField;
  }

  public get linkField() {
    return this.field("Link Field") as fields.LinkField;
  }

  public get dateField() {
    return this.field("Date Field") as fields.DateField;
  }

  public get singleLabelField() {
    return this.field("Single Label Field") as fields.CategoriesField;
  }

  public get multipleLabelField() {
    return this.field("Multiple Label Field") as fields.CategoriesField;
  }

  public get userField() {
    return this.field("User Field") as fields.PersonsField;
  }

  public get referenceField() {
    return this.field("Reference Field") as fields.ReferencesField;
  }
}

export class MockCollectionCollection extends Collection {
  static id: number = 421;
  static uuid: string = "a935a761-313d-4040-86e8-4f33223341ba";
  static workspaceId: number = 42;

  entry_ctor: new (entry: IEntry, elements: Array<Element>) => Entry =
    MockCollectionEntry;

  public entry(id: number): MockCollectionEntry | null;
  public entry(key: string): MockCollectionEntry | null;
  public entry(param: string | number): MockCollectionEntry | null {
    if (typeof param === "number") {
      return this.getEntryById(param) as MockCollectionEntry;
    }
    return this.getEntryByKey(param) as MockCollectionEntry;
  }

  public async createEntry(
    primaryValue: string,
    data = {}
  ): Promise<MockCollectionEntry> {
    return super.createEntry(
      primaryValue,
      data
    ) as Promise<MockCollectionEntry>;
  }
}

Collection.registerTypedCollection(MockCollectionCollection);
