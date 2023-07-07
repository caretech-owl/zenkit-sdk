import { IElement } from "../src/element";
import { Entry, IEntry } from "../src/entry";
import { ValueField } from "../src/fields/base";
import TextField from "../src/fields/text";
import * as elementDataJson from "./data/test_collection_elements.json";
import * as entryDataJson from "./data/test_collection_entries.json";

describe("test entry", () => {
  it("should create an entry", async () => {
    const elements: Array<IElement> = [];
    for (const i in Object.keys(elementDataJson)) {
      const elemJson = elementDataJson[i];
      if (elemJson) {
        elements.push(elemJson as IElement);
      }
    }
    const entry = new Entry(
      entryDataJson["listEntries"][0] as IEntry,
      elements
    );
    expect(entry.field("Text Field")).not.toBeNull();
    const field = entry.field("Text Field") as TextField;
    const value = field.value;
    expect(field.edited).toBeFalsy();
    field.set("New Text");
    expect(value).not.toBe(field.value);
    expect(field.value).toBe("New Text");
    expect(field.edited).toBeTruthy();
  });
});
