export enum FieldCategory {
  TEXT = 1,
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

interface ICategory {
  id: number;
  uuid: string;
  name: string;
  color: string; // TODO make ColorStringType
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
    predefinedCategories?: Array<ICategory>;
  };
}
