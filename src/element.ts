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

const FIELD_TYPE: { [key: number]: string } = {
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

const FIELD_SUFFIX: { [key: number]: string } = {
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
  color: string; // TODO make ColorStringType
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
    multiple?: boolean;
    predefinedCategories?: Array<ICategory>;
  };
}

export class Element implements IElement {
  _element: IElement;

  constructor(element: any) {
    this._element = element as IElement;
  }

  get id() {
    return this._element.id;
  }

  get uuid() {
    return this._element.uuid;
  }

  get name() {
    return this._element.name;
  }

  get description() {
    return this._element.description;
  }

  get isPrimary() {
    return this._element.isPrimary;
  }

  get sortOrder() {
    return this._element.sortOrder;
  }

  get elementcategory() {
    return this._element.elementcategory;
  }

  get type() {
    return FIELD_TYPE[this._element.elementcategory];
  }

  get elementData() {
    return this._element.elementData;
  }

  get fieldName() {
    return `${this.uuid}_${FIELD_SUFFIX[this.elementcategory]}`;
  }

  get labels(): ICategory[] {
    const res = [];
    for (const cat of this.elementData.predefinedCategories || []) {
      res.push(cat as ICategory);
    }
    return res;
  }

  public getTypeScriptEnum(): string {
    const vals = [];
    for (const cat of this.elementData.predefinedCategories || []) {
      vals.push(`    ${cat.name.toUpperCase().replace(" ", "_")} = ${cat.id},`);
    }
    return `enum ${this.name.toUpperCase().replace(" ", "_")} {
${vals.join("\n")}
};`;
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
