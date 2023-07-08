import { IElement } from "../src/element";
import { Entry, IEntry } from "../src/entry";
import TextField from "../src/fields/text";
import * as elementDataJson from "./data/test_collection_elements.json";
import * as entryDataJson from "./data/test_collection_entries.json";

describe("test entry", () => {
  it("should create an entry", async () => {
    const elements: Array<IElement> = [];
    for (const elementJson of elementDataJson.data) {
      if (elementJson) {
        elements.push(elementJson as IElement);
      }
    }
    const entry = new Entry(
      entryDataJson["listEntries"][0] as IEntry,
      elements
    );
    expect(entry.fieldNames).toContain("Text Field");
    expect(entry.fieldNames).not.toContain("Last Updated");
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
