export enum FieldCategory {
  TEXT = 1,
  NUMBER = 2,
  LINK = 3,
  DATE = 4,
  CATEGORIES = 6,
  CREATION_DATE = 8,
  UPDATED_DATE = 9,
  CREATION_USER = 11,
  UPDATED_USER = 12,
  PERSONS = 14,
  ATTACHEMENTS = 15,
  REFERENCES = 16,
}

const FIELD_TYPE: Record<number, string> = {
  [FieldCategory.TEXT]: "string",
  [FieldCategory.NUMBER]: "number",
  [FieldCategory.LINK]: "string",
  [FieldCategory.DATE]: "string",
  [FieldCategory.CATEGORIES]: "object",
  [FieldCategory.CREATION_DATE]: "string",
  [FieldCategory.UPDATED_DATE]: "string",
  [FieldCategory.CREATION_USER]: "number",
  [FieldCategory.UPDATED_USER]: "number",
  [FieldCategory.PERSONS]: "object",
  [FieldCategory.ATTACHEMENTS]: "object",
  [FieldCategory.REFERENCES]: "object",
};

const FIELD_SUFFIX: Record<number, string> = {
  [FieldCategory.TEXT]: "text",
  [FieldCategory.NUMBER]: "number",
  [FieldCategory.LINK]: "link",
  [FieldCategory.DATE]: "date",
  [FieldCategory.CATEGORIES]: "categories",
  [FieldCategory.PERSONS]: "persons",
  [FieldCategory.ATTACHEMENTS]: "files",
  [FieldCategory.REFERENCES]: "references",
};

export interface ICategory {
  id: number;
  uuid: string;
  name: string;
  color?: string; // TODO make ColorStringType
}

export interface IElement {
  id: number;
  uuid: string;
  name: string;
  description: string | null;
  isPrimary: boolean;
  sortOrder: number;
  elementcategory: FieldCategory;
  elementData: {
    multiple?: boolean;
    predefinedCategories?: Array<ICategory>;
  };
}

export class Element implements IElement {
  private _element: IElement;

  public constructor(element: IElement) {
    this._element = element;
  }

  public get id(): number {
    return this._element.id;
  }

  public get uuid(): string {
    return this._element.uuid;
  }

  public get name(): string {
    return this._element.name;
  }

  public get description(): string | null {
    return this._element.description;
  }

  public get isPrimary(): boolean {
    return this._element.isPrimary;
  }

  public get elementcategory(): FieldCategory {
    return this._element.elementcategory;
  }

  public get type(): string {
    return FIELD_TYPE[this._element.elementcategory];
  }

  public get elementData(): {
    multiple?: boolean;
    predefinedCategories?: Array<ICategory>;
  } {
    return this._element.elementData;
  }

  public get fieldName(): string {
    return `${this.uuid}_${FIELD_SUFFIX[this.elementcategory]}`;
  }

  public get labels(): ICategory[] {
    const res = [];
    for (const cat of this.elementData.predefinedCategories || []) {
      res.push(cat);
    }
    return res;
  }

  public get sortOrder(): number {
    return this._element.sortOrder;
  }

  public label(regex: string): ICategory | null {
    const rx = new RegExp(regex);
    for (const category of this.elementData.predefinedCategories || []) {
      if (rx.test(category.name)) {
        return category;
      }
    }
    return null;
  }
}
