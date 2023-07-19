import type { Collection } from "./collection";
import { FieldCategory } from "./element";
import { to_TitleCase, to_UPPER_CASE, to_camelCase } from "./utils";

export const FieldClassNames: Record<number, string> = {
  [FieldCategory.TEXT]: "TextField",
  [FieldCategory.NUMBER]: "NumberField",
  [FieldCategory.DATE]: "DateField",
  [FieldCategory.LINK]: "LinkField",
  [FieldCategory.PERSONS]: "PersonsField",
  [FieldCategory.REFERENCES]: "ReferencesField",
  [FieldCategory.CATEGORIES]: "CategoriesField",
};

export default async function generateORM(
  collection: Collection,
  prefix: string = "@caretech-owl/zenkit-sdk"
): Promise<string> {
  const elements = await collection.getElements();
  const elems = [];
  const elemEnums = [];
  for (const elem of elements) {
    if (elem.elementData.predefinedCategories) {
      const vals = [];
      for (const cat of elem.elementData.predefinedCategories || []) {
        vals.push(`  ${to_UPPER_CASE(cat.name)} = ${cat.id},`);
      }
      elemEnums.push(`export enum ${to_TitleCase(collection.name)} {
${vals.join("\n")}
}`);
    }
    if (elem.elementcategory in FieldClassNames) {
      elems.push(
        `  public get ${to_camelCase(elem.name)}() {
    return this.field("${elem.name}") as fields.${
          FieldClassNames[elem.elementcategory]
        };
  }`
      );
    }
  }
  const entryType = `${to_TitleCase(collection.name)}Entry`;
  return `import { Collection, Entry, IEntry, Element } from "${prefix}";
import * as fields from "${prefix}/fields";
  
${elemEnums.join("\n\n")}
  
export class ${entryType} extends Entry {
${elems.join("\n\n")}
}
  
export class ${to_TitleCase(collection.name)}Collection extends Collection {
  static id: number = ${collection.id};
  static uuid: string = "${collection.data.uuid}";
  static workspaceId: number = ${collection.data.workspaceId};
  
  entry_ctor: new (entry: IEntry, elements: Array<Element>) => Entry =
    TestCollectionEntry;
  
  public entry(id: number): ${entryType} | null;
  public entry(key: string): ${entryType} | null;
  public entry(param: unknown): ${entryType} | null {
    if (typeof param === "number") {
      return this.getEntryById(param) as ${entryType};
    } else if (typeof param === "string") {
      return this.getEntryByKey(param) as ${entryType};
    }
    return null;
  }
  
  public async createEntry(
    primaryValue: ${collection.primaryKey!.type},
    data = {}
  ): Promise<${entryType}> {
    return super.createEntry(
      primaryValue,
      data
    ) as Promise<${entryType}>;
  }
}
  
Collection.registerTypedCollection(TestCollectionCollection);
  `;
}
